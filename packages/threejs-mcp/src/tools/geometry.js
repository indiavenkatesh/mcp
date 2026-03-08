export const geometryTools = [
  {
    name: "threejs_add_geometry",
    description: "Generate code for any Three.js geometry type: box, sphere, cylinder, cone, torus, plane, ring, circle, dodecahedron, icosahedron, octahedron, tetrahedron, torusKnot, lathe, extrude, shape, tube, capsule, edges, wireframe",
    inputSchema: {
      type: "object",
      required: ["type"],
      properties: {
        type: {
          type: "string",
          enum: [
            "box", "sphere", "cylinder", "cone", "torus", "plane",
            "ring", "circle", "dodecahedron", "icosahedron", "octahedron",
            "tetrahedron", "torusKnot", "capsule", "edges", "wireframe"
          ],
          description: "Geometry type"
        },
        name: { type: "string", description: "Variable name for the mesh, e.g. 'cube'" },
        // Box
        width: { type: "number", description: "Width (box, plane)" },
        height: { type: "number", description: "Height (box, cylinder, cone, capsule)" },
        depth: { type: "number", description: "Depth (box)" },
        widthSegments: { type: "number" },
        heightSegments: { type: "number" },
        depthSegments: { type: "number" },
        // Sphere / poly shapes
        radius: { type: "number", description: "Radius (sphere, circle, ring, polyhedra, capsule)" },
        phiStart: { type: "number" },
        phiLength: { type: "number" },
        thetaStart: { type: "number" },
        thetaLength: { type: "number" },
        detail: { type: "number", description: "Detail level for polyhedra" },
        // Cylinder / cone
        radiusTop: { type: "number" },
        radiusBottom: { type: "number" },
        radialSegments: { type: "number" },
        openEnded: { type: "boolean" },
        // Torus
        tube: { type: "number", description: "Tube radius for torus" },
        tubularSegments: { type: "number" },
        arc: { type: "number" },
        // TorusKnot
        p: { type: "number" },
        q: { type: "number" },
        // Ring
        innerRadius: { type: "number" },
        outerRadius: { type: "number" },
        thetaSegments: { type: "number" },
        phiSegments: { type: "number" },
        // Material
        materialType: { type: "string", enum: ["standard", "basic", "phong", "lambert", "toon", "normal", "wireframe"], description: "Material to pair with" },
        color: { type: "string", description: "Mesh color hex" },
        // Position
        x: { type: "number" },
        y: { type: "number" },
        z: { type: "number" },
        castShadow: { type: "boolean" },
        receiveShadow: { type: "boolean" }
      }
    },
    handler(args = {}) {
      const {
        type = "box", name = "mesh",
        width = 1, height = 1, depth = 1,
        widthSegments = 1, heightSegments = 1, depthSegments = 1,
        radius = 1, detail = 0,
        radiusTop = 1, radiusBottom = 1, radialSegments = 32, openEnded = false,
        tube = 0.4, tubularSegments = 48, arc = Math.PI * 2,
        p = 2, q = 3,
        innerRadius = 0.5, outerRadius = 1, thetaSegments = 32, phiSegments = 1,
        phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI,
        materialType = "standard", color = "#ffffff",
        x = 0, y = 0, z = 0,
        castShadow = true, receiveShadow = true
      } = args;

      const geometries = {
        box: `new THREE.BoxGeometry(${width}, ${height}, ${depth}, ${widthSegments}, ${heightSegments}, ${depthSegments})`,
        sphere: `new THREE.SphereGeometry(${radius}, ${widthSegments || 32}, ${heightSegments || 16}, ${phiStart}, ${phiLength}, ${thetaStart}, ${thetaLength})`,
        cylinder: `new THREE.CylinderGeometry(${radiusTop}, ${radiusBottom}, ${height}, ${radialSegments}, ${heightSegments}, ${openEnded})`,
        cone: `new THREE.ConeGeometry(${radius}, ${height}, ${radialSegments}, ${heightSegments}, ${openEnded})`,
        torus: `new THREE.TorusGeometry(${radius}, ${tube}, ${widthSegments || 16}, ${tubularSegments}, ${arc})`,
        torusKnot: `new THREE.TorusKnotGeometry(${radius}, ${tube}, ${tubularSegments}, ${radialSegments}, ${p}, ${q})`,
        plane: `new THREE.PlaneGeometry(${width}, ${height}, ${widthSegments}, ${heightSegments})`,
        circle: `new THREE.CircleGeometry(${radius}, ${thetaSegments}, ${thetaStart}, ${arc})`,
        ring: `new THREE.RingGeometry(${innerRadius}, ${outerRadius}, ${thetaSegments}, ${phiSegments}, ${thetaStart}, ${arc})`,
        dodecahedron: `new THREE.DodecahedronGeometry(${radius}, ${detail})`,
        icosahedron: `new THREE.IcosahedronGeometry(${radius}, ${detail})`,
        octahedron: `new THREE.OctahedronGeometry(${radius}, ${detail})`,
        tetrahedron: `new THREE.TetrahedronGeometry(${radius}, ${detail})`,
        capsule: `new THREE.CapsuleGeometry(${radius}, ${height}, ${radialSegments}, ${heightSegments})`,
        edges: `new THREE.EdgesGeometry(new THREE.BoxGeometry(${width}, ${height}, ${depth}))`,
        wireframe: `new THREE.WireframeGeometry(new THREE.BoxGeometry(${width}, ${height}, ${depth}))`
      };

      const materials = {
        standard: `new THREE.MeshStandardMaterial({ color: '${color}' })`,
        basic: `new THREE.MeshBasicMaterial({ color: '${color}' })`,
        phong: `new THREE.MeshPhongMaterial({ color: '${color}' })`,
        lambert: `new THREE.MeshLambertMaterial({ color: '${color}' })`,
        toon: `new THREE.MeshToonMaterial({ color: '${color}' })`,
        normal: `new THREE.MeshNormalMaterial()`,
        wireframe: `new THREE.MeshBasicMaterial({ color: '${color}', wireframe: true })`
      };

      const geo = geometries[type] || geometries.box;
      const mat = (type === "edges" || type === "wireframe")
        ? `new THREE.LineBasicMaterial({ color: '${color}' })`
        : materials[materialType];
      const meshClass = (type === "edges" || type === "wireframe") ? "THREE.LineSegments" : "THREE.Mesh";

      return `// ${type} geometry
const ${name}Geo = ${geo};
const ${name}Mat = ${mat};
const ${name} = new ${meshClass}(${name}Geo, ${name}Mat);
${name}.position.set(${x}, ${y}, ${z});
${castShadow && type !== "edges" && type !== "wireframe" ? `${name}.castShadow = true;` : ""}
${receiveShadow && type !== "edges" && type !== "wireframe" ? `${name}.receiveShadow = true;` : ""}
scene.add(${name});`;
    }
  }
];
