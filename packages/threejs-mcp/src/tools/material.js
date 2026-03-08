export const materialTools = [
  {
    name: "threejs_add_material",
    description: "Generate code for any Three.js material: MeshStandardMaterial, MeshPhysicalMaterial, MeshToonMaterial, MeshMatCapMaterial, ShaderMaterial, SpriteMaterial, PointsMaterial, LineDashedMaterial, and more",
    inputSchema: {
      type: "object",
      required: ["type"],
      properties: {
        type: {
          type: "string",
          enum: [
            "standard", "physical", "basic", "lambert", "phong",
            "toon", "matcap", "normal", "depth",
            "points", "sprite", "line", "lineDashed",
            "shader"
          ]
        },
        name: { type: "string", description: "Variable name" },
        color: { type: "string", description: "Color hex, e.g. '#ff6600'" },
        emissive: { type: "string", description: "Emissive color hex" },
        emissiveIntensity: { type: "number" },
        metalness: { type: "number", description: "0–1 (standard/physical)" },
        roughness: { type: "number", description: "0–1 (standard/physical)" },
        // Physical extras
        transmission: { type: "number", description: "Glass transparency 0–1 (physical)" },
        ior: { type: "number", description: "Index of refraction (physical)" },
        thickness: { type: "number", description: "Glass thickness (physical)" },
        clearcoat: { type: "number" },
        clearcoatRoughness: { type: "number" },
        sheen: { type: "number" },
        sheenColor: { type: "string" },
        iridescence: { type: "number" },
        // Common
        opacity: { type: "number" },
        transparent: { type: "boolean" },
        side: { type: "string", enum: ["front", "back", "double"] },
        wireframe: { type: "boolean" },
        flatShading: { type: "boolean" },
        depthWrite: { type: "boolean" },
        blending: { type: "string", enum: ["normal", "additive", "subtractive", "multiply", "custom"] },
        // Shader
        vertexShader: { type: "string", description: "GLSL vertex shader code" },
        fragmentShader: { type: "string", description: "GLSL fragment shader code" },
        uniforms: { type: "string", description: "JSON string of uniforms object" }
      }
    },
    handler(args = {}) {
      const {
        type = "standard", name = "mat",
        color = "#ffffff", emissive = "#000000", emissiveIntensity = 1,
        metalness = 0, roughness = 0.5,
        transmission = 0, ior = 1.5, thickness = 0.5,
        clearcoat = 0, clearcoatRoughness = 0,
        sheen = 0, sheenColor = "#ffffff", iridescence = 0,
        opacity = 1, transparent = false,
        side = "front", wireframe = false, flatShading = false,
        depthWrite = true,
        blending = "normal",
        vertexShader, fragmentShader, uniforms
      } = args;

      const sideMap = { front: "THREE.FrontSide", back: "THREE.BackSide", double: "THREE.DoubleSide" };
      const blendMap = {
        normal: "THREE.NormalBlending",
        additive: "THREE.AdditiveBlending",
        subtractive: "THREE.SubtractiveBlending",
        multiply: "THREE.MultiplyBlending",
        custom: "THREE.CustomBlending"
      };

      const common = `  color: '${color}',\n  opacity: ${opacity},\n  transparent: ${transparent || opacity < 1},\n  side: ${sideMap[side] || "THREE.FrontSide"},\n  wireframe: ${wireframe},\n  depthWrite: ${depthWrite},\n  blending: ${blendMap[blending]}`;

      const defs = {
        standard: `new THREE.MeshStandardMaterial({\n${common},\n  emissive: '${emissive}',\n  emissiveIntensity: ${emissiveIntensity},\n  metalness: ${metalness},\n  roughness: ${roughness},\n  flatShading: ${flatShading}\n})`,
        physical: `new THREE.MeshPhysicalMaterial({\n${common},\n  emissive: '${emissive}',\n  metalness: ${metalness},\n  roughness: ${roughness},\n  transmission: ${transmission},\n  ior: ${ior},\n  thickness: ${thickness},\n  clearcoat: ${clearcoat},\n  clearcoatRoughness: ${clearcoatRoughness},\n  sheen: ${sheen},\n  sheenColor: new THREE.Color('${sheenColor}'),\n  iridescence: ${iridescence}\n})`,
        basic: `new THREE.MeshBasicMaterial({\n${common}\n})`,
        lambert: `new THREE.MeshLambertMaterial({\n${common},\n  emissive: '${emissive}'\n})`,
        phong: `new THREE.MeshPhongMaterial({\n${common},\n  emissive: '${emissive}',\n  shininess: 100,\n  flatShading: ${flatShading}\n})`,
        toon: `new THREE.MeshToonMaterial({\n${common}\n})`,
        matcap: `new THREE.MeshMatcapMaterial({\n  color: '${color}'\n  // matcap: textureLoader.load('path/to/matcap.png')\n})`,
        normal: `new THREE.MeshNormalMaterial({ wireframe: ${wireframe}, flatShading: ${flatShading} })`,
        depth: `new THREE.MeshDepthMaterial({ wireframe: ${wireframe} })`,
        points: `new THREE.PointsMaterial({\n  color: '${color}',\n  size: 0.05,\n  sizeAttenuation: true,\n  transparent: ${transparent || opacity < 1},\n  opacity: ${opacity}\n})`,
        sprite: `new THREE.SpriteMaterial({ color: '${color}', transparent: ${transparent || opacity < 1}, opacity: ${opacity} })`,
        line: `new THREE.LineBasicMaterial({ color: '${color}', linewidth: 1 })`,
        lineDashed: `new THREE.LineDashedMaterial({ color: '${color}', dashSize: 0.1, gapSize: 0.05 })`,
        shader: `new THREE.ShaderMaterial({\n  uniforms: ${uniforms || "{ time: { value: 0.0 } }"},\n  vertexShader: \`${vertexShader || "void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"}\`,\n  fragmentShader: \`${fragmentShader || "void main() { gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0); }"}\`\n})`
      };

      return `const ${name} = ${defs[type] || defs.standard};`;
    }
  }
];
