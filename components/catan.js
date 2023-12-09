import * as THREE from 'three';
import { getTile } from './tile';

export function getCatan(radius, level, textures) {
    const catanGroup = new THREE.Group();
    const tiles = [
        { x: 0, y: 0, z: 0, type: "Grassland" },
        { x: 0, y: 0, z: Math.sqrt(3), type: "Mountain"},
        { x: 0, y: 0, z: -Math.sqrt(3), type: "Grassland" },
        { x: 1.5, y: 0, z: Math.sqrt(3)/2, type: "Mountain" },
        { x: -1.5, y: 0, z: Math.sqrt(3)/2, type: "Grassland" },
        { x: 1.5, y: 0, z: -Math.sqrt(3)/2, type: "Mountain"},
        { x: -1.5, y: 0, z: -Math.sqrt(3)/2, type: "Grassland" },
    ];

    tiles.forEach(tile => {
        const tileMesh = getTile([tile.x * radius * 1.2, tile.y * radius, tile.z * radius * 1.2], radius, level, textures, tile.type);
        // tileMesh.position.set(tile.x, tile.y, tile.z);
        catanGroup.add(...tileMesh);
    });

    return catanGroup;
}