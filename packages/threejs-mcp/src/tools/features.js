// ── Lights ──────────────────────────────────────────────────────────────────
export const lightTools = [
  {
    name: "threejs_add_light",
    description: "Add any Three.js light: AmbientLight, DirectionalLight, PointLight, SpotLight, HemisphereLight, RectAreaLight",
    inputSchema: {
      type: "object",
      required: ["type"],
      properties: {
        type: { type: "string", enum: ["ambient", "directional", "point", "spot", "hemisphere", "rectArea"] },
        name: { type: "string" },
        color: { type: "string", description: "Main light color hex" },
        groundColor: { type: "string", description: "Ground color (hemisphere only)" },
        intensity: { type: "number" },
        x: { type: "number" }, y: { type: "number" }, z: { type: "number" },
        targetX: { type: "number" }, targetY: { type: "number" }, targetZ: { type: "number" },
        castShadow: { type: "boolean" },
        shadowMapSize: { type: "number", description: "Shadow map resolution e.g. 2048" },
        // Point / Spot
        distance: { type: "number" },
        decay: { type: "number" },
        // Spot
        angle: { type: "number", description: "Spotlight cone angle in radians" },
        penumbra: { type: "number" },
        // RectArea
        width: { type: "number" },
        height: { type: "number" }
      }
    },
    handler(args = {}) {
      const {
        type = "directional", name = "light",
        color = "#ffffff", groundColor = "#444444", intensity = 1,
        x = 5, y = 10, z = 5,
        targetX = 0, targetY = 0, targetZ = 0,
        castShadow = false, shadowMapSize = 2048,
        distance = 0, decay = 2,
        angle = Math.PI / 6, penumbra = 0.1,
        width = 10, height = 10
      } = args;

      const shadowBlock = castShadow ? `${name}.castShadow = true;
${name}.shadow.mapSize.width = ${shadowMapSize};
${name}.shadow.mapSize.height = ${shadowMapSize};
${name}.shadow.camera.near = 0.5;
${name}.shadow.camera.far = 500;` : "";

      const defs = {
        ambient: `const ${name} = new THREE.AmbientLight('${color}', ${intensity});\nscene.add(${name});`,
        hemisphere: `const ${name} = new THREE.HemisphereLight('${color}', '${groundColor}', ${intensity});\n${name}.position.set(${x}, ${y}, ${z});\nscene.add(${name});`,
        directional: `const ${name} = new THREE.DirectionalLight('${color}', ${intensity});\n${name}.position.set(${x}, ${y}, ${z});\n${name}.target.position.set(${targetX}, ${targetY}, ${targetZ});\n${shadowBlock}\nscene.add(${name});\nscene.add(${name}.target);`,
        point: `const ${name} = new THREE.PointLight('${color}', ${intensity}, ${distance}, ${decay});\n${name}.position.set(${x}, ${y}, ${z});\n${shadowBlock}\nscene.add(${name});`,
        spot: `const ${name} = new THREE.SpotLight('${color}', ${intensity}, ${distance}, ${angle}, ${penumbra}, ${decay});\n${name}.position.set(${x}, ${y}, ${z});\n${name}.target.position.set(${targetX}, ${targetY}, ${targetZ});\n${shadowBlock}\nscene.add(${name});\nscene.add(${name}.target);`,
        rectArea: `import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';\nimport { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';\nRectAreaLightUniformsLib.init();\nconst ${name} = new THREE.RectAreaLight('${color}', ${intensity}, ${width}, ${height});\n${name}.position.set(${x}, ${y}, ${z});\n${name}.lookAt(${targetX}, ${targetY}, ${targetZ});\nscene.add(${name});\nscene.add(new RectAreaLightHelper(${name}));`
      };

      return defs[type] || defs.directional;
    }
  }
];

// ── Cameras ──────────────────────────────────────────────────────────────────
export const cameraTools = [
  {
    name: "threejs_add_camera",
    description: "Generate code for PerspectiveCamera, OrthographicCamera, or CubeCamera",
    inputSchema: {
      type: "object",
      required: ["type"],
      properties: {
        type: { type: "string", enum: ["perspective", "orthographic", "cube"] },
        name: { type: "string" },
        fov: { type: "number" },
        near: { type: "number" },
        far: { type: "number" },
        left: { type: "number" }, right: { type: "number" },
        top: { type: "number" }, bottom: { type: "number" },
        x: { type: "number" }, y: { type: "number" }, z: { type: "number" }
      }
    },
    handler(args = {}) {
      const { type = "perspective", name = "camera", fov = 75, near = 0.1, far = 1000, left = -5, right = 5, top = 5, bottom = -5, x = 0, y = 2, z = 5 } = args;
      const defs = {
        perspective: `const ${name} = new THREE.PerspectiveCamera(${fov}, window.innerWidth / window.innerHeight, ${near}, ${far});\n${name}.position.set(${x}, ${y}, ${z});`,
        orthographic: `const ${name} = new THREE.OrthographicCamera(${left}, ${right}, ${top}, ${bottom}, ${near}, ${far});\n${name}.position.set(${x}, ${y}, ${z});`,
        cube: `const ${name}RenderTarget = new THREE.WebGLCubeRenderTarget(256, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });\nconst ${name} = new THREE.CubeCamera(${near}, ${far}, ${name}RenderTarget);\n${name}.position.set(${x}, ${y}, ${z});\nscene.add(${name});`
      };
      return defs[type] || defs.perspective;
    }
  }
];

// ── Animation ────────────────────────────────────────────────────────────────
export const animationTools = [
  {
    name: "threejs_animate",
    description: "Generate animation code: keyframe tracks, animation clips, mixer, morph targets, or GSAP-style tween",
    inputSchema: {
      type: "object",
      required: ["type"],
      properties: {
        type: { type: "string", enum: ["rotate", "scale", "bounce", "orbit", "keyframe", "mixer", "morph", "gsap"] },
        targetName: { type: "string", description: "The variable name of the object to animate" },
        axis: { type: "string", enum: ["x", "y", "z"], description: "Rotation axis" },
        speed: { type: "number", description: "Rotation speed multiplier" },
        amplitude: { type: "number", description: "Bounce/oscillation amplitude" },
        radius: { type: "number", description: "Orbit radius" }
      }
    },
    handler(args = {}) {
      const { type = "rotate", targetName = "mesh", axis = "y", speed = 1, amplitude = 0.5, radius = 3 } = args;
      const defs = {
        rotate: `// Add inside the animate() loop:\n${targetName}.rotation.${axis} += ${speed} * delta;`,
        scale: `// Add inside the animate() loop:\nconst t = clock.getElapsedTime();\n${targetName}.scale.setScalar(1 + Math.sin(t * ${speed}) * ${amplitude});`,
        bounce: `// Add inside the animate() loop:\nconst t = clock.getElapsedTime();\n${targetName}.position.y = Math.abs(Math.sin(t * ${speed})) * ${amplitude};`,
        orbit: `// Add inside the animate() loop:\nconst t = clock.getElapsedTime();\n${targetName}.position.x = Math.cos(t * ${speed}) * ${radius};\n${targetName}.position.z = Math.sin(t * ${speed}) * ${radius};`,
        keyframe: `// Keyframe animation
const times = [0, 1, 2];
const values = [0, Math.PI, 0]; // rotation.y values
const track = new THREE.NumberKeyframeTrack('${targetName}.rotation[y]', times, values);
const clip = new THREE.AnimationClip('rotate', 2, [track]);
const mixer = new THREE.AnimationMixer(${targetName});
const action = mixer.clipAction(clip);
action.play();
// In the animate() loop, add:
// mixer.update(delta);`,
        mixer: `// AnimationMixer for GLTF models
let mixer;
// After loading model:
// mixer = new THREE.AnimationMixer(model);
// mixer.clipAction(gltf.animations[0]).play();
// In the animate() loop:
// if (mixer) mixer.update(delta);`,
        morph: `// Morph targets
${targetName}.morphTargetInfluences[0] = 0;
// In animate():
const t = clock.getElapsedTime();
${targetName}.morphTargetInfluences[0] = (Math.sin(t) + 1) / 2;`,
        gsap: `// GSAP animation (add <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>)
gsap.to(${targetName}.rotation, { y: Math.PI * 2, duration: 2, repeat: -1, ease: 'power1.inOut' });
gsap.to(${targetName}.position, { y: ${amplitude}, duration: 1, yoyo: true, repeat: -1, ease: 'power2.inOut' });`
      };
      return defs[type] || defs.rotate;
    }
  }
];

// ── Loaders ──────────────────────────────────────────────────────────────────
export const loaderTools = [
  {
    name: "threejs_load_asset",
    description: "Generate code to load 3D assets: GLTF/GLB, OBJ, FBX, STL, PLY, Draco compressed, HDR environment map, or Texture",
    inputSchema: {
      type: "object",
      required: ["type"],
      properties: {
        type: { type: "string", enum: ["gltf", "obj", "fbx", "stl", "ply", "draco", "hdr", "texture", "cubeTexture", "video"] },
        url: { type: "string", description: "Asset URL or path" },
        name: { type: "string", description: "Variable name for loaded asset" },
        dracoDecoderPath: { type: "string" }
      }
    },
    handler(args = {}) {
      const { type = "gltf", url = "./model.glb", name = "model", dracoDecoderPath = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/" } = args;
      const defs = {
        gltf: `import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const loader = new GLTFLoader();
loader.load('${url}',
  (gltf) => {
    const ${name} = gltf.scene;
    scene.add(${name});
    // Play first animation if exists:
    // const mixer = new THREE.AnimationMixer(${name});
    // mixer.clipAction(gltf.animations[0]).play();
  },
  (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
  (err) => console.error('GLTF load error:', err)
);`,
        draco: `import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('${dracoDecoderPath}');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
loader.load('${url}', (gltf) => {
  const ${name} = gltf.scene;
  scene.add(${name});
});`,
        obj: `import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
const mtlLoader = new MTLLoader();
mtlLoader.load('${url.replace('.obj', '.mtl')}', (materials) => {
  materials.preload();
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load('${url}', (${name}) => scene.add(${name}));
});`,
        fbx: `import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
const loader = new FBXLoader();
loader.load('${url}', (${name}) => {
  ${name}.scale.setScalar(0.01);
  scene.add(${name});
  const mixer = new THREE.AnimationMixer(${name});
  if (${name}.animations.length) mixer.clipAction(${name}.animations[0]).play();
});`,
        stl: `import { STLLoader } from 'three/addons/loaders/STLLoader.js';
const loader = new STLLoader();
loader.load('${url}', (geometry) => {
  const ${name} = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
  scene.add(${name});
});`,
        hdr: `import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
const loader = new RGBELoader();
loader.load('${url}', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture; // PBR environment lighting
});`,
        texture: `const textureLoader = new THREE.TextureLoader();
const ${name} = textureLoader.load('${url}');
${name}.wrapS = THREE.RepeatWrapping;
${name}.wrapT = THREE.RepeatWrapping;
${name}.repeat.set(1, 1);
// Usage: material.map = ${name};`,
        cubeTexture: `const cubeLoader = new THREE.CubeTextureLoader();
const ${name} = cubeLoader.setPath('${url}').load(['px.jpg','nx.jpg','py.jpg','ny.jpg','pz.jpg','nz.jpg']);
scene.background = ${name};
scene.environment = ${name};`,
        video: `const video = document.createElement('video');
video.src = '${url}';
video.crossOrigin = 'anonymous';
video.loop = true;
video.muted = true;
video.play();
const ${name} = new THREE.VideoTexture(video);
// Usage: material.map = ${name};`
      };
      return defs[type] || defs.gltf;
    }
  }
];

// ── Post-processing ──────────────────────────────────────────────────────────
export const postFxTools = [
  {
    name: "threejs_add_post_processing",
    description: "Generate post-processing code: bloom, SSAO, depth-of-field, film grain, vignette, outline, SMAA/FXAA, pixel, glitch",
    inputSchema: {
      type: "object",
      required: ["effects"],
      properties: {
        effects: {
          type: "array",
          items: { type: "string", enum: ["bloom", "ssao", "dof", "film", "vignette", "outline", "smaa", "fxaa", "pixel", "glitch", "godRays", "motionBlur"] },
          description: "List of effects to apply"
        },
        bloomStrength: { type: "number" },
        bloomRadius: { type: "number" },
        bloomThreshold: { type: "number" },
        pixelSize: { type: "number" }
      }
    },
    handler(args = {}) {
      const { effects = ["bloom"], bloomStrength = 1.5, bloomRadius = 0.4, bloomThreshold = 0.85, pixelSize = 8 } = args;
      const imports = [
        "import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';",
        "import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';"
      ];
      const passes = [];
      if (effects.includes("bloom")) {
        imports.push("import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';");
        passes.push(`const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), ${bloomStrength}, ${bloomRadius}, ${bloomThreshold});\ncomposer.addPass(bloomPass);`);
      }
      if (effects.includes("fxaa")) {
        imports.push("import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';\nimport { FXAAShader } from 'three/addons/shaders/FXAAShader.js';");
        passes.push(`const fxaaPass = new ShaderPass(FXAAShader);\nfxaaPass.uniforms['resolution'].value.set(1/window.innerWidth, 1/window.innerHeight);\ncomposer.addPass(fxaaPass);`);
      }
      if (effects.includes("ssao")) {
        imports.push("import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';");
        passes.push(`const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);\nssaoPass.kernelRadius = 16;\ncomposer.addPass(ssaoPass);`);
      }
      if (effects.includes("film")) {
        imports.push("import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';");
        passes.push(`const filmPass = new FilmPass(0.35);\ncomposer.addPass(filmPass);`);
      }
      if (effects.includes("glitch")) {
        imports.push("import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';");
        passes.push(`const glitchPass = new GlitchPass();\ncomposer.addPass(glitchPass);`);
      }
      if (effects.includes("pixel")) {
        imports.push("import { PixelShader } from 'three/addons/shaders/PixelShader.js';\nimport { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';");
        passes.push(`const pixelPass = new ShaderPass(PixelShader);\npixelPass.uniforms['resolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);\npixelPass.uniforms['pixelSize'].value = ${pixelSize};\ncomposer.addPass(pixelPass);`);
      }
      if (effects.includes("outline")) {
        imports.push("import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';");
        passes.push(`const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);\noutlinePass.edgeStrength = 3;\noutlinePass.edgeGlow = 1;\noutlinePass.edgeThickness = 1;\noutlinePass.visibleEdgeColor.set('#ffffff');\ncomposer.addPass(outlinePass);\n// outlinePass.selectedObjects = [mesh]; // objects to outline`);
      }

      return `${imports.join('\n')}

// Setup EffectComposer
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

${passes.join('\n\n')}

// IMPORTANT: Replace renderer.render(scene, camera) in animate() with:
// composer.render();
// Also update composer on resize:
// composer.setSize(window.innerWidth, window.innerHeight);`;
    }
  }
];

// ── Particle System ──────────────────────────────────────────────────────────
export const particleTools = [
  {
    name: "threejs_particle_system",
    description: "Generate a Three.js particle system using Points, BufferGeometry, and custom shaders",
    inputSchema: {
      type: "object",
      properties: {
        count: { type: "number", description: "Number of particles" },
        spread: { type: "number", description: "Spread radius" },
        size: { type: "number", description: "Particle size" },
        color: { type: "string" },
        animated: { type: "boolean", description: "Animate particle positions" },
        type: { type: "string", enum: ["random", "sphere", "galaxy", "snow", "fire", "shader"] }
      }
    },
    handler(args = {}) {
      const { count = 5000, spread = 10, size = 0.05, color = "#ffffff", animated = true, type = "random" } = args;
      return `// Particle system – ${type}
const particleCount = ${count};
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const baseColor = new THREE.Color('${color}');

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
${type === "sphere" ? `  const phi = Math.acos(-1 + (2 * i) / particleCount);
  const theta = Math.sqrt(particleCount * Math.PI) * phi;
  positions[i3]     = ${spread} * Math.cos(theta) * Math.sin(phi);
  positions[i3 + 1] = ${spread} * Math.sin(theta) * Math.sin(phi);
  positions[i3 + 2] = ${spread} * Math.cos(phi);` : type === "galaxy" ? `  const radius = Math.random() * ${spread};
  const spinAngle = radius * 5;
  const branchAngle = (i % 3) * ((Math.PI * 2) / 3);
  positions[i3]     = Math.cos(branchAngle + spinAngle) * radius;
  positions[i3 + 1] = (Math.random() - 0.5) * 0.3;
  positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius;` : `  positions[i3]     = (Math.random() - 0.5) * ${spread};
  positions[i3 + 1] = (Math.random() - 0.5) * ${spread};
  positions[i3 + 2] = (Math.random() - 0.5) * ${spread};`}
  colors[i3]     = baseColor.r;
  colors[i3 + 1] = baseColor.g;
  colors[i3 + 2] = baseColor.b;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMat = new THREE.PointsMaterial({
  size: ${size},
  sizeAttenuation: true,
  vertexColors: true,
  transparent: true,
  alphaMap: null, // optionally load a circular texture
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);
${animated ? `\n// In animate() loop:\n// particles.rotation.y += 0.0005 * delta;` : ""}`;
    }
  }
];

// ── Helpers / Debug ──────────────────────────────────────────────────────────
export const helperTools = [
  {
    name: "threejs_add_helper",
    description: "Add debug helpers: AxesHelper, GridHelper, BoxHelper, CameraHelper, DirectionalLightHelper, SpotLightHelper, PointLightHelper, ArrowHelper, Skeleton, Bone",
    inputSchema: {
      type: "object",
      required: ["type"],
      properties: {
        type: { type: "string", enum: ["axes", "grid", "box", "camera", "directionalLight", "spotLight", "pointLight", "arrow", "polarGrid"] },
        size: { type: "number" },
        divisions: { type: "number" },
        color: { type: "string" },
        targetName: { type: "string", description: "Variable name of object to help" }
      }
    },
    handler(args = {}) {
      const { type = "axes", size = 5, divisions = 10, color = "#ffffff", targetName = "mesh" } = args;
      const defs = {
        axes: `scene.add(new THREE.AxesHelper(${size}));`,
        grid: `scene.add(new THREE.GridHelper(${size * 2}, ${divisions}));`,
        polarGrid: `scene.add(new THREE.PolarGridHelper(${size}, 16, 8, 64));`,
        box: `const ${targetName}Helper = new THREE.BoxHelper(${targetName}, '${color}');\nscene.add(${targetName}Helper);\n// In animate(): ${targetName}Helper.update();`,
        camera: `const ${targetName}Helper = new THREE.CameraHelper(${targetName});\nscene.add(${targetName}Helper);`,
        directionalLight: `import { DirectionalLightHelper } from 'three';\nconst ${targetName}Helper = new THREE.DirectionalLightHelper(${targetName}, ${size});\nscene.add(${targetName}Helper);`,
        spotLight: `const ${targetName}Helper = new THREE.SpotLightHelper(${targetName});\nscene.add(${targetName}Helper);\n// In animate(): ${targetName}Helper.update();`,
        pointLight: `const ${targetName}Helper = new THREE.PointLightHelper(${targetName}, ${size});\nscene.add(${targetName}Helper);`,
        arrow: `const dir = new THREE.Vector3(0, 1, 0);\nconst origin = new THREE.Vector3(0, 0, 0);\nconst arrow = new THREE.ArrowHelper(dir, origin, ${size}, '${color}');\nscene.add(arrow);`
      };
      return defs[type] || defs.axes;
    }
  }
];

// ── Raycasting ───────────────────────────────────────────────────────────────
export const raycastTools = [
  {
    name: "threejs_raycasting",
    description: "Generate raycasting code for mouse picking, hover effects, and click detection on 3D objects",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["click", "hover", "drag"], description: "Interaction mode" },
        targetArray: { type: "string", description: "Array of objects to test, e.g. 'objects'" }
      }
    },
    handler(args = {}) {
      const { mode = "click", targetArray = "objects" } = args;
      return `// Raycasting – ${mode} mode
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
${mode === "drag" ? `let isDragging = false, draggedObject = null;
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const intersection = new THREE.Vector3();` : ""}

${mode === "hover" ? `let hoveredObject = null;
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(${targetArray});
  if (hits.length > 0) {
    if (hoveredObject !== hits[0].object) {
      if (hoveredObject) hoveredObject.material.emissive?.set(0x000000);
      hoveredObject = hits[0].object;
      hoveredObject.material.emissive?.set(0x222222);
    }
  } else {
    if (hoveredObject) hoveredObject.material.emissive?.set(0x000000);
    hoveredObject = null;
  }
});` : mode === "click" ? `window.addEventListener('click', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(${targetArray});
  if (hits.length > 0) {
    const hit = hits[0];
    console.log('Clicked:', hit.object.name, 'at', hit.point);
    // Your click handler here
  }
});` : `window.addEventListener('mousedown', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(${targetArray});
  if (hits.length > 0) { isDragging = true; draggedObject = hits[0].object; }
});
window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(dragPlane, intersection);
  if (draggedObject) draggedObject.position.copy(intersection);
});
window.addEventListener('mouseup', () => { isDragging = false; draggedObject = null; });`}`;
    }
  }
];

// ── Physics ───────────────────────────────────────────────────────────────────
export const physicsTools = [
  {
    name: "threejs_add_physics",
    description: "Generate Three.js + cannon-es physics setup: world, bodies, constraints, and sync loop",
    inputSchema: {
      type: "object",
      required: ["type"],
      properties: {
        type: { type: "string", enum: ["world", "box", "sphere", "ground", "constraint", "spring"] },
        name: { type: "string" },
        mass: { type: "number" },
        restitution: { type: "number", description: "Bounciness 0–1" },
        friction: { type: "number" },
        gravityY: { type: "number" }
      }
    },
    handler(args = {}) {
      const { type = "world", name = "body", mass = 1, restitution = 0.3, friction = 0.4, gravityY = -9.82 } = args;
      const defs = {
        world: `// cannon-es physics world
// npm install cannon-es
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
const physicsWorld = new CANNON.World({ gravity: new CANNON.Vec3(0, ${gravityY}, 0) });
physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
physicsWorld.allowSleep = true;
const defaultMaterial = new CANNON.Material('default');
const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: ${friction}, restitution: ${restitution}
});
physicsWorld.addContactMaterial(contactMaterial);
physicsWorld.defaultContactMaterial = contactMaterial;
// In animate():
// physicsWorld.fixedStep();
// Sync mesh to body:
// mesh.position.copy(body.position);
// mesh.quaternion.copy(body.quaternion);`,
        sphere: `const ${name}Shape = new CANNON.Sphere(1);
const ${name} = new CANNON.Body({ mass: ${mass}, shape: ${name}Shape });
${name}.position.set(0, 5, 0);
physicsWorld.addBody(${name});`,
        box: `const ${name}Shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
const ${name} = new CANNON.Body({ mass: ${mass}, shape: ${name}Shape });
${name}.position.set(0, 5, 0);
physicsWorld.addBody(${name});`,
        ground: `const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
physicsWorld.addBody(groundBody);`,
        spring: `// Spring between two bodies
// (using a custom constraint + update)
const spring = { stiffness: 50, damping: 1 };
function applySpring(bodyA, bodyB) {
  const dist = bodyA.position.distanceTo(bodyB.position);
  const force = (dist - 2) * spring.stiffness;
  const dir = bodyB.position.clone().vsub(bodyA.position).unit();
  bodyA.applyForce(dir.scale(force), bodyA.position);
  bodyB.applyForce(dir.scale(-force), bodyB.position);
}
// In animate(): applySpring(bodyA, bodyB);`
      };
      return defs[type] || defs.world;
    }
  }
];

// ── Shadows ───────────────────────────────────────────────────────────────────
export const shadowTools = [
  {
    name: "threejs_setup_shadows",
    description: "Generate complete shadow configuration for renderer, lights, and meshes",
    inputSchema: {
      type: "object",
      properties: {
        shadowType: { type: "string", enum: ["basic", "pcf", "pcfSoft", "vsm"] },
        mapSize: { type: "number" },
        lightName: { type: "string" },
        meshNames: { type: "array", items: { type: "string" } }
      }
    },
    handler(args = {}) {
      const { shadowType = "pcfSoft", mapSize = 2048, lightName = "dirLight", meshNames = ["mesh"] } = args;
      const typeMap = {
        basic: "THREE.BasicShadowMap",
        pcf: "THREE.PCFShadowMap",
        pcfSoft: "THREE.PCFSoftShadowMap",
        vsm: "THREE.VSMShadowMap"
      };
      return `// Shadow setup
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = ${typeMap[shadowType]};

// Light shadows
${lightName}.castShadow = true;
${lightName}.shadow.mapSize.set(${mapSize}, ${mapSize});
${lightName}.shadow.camera.near = 0.5;
${lightName}.shadow.camera.far = 500;
${lightName}.shadow.camera.left = -50;
${lightName}.shadow.camera.right = 50;
${lightName}.shadow.camera.top = 50;
${lightName}.shadow.camera.bottom = -50;
${lightName}.shadow.bias = -0.0001;

// Mesh shadows
${meshNames.map(m => `${m}.castShadow = true;\n${m}.receiveShadow = true;`).join('\n')}`;
    }
  }
];
