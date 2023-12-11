import * as THREE from 'three';
import { getPrisms } from './prism.js';

export function getTile(center, radius, level, textures, tileType, scene) {
    const prismMeshes = [];
    
    const prismData = [
        { cOff: [0, 0, 1 / Math.sqrt(3)], yFlip: true },
        { cOff: [0, 0, -1 / Math.sqrt(3)], yFlip: false },
        { cOff: [1 / 2, 0, 1 / (2 * Math.sqrt(3))], yFlip: false },
        { cOff: [1 / 2, 0, -1 / (2 * Math.sqrt(3))], yFlip: true },
        { cOff: [-1 / 2, 0, 1 / (2 * Math.sqrt(3))], yFlip: false },
        { cOff: [-1 / 2, 0, -1 / (2 * Math.sqrt(3))], yFlip: true }
    ];

    for (let i = 0; i < prismData.length; i++) {
        const prismCenter = [...center];
        prismCenter[0] += radius * prismData[i].cOff[0];
        prismCenter[1] += radius * prismData[i].cOff[1];
        prismCenter[2] += radius * prismData[i].cOff[2];

        prismMeshes.push(...getPrisms(prismCenter, radius / Math.sqrt(3), level, prismData[i].yFlip, textures, tileType, scene));
    }

    return prismMeshes;
}
