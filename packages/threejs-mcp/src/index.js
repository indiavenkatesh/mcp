/**
 * @indiavenkatesh/mcp-threejs
 *
 * MCP server with all Three.js features as tools.
 * Docs are synced from GitHub daily and loaded into an in-memory
 * knowledge base — all lookup/search tools query live data.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { sceneTools }    from './tools/scene.js';
import { geometryTools } from './tools/geometry.js';
import { materialTools } from './tools/material.js';
import {
  lightTools, cameraTools, animationTools, loaderTools,
  postFxTools, particleTools, helperTools, raycastTools,
  physicsTools, shadowTools
} from './tools/features.js';

import { startDocsSync, forceSync, getSyncStatus } from './docs-sync.js';
import * as kb from './knowledge-base.js';

// ── Server ────────────────────────────────────────────────────────────────────
const server = new McpServer({
  name: 'threejs-mcp',
  version: '2.0.0',
  description: 'Complete Three.js toolkit — all API features as MCP tools, with live-synced knowledge base'
});

// ── All code-generation tools ────────────────────────────────────────────────
const allTools = [
  ...sceneTools, ...geometryTools, ...materialTools,
  ...lightTools, ...cameraTools, ...animationTools,
  ...loaderTools, ...postFxTools, ...particleTools,
  ...helperTools, ...raycastTools, ...physicsTools, ...shadowTools
];

for (const tool of allTools) {
  const zodShape = buildZodShape(
    tool.inputSchema?.properties || {},
    tool.inputSchema?.required || []
  );
  server.tool(tool.name, tool.description, zodShape, async (args) => {
    try {
      const result = tool.handler(args);
      return { content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
    }
  });
}

// ── Knowledge base tools (powered by synced docs) ────────────────────────────

/**
 * Look up a specific Three.js class — returns constructor, all properties,
 * all methods, examples, and docs link — pulled from the synced knowledge base.
 */
server.tool(
  'threejs_class_lookup',
  'Look up a Three.js class from the synced docs. Returns constructor signature, all properties, all methods, examples, and docs URL.',
  { className: z.string().describe('Class name e.g. "BufferGeometry", "MeshStandardMaterial", "Vector3"') },
  async ({ className }) => {
    const entry = kb.lookup(className);
    if (!entry) {
      const similar = kb.search(className, 5);
      const suggestions = similar.length > 0
        ? `\n\nDid you mean one of these?\n${similar.map(e => `- ${e.className} (${e.category})`).join('\n')}`
        : '\n\nKnowledge base may not be loaded yet — try threejs_docs_sync first.';
      return { content: [{ type: 'text', text: `Class "${className}" not found.${suggestions}` }] };
    }
    return { content: [{ type: 'text', text: kb.formatEntry(entry) }] };
  }
);

/**
 * Search across all synced Three.js docs — class names, descriptions, properties, methods.
 */
server.tool(
  'threejs_docs_search',
  'Search the live Three.js knowledge base by class name, property, method, or keyword.',
  {
    query: z.string().describe('Search term e.g. "castShadow", "lerp", "environment map", "transmission"'),
    limit: z.number().optional().describe('Max results (default 10)')
  },
  async ({ query, limit = 10 }) => {
    const results = kb.search(query, limit);
    if (results.length === 0) {
      return { content: [{ type: 'text', text: `No results for "${query}". Try threejs_docs_sync if the knowledge base is empty.` }] };
    }
    const output = results.map(e =>
      `**${e.className}** (${e.category})\n${e.description}\nConstructor: \`${e.constructor}\`\n${e.docsUrl}`
    ).join('\n\n---\n\n');
    return { content: [{ type: 'text', text: `Found ${results.length} results for "${query}":\n\n${output}` }] };
  }
);

/**
 * List all classes in a category, or all categories.
 */
server.tool(
  'threejs_list_classes',
  'List all Three.js classes from the synced docs, optionally filtered by category.',
  { category: z.string().optional().describe('Category filter e.g. "Geometries", "Materials", "Lights". Leave empty to list all categories.') },
  async ({ category } = {}) => {
    const kbStatus = kb.getStatus();
    if (!kbStatus.ready) {
      return { content: [{ type: 'text', text: 'Knowledge base not ready. Call threejs_docs_sync first.' }] };
    }

    if (!category) {
      const cats = kb.listCategories();
      const summary = cats.map(c => {
        const classes = kb.listClasses(c);
        return `**${c}** (${classes.length} classes): ${classes.map(e => e.className).join(', ')}`;
      }).join('\n\n');
      return { content: [{ type: 'text', text: `Three.js API — ${kbStatus.totalClasses} classes across ${cats.length} categories:\n\n${summary}` }] };
    }

    const classes = kb.listClasses(category);
    if (classes.length === 0) {
      return { content: [{ type: 'text', text: `No classes found in category "${category}". Available: ${kb.listCategories().join(', ')}` }] };
    }
    const output = classes.map(e =>
      `- **${e.className}**: ${e.description.slice(0, 100)}${e.description.length > 100 ? '...' : ''}`
    ).join('\n');
    return { content: [{ type: 'text', text: `**${category}** — ${classes.length} classes:\n\n${output}` }] };
  }
);

/**
 * Full scene generator — uses live KB to pick accurate constructor signatures.
 */
server.tool(
  'threejs_generate_full_scene',
  'Generate a complete self-contained Three.js HTML file from a natural language description.',
  { description: z.string().describe('Scene description e.g. "rotating galaxy with bloom and orbit controls"') },
  async ({ description }) => {
    const lower = description.toLowerCase();

    // Look up actual constructors from synced KB
    const sphereEntry = kb.lookup('SphereGeometry');
    const standardEntry = kb.lookup('MeshStandardMaterial');
    const dirLightEntry = kb.lookup('DirectionalLight');

    const hasBg       = lower.includes('dark') || lower.includes('space') || lower.includes('night');
    const hasBloom    = lower.includes('glow') || lower.includes('bloom') || lower.includes('neon');
    const hasParticles= lower.includes('particle') || lower.includes('galaxy') || lower.includes('star');
    const hasFog      = lower.includes('fog') || lower.includes('mist');

    const bg = hasBg ? '#050510' : '#1a1a2e';

    const sceneCode = sceneTools[0].handler({ background: bg, fog: hasFog, orbitControls: true, shadows: !hasParticles });
    const objCode   = hasParticles
      ? particleTools[0].handler({ type: lower.includes('galaxy') ? 'galaxy' : 'sphere', count: 8000, spread: 8, color: '#4488ff', animated: true })
      : geometryTools[0].handler({ type: 'sphere', name: 'sphere', radius: 1, materialType: 'standard', color: '#4488ff', castShadow: true });
    const lightCode = lightTools[0].handler({ type: 'ambient', intensity: 0.5 }) + '\n' +
                      lightTools[0].handler({ type: 'directional', name: 'sun', x: 5, y: 10, z: 5, castShadow: true });
    const postCode  = hasBloom
      ? postFxTools[0].handler({ effects: ['bloom', 'fxaa'], bloomStrength: 2, bloomRadius: 0.4, bloomThreshold: 0.1 })
      : '';

    // Enrich with live KB info
    const kbNote = sphereEntry
      ? `\n// KB info: ${sphereEntry.constructor} — ${sphereEntry.description.slice(0, 80)}`
      : '';

    const html = sceneCode.replace('// ── Your objects go below', `${kbNote}
// ── Objects ──────────────────────────────────────────────────────
${objCode}
// ── Lights ───────────────────────────────────────────────────────
${lightCode}`);

    return {
      content: [{
        type: 'text',
        text: html + (postCode ? `\n\n/* Post-processing:\n${postCode}\n*/` : '')
      }]
    };
  }
);

// ── Docs management tools ─────────────────────────────────────────────────────

server.tool(
  'threejs_docs_status',
  'Show the current Three.js docs sync status: last sync time, age, class count, knowledge base readiness.',
  {},
  async () => ({ content: [{ type: 'text', text: await getSyncStatus() }] })
);

server.tool(
  'threejs_docs_sync',
  'Force an immediate re-sync of all Three.js API docs from GitHub and rebuild the knowledge base.',
  {},
  async () => ({ content: [{ type: 'text', text: await forceSync() }] })
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildZodShape(properties, required = []) {
  const shape = {};
  for (const [key, def] of Object.entries(properties)) {
    let schema;
    if (def.type === 'string' && def.enum) schema = z.enum(def.enum);
    else if (def.type === 'string')         schema = z.string();
    else if (def.type === 'number')         schema = z.number();
    else if (def.type === 'boolean')        schema = z.boolean();
    else if (def.type === 'array')          schema = z.array(z.string());
    else                                    schema = z.any();
    if (def.description) schema = schema.describe(def.description);
    shape[key] = required.includes(key) ? schema : schema.optional();
  }
  return shape;
}

// ── Start ─────────────────────────────────────────────────────────────────────
async function main() {
  // Start docs sync in background — loads from disk immediately if fresh,
  // fetches from GitHub if stale. Either way, server starts without blocking.
  startDocsSync().catch(err => console.error('[docs-sync] startup error:', err.message));

  const transport = new StdioServerTransport();
  await server.connect(transport);

  const total = allTools.length + 6; // +6 KB/docs tools
  console.error(`[threejs-mcp] v2.0 running — ${total} tools registered`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
