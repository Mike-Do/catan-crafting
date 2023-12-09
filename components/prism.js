import * as THREE from 'three';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@3.0.0';
import { mergeBufferGeometries } from 'https://cdn.skypack.dev/three-stdlib@2.8.5/utils/BufferGeometryUtils';

const simplex = new SimplexNoise();
const MAX_HEIGHT = 2; // adjust this for different types of terrains

// define height for textures
const STONE_HEIGHT = MAX_HEIGHT * 0.8;
const GRASS_HEIGHT = MAX_HEIGHT * 0.5;

let stoneGeo = new THREE.BoxGeometry(0,0,0);
let grassGeo = new THREE.BoxGeometry(0,0,0);

let currTextures;

function stone(height) {
    const px = Math.random() * 0.4;
    const pz = Math.random() * 0.4;

    const geo = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 7, 7);
    // geo.translate(position.x + px, height + 0.5, position.y + pz);

    return geo;
}

function tree (height) {
    const treeHeight = Math.random() * 0.7 + 0.25;
    
    // pyramid for tree top
    const geo = new THREE.CylinderGeometry(0, 1.5, treeHeight, 3);
    // geo.translate(position.x, height + treeHeight * 0 + 1, position.y);

    const geo2 = new THREE.CylinderGeometry(0, 1.15, treeHeight, 3);
    // geo2.translate(position.x, height + treeHeight * 0.6 + 1, position.y);

    const geo3 = new THREE.CylinderGeometry(0, 0.8, treeHeight, 3);
    // geo3.translate(position.x, height + treeHeight * 1.25 + 1, position.y);

    // use mergeBufferGeometries to combine geometries into one
    return [geo, geo2, geo3]
}

export function getPrisms(center, radius, level, yFlip, textures) {
    if (textures != undefined) {
        currTextures = textures;
    }

    if (level === 0) {
        // add simplex noise
        let noise = (simplex.noise2D(center[0] * 0.3, center[2] * 0.3) + 1) * 0.5;
        noise = Math.pow(noise, 1.5);
        const height = noise * MAX_HEIGHT;
        center[1] += height / 2;
        let geo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, height, 3);
        let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });


        if(height > STONE_HEIGHT) {
            geo = mergeBufferGeometries([geo, stoneGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.stone
            });
        } else if(height > GRASS_HEIGHT) {
            geo = mergeBufferGeometries([geo, grassGeo]);
            material = new THREE.MeshPhysicalMaterial({ 
                flatShading: true,
                map: currTextures.grass
            });
        }
          
        
        const mesh = new THREE.Mesh(geo, material);
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
