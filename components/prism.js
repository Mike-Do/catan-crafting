import * as THREE from 'three';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@3.0.0';
import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const simplex = new SimplexNoise();
let MAX_HEIGHT = 2; // adjust this for different types of terrains

// define height for textures
// const STONE_HEIGHT = MAX_HEIGHT * 0.8;
// const GRASS_HEIGHT = MAX_HEIGHT * 0.5;

let currGeo = new THREE.BoxGeometry(0,0,0);
// let grassGeo = new THREE.BoxGeometry(0,0,0);
// let waterGeo = new THREE.BoxGeometry(0,0,0);
// let dirtGeo = new THREE.BoxGeometry(0,0,0);
// let hayGeo = new THREE.BoxGeometry(0,0,0);

let currTextures;
let currTileType;
let currScene;

// Tile Type: 
// 1. Perlin noise changes
// 2. Textures used change

const loader = new GLTFLoader();

// helper method for loading a 3D model
function load3DModel(modelType, radius, height, center) {
    loader.load( `../assets/${modelType}.glb`, function ( gltf ) {
        const model = gltf.scene;

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
        if (modelType === "stone" || modelType === "steve" || modelType === "steve_boat" || modelType === "horse") {
            newPositionY = center[1] + height / 2;
        }

        if (modelType === "hay") {
            newPositionY = center[1] - scaledSize.y / 2;
        }
        model.position.set(center[0], newPositionY, center[2]);
        
        currScene.add(model);
    }, undefined, function ( error ) {
        console.error( error );
    } );
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
function getMesh(tileType, radius, height, center) {
    // initialize geo and material
    let geo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, height, 3);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    if (tileType == "Grassland") {
        // threshold for stone and grass
        let STONE_HEIGHT = MAX_HEIGHT * 0.7;
        let GRASS_HEIGHT = 0;
        
        if(height > STONE_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.stone
            });
        } else if (height > GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.grass
            });

            // randomly add 3D model sheep
            let randomNumber = Math.random();
            if (randomNumber > 0.7 && randomNumber < 0.8) {
                load3DModel("sheep", radius, height, center);
            } else if (randomNumber > 0.87 && randomNumber < 0.9) {
                load3DModel("steve", radius, height, center);
            }    
        }
    } else if (tileType == "Mountain") {
        // threshold for stone and mountain_grass
        let STONE_HEIGHT = MAX_HEIGHT * 0.2;
        let GRASS_HEIGHT = 0;

        if(height > STONE_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.stone
            });
            let randomNumber = Math.random();
//             if (randomNumber > 0.75 && randomNumber < 0.8) {
//                 load3DModel("stone", radius, height, center);
//             }
        } else if (height > GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.mountainGrass
            });

            let randomNumber = Math.random();
            if (randomNumber > 0.1 && randomNumber < 0.8) {
                load3DModel("stone", radius, height, center);
            }
        }
    } else if (tileType == "Riverland") {
        let STONE_HEIGHT = MAX_HEIGHT * 0.3;
        let GRASS_HEIGHT = MAX_HEIGHT * 0.1;
        let WATER_HEIGHT = 0;

        if(height > STONE_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.riverlandStone
            });
        } else if (height > GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.riverlandGrass
            });

            // randomly add 3D model trees
            let randomNumber = Math.random();
            if (randomNumber > 0.7 && randomNumber < 0.8) {
                load3DModel("tree", radius, height, center);
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
            roughnessMap: currTextures.water,
            metalnessMap: currTextures.water,
            });

            // randomly add 3D model steve in boat
            // randomly add 3D model clay
            let randomNumber = Math.random();
            if (randomNumber > 0.76 && randomNumber < 0.8) {
                load3DModel("steve_boat", radius, height, center);
            }
        }
        // geo = new THREE.CylinderGeometry(17, 17, MAX_HEIGHT * 0.2, 50);
    } else if (tileType == "Farmland") {
        let DIRT_HEIGHT = 0;
        let GRASS_HEIGHT = MAX_HEIGHT * 0.2;
        let HAY_HEIGHT = MAX_HEIGHT * 0.3;

        if(height > DIRT_HEIGHT && height < GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.dirt
            });

            // randomly add 3D model sheep
            let randomNumber = Math.random();
            if (randomNumber > 0.6 && randomNumber < 0.8) {
                load3DModel("hay", radius, height, center);
            }
        } else if (height > GRASS_HEIGHT && height < HAY_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.farmGrass
            });
        } else if (height > HAY_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.hay
            });
        }
    } else if (tileType == "Clayland") {
        let CLAY_HEIGHT = MAX_HEIGHT * 0.2;
        let STONE_HEIGHT = 0;

        if (height > STONE_HEIGHT && height < CLAY_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.clayStone
            });

            // randomly add 3D model horse
            let randomNumber = Math.random();
            if (randomNumber > 0.73 && randomNumber < 0.8) {
                load3DModel("horse", radius, height, center);
            }
        } else if (height >= CLAY_HEIGHT) {
            geo = mergeBufferGeometries([geo, currGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.clay
            });

            // randomly add 3D model clay
            let randomNumber = Math.random();
            if (randomNumber > 0.73 && randomNumber < 0.8) {
                load3DModel("clay", radius, height, center);
            }
        }
    }
    // add other tile types
    
    // if(height > STONE_HEIGHT) {
    //     geo = mergeBufferGeometries([geo, stoneGeo]);
    //     material = new THREE.MeshPhysicalMaterial({ 
    //         flatShading: true,
    //         map: currTextures.stone
    //     });
    // } else if (height > GRASS_HEIGHT) {
    //     geo = mergeBufferGeometries([geo, grassGeo]);
    //     material = new THREE.MeshPhysicalMaterial({ 
    //         flatShading: true,
    //         map: currTextures.grass
    //     });
    // }

    const mesh = new THREE.Mesh(geo, material);

    // add special effects for Riverland
    if (tileType == "Riverland") {
        mesh.receiveShadow = true;
        mesh.rotation.y = -Math.PI * 0.333 * 0.5;
        mesh.position.set(0, MAX_HEIGHT * 0.1, 0);
    }
    return mesh;
}

export function getPrisms(center, radius, level, yFlip, textures, tileType, scene) {
    if (textures != undefined) {
        currTextures = textures;
    }

    if (tileType != undefined) {
        currTileType = tileType;
    }

    if (scene != undefined) {
        currScene = scene;
    }

    if (level === 0) {
        // add simplex noise
        let height = getPerlinNoise(center, currTileType);
        
        center[1] += height / 2;

        // let geo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, height, 3);
        // let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });


        // if(height > STONE_HEIGHT) {
        //     geo = mergeBufferGeometries([geo, stoneGeo]);
        //     material = new THREE.MeshPhysicalMaterial({ 
        //         flatShading: true,
        //         map: currTextures.stone
        //     });
        // } else if (height > GRASS_HEIGHT) {
        //     geo = mergeBufferGeometries([geo, grassGeo]);
        //     material = new THREE.MeshPhysicalMaterial({ 
        //         flatShading: true,
        //         map: currTextures.grass
        //     });
        // }
          
        
        // const mesh = new THREE.Mesh(geo, material);
        const mesh = getMesh(currTileType, radius, height, center);
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
        childrenMeshes.push(...getPrisms(childCenter, radius / 2, level - 1, childrenData[i].yFlip));
    }

    return childrenMeshes;
}