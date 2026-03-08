/**
 * @indiavenkatesh/mcp-threejs
 *
 * MCP server exposing all Three.js features as structured tools,
 * with automatic daily docs sync from the official Three.js GitHub repo.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { sceneTools } from './tools/scene.js';
import { geometryTools } from './tools/geometry.js';
import { materialTools } from './tools/material.js';
import {
  lightTools, cameraTools, animationTools, loaderTools,
  postFxTools, particleTools, helperTools, raycastTools,
  physicsTools, shadowTools
} from './tools/features.js';
import { startDocsSync, forceSync, getSyncStatus, searchDocs } from './docs-sync.js';

// ── Server setup ─────────────────────────────────────────────────────────────
const server = new McpServer({
  name: 'threejs-mcp',
  version: '1.0.0',
  description: 'Complete Three.js toolkit as MCP tools with daily auto-synced API docs'
});

// ── Collect all tools ────────────────────────────────────────────────────────
const allTools = [
  ...sceneTools,
  ...geometryTools,
  ...materialTools,
  ...lightTools,
  ...cameraTools,
  ...animationTools,
  ...loaderTools,
  ...postFxTools,
  ...particleTools,
  ...helperTools,
  ...raycastTools,
  ...physicsTools,
  ...shadowTools
];

// ── Register every Three.js tool ─────────────────────────────────────────────
for (const tool of allTools) {
  // Convert flat JSON Schema inputSchema to Zod shape for MCP SDK
  const zodShape = buildZodShape(tool.inputSchema?.properties || {}, tool.inputSchema?.required || []);

  server.tool(
    tool.name,
    tool.description,
    zodShape,
    async (args) => {
      try {
        const result = tool.handler(args);
        return {
          content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Error: ${err.message}` }],
          isError: true
        };
      }
    }
  );
}

// ── Docs tools ───────────────────────────────────────────────────────────────
server.tool(
  'threejs_docs_status',
  'Check the status of the Three.js docs auto-sync (last sync time, file size, age)',
  {},
  async () => ({
    content: [{ type: 'text', text: await getSyncStatus() }]
  })
);

server.tool(
  'threejs_docs_sync',
  'Force an immediate re-sync of the Three.js API documentation from GitHub',
  {},
  async () => ({
    content: [{ type: 'text', text: await forceSync() }]
  })
);

server.tool(
  'threejs_docs_search',
  'Search the locally synced Three.js documentation for a class, method, or property',
  { query: z.string().describe('Search term, e.g. "BufferGeometry", "castShadow", "lerp"') },
  async ({ query }) => ({
    content: [{ type: 'text', text: await searchDocs(query) }]
  })
);

// ── Full scene generator (meta-tool) ─────────────────────────────────────────
server.tool(
  'threejs_generate_full_scene',
  'Generate a complete self-contained Three.js HTML file from a natural language description. Combines scene, geometry, material, lighting, and animation in one file.',
  {
    description: z.string().describe('What you want the scene to look like, e.g. "a rotating galaxy of blue particles with bloom effect"'),
    width: z.number().optional(),
    height: z.number().optional()
  },
  async ({ description }) => {
    // Compose a rich scene from the description keywords
    const lower = description.toLowerCase();

    const hasBg = lower.includes('dark') || lower.includes('space') || lower.includes('night');
    const hasBloom = lower.includes('glow') || lower.includes('bloom') || lower.includes('neon');
    const hasParticles = lower.includes('particle') || lower.includes('galaxy') || lower.includes('star') || lower.includes('dust');
    const hasFog = lower.includes('fog') || lower.includes('misty') || lower.includes('haze');
    const hasPhysics = lower.includes('physics') || lower.includes('bounce') || lower.includes('fall');

    const bg = hasBg ? '#050510' : '#1a1a2e';
    const sceneCode = sceneTools[0].handler({ background: bg, fog: hasFog, orbitControls: true, shadows: !hasParticles });

    const geometryCode = hasParticles
      ? particleTools[0].handler({ type: lower.includes('galaxy') ? 'galaxy' : 'sphere', count: 8000, spread: 8, color: '#4488ff', animated: true })
      : geometryTools[0].handler({ type: 'sphere', name: 'sphere', radius: 1, materialType: 'standard', color: '#4488ff', castShadow: true });

    const lightCode = lightTools[0].handler({ type: 'ambient', color: '#ffffff', intensity: 0.5 }) + '\n' +
      lightTools[0].handler({ type: 'directional', name: 'sun', x: 5, y: 10, z: 5, castShadow: true });

    const animCode = hasParticles
      ? '// In animate(): particles.rotation.y += 0.0002;'
      : animationTools[0].handler({ type: 'rotate', targetName: 'sphere', axis: 'y', speed: 0.5 });

    const postCode = hasBloom
      ? postFxTools[0].handler({ effects: ['bloom', 'fxaa'], bloomStrength: 2, bloomRadius: 0.5, bloomThreshold: 0.1 })
      : '';

    const combined = `<!-- Three.js Scene: ${description} -->
${sceneCode.replace('</script>', `
// ── Objects ──────────────────────────────────────────────────────
${geometryCode}

// ── Lights ───────────────────────────────────────────────────────
${lightCode}

// ── Post-processing ──────────────────────────────────────────────
${hasBloom ? '// See post-processing code below ↓' : ''}

// ── Animation ────────────────────────────────────────────────────
// (Add inside the animate() function above)
// ${animCode.split('\n').join('\n// ')}

</script>`)
}

${postCode ? `<!-- Post-processing additions -->\n<!-- ${postCode.split('\n').slice(0, 5).join('\n')} -->` : ''}`;

    return { content: [{ type: 'text', text: combined }] };
  }
);

// ── Zod shape builder ────────────────────────────────────────────────────────
function buildZodShape(properties, required = []) {
  const shape = {};
  for (const [key, def] of Object.entries(properties)) {
    let schema;
    if (def.type === 'string' && def.enum) {
      schema = z.enum(def.enum);
    } else if (def.type === 'string') {
      schema = z.string();
    } else if (def.type === 'number') {
      schema = z.number();
    } else if (def.type === 'boolean') {
      schema = z.boolean();
    } else if (def.type === 'array') {
      schema = z.array(z.string());
    } else {
      schema = z.any();
    }

    if (def.description) schema = schema.describe(def.description);
    shape[key] = required.includes(key) ? schema : schema.optional();
  }
  return shape;
}

// ── Start ────────────────────────────────────────────────────────────────────
async function main() {
  // Start daily docs sync in the background (non-blocking)
  startDocsSync().catch(err => console.error('[docs-sync] startup error:', err.message));

  // Start MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[threejs-mcp] Server running. Tools registered:', allTools.length + 4);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
