/**
 * knowledge-base.js
 *
 * In-memory store of all Three.js classes parsed from the synced docs.
 * Rebuilt every time docs-sync runs (startup + daily cron).
 * All MCP tools query this instead of hardcoded strings.
 *
 * Structure:
 *   Map<className, { category, description, constructor, properties, methods, docsUrl }>
 */

/** @type {Map<string, ClassEntry>} */
const store = new Map();

let lastBuilt = null;
let totalClasses = 0;

/**
 * @typedef {{ 
 *   className: string,
 *   category: string,
 *   categoryPath: string,
 *   description: string,
 *   constructor: string,
 *   properties: Array<{ name: string, type: string }>,
 *   methods: Array<{ name: string, params: string, returns: string }>,
 *   docsUrl: string
 * }} ClassEntry
 */

/**
 * Rebuild the store from an array of parsed class entries.
 * Called by docs-sync after each successful sync.
 *
 * @param {ClassEntry[]} entries
 */
export function rebuild(entries) {
  store.clear();
  for (const entry of entries) {
    store.set(entry.className.toLowerCase(), entry);
    // Also index by exact case
    store.set(entry.className, entry);
  }
  totalClasses = entries.length;
  lastBuilt = new Date().toISOString();
  console.log(`[knowledge-base] ✅ Rebuilt with ${totalClasses} classes from ${lastBuilt}`);
}

/**
 * Look up a class by name (case-insensitive).
 * @param {string} name
 * @returns {ClassEntry|null}
 */
export function lookup(name) {
  return store.get(name) || store.get(name.toLowerCase()) || null;
}

/**
 * Search classes by partial name or description.
 * @param {string} query
 * @param {number} limit
 * @returns {ClassEntry[]}
 */
export function search(query, limit = 15) {
  const q = query.toLowerCase();
  const results = [];
  const seen = new Set();

  for (const [key, entry] of store.entries()) {
    if (seen.has(entry.className)) continue;
    const match =
      entry.className.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.category.toLowerCase().includes(q) ||
      entry.properties.some(p => p.name.toLowerCase().includes(q)) ||
      entry.methods.some(m => m.name.toLowerCase().includes(q));

    if (match) {
      results.push(entry);
      seen.add(entry.className);
    }
    if (results.length >= limit) break;
  }
  return results;
}

/**
 * List all classes, optionally filtered by category.
 * @param {string|null} category
 * @returns {ClassEntry[]}
 */
export function listClasses(category = null) {
  const seen = new Set();
  const results = [];
  for (const entry of store.values()) {
    if (seen.has(entry.className)) continue;
    if (category && entry.category.toLowerCase() !== category.toLowerCase()) continue;
    results.push(entry);
    seen.add(entry.className);
  }
  return results.sort((a, b) => a.className.localeCompare(b.className));
}

/**
 * Get all unique categories.
 * @returns {string[]}
 */
export function listCategories() {
  const cats = new Set();
  for (const entry of store.values()) cats.add(entry.category);
  return [...cats].sort();
}

/**
 * Get store status.
 */
export function getStatus() {
  return {
    totalClasses,
    lastBuilt,
    categories: listCategories(),
    ready: store.size > 0
  };
}

/**
 * Format a ClassEntry into rich markdown for MCP tool output.
 * @param {ClassEntry} entry
 * @returns {string}
 */
export function formatEntry(entry) {
  let out = `## THREE.${entry.className}\n`;
  out += `**Category:** ${entry.category}\n\n`;
  out += `**Description:** ${entry.description}\n\n`;
  out += `**Constructor:** \`${entry.constructor}\`\n\n`;

  if (entry.properties.length > 0) {
    out += `**Properties (${entry.properties.length}):**\n`;
    out += entry.properties.map(p => `- \`.${p.name}\` : \`${p.type}\``).join('\n');
    out += '\n\n';
  }

  if (entry.methods.length > 0) {
    out += `**Methods (${entry.methods.length}):**\n`;
    out += entry.methods.map(m => `- \`.${m.name}(${m.params})\` → \`${m.returns}\``).join('\n');
    out += '\n\n';
  }

  out += `**Docs:** ${entry.docsUrl}`;
  return out;
}
