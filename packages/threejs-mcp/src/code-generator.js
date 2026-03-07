import { ANIMATION_PATTERNS } from "./threejs-knowledge.js";

// ── Scene code generator ───────────────────────────────────────────────────

export function generateSceneCode(params) {
  const { objects, lights, background, camera, enableOrbitControls, enableShadows } = params;

  const objectsCode = objects.map((obj, i) => {
    const name = obj.name ?? `mesh${i}`;
    const pos  = obj.position ?? { x: 0, y: 0, z: 0 };
    const scl  = obj.scale    ?? { x: 1, y: 1, z: 1 };
    return `// ${name}
const ${name}Geo = new THREE.${obj.geometry}();
const ${name}Mat = new THREE.${obj.material}({ color: "${obj.color}" });
const ${name} = new THREE.Mesh(${name}Geo, ${name}Mat);
${name}.position.set(${pos.x}, ${pos.y}, ${pos.z});
${name}.scale.set(${scl.x}, ${scl.y}, ${scl.z});
${enableShadows ? `${name}.castShadow = true;\n${name}.receiveShadow = true;` : ""}
scene.add(${name});`;
  }).join("\n\n");

  const lightsCode = lights.map((l, i) => {
    const name = `light${i}`;
    const pos  = l.position ?? { x: 0, y: 5, z: 0 };
    return `const ${name} = new THREE.${l.type}("${l.color}", ${l.intensity});
${l.type !== "AmbientLight" ? `${name}.position.set(${pos.x}, ${pos.y}, ${pos.z});` : ""}
scene.add(${name});`;
  }).join("\n");

  return `// Three.js Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("${background}");

const camera = new THREE.PerspectiveCamera(${camera.fov ?? 75}, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(${camera.position?.x ?? 0}, ${camera.position?.y ?? 2}, ${camera.position?.z ?? 6});

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
${enableShadows ? "renderer.shadowMap.enabled = true;" : ""}
document.body.appendChild(renderer.domElement);

${enableOrbitControls ? "const controls = new OrbitControls(camera, renderer.domElement);\ncontrols.enableDamping = true;" : ""}

// Lights
${lightsCode}

// Objects
${objectsCode}

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  // TODO: add animation here
  ${enableOrbitControls ? "controls.update();" : ""}
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});`;
}

// ── Animation code generator ───────────────────────────────────────────────

export function generateAnimationCode({ pattern, targetObject, axis, speed, amplitude, customCode }) {
  if (pattern === "custom") return customCode ?? "// Add your custom animation code here";
  const p = ANIMATION_PATTERNS[pattern];
  if (!p) return `// Unknown pattern: ${pattern}`;
  return p.code(targetObject, axis, speed, amplitude);
}

// ── Full HTML generator ────────────────────────────────────────────────────

export function generateFullHTML(params) {
  const {
    title = "Three.js Animation",
    objects = [],
    lights  = [
      { type: "AmbientLight",     color: "#ffffff", intensity: 0.6 },
      { type: "DirectionalLight", color: "#ffffff", intensity: 1.2, position: { x: 5, y: 10, z: 5 } },
    ],
    background        = "#0a0a1a",
    enableOrbitControls = true,
    enableStats         = false,
    cameraPosition      = { x: 0, y: 2, z: 8 },
  } = params;

  // Build JS objects + animations
  const objJS = objects.map((obj, i) => {
    const name = obj.name ?? `mesh${i}`;
    const pos  = obj.position ?? { x: i * 3 - objects.length * 1.5, y: 0, z: 0 };
    const scl  = obj.scale    ?? { x: 1, y: 1, z: 1 };

    let animCode = "";
    if (obj.animation) {
      const { pattern, axis, speed = 1, amplitude = 1 } = obj.animation;
      const p = ANIMATION_PATTERNS[pattern];
      if (p) animCode = `  ${p.code(name, axis ?? "y", speed, amplitude).split("\n").join("\n  ")}`;
    }

    return { name, pos, scl, obj, animCode };
  });

  const objectsBlock = objJS.map(({ name, pos, scl, obj }) => `
  const ${name}Geo = new THREE.${obj.geometry}();
  const ${name}Mat = new THREE.MeshStandardMaterial({ color: "${obj.color ?? "#4488ff"}", roughness: 0.4, metalness: 0.3 });
  const ${name} = new THREE.Mesh(${name}Geo, ${name}Mat);
  ${name}.position.set(${pos.x}, ${pos.y}, ${pos.z});
  ${name}.scale.set(${scl.x}, ${scl.y}, ${scl.z});
  ${name}.castShadow = true;
  scene.add(${name});`).join("\n");

  const lightsBlock = lights.map((l, i) => {
    const n   = `light${i}`;
    const pos = l.position ?? { x: 0, y: 5, z: 0 };
    return `  const ${n} = new THREE.${l.type}("${l.color}", ${l.intensity});
  ${l.type !== "AmbientLight" ? `${n}.position.set(${pos.x}, ${pos.y}, ${pos.z}); ${n}.castShadow = true;` : ""}
  scene.add(${n});`;
  }).join("\n");

  const animBlock = objJS.filter(o => o.animCode).map(o => o.animCode).join("\n");

  // If no objects were supplied, render a nice default TorusKnot
  const defaultScene = objects.length === 0 ? `
  const mainGeo = new THREE.TorusKnotGeometry(1.5, 0.5, 128, 16);
  const mainMat = new THREE.MeshStandardMaterial({ color: "#7744ff", metalness: 0.6, roughness: 0.2, emissive: "#220055", emissiveIntensity: 0.3 });
  const mainMesh = new THREE.Mesh(mainGeo, mainMat);
  mainMesh.castShadow = true;
  scene.add(mainMesh);
  ` : "";

  const defaultAnim = objects.length === 0 ? `
  mainMesh.rotation.x += 0.4 * delta;
  mainMesh.rotation.y += 0.7 * delta;
  ` : "";

  // Stars background
  const starsBlock = `
  const starsGeo = new THREE.BufferGeometry();
  const starsArr = new Float32Array(5000 * 3);
  for (let i = 0; i < 5000 * 3; i++) starsArr[i] = (Math.random() - 0.5) * 200;
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starsArr, 3));
  scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 })));`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: ${background}; overflow: hidden; }
  canvas { display: block; }
  #label { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
    color: rgba(255,255,255,0.4); font-family: monospace; font-size: 12px; letter-spacing: 2px;
    pointer-events: none; }
</style>
</head>
<body>
<div id="label">${title.toUpperCase()}</div>
<script type="module">
import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';
${enableStats ? "import Stats from 'https://cdn.skypack.dev/stats.js';" : ""}

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// Scene & Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color("${background}");
scene.fog = new THREE.FogExp2("${background}", 0.018);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
camera.position.set(${cameraPosition.x}, ${cameraPosition.y}, ${cameraPosition.z});

${enableOrbitControls ? `const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;` : ""}

${enableStats ? `const stats = new Stats(); document.body.appendChild(stats.dom);` : ""}

// Stars
${starsBlock}

// Lights
${lightsBlock}

// Objects
${defaultScene}
${objectsBlock}

// Animation
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  ${defaultAnim}
  ${animBlock}
  ${enableOrbitControls ? "controls.update();" : ""}
  ${enableStats ? "stats.update();" : ""}
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
<\/script>
</body>
</html>`;
}
