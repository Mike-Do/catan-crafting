import * as THREE from 'three';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@3.0.0';
import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';

const simplex = new SimplexNoise();
let MAX_HEIGHT = 2; // adjust this for different types of terrains

// define height for textures
// const STONE_HEIGHT = MAX_HEIGHT * 0.8;
// const GRASS_HEIGHT = MAX_HEIGHT * 0.5;

let stoneGeo = new THREE.BoxGeometry(0,0,0);
let grassGeo = new THREE.BoxGeometry(0,0,0);
let waterGeo = new THREE.BoxGeometry(0,0,0);
let dirtGeo = new THREE.BoxGeometry(0,0,0);
let hayGeo = new THREE.BoxGeometry(0,0,0);

let currTextures;
let currTileType;

// Tile Type: 
// 1. Perlin noise changes
// 2. Textures used change

// helper function that returns height randomly generated with perlin noise
function getPerlinNoise(center, tileType) {
    let parameter1;
    let maxHeight;
    let parameter2;

    if (tileType == "Grassland") {
        parameter1 = 0.3;
        parameter2 = 1.5;
        maxHeight = 1.5;
    } else if (tileType == "Mountain") {
        parameter1 = 0.3;
        parameter2 = 1.5;
        maxHeight = 5;
    } else if (tileType == "Riverland") {
        parameter1 = 0.3;
        parameter2 = 1.5;
        maxHeight = 1.5;
    } else if (tileType == "Farmland") {
        parameter1 = 0.3;
        parameter2 = 1.5;
        maxHeight = 1.5;
    }
    // add other tile types
    let noise = (simplex.noise2D(center[0] * parameter1, center[2] * parameter1) + 1) * 0.5;
    noise = Math.pow(noise, parameter2);
    const height = noise * maxHeight;

    return height;
}

// helper function that returns a mesh based on the tile type
function getMesh(tileType, radius, height) {
    // initialize geo and material
    let geo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, height, 3);
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    if (tileType == "Grassland") {
        // threshold for stone and grass
        let STONE_HEIGHT = MAX_HEIGHT * 0.7;
        let GRASS_HEIGHT = 0;
        
        if(height > STONE_HEIGHT) {
            geo = mergeBufferGeometries([geo, stoneGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.stone
            });
        } else if (height > GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, grassGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.grass
            });
        }
    } else if (tileType == "Mountain") {
        // threshold for stone and mountain_grass
        let STONE_HEIGHT = MAX_HEIGHT * 0.2;
        let GRASS_HEIGHT = 0;

        if(height > STONE_HEIGHT) {
            geo = mergeBufferGeometries([geo, stoneGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.stone
            });
        } else if (height > GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, grassGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.mountainGrass
            });
        }
    } else if (tileType == "Riverland") {
        let STONE_HEIGHT = MAX_HEIGHT * 0.3;
        let GRASS_HEIGHT = MAX_HEIGHT * 0.1;
        let WATER_HEIGHT = 0;

        if(height > STONE_HEIGHT) {
            geo = mergeBufferGeometries([geo, stoneGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.riverlandStone
            });
        } else if (height > GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, grassGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.riverlandGrass
            });
        } else if (height > WATER_HEIGHT) {
            geo = mergeBufferGeometries([geo, waterGeo]);
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
        }
        // geo = new THREE.CylinderGeometry(17, 17, MAX_HEIGHT * 0.2, 50);
    } else if (tileType == "Farmland") {
        let DIRT_HEIGHT = 0;
        let GRASS_HEIGHT = MAX_HEIGHT * 0.2;
        let HAY_HEIGHT = MAX_HEIGHT * 0.3;

        if(height > DIRT_HEIGHT && height < GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, dirtGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.dirt
            });
        } else if (height > GRASS_HEIGHT && height < HAY_HEIGHT) {
            geo = mergeBufferGeometries([geo, grassGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.farmGrass
            });
        } else if (height > HAY_HEIGHT) {
            geo = mergeBufferGeometries([geo, hayGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.hay
            });
        }
    }
    // add other tile types
    
    // if(height > STONE_HEIGHT) {
    //     geo = mergeBufferGeometries([geo, stoneGeo]);
    //     material = new THREE.MeshPhysicalMaterial({ 
    //         flatShading: true,
    //         map: currTextures.stone
    //     });
    // } else if (height > GRASS_HEIGHT) {
    //     geo = mergeBufferGeometries([geo, grassGeo]);
    //     material = new THREE.MeshPhysicalMaterial({ 
    //         flatShading: true,
    //         map: currTextures.grass
    //     });
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

export function getPrisms(center, radius, level, yFlip, textures, tileType) {
    if (textures != undefined) {
        currTextures = textures;
    }

    if (tileType != undefined) {
        currTileType = tileType;
    }

    if (level === 0) {
        // add simplex noise
        let height = getPerlinNoise(center, currTileType);
        
        center[1] += height / 2;

        // let geo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, height, 3);
        // let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });


        // if(height > STONE_HEIGHT) {
        //     geo = mergeBufferGeometries([geo, stoneGeo]);
        //     material = new THREE.MeshPhysicalMaterial({ 
        //         flatShading: true,
        //         map: currTextures.stone
        //     });
        // } else if (height > GRASS_HEIGHT) {
        //     geo = mergeBufferGeometries([geo, grassGeo]);
        //     material = new THREE.MeshPhysicalMaterial({ 
        //         flatShading: true,
        //         map: currTextures.grass
        //     });
        // }
          
        
        // const mesh = new THREE.Mesh(geo, material);
        const mesh = getMesh(currTileType, radius, height);
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
