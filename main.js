import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getCatan } from './components/catan';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Weather from './components/weather';
import { addGUI } from './components/gui';

// GUI
var weather;
var catan;
const appState = {
    detail: 2,
    // focus: 0,
    cloud: true,
    rain: true,
    lightning: true,
    fog: true,
    reload: function() {
        reloadCatan();
        weather.updateState();
    },
    autoRotate: true,
    lookAt: 0,
};
addGUI(appState);

const scene = new THREE.Scene();
let camera;
let controls;
let textures;
generateCamera();

const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.setClearColor(0x181716); // Set background color to beige
// set background color to transparent
renderer.setClearColor(0x000000, 0);
// add shadow support
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 12.470765814495916);
camera.position.set(0, 35, 50);

// board is positioned at origin, ensure camera cannot go below the board
controls.maxPolarAngle = Math.PI / 2;

controls.update();
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
    camera.lookAt(new THREE.Vector3(0, 0, 12.470765814495916));

    scene.add(camera);
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

var tileCenters = [];
// Load textures and 3D models asynchronously on the board
(async function () {
    // wait for textures to load before rendering scene
    textures = {
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

    const [largerHexagon, centers] = getCatan(6, appState.detail, textures, loadedModels, appState);
    catan = largerHexagon;
    tileCenters = centers;
    scene.add(largerHexagon);
})();

weather = new Weather(scene, camera, appState);

function reloadCatan() {
    removeObject(catan);
    var c;
    // re-instantiate the catan board with the new level of detail
    [catan, c] = getCatan(6, appState.detail, textures, loadedModels, appState);
    scene.add(catan);
}

function removeObject(object3D) {
    if (!(object3D instanceof THREE.Object3D)) return false;

    // for better memory management and performance
    if (object3D.geometry) object3D.geometry.dispose();

    if (object3D.material) {
    if (object3D.material instanceof Array) {
    // for better memory management and performance
    object3D.material.forEach(material => material.dispose());
    } else {
    // for better memory management and performance
    object3D.material.dispose();
    }
    }
    object3D.removeFromParent(); // the parent might be the scene or another Object3D, but it is sure to be removed this way
    return true;
}

camera.position.z = 10;

// add WASD controls
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

let angle = 0;
let radius = 10;
// let autoRotate = true;
let keyState = { w: false, a: false, s: false, d: false };

function startAutoRotate() {
    angle = Math.atan2(camera.position.z, camera.position.x);
    if (angle < 0) {
        angle += Math.PI * 2;
    }
    radius = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
    appState.autoRotate = true;
}

function stopAutoRotate() {
    appState.autoRotate = false;
}

controls.addEventListener('start', stopAutoRotate);

controls.addEventListener('end', startAutoRotate);


function onDocumentKeyDown(event) {
    stopAutoRotate();

    const keyCode = event.which;
    if (keyCode == 87) {
        keyState.w = true;
    } else if (keyCode == 83) {
        keyState.s = true;
    } else if (keyCode == 65) {
        keyState.a = true;
    } else if (keyCode == 68) {
        keyState.d = true;
    }
}

function onDocumentKeyUp(event) {
    switch (event.key) {
        case 'w':
            keyState.w = false;
            break;
        case 'a':
            keyState.a = false;
            break;
        case 's':
            keyState.s = false;
            break;
        case 'd':
            keyState.d = false;
            break;
    }
    startAutoRotate();
}

// called every frame; core function that brings everything together
function animate() {
	requestAnimationFrame( animate );
    controls.update();

    if (tileCenters[appState.lookAt] !== undefined) {
        // camera.lookAt(new THREE.Vector3(...tileCenters[appState.lookAt]));
        const targetPosition = new THREE.Vector3(...tileCenters[appState.lookAt]);
        camera.lookAt(targetPosition);
    }

    // camera rotation
    // radius is the curent distance from the center of the scene
    if (appState.autoRotate && appState.lookAt === 0) {
        angle += 0.005;
        camera.position.x = radius * Math.cos(angle);
        camera.position.z = radius * Math.sin(angle);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
    if (keyState.w) camera.position.z -= 0.5;
    if (keyState.s) camera.position.z += 0.5;
    if (keyState.a) camera.position.x -= 0.5;
    if (keyState.d) camera.position.x += 0.5;

    weather.update();

	renderer.render( scene, camera );
}

animate();
