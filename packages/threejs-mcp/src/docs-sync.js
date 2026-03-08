/**
 * docs-sync.js
 *
 * 1. Fetches all Three.js API docs from github.com/mrdoob/three.js
 * 2. Parses each class into structured data
 * 3. Writes docs/API.md  (human-readable markdown)
 * 4. Writes docs/API.json (machine-readable, for fast restarts)
 * 5. Calls knowledge-base.rebuild() so all MCP tools immediately use fresh data
 *
 * Runs on startup (if stale) + daily at 2:00 AM UTC via node-cron.
 */

import cron from 'node-cron';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as kb from './knowledge-base.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR  = path.join(__dirname, '..', 'docs');
const MD_FILE   = path.join(DOCS_DIR, 'API.md');
const JSON_FILE = path.join(DOCS_DIR, 'API.json');
const META_FILE = path.join(DOCS_DIR, '.sync-meta.json');

const GITHUB_RAW = 'https://raw.githubusercontent.com/mrdoob/three.js/master';
const GITHUB_API = 'https://api.github.com/repos/mrdoob/three.js/contents/docs/api/en';

const DOC_CATEGORIES = [
  { name: 'Animation',        path: 'animation' },
  { name: 'Audio',            path: 'audio' },
  { name: 'Cameras',          path: 'cameras' },
  { name: 'Constants',        path: 'constants' },
  { name: 'Core',             path: 'core' },
  { name: 'Extras',           path: 'extras' },
  { name: 'Geometries',       path: 'geometries' },
  { name: 'Helpers',          path: 'helpers' },
  { name: 'Lights',           path: 'lights' },
  { name: 'Lights / Shadows', path: 'lights/shadows' },
  { name: 'Loaders',          path: 'loaders' },
  { name: 'Materials',        path: 'materials' },
  { name: 'Math',             path: 'math' },
  { name: 'Objects',          path: 'objects' },
  { name: 'Renderers',        path: 'renderers' },
  { name: 'Scenes',           path: 'scenes' },
  { name: 'Textures',         path: 'textures' }
];

async function fetchDirListing(subPath) {
  const url = `${GITHUB_API}${subPath ? '/' + subPath : ''}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'threejs-mcp-docs-sync' }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.filter(f => f.name.endsWith('.html')) : [];
}

async function parseDocPage(rawUrl, className, category) {
  try {
    const res = await fetch(rawUrl, { headers: { 'User-Agent': 'threejs-mcp-docs-sync' } });
    if (!res.ok) return null;
    const html = await res.text();

    const descMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const description = descMatch
      ? descMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      : 'No description available.';

    const ctorMatch = html.match(/\[name\]\s*\(([^)]*)\)/);
    const constructorSig = ctorMatch
      ? `new THREE.${className}(${ctorMatch[1]})`
      : `new THREE.${className}()`;

    const propPattern = /\[property:([^\]]+)\s+([^\]]+)\]/g;
    const properties = [];
    let m;
    while ((m = propPattern.exec(html)) !== null) {
      properties.push({ name: m[2].trim(), type: m[1].trim() });
    }

    const methodPattern = /\[method:([^\]]+)\s+([^\]]+)\]\s*\(([^)]*)\)/g;
    const methods = [];
    while ((m = methodPattern.exec(html)) !== null) {
      methods.push({ name: m[2].trim(), params: m[3].trim(), returns: m[1].trim() });
    }

    const examplePattern = /<code[^>]*>([\s\S]*?)<\/code>/g;
    const examples = [];
    while ((m = examplePattern.exec(html)) !== null) {
      const code = m[1].replace(/<[^>]+>/g, '').trim();
      if (code.length > 10 && code.length < 400) examples.push(code);
    }

    return {
      className,
      category: category.name,
      categoryPath: category.path,
      description,
      constructor: constructorSig,
      properties,
      methods,
      examples: examples.slice(0, 3),
      docsUrl: `https://threejs.org/docs/#api/en/${category.path}/${className}`
    };
  } catch {
    return null;
  }
}

async function fetchAllDocs() {
  const allEntries = [];
  for (const category of DOC_CATEGORIES) {
    console.log(`[docs-sync]   -> ${category.name}`);
    const files = await fetchDirListing(category.path);
    for (const file of files) {
      const className = file.name.replace('.html', '');
      const rawUrl = `${GITHUB_RAW}/docs/api/en/${category.path}/${file.name}`;
      const entry = await parseDocPage(rawUrl, className, category);
      if (entry) allEntries.push(entry);
      await new Promise(r => setTimeout(r, 80));
    }
  }
  return allEntries;
}

function buildMarkdown(entries, timestamp) {
  let md = `# Three.js API Reference\n\n`;
  md += `> Auto-synced by threejs-mcp | **${timestamp}** | ${entries.length} classes\n\n`;
  md += `> Source: [mrdoob/three.js](https://github.com/mrdoob/three.js)\n\n---\n\n`;

  const categories = [...new Set(entries.map(e => e.category))];
  md += `## Table of Contents\n\n`;
  md += categories.map(c => `- [${c}](#${c.toLowerCase().replace(/[\s\/]+/g, '-')})`).join('\n');
  md += '\n\n---\n\n';

  for (const cat of categories) {
    md += `## ${cat}\n\n`;
    for (const e of entries.filter(e => e.category === cat)) {
      md += `### ${e.className}\n\n`;
      md += `**Description:** ${e.description}\n\n`;
      md += `**Constructor:** \`${e.constructor}\`\n\n`;
      if (e.properties.length > 0) {
        md += `**Properties:**\n` + e.properties.map(p => `- \`.${p.name}\` : \`${p.type}\``).join('\n') + '\n\n';
      }
      if (e.methods.length > 0) {
        md += `**Methods:**\n` + e.methods.map(m => `- \`.${m.name}(${m.params})\` -> \`${m.returns}\``).join('\n') + '\n\n';
      }
      if (e.examples.length > 0) {
        md += `**Example:**\n\`\`\`js\n${e.examples[0]}\n\`\`\`\n\n`;
      }
      md += `**Docs:** ${e.docsUrl}\n\n---\n\n`;
    }
  }
  return md;
}

async function runSync() {
  console.log('[docs-sync] Starting Three.js docs sync...');
  const start = Date.now();
  try {
    await fs.mkdir(DOCS_DIR, { recursive: true });
    const entries = await fetchAllDocs();
    const timestamp = new Date().toUTCString();

    // Write markdown + JSON
    await fs.writeFile(MD_FILE, buildMarkdown(entries, timestamp), 'utf8');
    await fs.writeFile(JSON_FILE, JSON.stringify(entries, null, 2), 'utf8');

    // Update in-memory knowledge base immediately
    kb.rebuild(entries);

    const meta = {
      lastSync: new Date().toISOString(),
      durationMs: Date.now() - start,
      totalClasses: entries.length,
      mdSizeBytes: Buffer.byteLength(buildMarkdown(entries, timestamp), 'utf8')
    };
    await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2), 'utf8');
    console.log(`[docs-sync] Synced ${entries.length} classes in ${meta.durationMs}ms`);
  } catch (err) {
    console.error('[docs-sync] Sync failed:', err.message);
  }
}

async function loadFromDisk() {
  try {
    const raw = await fs.readFile(JSON_FILE, 'utf8');
    const entries = JSON.parse(raw);
    kb.rebuild(entries);
    console.log(`[docs-sync] Loaded ${entries.length} classes from disk cache`);
    return true;
  } catch {
    return false;
  }
}

async function isStale() {
  try {
    const raw = await fs.readFile(META_FILE, 'utf8');
    const meta = JSON.parse(raw);
    return (Date.now() - new Date(meta.lastSync).getTime()) > 23 * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

export async function startDocsSync() {
  const stale = await isStale();
  if (!stale) {
    await loadFromDisk();
    console.log('[docs-sync] Docs fresh - next sync at 02:00 UTC');
  } else {
    loadFromDisk(); // load stale cache for now
    runSync();     // refresh in background
  }
  cron.schedule('0 2 * * *', () => {
    console.log('[docs-sync] Daily cron triggered');
    runSync();
  }, { timezone: 'UTC' });
}

export async function forceSync() {
  await runSync();
  return `Sync complete - ${kb.getStatus().totalClasses} classes in knowledge base.`;
}

export async function getSyncStatus() {
  try {
    const raw = await fs.readFile(META_FILE, 'utf8');
    const meta = JSON.parse(raw);
    const age = Math.round((Date.now() - new Date(meta.lastSync).getTime()) / 60000);
    const kbs = kb.getStatus();
    return [
      `Three.js Docs Sync Status`,
      `Last sync:   ${meta.lastSync}`,
      `Age:         ${age} minutes`,
      `Duration:    ${meta.durationMs}ms`,
      `Classes:     ${meta.totalClasses}`,
      `KB ready:    ${kbs.ready ? 'yes - ' + kbs.totalClasses + ' classes loaded' : 'no'}`,
      `Next sync:   Daily at 02:00 UTC`
    ].join('\n');
  } catch {
    return 'Never synced. Call threejs_docs_sync to trigger.';
  }
}
