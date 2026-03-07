#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GEOMETRIES, MATERIALS, LIGHTS, ANIMATION_PATTERNS, SCENE_TEMPLATES } from "./threejs-knowledge.js";
import { generateSceneCode, generateAnimationCode, generateFullHTML } from "./code-generator.js";

const server = new McpServer({
  name: "threejs-mcp",
  version: "1.0.0",
});

// ── RESOURCES ──────────────────────────────────────────────────────────────

server.resource("threejs://geometries", "threejs://geometries", async (uri) => ({
  contents: [{
    uri: uri.href,
    mimeType: "application/json",
    text: JSON.stringify(GEOMETRIES, null, 2),
  }],
}));

server.resource("threejs://materials", "threejs://materials", async (uri) => ({
  contents: [{
    uri: uri.href,
    mimeType: "application/json",
    text: JSON.stringify(MATERIALS, null, 2),
  }],
}));

server.resource("threejs://lights", "threejs://lights", async (uri) => ({
  contents: [{
    uri: uri.href,
    mimeType: "application/json",
    text: JSON.stringify(LIGHTS, null, 2),
  }],
}));

server.resource("threejs://animation-patterns", "threejs://animation-patterns", async (uri) => ({
  contents: [{
    uri: uri.href,
    mimeType: "application/json",
    text: JSON.stringify(ANIMATION_PATTERNS, null, 2),
  }],
}));

// ── TOOLS ──────────────────────────────────────────────────────────────────

// 1. List available Three.js components
server.tool(
  "list_threejs_components",
  "List available Three.js geometries, materials, lights, and animation patterns",
  { category: z.enum(["geometries", "materials", "lights", "animations", "all"]).optional().default("all") },
  async ({ category }) => {
    const data = {};
    if (category === "all" || category === "geometries") data.geometries = Object.keys(GEOMETRIES);
    if (category === "all" || category === "materials") data.materials = Object.keys(MATERIALS);
    if (category === "all" || category === "lights")    data.lights = Object.keys(LIGHTS);
    if (category === "all" || category === "animations") data.animationPatterns = Object.keys(ANIMATION_PATTERNS);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// 2. Get component details
server.tool(
  "get_component_details",
  "Get detailed parameters and usage for a specific Three.js geometry, material, or light",
  {
    type: z.enum(["geometry", "material", "light"]),
    name: z.string().describe("Component name e.g. BoxGeometry, MeshStandardMaterial, PointLight"),
  },
  async ({ type, name }) => {
    const map = { geometry: GEOMETRIES, material: MATERIALS, light: LIGHTS };
    const detail = map[type]?.[name];
    if (!detail) {
      return { content: [{ type: "text", text: `Unknown ${type}: "${name}". Use list_threejs_components to see available options.` }] };
    }
    return { content: [{ type: "text", text: JSON.stringify(detail, null, 2) }] };
  }
);

// 3. Generate a Three.js scene
server.tool(
  "generate_scene",
  "Generate Three.js JavaScript code for a 3D scene with specified objects and settings",
  {
    objects: z.array(z.object({
      geometry:  z.string().describe("Three.js geometry name e.g. BoxGeometry"),
      material:  z.string().describe("Three.js material name e.g. MeshStandardMaterial"),
      color:     z.string().optional().default("#4488ff").describe("Hex color string"),
      position:  z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
      scale:     z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
      name:      z.string().optional().describe("Object name for reference"),
      params:    z.record(z.any()).optional().describe("Extra geometry constructor params"),
    })).describe("List of 3D objects to add to the scene"),
    lights: z.array(z.object({
      type:      z.string().describe("Light type e.g. AmbientLight, PointLight"),
      color:     z.string().optional().default("#ffffff"),
      intensity: z.number().optional().default(1),
      position:  z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    })).optional().default([{ type: "AmbientLight", color: "#ffffff", intensity: 0.6 }, { type: "DirectionalLight", color: "#ffffff", intensity: 1.2, position: { x: 5, y: 10, z: 5 } }]),
    background: z.string().optional().default("#0a0a1a").describe("Scene background color"),
    camera: z.object({
      fov:      z.number().optional().default(75),
      position: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional().default({ x: 0, y: 2, z: 6 }),
    }).optional().default({}),
    enableOrbitControls: z.boolean().optional().default(true),
    enableShadows:       z.boolean().optional().default(true),
  },
  async (params) => {
    const code = generateSceneCode(params);
    return { content: [{ type: "text", text: code }] };
  }
);

// 4. Generate animation code
server.tool(
  "generate_animation",
  "Generate Three.js animation loop code for common animation patterns",
  {
    pattern: z.enum(["rotate", "orbit", "float", "pulse", "wave", "spiral", "bounce", "custom"]),
    targetObject: z.string().optional().default("mesh").describe("Variable name of the object to animate"),
    axis: z.enum(["x", "y", "z", "xy", "xyz"]).optional().default("y"),
    speed: z.number().optional().default(1.0).describe("Animation speed multiplier"),
    amplitude: z.number().optional().default(1.0).describe("Movement amplitude"),
    customCode: z.string().optional().describe("Custom animation code (for pattern='custom')"),
  },
  async (params) => {
    const code = generateAnimationCode(params);
    return { content: [{ type: "text", text: code }] };
  }
);

// 5. Generate a complete runnable HTML file
server.tool(
  "generate_full_animation",
  "Generate a complete, self-contained HTML file with Three.js 3D animation ready to run in the browser",
  {
    title: z.string().optional().default("Three.js Animation"),
    description: z.string().describe("Natural language description of what to animate. E.g. 'a rotating glowing torus with particle trails'"),
    template: z.enum(["solar-system", "particle-field", "geometric-shapes", "terrain", "custom"]).optional().default("custom"),
    objects: z.array(z.object({
      geometry:  z.string(),
      material:  z.string(),
      color:     z.string().optional().default("#4488ff"),
      position:  z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
      scale:     z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
      animation: z.object({
        pattern:   z.string(),
        axis:      z.string().optional().default("y"),
        speed:     z.number().optional().default(1),
        amplitude: z.number().optional().default(1),
      }).optional(),
      name: z.string().optional(),
    })).optional().default([]),
    lights: z.array(z.object({
      type:      z.string(),
      color:     z.string().optional().default("#ffffff"),
      intensity: z.number().optional().default(1),
      position:  z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    })).optional(),
    background: z.string().optional().default("#0a0a1a"),
    enablePostProcessing: z.boolean().optional().default(false),
    enableOrbitControls:  z.boolean().optional().default(true),
    enableStats:          z.boolean().optional().default(false),
    cameraPosition: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional().default({ x: 0, y: 2, z: 8 }),
  },
  async (params) => {
    let html;
    if (params.template !== "custom") {
      html = SCENE_TEMPLATES[params.template]?.(params) ?? generateFullHTML(params);
    } else {
      html = generateFullHTML(params);
    }
    return { content: [{ type: "text", text: html }] };
  }
);

// 6. Get scene template
server.tool(
  "get_scene_template",
  "Get a ready-made Three.js scene template for common scenarios",
  { template: z.enum(["solar-system", "particle-field", "geometric-shapes", "terrain", "vortex", "galaxy"]) },
  async ({ template }) => {
    const html = SCENE_TEMPLATES[template]?.({}) ?? "Template not found.";
    return { content: [{ type: "text", text: html }] };
  }
);

// 7. Explain a Three.js concept
server.tool(
  "explain_threejs_concept",
  "Get a clear explanation and code example for a Three.js concept",
  { concept: z.string().describe("Three.js concept e.g. 'raycasting', 'shader material', 'texture mapping', 'post-processing'") },
  async ({ concept }) => {
    const concepts = {
      "raycasting": `Raycasting in Three.js allows picking / interacting with 3D objects via mouse.\n\nCode:\nconst raycaster = new THREE.Raycaster();\nconst mouse = new THREE.Vector2();\n\nwindow.addEventListener('mousemove', (e) => {\n  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;\n  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;\n});\n\n// Inside animation loop:\nraycaster.setFromCamera(mouse, camera);\nconst intersects = raycaster.intersectObjects(scene.children);\nif (intersects.length > 0) {\n  intersects[0].object.material.color.set(0xff0000);\n}`,
      "shader material": `ShaderMaterial lets you write custom GLSL shaders.\n\nCode:\nconst material = new THREE.ShaderMaterial({\n  uniforms: { time: { value: 0.0 }, color: { value: new THREE.Color(0x00ff88) } },\n  vertexShader: \`\n    uniform float time;\n    void main() {\n      vec3 pos = position;\n      pos.y += sin(pos.x * 2.0 + time) * 0.3;\n      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n    }\`,\n  fragmentShader: \`\n    uniform vec3 color;\n    void main() { gl_FragColor = vec4(color, 1.0); }\`\n});\n// In animation loop: material.uniforms.time.value += 0.01;`,
      "texture mapping": `Apply images as textures to geometry surfaces.\n\nCode:\nconst loader = new THREE.TextureLoader();\nconst texture = loader.load('texture.jpg');\nconst material = new THREE.MeshStandardMaterial({ map: texture });\n// Other maps: normalMap, roughnessMap, metalnessMap, emissiveMap, aoMap`,
      "post-processing": `Add screen-space effects like bloom, depth-of-field, etc. Requires EffectComposer.\n\nCode (via CDN):\nimport { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';\nimport { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';\nimport { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';\n\nconst composer = new EffectComposer(renderer);\ncomposer.addPass(new RenderPass(scene, camera));\ncomposer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85));\n// In loop: composer.render() instead of renderer.render()`,
    };
    const found = Object.entries(concepts).find(([k]) => k.toLowerCase().includes(concept.toLowerCase()));
    const text = found ? found[1] : `Concept "${concept}" not found. Available: ${Object.keys(concepts).join(", ")}`;
    return { content: [{ type: "text", text }] };
  }
);

// ── PROMPTS ────────────────────────────────────────────────────────────────

server.prompt(
  "create_3d_animation",
  "Generate a Three.js 3D animation from a natural language description",
  { description: z.string().describe("Describe the 3D animation you want to create") },
  ({ description }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `You are a Three.js expert. Create a stunning 3D animation based on this description:\n\n"${description}"\n\nSteps:\n1. Use list_threejs_components to discover available geometries/materials\n2. Use generate_full_animation with appropriate objects and animations\n3. Return the complete HTML file content\n\nMake it visually impressive with good lighting, colors, and smooth animations.`,
      },
    }],
  })
);

// ── START ──────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Three.js MCP Server running on stdio");
