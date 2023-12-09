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
        let STONE_HEIGHT = MAX_HEIGHT * 0.9;
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
