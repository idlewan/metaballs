import React from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { Vector3, Mesh } from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, shaderMaterial, Grid } from '@react-three/drei';

import { Spheres, ShaderObject } from './metaballs';

// check webgl support. If not supported, show error message, otherwise init
try {
    let canvas = document.createElement('canvas')
    let webgl_support = !! window.WebGLRenderingContext && (
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'))
    if (!webgl_support) {
        throw "NO_WEBGL";
    }
    init();
} catch (e) {
    if (e == "NO_WEBGL") {
        document.getElementById("no-webgl")!.classList.remove("hidden");
    } else {
        document.getElementById("generic-error")!.classList.remove("hidden");
    }
    throw e;
}

function init() {
    createRoot(document.getElementById('root')!).render(
        <Canvas camera={{ position: [-6, 0, 5] }} dpr={1} >

            {/* these only light the debug spheres when they are visible */}
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <directionalLight position={[0, 0, 5]} color="red" />

            <ShaderObject />
            <Spheres />

            {/* // useful objects to debug if unsure how camera/things are moving/updating
                // notably autoRotate

            <axesHelper />

            <Grid renderOrder={-1} infiniteGrid
                position={[0, -1.85, 0]}
                cellSize={0.5} sectionSize={2.5}
                sectionColor={0xffffff}
                cellThickness={0.5} sectionThickness={1.5}
                fadeDistance={30} />
            */}

            <OrbitControls makeDefault
                autoRotate autoRotateSpeed={0.75} enableZoom={true}
            />
        </Canvas>
    );
}
