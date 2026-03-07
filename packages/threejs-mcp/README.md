# @indiavenkatesh/mcp-threejs

> MCP Server that gives LLMs the ability to generate Three.js 3D animations from natural language.

## Tools

| Tool | Description |
|------|-------------|
| `list_threejs_components` | List geometries, materials, lights, animation patterns |
| `get_component_details` | Full params for any Three.js component |
| `generate_scene` | Generate Three.js JS scene code |
| `generate_animation` | Generate animation loop snippets |
| `generate_full_animation` | **Main** — complete self-contained HTML file |
| `get_scene_template` | 6 ready-made scenes (solar-system, galaxy, terrain…) |
| `explain_threejs_concept` | Docs for raycasting, shaders, textures, post-processing |

## Built-in Templates

| Template | Description |
|----------|-------------|
| `solar-system` | 8 planets with orbits, rings, and shadows |
| `particle-field` | 12,000 animated particles with custom GLSL shaders |
| `geometric-shapes` | Torus knot, icosahedron, torus with colored point lights |
| `terrain` | Neon animated wave terrain via ShaderMaterial |
| `vortex` | Additive-blended color particle vortex |
| `galaxy` | 20,000-star spiral galaxy |

## Usage

```bash
npm install
node src/index.js
```

### Claude Desktop

```json
{
  "mcpServers": {
    "threejs": {
      "command": "node",
      "args": ["/absolute/path/to/packages/threejs-mcp/src/index.js"]
    }
  }
}
```

### Cursor / Windsurf / VS Code

```json
{
  "threejs-mcp": {
    "command": "node",
    "args": ["/absolute/path/to/packages/threejs-mcp/src/index.js"],
    "transport": "stdio"
  }
}
```

## Example Prompts

- *"Create a rotating glowing torus knot with a particle field background"*
- *"Generate a solar system with all 8 planets and Saturn's rings"*
- *"Build a neon wave terrain with animated GLSL shader"*
- *"Create a galaxy with spiral arms and 20,000 particles"*

The LLM returns a complete HTML file — open it directly in any browser, no build step needed.
