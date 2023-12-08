import React, { useRef , useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import Catan  from "./components/Catan";
import * as THREE from "three";

export default function App() {
  return (
    <>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} />
        <group>
          <Catan />
        </group>
      </Canvas>
    </>
  );
}
