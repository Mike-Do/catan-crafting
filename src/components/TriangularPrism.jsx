import * as THREE from "three";
import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function getTriangularPrismMeshs(r, c, level, yFlip) {
    if (level > 0) {
        const children = [];
        const members = [
            { cOff: [0, 0, 0], yFlip: !yFlip },
            { cOff: [0, 0, r / 2], yFlip: yFlip },
            { cOff: [-Math.sqrt(3) / 4 * r, 0, -r / 4], yFlip: yFlip },
            { cOff: [Math.sqrt(3) / 4 * r, 0, -r / 4], yFlip: yFlip }
        ]
        for (let i = 0; i < members.length; i++) {
            const sign = members[i].yFlip ? -1 : 1;
            let center = [c[0] + sign * members[i].cOff[0], c[1] + sign * members[i].cOff[1], c[2] + sign * members[i].cOff[2]];
            children.push(getTriangularPrismMeshs(r / 2, center, level - 1, members[i].yFlip));
        }
        return (
            <group>
                {children}
            </group>
        );
    }

    return (
        <mesh position={c} rotation-y={yFlip ? Math.PI : 0}>
            <primitive object={new THREE.CylinderGeometry(r * 0.95, r * 0.95, 0.5, 3)} attach={"geometry"} />
            <meshStandardMaterial color={0x00ff00} />
        </mesh>
    );
}

export default function TriangularPrism(props) {

    return (
        <>
            {getTriangularPrismMeshs(props.radius, props.center, props.level, props.yFlip)}
        </>
    );
}