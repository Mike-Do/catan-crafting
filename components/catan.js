import * as THREE from 'three';
import { getTile } from './tile';

export function getCatan(radius, level, textures, loadedModels, appState) {
    const catanGroup = new THREE.Group();
    const tiles = [
        { x: 0, y: 0, z: 0, type: "Grassland" },
        { x: 0, y: 0, z: Math.sqrt(3), type: "Farmland"},
        { x: 0, y: 0, z: -Math.sqrt(3), type: "Farmland" },
        { x: 1.5, y: 0, z: Math.sqrt(3)/2, type: "Mountain" },
        { x: -1.5, y: 0, z: Math.sqrt(3)/2, type: "Clayland" },
        { x: 1.5, y: 0, z: -Math.sqrt(3)/2, type: "Riverland"},
        { x: -1.5, y: 0, z: -Math.sqrt(3)/2, type: "Riverland" },
    ];

    tiles.forEach(tile => {
        const tileMesh = getTile([tile.x * radius * 1.2, tile.y * radius, tile.z * radius * 1.2], radius, level, textures, tile.type, catanGroup, loadedModels, appState);
        // tileMesh.position.set(tile.x, tile.y, tile.z);
        console.log([tile.x * radius * 1.2, tile.y * radius, tile.z * radius * 1.2])
        catanGroup.add(...tileMesh);

        // create larger hexes to go underneath the tiles
        let hexGeo = new THREE.CylinderGeometry(radius * 1.3, radius * 1.3, 1, 6);
        let hexMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        let hex = new THREE.Mesh(hexGeo, hexMat);

        // position the hexes so they are centered beneath the tiles and have the same orientation
        hex.position.set(tile.x * radius * 1.2, tile.y * radius - 0.5, tile.z * radius * 1.2);
        hex.rotation.y = Math.PI / 6;

        // set color to edcf8d
        hexMat.color.setHex(0xcca471);
        catanGroup.add(hex);
    });

    // create rectangular prism for the base of the catan board in blue
    return catanGroup;
}

