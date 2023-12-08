import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// GUI
const gui = new GUI();
gui.add( document, 'title' );

const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let camera;
let controls;
let rain, rainGeo, rainMaterial, rainCount = 10000;
generateCamera();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.setClearColor(0xF5F5DC); // Set background color to beige
// add shadow support
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
camera.position.set(0, 20, 100);
// constrols.dampingFactor = 0.05;
// controls.enableDamping = true;
controls.update();

// add skybox called "catan_skybox.jpeg" sample the texture on the inside of the cube to make skybox using direction vectors
// const skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
// const skyboxTexture = new THREE.TextureLoader().load('./assets/catan_skybox.jpeg');

// const skyboxMaterial = new THREE.MeshBasicMaterial({
//     map: skyboxTexture,
//     side: THREE.BackSide
// });

// const skybox = new THREE.Mesh(skyboxGeo, skyboxMaterial);
// scene.add(skybox);

// add skybox using cube mapping, have files nx, ny, nz, px, py, pz
// const loader = new THREE.CubeTextureLoader();
// const texture = loader.load([
//     './assets/px.png',
//     './assets/nx.png',
//     './assets/py.png',
//     './assets/ny.png',
//     './assets/pz.png',
//     './assets/nz.png',
// ]);

// scene.background = texture;



// rainGeo = new THREE.BufferGeometry();
// const positions = [];
// for (let i = 0; i < rainCount; i++) {
//     let rainDrop = new THREE.Vector3(
//         Math.random() * 400 - 200,
//         Math.random() * 500 - 250,
//         Math.random() * 400 - 200
//     );
//     rainDrop.velocity = [];
//     rainDrop.velocity = 0;
//     rainGeo.vertices.push(rainDrop);
// }
rainGeo = new THREE.BufferGeometry();
const positions = [];
const velocities = []; // Separate array for velocities
for (let i = 0; i < rainCount; i++) {
    positions.push(Math.random() * 400 - 200);
    positions.push(Math.random() * 500 - 250);
    positions.push(Math.random() * 400 - 200);

    // Initial velocity
    velocities.push(0); // Assuming initial velocity is 0
}
rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
rainGeo.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 1));


rainMaterial = new THREE.PointsMaterial({
    color: 0x30B4C9,
    size: 0.35,
    transparent: true
});

rain = new THREE.Points(rainGeo, rainMaterial);
scene.add(rain);



const light = new THREE.PointLight( new THREE.Color(0xffffff).convertSRGBToLinear(), 80, 200);
light.position.set(10, 20, 10);

// ensure light can cast shadow
light.castShadow = true;
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;
scene.add(light);



function generateCamera() {
    let fieldOfView = 75;
    let aspect = window.innerWidth / window.innerHeight;
    let nearPlane = 1;
    let farPlane = 5000;
    camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspect,
      nearPlane,
      farPlane
    );
    camera.position.x = 500;
    camera.position.y = 500;
    camera.position.z = 500;
    camera.up.set(0, 1, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);
  }

const smallHexGeometry = new THREE.CylinderGeometry( 0.95, 0.95, 1, 6 );
const smallHexMaterial = new THREE.MeshBasicMaterial( { color: 0x808080 } );

// Array to hold smaller hexagon meshes
const smallHexagons = [];

// Function to create a single small hexagon
function createSmallHexagon(x, y, z) {
    const smallHexagonMesh = new THREE.Mesh(smallHexGeometry, smallHexMaterial);
    smallHexagonMesh.position.set(x, y, z);
    return smallHexagonMesh;
}

// Function to create the larger hexagon tile
function createHexagonTile() {
    const hexagonGroup = new THREE.Group();

    // Define positions for smaller hexagons forming the larger hexagon
    const positions = [
        // [0, 0, 0],
        // [1, 0, 0],
        // [2, 0, 0],
        // [0, 0, 1],
        // [1, 0, 1],
        // [2, 0, 1],
        // [0, 0, 2],
        // [1, 0, 2],
        // [2, 0, 2]
		// [0, 0, 0],
		// [-1, 0, 0],
		// [-2, 0, 0],

		// [-0.5, 0, -1.5],
		// [-0.5, 0, 1.5]

		// GOOD NUMBERS
		// [0, 0, 0],
		// [1.5, 0, -0.866],
		// [-1.5, 0, -0.866],
		// [-3, 0, 0],
		// [-1.5, 0, 0.866],
		// [1.5, 0, 0.866],
		// [3, 0, 0]

		//
		[-Math.sqrt(3), 0, 0],
		[0, 0, 0],
		[Math.sqrt(3)/2, 0, 1.5],
		[-Math.sqrt(3)/2, 0, 1.5],
		[Math.sqrt(3), 0, 0],
		[Math.sqrt(3)/2, 0, -1.5],
		[-Math.sqrt(3)/2, 0, -1.5]

		// [-2, 0, -3],
		// [2, 0, -3],

    ];

    // Create smaller hexagons at specified positions
    for (let i = 0; i < positions.length; i++) {
        const [x, y, z] = positions[i];
        const smallHexagon = createSmallHexagon(x, y, z);
        smallHexagons.push(smallHexagon);
        hexagonGroup.add(smallHexagon);

        // randomly add stones
        if (Math.random() > 0.5) {
            const stoneGeo = stone(0, {x, y, z});
            const stoneMesh = new THREE.Mesh(stoneGeo, new THREE.MeshBasicMaterial({color: 0x000000}));
            hexagonGroup.add(stoneMesh);
        }

        // randomly add trees
        if (Math.random() > 0.5) {
            const treeGeos = tree(0, {x, y, z});
            // loop through treeGeos and add each to hexagonGroup
            treeGeos.forEach(treeGeo => {
                const treeMesh = new THREE.Mesh(treeGeo, new THREE.MeshBasicMaterial({color: 0x00ff00}));
                hexagonGroup.add(treeMesh);
            })
        }
    }

    return hexagonGroup;
}

// Add the larger hexagon tile to the scene
const largerHexagon = createHexagonTile();
scene.add(largerHexagon);

// const cube = new THREE.Mesh( hexGeomgetry, material );
// scene.add( cube );

camera.position.z = 10;

// largerHexagon.rotation.x += 5;
// largerHexagon.rotation.y += 5;

function stone(height, position) {
    const px = Math.random() * 0.4;
    const pz = Math.random() * 0.4;

    const geo = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 7, 7);
    geo.translate(position.x + px, height + 0.5, position.y + pz);

    return geo;
}

function tree (height, position) {
    const treeHeight = Math.random() * 0.7 + 0.25;
    
    // pyramid for tree top
    const geo = new THREE.CylinderGeometry(0, 1.5, treeHeight, 3);
    geo.translate(position.x, height + treeHeight * 0 + 1, position.y);

    const geo2 = new THREE.CylinderGeometry(0, 1.15, treeHeight, 3);
    geo2.translate(position.x, height + treeHeight * 0.6 + 1, position.y);

    const geo3 = new THREE.CylinderGeometry(0, 0.8, treeHeight, 3);
    geo3.translate(position.x, height + treeHeight * 1.25 + 1, position.y);

    // use mergeBufferGeometries to combine geometries into one
    return [geo, geo2, geo3]
}

function clouds() {
    let geo = new THREE.SphereGeometry(0, 0, 0); 
    // let count = Math.floor(Math.pow(Math.random(), 0.45) * 4);
    let count = 3;
  
    for(let i = 0; i < count; i++) {
      const puff1 = new THREE.SphereGeometry(1.2, 7, 7);
      const puff2 = new THREE.SphereGeometry(1.5, 7, 7);
      const puff3 = new THREE.SphereGeometry(0.9, 7, 7);
     
      puff1.translate(-1.85, Math.random() * 0.3, 0);
      puff2.translate(0,     Math.random() * 0.3, 0);
      puff3.translate(1.85,  Math.random() * 0.3, 0);

      // translate each puff by   Math.random() * 20 - 10, 
      // Math.random() * 7 + 7, 
      // Math.random() * 20 - 10 for x, y, z respectively
      puff1.translate(Math.random() * 20 - 10, Math.random() * 7 + 7, Math.random() * 20 - 10);
      puff2.translate(Math.random() * 20 - 10, Math.random() * 7 + 7, Math.random() * 20 - 10);
      puff3.translate(Math.random() * 20 - 10, Math.random() * 7 + 7, Math.random() * 20 - 10);
    
      // then rotate each puff by Math.random() * Math.PI * 2 for y
      puff1.rotateY(Math.random() * Math.PI * 2);
      puff2.rotateY(Math.random() * Math.PI * 2);
      puff3.rotateY(Math.random() * Math.PI * 2);

      return [puff1, puff2, puff3];
    }
}

// add clouds to scene
const cloudGroup = new THREE.Group();
const cloudGeos = clouds();
cloudGeos.forEach(cloudGeo => {
    // make color of cloud white
    const cloudMesh = new THREE.Mesh(cloudGeo, new THREE.MeshBasicMaterial({color: 0x000}));
    cloudGroup.add(cloudMesh);
})

// called every frame; core function that brings everything together
function animate() {
	requestAnimationFrame( animate );

	// largerHexagon.rotation.x += 0.009;
    // largerHexagon.rotation.y += 0.009;
    controls.update();

    // Update positions and velocities
    let positions = rainGeo.attributes.position;
    let velocities = rainGeo.attributes.velocity;
    let count = positions.count;

    for (let i = 0; i < count; i++) {
        // Update velocity
        // let velocity = velocities.getX(i) - 0.1 + Math.random() * 0.1;
        // make velocity slow
        let velocity = velocities.getX(i) - 0.01 + Math.random() * 0.01;

        // after velocity reaches a certain point, reset it to 0
        if (velocity > 0.25) {
            velocity = 0;
        }

        // reset velocity periodically
        velocities.setX(i, velocity);

        // Update position
        let y = positions.getY(i) + velocity;
        if (y < -200) {
            y = 200;
            velocity = 0;
        }
        positions.setY(i, y);
    }

    positions.needsUpdate = true;
    rain.rotation.y += 0.002;
    // velocities.needsUpdate = true;


	renderer.render( scene, camera );
}

animate();
