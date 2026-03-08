export const sceneTools = [
  {
    name: "threejs_create_scene",
    description: "Generate a complete Three.js scene setup with renderer, camera, lighting, and animation loop",
    inputSchema: {
      type: "object",
      properties: {
        background: { type: "string", description: "Background color hex e.g. '#1a1a2e' or 'skyblue'" },
        fog: { type: "boolean", description: "Add fog to the scene" },
        fogColor: { type: "string", description: "Fog color hex" },
        fogNear: { type: "number", description: "Fog near distance" },
        fogFar: { type: "number", description: "Fog far distance" },
        antialias: { type: "boolean", description: "Enable antialiasing" },
        shadows: { type: "boolean", description: "Enable shadow maps" },
        orbitControls: { type: "boolean", description: "Add OrbitControls for mouse navigation" },
        axesHelper: { type: "boolean", description: "Show axes helper" },
        gridHelper: { type: "boolean", description: "Show grid helper" },
        stats: { type: "boolean", description: "Include Stats.js performance monitor" }
      }
    },
    handler({ background = "#000000", fog = false, fogColor = "#cccccc", fogNear = 10, fogFar = 100, antialias = true, shadows = false, orbitControls = true, axesHelper = false, gridHelper = false, stats = false } = {}) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Three.js Scene</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #000; }
    canvas { display: block; }
  </style>
</head>
<body>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';
${orbitControls ? "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';" : ""}
${stats ? "import Stats from 'three/addons/libs/stats.module.js';" : ""}

// ── Renderer ─────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: ${antialias} });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
${shadows ? "renderer.shadowMap.enabled = true;\nrenderer.shadowMap.type = THREE.PCFSoftShadowMap;" : ""}
document.body.appendChild(renderer.domElement);

// ── Scene ────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color('${background}');
${fog ? `scene.fog = new THREE.Fog('${fogColor}', ${fogNear}, ${fogFar});` : ""}

// ── Camera ───────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// ── Controls ─────────────────────────────────────────────────────────────────
${orbitControls ? "const controls = new OrbitControls(camera, renderer.domElement);\ncontrols.enableDamping = true;\ncontrols.dampingFactor = 0.05;" : ""}

// ── Helpers ──────────────────────────────────────────────────────────────────
${axesHelper ? "scene.add(new THREE.AxesHelper(5));" : ""}
${gridHelper ? "scene.add(new THREE.GridHelper(10, 10));" : ""}
${stats ? "const stats = new Stats();\ndocument.body.appendChild(stats.dom);" : ""}

// ── Resize handler ───────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Animation loop ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  ${orbitControls ? "controls.update();" : ""}
  ${stats ? "stats.update();" : ""}
  renderer.render(scene, camera);
}
animate();

// ── Your objects go below ────────────────────────────────────────────────────

</script>
</body>
</html>`;
    }
  },

  {
    name: "threejs_add_fog",
    description: "Generate code to add linear or exponential fog to a Three.js scene",
    inputSchema: {
      type: "object",
      required: ["type"],
      properties: {
        type: { type: "string", enum: ["linear", "exponential"], description: "Fog type" },
        color: { type: "string", description: "Fog color hex" },
        near: { type: "number", description: "Near distance (linear only)" },
        far: { type: "number", description: "Far distance (linear only)" },
        density: { type: "number", description: "Density (exponential only)" }
      }
    },
    handler({ type = "linear", color = "#cccccc", near = 10, far = 100, density = 0.025 } = {}) {
      if (type === "linear") {
        return `scene.fog = new THREE.Fog('${color}', ${near}, ${far});`;
      }
      return `scene.fog = new THREE.FogExp2('${color}', ${density});`;
    }
  }
];
