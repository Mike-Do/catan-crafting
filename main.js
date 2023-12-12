import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';
import { getCatan } from './components/catan';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Weather from './components/weather';
import { addGUI } from './components/gui';

// GUI
var weather;
const appState = {
    detail: 3,
    cloud: true,
    rain: true,
    lightning: true,
    fog: true,
    reload: function() {
        weather.updateState();
    }
};
addGUI(appState);

const scene = new THREE.Scene();
let camera;
let controls;
let rain, rainGeo, rainMaterial, rainCount = 10000;
generateCamera();

const renderer = new THREE.WebGLRenderer();
// const sceneContainer = document.body;
// Append the renderer's DOM element to the scene container
// sceneContainer.appendChild(renderer.domElement);

// const containerWidth = document.body.clientWidth;
// const containerHeight = document.body.clientHeight;
// renderer.setSize(containerWidth, containerHeight);

renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.setClearColor(0x181716); // Set background color to beige
// set background color to transparent
renderer.setClearColor(0x000000, 0);
// add shadow support
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
camera.position.set(0, 35, 50);

// board is positioned at origin, ensure camera cannot go below the board
controls.maxPolarAngle = Math.PI / 2;


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

// add skybox using cube mapping, have files back, front, top, bottom, left, right located in skybox/assets
// const skybox = new THREE.CubeTextureLoader();
// const texture = skybox.load([
//     './assets/skybox/right.jpg',
//     './assets/skybox/left.jpg',
//     './assets/skybox/top.jpg',
//     './assets/skybox/bottom.jpg',
//     './assets/skybox/front.jpg',
//     './assets/skybox/back.jpg'
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
// scene.add(rain);

// const light = new THREE.PointLight( new THREE.Color(0xffffff).convertSRGBToLinear(), 80, 200);
// light.position.set(10, 20, 10);

// // ensure light can cast shadow
// light.castShadow = true;
// light.shadow.mapSize.width = 512;
// light.shadow.mapSize.height = 512;
// light.shadow.camera.near = 0.5;
// light.shadow.camera.far = 500;

// add bright directional light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 20, 10);
light.castShadow = true;
light.shadow.mapSize.width = 512;
light.shadow.mapSize.height = 512;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;

scene.add(light);

// add another light to brighten up the scene on other side
const light2 = new THREE.DirectionalLight(0xffffff, 1);
light2.position.set(0, 20, -10);
light2.castShadow = true;
light2.shadow.mapSize.width = 512;
light2.shadow.mapSize.height = 512;
light2.shadow.camera.near = 0.5;
light2.shadow.camera.far = 500;

scene.add(light2);

// add another light to brighten up the scene on other side
const light3 = new THREE.DirectionalLight(0xffffff, 1);
light3.position.set(10, 20, 0);
light3.castShadow = true;
light3.shadow.mapSize.width = 512;
light3.shadow.mapSize.height = 512;
light3.shadow.camera.near = 0.5;
light3.shadow.camera.far = 500;

scene.add(light3);

// add another light to brighten up the scene on other side
const light4 = new THREE.DirectionalLight(0xffffff, 1);
light4.position.set(-10, 20, 0);
light4.castShadow = true;
light4.shadow.mapSize.width = 512;
light4.shadow.mapSize.height = 512;
light4.shadow.camera.near = 0.5;
light4.shadow.camera.far = 500;

scene.add(light4);

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

    scene.add
    (camera);
  }


const loader = new GLTFLoader();
let loadedModels = {}; // Object to store loaded models

// helper method that loads a 3D model once
function loadModelOnce(modelType) {
    return new Promise((resolve, reject) => {
        loader.load(`../assets/${modelType}.glb`, function (gltf) {
            const model = gltf.scene;
            loadedModels[modelType] = model.clone(); // Store the loaded model by its type
            resolve();
        }, undefined, function (error) {
            console.error(error);
            reject(error);
        });
    });
}

// Load textures and 3D models asynchronously on the board
(async function () {
    // wait for textures to load before rendering scene
    let textures = {
        stone: await new THREE.TextureLoader().loadAsync('./assets/stone.png'),
        grass: await new THREE.TextureLoader().loadAsync('./assets/grass.png'),
        mountainGrass: await new THREE.TextureLoader().loadAsync('./assets/mountain_grass.png'),
        water: await new THREE.TextureLoader().loadAsync('./assets/water.jpg'),
        riverlandGrass: await new THREE.TextureLoader().loadAsync('./assets/riverland_grass.png'),
        riverlandStone: await new THREE.TextureLoader().loadAsync('./assets/riverland_stone.png'),
        dirt: await new THREE.TextureLoader().loadAsync('./assets/farm_dirt.png'),
        farmGrass: await new THREE.TextureLoader().loadAsync('./assets/farm_grass.png'),
        hay: await new THREE.TextureLoader().loadAsync('./assets/hay.png'),
        clay: await new THREE.TextureLoader().loadAsync('./assets/clay.png'),
        clayStone: await new THREE.TextureLoader().loadAsync('./assets/clay_stone.png')
    };

    // wait for all the 3D models to load before rendering scene
    await Promise.all([
        loadModelOnce('clay'),
        loadModelOnce('hay'),
        loadModelOnce('sheep'),
        loadModelOnce('steve'),
        loadModelOnce('steve_boat'),
        loadModelOnce('stone'),
        loadModelOnce('tree')
    ]);

    // scene.background = null;
    // // After the scene is loaded, initiate Vanta.js background


    // let stoneMesh = hexMesh(stoneGeo, textures.stone);
    // const smallHexMaterial = new THREE.MeshStandardMaterial({ map: textures.stone });

    // Add the larger hexagon tile to the scene
    // stoneGeo = mergeBufferGeometries([smallHexGeometry, stoneGeo]);
    const largerHexagon = getCatan(6, 3, textures, scene, loadedModels);
    scene.add(largerHexagon);
})();

weather = new Weather(scene, camera, appState);


// Function to initiate Vanta.js background
// function initiateVantaBackground() {
//     VANTA.WAVES({
//         el: "body",
//         mouseControls: true, // Add mouse interactivity if needed
//         touchControls: true // Add touch interactivity if needed
//         // Add any additional Vanta.js options as required
//     });
// }

camera.position.z = 10;

// largerHexagon.rotation.x += 5;
// largerHexagon.rotation.y += 5;

// function stone(height, position) {
//     const px = Math.random() * 0.4;
//     const pz = Math.random() * 0.4;

//     const geo = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 7, 7);
//     geo.translate(position.x + px, height + 0.5, position.y + pz);

//     return geo;
// }

// function tree (height, position) {
//     const treeHeight = Math.random() * 0.7 + 0.25;
    
//     // pyramid for tree top
//     const geo = new THREE.CylinderGeometry(0, 1.5, treeHeight, 3);
//     geo.translate(position.x, height + treeHeight * 0 + 1, position.y);

//     const geo2 = new THREE.CylinderGeometry(0, 1.15, treeHeight, 3);
//     geo2.translate(position.x, height + treeHeight * 0.6 + 1, position.y);

//     const geo3 = new THREE.CylinderGeometry(0, 0.8, treeHeight, 3);
//     geo3.translate(position.x, height + treeHeight * 1.25 + 1, position.y);

//     // use mergeBufferGeometries to combine geometries into one
//     return [geo, geo2, geo3]
// }

// function clouds() {
//     let geo = new THREE.SphereGeometry(0, 0, 0); 
//     // let count = Math.floor(Math.pow(Math.random(), 0.45) * 4);
//     let count = 3;
  
//     for(let i = 0; i < count; i++) {
//       const puff1 = new THREE.SphereGeometry(1.2, 7, 7);
//       const puff2 = new THREE.SphereGeometry(1.5, 7, 7);
//       const puff3 = new THREE.SphereGeometry(0.9, 7, 7);
     
//       puff1.translate(-1.85, Math.random() * 0.3, 0);
//       puff2.translate(0,     Math.random() * 0.3, 0);
//       puff3.translate(1.85,  Math.random() * 0.3, 0);

//       // translate each puff by   Math.random() * 20 - 10, 
//       // Math.random() * 7 + 7, 
//       // Math.random() * 20 - 10 for x, y, z respectively
//       puff1.translate(Math.random() * 20 - 10, Math.random() * 7 + 7, Math.random() * 20 - 10);
//       puff2.translate(Math.random() * 20 - 10, Math.random() * 7 + 7, Math.random() * 20 - 10);
//       puff3.translate(Math.random() * 20 - 10, Math.random() * 7 + 7, Math.random() * 20 - 10);
    
//       // then rotate each puff by Math.random() * Math.PI * 2 for y
//       puff1.rotateY(Math.random() * Math.PI * 2);
//       puff2.rotateY(Math.random() * Math.PI * 2);
//       puff3.rotateY(Math.random() * Math.PI * 2);

//       return [puff1, puff2, puff3];
//     }
// }

// add clouds to scene
// const cloudGroup = new THREE.Group();
// const cloudGeos = clouds();
// cloudGeos.forEach(cloudGeo => {
//     // make color of cloud white
//     const cloudMesh = new THREE.Mesh(cloudGeo, new THREE.MeshBasicMaterial({color: 0x000}));
//     cloudGroup.add(cloudMesh);
// })

// add WASD controls
document.addEventListener('keydown', onDocumentKeyDown, false);

let angle = 0;
let radius = 10;

function onDocumentKeyDown(event) {
    const keyCode = event.which;
    if (keyCode == 87) {
        // camera.position.z -= 1;
        radius -= 0.5;
    } else if (keyCode == 83) {
        // camera.position.z += 1;
        radius += 0.5;
    } else if (keyCode == 65) {
        // camera.position.x -= 1;
        angle -= 0.1;
    } else if (keyCode == 68) {
        // camera.position.x += 1;
        angle += 0.1;
    }
}

// called every frame; core function that brings everything together
function animate() {
	requestAnimationFrame( animate );

	// largerHexagon.rotation.x += 0.009;
    // largerHexagon.rotation.y += 0.009;
    controls.update();

    // Update positions and velocities
    // let positions = rainGeo.attributes.position;
    // let velocities = rainGeo.attributes.velocity;
    // let count = positions.count;

    // for (let i = 0; i < count; i++) {
    //     // Update velocity
    //     // let velocity = velocities.getX(i) - 0.1 + Math.random() * 0.1;
    //     // make velocity slow
    //     let velocity = velocities.getX(i) - 0.01 + Math.random() * 0.01;

    //     // after velocity reaches a certain point, reset it to 0
    //     if (velocity > 0.25) {
    //         velocity = 0;
    //     }

    //     // reset velocity periodically
    //     velocities.setX(i, velocity);

    //     // Update position
    //     let y = positions.getY(i) + velocity;
    //     if (y < -200) {
    //         y = 200;
    //         velocity = 0;
    //     }
    //     positions.setY(i, y);
    // }

    // positions.needsUpdate = true;
    // rain.rotation.y += 0.002;
    // velocities.needsUpdate = true;

    // camera rotation
    // radius is the curent distance from the center of the scene
    angle += 0.01;
    camera.position.x = radius * Math.cos(angle);
    camera.position.z = radius * Math.sin(angle);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    weather.update();

	renderer.render( scene, camera );
}

animate();
