export const GEOMETRIES = {
  BoxGeometry: {
    description: "A rectangular box (cube)",
    params: [
      { name: "width", type: "number", default: 1 },
      { name: "height", type: "number", default: 1 },
      { name: "depth", type: "number", default: 1 },
      { name: "widthSegments", type: "integer", default: 1 },
      { name: "heightSegments", type: "integer", default: 1 },
      { name: "depthSegments", type: "integer", default: 1 },
    ],
    example: "new THREE.BoxGeometry(1, 1, 1)",
  },
  SphereGeometry: {
    description: "A sphere",
    params: [
      { name: "radius", type: "number", default: 1 },
      { name: "widthSegments", type: "integer", default: 32 },
      { name: "heightSegments", type: "integer", default: 16 },
    ],
    example: "new THREE.SphereGeometry(1, 32, 16)",
  },
  TorusGeometry: {
    description: "A torus (donut shape)",
    params: [
      { name: "radius", type: "number", default: 1 },
      { name: "tube", type: "number", default: 0.4 },
      { name: "radialSegments", type: "integer", default: 16 },
      { name: "tubularSegments", type: "integer", default: 100 },
    ],
    example: "new THREE.TorusGeometry(1, 0.4, 16, 100)",
  },
  TorusKnotGeometry: {
    description: "A torus knot — complex knotted shape",
    params: [
      { name: "radius", type: "number", default: 1 },
      { name: "tube", type: "number", default: 0.4 },
      { name: "tubularSegments", type: "integer", default: 100 },
      { name: "radialSegments", type: "integer", default: 8 },
      { name: "p", type: "integer", default: 2 },
      { name: "q", type: "integer", default: 3 },
    ],
    example: "new THREE.TorusKnotGeometry(1, 0.3, 100, 16, 2, 3)",
  },
  CylinderGeometry: {
    description: "A cylinder, cone, or frustum",
    params: [
      { name: "radiusTop", type: "number", default: 1 },
      { name: "radiusBottom", type: "number", default: 1 },
      { name: "height", type: "number", default: 1 },
      { name: "radialSegments", type: "integer", default: 32 },
    ],
    example: "new THREE.CylinderGeometry(0.5, 0.5, 2, 32)",
  },
  ConeGeometry: {
    description: "A cone",
    params: [
      { name: "radius", type: "number", default: 1 },
      { name: "height", type: "number", default: 1 },
      { name: "radialSegments", type: "integer", default: 32 },
    ],
    example: "new THREE.ConeGeometry(1, 2, 32)",
  },
  PlaneGeometry: {
    description: "A flat rectangular plane",
    params: [
      { name: "width", type: "number", default: 1 },
      { name: "height", type: "number", default: 1 },
      { name: "widthSegments", type: "integer", default: 1 },
      { name: "heightSegments", type: "integer", default: 1 },
    ],
    example: "new THREE.PlaneGeometry(10, 10, 50, 50)",
  },
  OctahedronGeometry: {
    description: "An octahedron (8-faced polyhedron)",
    params: [{ name: "radius", type: "number", default: 1 }],
    example: "new THREE.OctahedronGeometry(1)",
  },
  IcosahedronGeometry: {
    description: "An icosahedron (20-faced polyhedron) — useful for spherical subdivision",
    params: [
      { name: "radius", type: "number", default: 1 },
      { name: "detail", type: "integer", default: 0 },
    ],
    example: "new THREE.IcosahedronGeometry(1, 0)",
  },
  RingGeometry: {
    description: "A flat ring / annulus",
    params: [
      { name: "innerRadius", type: "number", default: 0.5 },
      { name: "outerRadius", type: "number", default: 1 },
      { name: "thetaSegments", type: "integer", default: 32 },
    ],
    example: "new THREE.RingGeometry(0.5, 1, 32)",
  },
  TetrahedronGeometry: {
    description: "A tetrahedron (4-faced polyhedron)",
    params: [{ name: "radius", type: "number", default: 1 }],
    example: "new THREE.TetrahedronGeometry(1)",
  },
  BufferGeometry: {
    description: "Custom geometry via vertex buffer — used for particles and procedural shapes",
    params: [],
    example: "new THREE.BufferGeometry()",
  },
};

export const MATERIALS = {
  MeshStandardMaterial: {
    description: "PBR material — supports metalness/roughness. Best for realistic rendering.",
    params: { color: "hex", metalness: "0–1", roughness: "0–1", emissive: "hex", wireframe: "boolean" },
    example: "new THREE.MeshStandardMaterial({ color: 0x4488ff, metalness: 0.3, roughness: 0.4 })",
  },
  MeshPhysicalMaterial: {
    description: "Extended PBR with clearcoat, transmission (glass), and iridescence.",
    params: { color: "hex", metalness: "0–1", roughness: "0–1", transmission: "0–1", clearcoat: "0–1" },
    example: "new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0 })",
  },
  MeshBasicMaterial: {
    description: "Unlit flat material — ignores all lights. Fastest.",
    params: { color: "hex", wireframe: "boolean", transparent: "boolean", opacity: "0–1" },
    example: "new THREE.MeshBasicMaterial({ color: 0xff4400, wireframe: true })",
  },
  MeshNormalMaterial: {
    description: "Colors surfaces based on normals — great for debugging or visual effect.",
    params: { wireframe: "boolean" },
    example: "new THREE.MeshNormalMaterial()",
  },
  MeshPhongMaterial: {
    description: "Blinn-Phong shading — cheaper than PBR, supports shininess/specular.",
    params: { color: "hex", specular: "hex", shininess: "number", emissive: "hex" },
    example: "new THREE.MeshPhongMaterial({ color: 0x44ff88, shininess: 100 })",
  },
  MeshToonMaterial: {
    description: "Cel/toon shading for cartoon look.",
    params: { color: "hex" },
    example: "new THREE.MeshToonMaterial({ color: 0xff8800 })",
  },
  PointsMaterial: {
    description: "Material for particle systems (Points object).",
    params: { color: "hex", size: "number", transparent: "boolean", opacity: "0–1", sizeAttenuation: "boolean" },
    example: "new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, sizeAttenuation: true })",
  },
  LineBasicMaterial: {
    description: "Material for lines.",
    params: { color: "hex", linewidth: "number" },
    example: "new THREE.LineBasicMaterial({ color: 0x00ffff })",
  },
  ShaderMaterial: {
    description: "Full custom GLSL vertex + fragment shaders. Maximum flexibility.",
    params: { uniforms: "object", vertexShader: "string (GLSL)", fragmentShader: "string (GLSL)" },
    example: "new THREE.ShaderMaterial({ uniforms: { time: { value: 0 } }, vertexShader: '...', fragmentShader: '...' })",
  },
};

export const LIGHTS = {
  AmbientLight: {
    description: "Illuminates all objects equally from all directions. No shadows.",
    params: { color: "hex", intensity: "number" },
    example: "new THREE.AmbientLight(0xffffff, 0.5)",
  },
  DirectionalLight: {
    description: "Parallel rays like sunlight. Supports shadows.",
    params: { color: "hex", intensity: "number", position: "Vector3" },
    example: "const light = new THREE.DirectionalLight(0xffffff, 1); light.position.set(5, 10, 5);",
  },
  PointLight: {
    description: "Emits light in all directions from a point. Like a light bulb.",
    params: { color: "hex", intensity: "number", distance: "number", decay: "number" },
    example: "const light = new THREE.PointLight(0xff4400, 2, 50); light.position.set(3, 5, 3);",
  },
  SpotLight: {
    description: "Cone-shaped spotlight with shadows. Like a stage spotlight.",
    params: { color: "hex", intensity: "number", distance: "number", angle: "radians", penumbra: "0–1" },
    example: "const light = new THREE.SpotLight(0xffffff, 2); light.position.set(0, 10, 0); light.angle = Math.PI / 6;",
  },
  HemisphereLight: {
    description: "Sky/ground gradient light — great for outdoor scenes.",
    params: { skyColor: "hex", groundColor: "hex", intensity: "number" },
    example: "new THREE.HemisphereLight(0x87ceeb, 0x8b6914, 0.6)",
  },
  RectAreaLight: {
    description: "Rectangular area light (like a TV or window). Requires RectAreaLightHelper.",
    params: { color: "hex", intensity: "number", width: "number", height: "number" },
    example: "new THREE.RectAreaLight(0xffffff, 5, 4, 4)",
  },
};

export const ANIMATION_PATTERNS = {
  rotate: {
    description: "Continuous rotation around an axis",
    axes: ["x", "y", "z"],
    code: (obj, axis, speed) => `${obj}.rotation.${axis} += ${speed} * delta;`,
  },
  orbit: {
    description: "Object orbits a center point",
    code: (obj, _, speed) => `const angle = clock.getElapsedTime() * ${speed};\n${obj}.position.x = Math.cos(angle) * orbitRadius;\n${obj}.position.z = Math.sin(angle) * orbitRadius;`,
  },
  float: {
    description: "Gentle up-down floating motion",
    code: (obj, _, speed, amp) => `${obj}.position.y = Math.sin(clock.getElapsedTime() * ${speed}) * ${amp};`,
  },
  pulse: {
    description: "Scale pulsing in and out",
    code: (obj, _, speed, amp) => `const s = 1 + Math.sin(clock.getElapsedTime() * ${speed}) * ${amp * 0.2};\n${obj}.scale.set(s, s, s);`,
  },
  wave: {
    description: "Sinusoidal wave position motion",
    code: (obj, axis, speed, amp) => `${obj}.position.${axis} = Math.sin(clock.getElapsedTime() * ${speed}) * ${amp};`,
  },
  spiral: {
    description: "Spiral path motion",
    code: (obj, _, speed) => `const t = clock.getElapsedTime() * ${speed};\n${obj}.position.x = Math.cos(t) * t * 0.1;\n${obj}.position.z = Math.sin(t) * t * 0.1;\n${obj}.position.y = t * 0.05;`,
  },
  bounce: {
    description: "Bouncing motion with easing",
    code: (obj, _, speed, amp) => `const t = clock.getElapsedTime() * ${speed};\n${obj}.position.y = Math.abs(Math.sin(t)) * ${amp};`,
  },
};

// ── SCENE TEMPLATES ────────────────────────────────────────────────────────

export const SCENE_TEMPLATES = {
  "solar-system": () => generateSolarSystem(),
  "particle-field": () => generateParticleField(),
  "geometric-shapes": () => generateGeometricShapes(),
  "terrain": () => generateTerrain(),
  "vortex": () => generateVortex(),
  "galaxy": () => generateGalaxy(),
};

function generateSolarSystem() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Solar System – Three.js</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; overflow: hidden; font-family: sans-serif; }
  canvas { display: block; }
  #info { position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
    color: #aaa; font-size: 13px; text-align: center; pointer-events: none; }
</style>
</head>
<body>
<div id="info">Solar System · Drag to orbit · Scroll to zoom</div>
<script type="module">
import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 30, 60);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Stars
const starsGeo = new THREE.BufferGeometry();
const starsArr = new Float32Array(6000);
for (let i = 0; i < 6000; i++) starsArr[i] = (Math.random() - 0.5) * 600;
starsGeo.setAttribute('position', new THREE.BufferAttribute(starsArr, 3));
scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })));

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffdd00 })
);
scene.add(sun);
scene.add(new THREE.PointLight(0xffffff, 2, 200));

// Planets config
const planets = [
  { name: 'Mercury', radius: 0.4, distance: 8,  speed: 4.7,  color: 0x888888 },
  { name: 'Venus',   radius: 0.9, distance: 12, speed: 3.5,  color: 0xe8a44a },
  { name: 'Earth',   radius: 1.0, distance: 17, speed: 2.9,  color: 0x2277ff },
  { name: 'Mars',    radius: 0.6, distance: 22, speed: 2.4,  color: 0xcc4422 },
  { name: 'Jupiter', radius: 2.5, distance: 32, speed: 1.3,  color: 0xc88b3a },
  { name: 'Saturn',  radius: 2.0, distance: 42, speed: 0.97, color: 0xe8d5a3, rings: true },
  { name: 'Uranus',  radius: 1.5, distance: 52, speed: 0.68, color: 0x7de8e8 },
  { name: 'Neptune', radius: 1.4, distance: 60, speed: 0.54, color: 0x4455ee },
];

const planetMeshes = planets.map(p => {
  const orbit = new THREE.Object3D();
  scene.add(orbit);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(p.radius, 24, 24),
    new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.8, metalness: 0.1 })
  );
  mesh.position.x = p.distance;
  orbit.add(mesh);

  // Orbit ring
  const ringGeo = new THREE.RingGeometry(p.distance - 0.05, p.distance + 0.05, 128);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  if (p.rings) {
    const satRing = new THREE.Mesh(
      new THREE.RingGeometry(p.radius * 1.3, p.radius * 2.2, 64),
      new THREE.MeshBasicMaterial({ color: 0xc8a86b, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    satRing.rotation.x = Math.PI / 3;
    mesh.add(satRing);
  }

  return { orbit, mesh, speed: p.speed, angle: Math.random() * Math.PI * 2 };
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const t = clock.getElapsedTime();
  sun.rotation.y += delta * 0.2;
  planetMeshes.forEach(p => {
    p.angle += p.speed * delta * 0.3;
    p.orbit.rotation.y = p.angle;
    p.mesh.rotation.y += delta;
  });
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
</script>
</body>
</html>`;
}

function generateParticleField() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Particle Field – Three.js</title>
<style>* { margin: 0; padding: 0; } body { overflow: hidden; background: #000; }</style>
</head>
<body>
<script type="module">
import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.01);
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 0, 30);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = 0.5;

const COUNT = 12000;
const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const sizes = new Float32Array(COUNT);
const color = new THREE.Color();

for (let i = 0; i < COUNT; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 80;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
  color.setHSL(Math.random() * 0.3 + 0.5, 1, 0.6);
  colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
  sizes[i] = Math.random() * 2 + 0.5;
}

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const mat = new THREE.ShaderMaterial({
  uniforms: { time: { value: 0 } },
  vertexShader: \`
    attribute float size;
    varying vec3 vColor;
    uniform float time;
    void main() {
      vColor = color;
      vec3 pos = position;
      pos.y += sin(time + position.x * 0.1) * 2.0;
      pos.x += cos(time + position.z * 0.1) * 1.0;
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  \`,
  fragmentShader: \`
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor, 1.0 - d * 2.0);
    }
  \`,
  transparent: true, vertexColors: true, depthWrite: false, blending: THREE.AdditiveBlending,
});

scene.add(new THREE.Points(geo, mat));

const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  mat.uniforms.time.value = clock.getElapsedTime();
  controls.update();
  renderer.render(scene, camera);
})();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
</script>
</body>
</html>`;
}

function generateGeometricShapes() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Geometric Shapes – Three.js</title>
<style>* { margin: 0; padding: 0; } body { overflow: hidden; background: #0a0a1a; }</style>
</head>
<body>
<script type="module">
import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 4, 14);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
scene.add(new THREE.AmbientLight(0x222244, 1));
const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(5, 10, 5); dir.castShadow = true;
scene.add(dir);
[0xff2244, 0x2244ff, 0x22ffaa].forEach((c, i) => {
  const pl = new THREE.PointLight(c, 2, 20);
  pl.position.set(Math.cos(i * Math.PI * 2 / 3) * 6, 2, Math.sin(i * Math.PI * 2 / 3) * 6);
  scene.add(pl);
});

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x111133, roughness: 0.8, metalness: 0.2 })
);
floor.rotation.x = -Math.PI / 2; floor.position.y = -2; floor.receiveShadow = true;
scene.add(floor);

// Shapes
const shapes = [
  { geo: new THREE.TorusKnotGeometry(1, 0.35, 128, 16), color: 0xff4488, x: -5, speed: 0.8 },
  { geo: new THREE.IcosahedronGeometry(1.3, 1), color: 0x44aaff, x: 0, speed: 1.2 },
  { geo: new THREE.TorusGeometry(1.1, 0.4, 16, 100), color: 0x44ffaa, x: 5, speed: 0.6 },
];

const meshes = shapes.map(s => {
  const m = new THREE.Mesh(s.geo, new THREE.MeshStandardMaterial({
    color: s.color, metalness: 0.5, roughness: 0.2, emissive: s.color, emissiveIntensity: 0.1
  }));
  m.position.set(s.x, 0, 0); m.castShadow = true;
  m.userData = { speed: s.speed };
  scene.add(m); return m;
});

const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  meshes.forEach((m, i) => {
    m.rotation.x = t * m.userData.speed * 0.5;
    m.rotation.y = t * m.userData.speed;
    m.position.y = Math.sin(t * m.userData.speed + i) * 0.5;
  });
  controls.update();
  renderer.render(scene, camera);
})();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
</script>
</body>
</html>`;
}

function generateTerrain() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Terrain – Three.js</title>
<style>* { margin: 0; padding: 0; } body { overflow: hidden; background: #0a0a20; }</style>
</head>
<body>
<script type="module">
import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a0a20, 20, 60);
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 8, 20);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.48;

scene.add(new THREE.AmbientLight(0x112244, 2));
const dirLight = new THREE.DirectionalLight(0x4488ff, 2);
dirLight.position.set(0, 10, 5);
scene.add(dirLight);

// Neon grid terrain
const mat = new THREE.ShaderMaterial({
  uniforms: { time: { value: 0 }, color1: { value: new THREE.Color(0x0044ff) }, color2: { value: new THREE.Color(0x00ffcc) } },
  vertexShader: \`
    uniform float time;
    varying vec2 vUv;
    varying float vHeight;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float wave = sin(pos.x * 0.5 + time) * cos(pos.z * 0.5 + time * 0.7) * 1.5;
      wave += sin(pos.x * 1.2 - time * 0.8) * 0.5;
      pos.y += wave;
      vHeight = wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  \`,
  fragmentShader: \`
    uniform vec3 color1, color2;
    varying vec2 vUv;
    varying float vHeight;
    void main() {
      float grid = abs(fract(vUv.x * 20.0) - 0.5) < 0.03 || abs(fract(vUv.y * 20.0) - 0.5) < 0.03 ? 1.0 : 0.1;
      vec3 c = mix(color1, color2, (vHeight + 1.5) / 3.0);
      gl_FragColor = vec4(c * grid, 1.0);
    }
  \`,
  side: THREE.DoubleSide, wireframe: false,
});

const geo = new THREE.PlaneGeometry(40, 40, 80, 80);
geo.rotateX(-Math.PI / 2);
scene.add(new THREE.Mesh(geo, mat));

const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  mat.uniforms.time.value = clock.getElapsedTime();
  controls.update();
  renderer.render(scene, camera);
})();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
</script>
</body>
</html>`;
}

function generateVortex() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Vortex – Three.js</title>
<style>* { margin: 0; padding: 0; } body { overflow: hidden; background: #000; }</style>
</head>
<body>
<script type="module">
import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 5;

const COUNT = 8000;
const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);

for (let i = 0; i < COUNT; i++) {
  const t = (i / COUNT) * Math.PI * 2 * 20;
  const r = (i / COUNT) * 4;
  positions[i * 3]     = Math.cos(t) * r;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
  positions[i * 3 + 2] = Math.sin(t) * r;
  const c = new THREE.Color().setHSL(i / COUNT * 0.6 + 0.5, 1, 0.6);
  colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
}

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
const vortex = new THREE.Points(geo, mat);
scene.add(vortex);

const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  vortex.rotation.y = t * 0.5;
  vortex.rotation.z = Math.sin(t * 0.2) * 0.3;
  camera.position.y = Math.sin(t * 0.3) * 1.5;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
})();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
</script>
</body>
</html>`;
}

function generateGalaxy() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Galaxy – Three.js</title>
<style>* { margin: 0; padding: 0; } body { overflow: hidden; background: #000; }</style>
</head>
<body>
<script type="module">
import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
camera.position.set(3, 3, 3);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const COUNT = 20000, ARMS = 3, SPREAD = 0.3, RADIUS = 5;
const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const insideColor = new THREE.Color(0xff6030), outsideColor = new THREE.Color(0x1b3984);

for (let i = 0; i < COUNT; i++) {
  const r = Math.random() * RADIUS;
  const spin = r * 1.5;
  const arm = (i % ARMS) / ARMS * Math.PI * 2;
  const angle = arm + spin;
  const rx = (Math.random() - 0.5) * SPREAD * r, ry = (Math.random() - 0.5) * SPREAD * 0.3, rz = (Math.random() - 0.5) * SPREAD * r;
  positions[i * 3]     = Math.cos(angle) * r + rx;
  positions[i * 3 + 1] = ry;
  positions[i * 3 + 2] = Math.sin(angle) * r + rz;
  const c = insideColor.clone().lerp(outsideColor, r / RADIUS);
  colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
}

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const galaxy = new THREE.Points(geo, new THREE.PointsMaterial({
  size: 0.02, sizeAttenuation: true, vertexColors: true,
  blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
}));
scene.add(galaxy);

const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  galaxy.rotation.y = clock.getElapsedTime() * 0.05;
  controls.update();
  renderer.render(scene, camera);
})();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
</script>
</body>
</html>`;
}
