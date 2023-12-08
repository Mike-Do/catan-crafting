import * as THREE from "three";
import React, { useRef, useState } from "react";
import Tile from "./Tile.jsx";
import { Canvas, useFrame } from "@react-three/fiber";

export default function Catan() {

    const group = useRef();
    useFrame(() => {
        group.current.rotation.x = group.current.rotation.y += 0.005;
    });

    const level = 2;

    return (
        <group ref={group} scale={[1, 1, 1]}>
            <Tile center={[0, 0, 0]} level={level} />
            <Tile center={[0, 0, Math.sqrt(3)]} level={level} />
            <Tile center={[0, 0, -Math.sqrt(3)]} level={level} />
            <Tile center={[1.5, 0, Math.sqrt(3)/2]} level={level} />
            <Tile center={[-1.5, 0, Math.sqrt(3)/2]} level={level} />
            <Tile center={[1.5, 0, -Math.sqrt(3)/2]} level={level} />
            <Tile center={[-1.5, 0, -Math.sqrt(3)/2]} level={level} />
        </group>
    );
}