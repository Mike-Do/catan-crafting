import * as THREE from 'three';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@3.0.0';
import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';

const simplex = new SimplexNoise();
let MAX_HEIGHT = 2; // adjust this for different types of terrains

let currGeo = new THREE.BoxGeometry(0, 0, 0);
// Function to position and scale the loaded model
function load3DModel(modelType, radius, height, center, catanGroup, loadedModels, appState) {
    // Handle the case where the model hasn't been loaded yet
    if (!loadedModels[modelType]) {
        console.error(`Model type ${modelType} not loaded yet`);
        return;
    }

    const model = loadedModels[modelType].clone(); // Clone the loaded model

    // get original size of 3d model
    let bbox = new THREE.Box3().setFromObject(model);
    let empty = new THREE.Vector3();
    let originalSize = bbox.getSize(empty);

    // calculate scaling factor based on original size and radius
    const scaleX = radius / originalSize.x;
    const scaleY = radius / originalSize.y;
    const scaleZ = radius / originalSize.z;

    // Choose the smallest scaling factor to ensure the model fits within the prism
    const minScaleFactor = Math.min(scaleX, scaleY, scaleZ);

    // randomize the rotation of the 3D model
    model.rotation.y = Math.random() * Math.PI * 2;
    model.scale.set(minScaleFactor, minScaleFactor, minScaleFactor);

    // Calculate the size of the model after scaling
    bbox = new THREE.Box3().setFromObject(model);
    let scaled = new THREE.Vector3();
    let scaledSize = bbox.getSize(scaled);

    // Position the model above the prism
    // center[1] is center of prism, add half height to get to top, add half scaled model to put model on top
    let newPositionY = center[1] + height / 2 + scaledSize.y / 2;
    if (modelType === "stone" || modelType === "steve" || modelType === "steve_boat") {
        newPositionY = center[1] + height / 2;
    }

    if (modelType === "hay") {
        newPositionY = center[1] - scaledSize.y / 2;
    }

    if (modelType === "diamond") {
        newPositionY += scaledSize.y / 2;
    }

    model.position.set(center[0], newPositionY, center[2]);

    if (modelType === "sheep" || modelType === "steve") {
        appState.rainGoHomeGroup.add(model);
        return;
    } else if (modelType === "steve_boat") {
        appState.fogGoHomeGroup.add(model);
        return;
    }

    // add the 3D model to the group
    catanGroup.add(model);
}

// helper function that returns height randomly generated with perlin noise
function getPerlinNoise(center, tileType) {
    let parameter1 = 0.3;
    let maxHeight;
    let parameter2 = 1.5;

    if (tileType == "Grassland") {
        maxHeight = 1.5;
    } else if (tileType == "Mountain") {
        maxHeight = 5;
    } else if (tileType == "Riverland") {
        maxHeight = 1.5;
    } else if (tileType == "Farmland") {
        maxHeight = 1.5;
    } else if (tileType == "Clayland") {
        parameter1 = 0.2;
        parameter2 = 1.5;
        maxHeight = 3;
    }
    // add other tile types
    let noise = (simplex.noise2D(center[0] * parameter1, center[2] * parameter1) + 1) * 0.5;
    noise = Math.pow(noise, parameter2);
    const height = noise * maxHeight;

    return height;
}

// helper function that returns a mesh based on the tile type
function getMesh(tileType, radius, height, center, textures, catanGroup, loadedModels, appState) {
    // initialize geo and material
    let geo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, height, 3);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    if (tileType == "Grassland") {
        // threshold for stone and grass
        let STONE_HEIGHT = MAX_HEIGHT * 0.6;
        let GRASS_HEIGHT = 0;

        if (height > STONE_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.stone
            });
        } else if (height > GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.grass
            });

            // randomly add 3D model sheep and steve if not raining
            let randomNumber = Math.random();
            if (randomNumber > 0.7 && randomNumber < 0.8) {
                load3DModel("sheep", radius, height, center, catanGroup, loadedModels, appState);
            } else if (randomNumber > 0.87 && randomNumber < 0.9) {
                load3DModel("steve", radius, height, center, catanGroup, loadedModels, appState);
            }

            // EASTER EGG DIAMOND
            if (randomNumber > 0.1 && randomNumber < 0.101) {
                load3DModel("diamond", radius, height, center, catanGroup, loadedModels, appState);
            }
        }
    } else if (tileType == "Mountain") {
        // threshold for stone and mountain_grass
        MAX_HEIGHT = 5; // max height for mountain
        let GRASS_HEIGHT = 0;
        let STONE_HEIGHT = MAX_HEIGHT * 0.2;
        let SNOW_HEIGHT = MAX_HEIGHT * 0.8;

        if (height > GRASS_HEIGHT && height < STONE_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.mountainGrass
            });
        } else if (height >= STONE_HEIGHT && height < SNOW_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.stone
            });

            let randomNumber = Math.random();
            if (randomNumber > 0.7 && randomNumber < 0.8) {
                load3DModel("stone", radius, height, center, catanGroup, loadedModels, appState);
            }
        } else if (height >= SNOW_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.snow
            });
        }
    } else if (tileType == "Riverland") {
        let STONE_HEIGHT = MAX_HEIGHT * 0.3;
        let GRASS_HEIGHT = MAX_HEIGHT * 0.1;
        let WATER_HEIGHT = 0;

        if (height > STONE_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.riverlandStone
            });
        } else if (height > GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.riverlandGrass
            });

            // randomly add 3D model trees
            let randomNumber = Math.random();
            if (randomNumber > 0.7 && randomNumber < 0.8) {
                load3DModel("tree", radius, height, center, catanGroup, loadedModels, appState);
            }
        } else if (height > WATER_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color("#55aaff").convertSRGBToLinear().multiplyScalar(3),
                ior: 1.4,
                transmission: 1,
                transparent: true,
                thickness: 2,
                roughness: 1,
                metalness: 0.025,
                roughnessMap: textures.water,
                metalnessMap: textures.water,
            });

            // randomly add 3D model steve in boat if not foggy
            let randomNumber = Math.random();
            if (randomNumber > 0.76 && randomNumber < 0.8) {
                load3DModel("steve_boat", radius, height, center, catanGroup, loadedModels, appState);
            }
        }
    } else if (tileType == "Farmland") {
        let DIRT_HEIGHT = 0;
        let GRASS_HEIGHT = MAX_HEIGHT * 0.2;
        let HAY_HEIGHT = MAX_HEIGHT * 0.3;

        if (height > DIRT_HEIGHT && height < GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.dirt
            });

            // randomly add 3D model sheep
            let randomNumber = Math.random();
            if (randomNumber > 0.6 && randomNumber < 0.8) {
                load3DModel("hay", radius, height, center, catanGroup, loadedModels, appState);
            }
        } else if (height > GRASS_HEIGHT && height < HAY_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.farmGrass
            });
        } else if (height > HAY_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.hay
            });
        }
    } else if (tileType == "Clayland") {
        let CLAY_HEIGHT = MAX_HEIGHT * 0.2;
        let STONE_HEIGHT = 0;

        if (height > STONE_HEIGHT && height < CLAY_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.clayStone
            });
        } else if (height >= CLAY_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({
                flatShading: true,
                map: textures.clay
            });

            // randomly add 3D model clay
            let randomNumber = Math.random();
            if (randomNumber > 0.73 && randomNumber < 0.8) {
                load3DModel("clay", radius, height, center, catanGroup, loadedModels, appState);
            }
        }
    }
    const mesh = new THREE.Mesh(geo, material);

    // add special effects for Riverland
    if (tileType == "Riverland") {
        mesh.receiveShadow = true;
        mesh.rotation.y = -Math.PI * 0.333 * 0.5;
        mesh.position.set(0, MAX_HEIGHT * 0.1, 0);
    }
    return mesh;
}

export function getPrisms(center, radius, level, yFlip, textures, tileType, catanGroup, loadedModels, appState) {
    if (level === 0) {
        // add simplex noise
        let height = getPerlinNoise(center, tileType);

        center[1] += height / 2;
        const mesh = getMesh(tileType, radius, height, center, textures, catanGroup, loadedModels, appState);
        mesh.position.set(...center);
        mesh.rotation.set(0, yFlip ? Math.PI : 0, 0);
        return [mesh];
    }

    const childrenMeshes = [];
    const childrenData = [
        { cOff: [0, 0, 0], yFlip: !yFlip },
        { cOff: [0, 0, radius / 2], yFlip: yFlip },
        { cOff: [-Math.sqrt(3) / 4 * radius, 0, -radius / 4], yFlip: yFlip },
        { cOff: [Math.sqrt(3) / 4 * radius, 0, -radius / 4], yFlip: yFlip }
    ];

    for (let i = 0; i < childrenData.length; i++) {
        const sign = childrenData[i].yFlip ? -1 : 1;
        const childCenter = [...center];
        childCenter[0] += sign * childrenData[i].cOff[0];
        childCenter[1] += sign * childrenData[i].cOff[1];
        childCenter[2] += sign * childrenData[i].cOff[2];
        childrenMeshes.push(...getPrisms(childCenter, radius / 2, level - 1, childrenData[i].yFlip, textures, tileType, catanGroup, loadedModels, appState));
    }

    return childrenMeshes;
}