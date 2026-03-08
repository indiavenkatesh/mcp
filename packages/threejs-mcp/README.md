# @indiavenkatesh/mcp-threejs

A full-featured MCP server that exposes **every major Three.js capability** as a structured tool, plus an **automatic daily docs sync** that keeps `docs/API.md` up-to-date with the official Three.js GitHub repo — without any manual work.

---

## Features

| Category | Tools |
|---|---|
| 🎬 Scene | `threejs_create_scene`, `threejs_add_fog` |
| 📐 Geometry | `threejs_add_geometry` — 14 geometry types |
| 🎨 Material | `threejs_add_material` — 13 material types including ShaderMaterial, MeshPhysicalMaterial |
| 💡 Lights | `threejs_add_light` — Ambient, Directional, Point, Spot, Hemisphere, RectArea |
| 📷 Cameras | `threejs_add_camera` — Perspective, Orthographic, CubeCamera |
| 🎞 Animation | `threejs_animate` — rotate, scale, bounce, orbit, keyframe, mixer, morph, GSAP |
| 📦 Loaders | `threejs_load_asset` — GLTF, OBJ, FBX, STL, Draco, HDR, Texture, Video |
| ✨ Post-FX | `threejs_add_post_processing` — Bloom, SSAO, FXAA, Film, Glitch, Pixel, Outline |
| 💥 Particles | `threejs_particle_system` — random, sphere, galaxy, snow, fire patterns |
| 🔧 Helpers | `threejs_add_helper` — Axes, Grid, Box, Camera, Light helpers |
| 🖱 Raycasting | `threejs_raycasting` — click, hover, drag modes |
| ⚙️ Physics | `threejs_add_physics` — cannon-es world, bodies, ground, spring |
| 🌑 Shadows | `threejs_setup_shadows` — PCFSoft, VSM, configures renderer + lights |
| 🪄 Meta | `threejs_generate_full_scene` — full scene from natural language |
| 📚 Docs | `threejs_docs_status`, `threejs_docs_sync`, `threejs_docs_search` |

---

## Auto Docs Sync

When the server starts, it checks if `docs/API.md` is stale (older than 23 hours).  
If it is, it fetches the latest docs from the [official Three.js GitHub repo](https://github.com/mrdoob/three.js) and writes a structured markdown file with:

- Every class across all 17 API categories
- Constructor signatures
- Properties and method signatures
- Direct links to threejs.org for each class

After first run, it re-syncs automatically at **2:00 AM UTC every day** via `node-cron`.

You can also trigger a sync manually from your LLM:

> "Sync the Three.js docs" → calls `threejs_docs_sync`

> "Search for BufferGeometry in the docs" → calls `threejs_docs_search`

---

## Installation

```bash
cd packages/threejs-mcp
npm install
```

## Running

```bash
node src/index.js
```

## Claude Desktop Config

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "threejs": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/packages/threejs-mcp/src/index.js"]
    }
  }
}
```

Restart Claude Desktop — all tools appear automatically.

---

## Tool Usage Examples

### Create a full scene
```
threejs_create_scene({
  background: "#050510",
  fog: true,
  shadows: true,
  orbitControls: true,
  stats: true
})
```

### Add a physically-based glass sphere
```
threejs_add_geometry({ type: "sphere", name: "glass", radius: 1, materialType: "physical" })
threejs_add_material({ type: "physical", name: "glassMat", transmission: 1, ior: 1.5, roughness: 0, metalness: 0, transparent: true })
```

### Add bloom post-processing
```
threejs_add_post_processing({ effects: ["bloom", "fxaa"], bloomStrength: 2.5, bloomThreshold: 0.1 })
```

### Spawn a galaxy particle system
```
threejs_particle_system({ type: "galaxy", count: 10000, spread: 10, color: "#4488ff", animated: true })
```

### Generate a full scene from description
```
threejs_generate_full_scene({ description: "a neon galaxy with glowing particles and bloom" })
```

### Search the docs
```
threejs_docs_search({ query: "RectAreaLight" })
```

---

## Docs Output

After first run, `docs/API.md` contains the full Three.js API reference organized by category:

```
docs/
├── API.md          ← auto-generated, updated daily
└── .sync-meta.json ← sync metadata (last run time, size, duration)
```

---

## Project Structure

```
packages/threejs-mcp/
├── src/
│   ├── index.js          ← MCP server entry point
│   ├── docs-sync.js      ← Daily docs auto-sync scheduler
│   └── tools/
│       ├── scene.js      ← Scene / renderer tools
│       ├── geometry.js   ← All geometry types
│       ├── material.js   ← All material types
│       └── features.js   ← Lights, cameras, animation, loaders,
│                            post-FX, particles, helpers, raycasting,
│                            physics, shadows
├── docs/
│   ├── API.md            ← Auto-synced Three.js docs
│   └── .sync-meta.json
└── package.json
```

---

## Adding New Tools

Each tool follows the same pattern:

```js
{
  name: 'threejs_my_tool',
  description: 'What this tool does',
  inputSchema: { type: 'object', properties: { ... } },
  handler(args) {
    return `// generated Three.js code here`;
  }
}
```

Export it from a tools file and add it to the `allTools` array in `src/index.js`.
