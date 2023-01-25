import {
    Mesh, Vector2, Vector3,
    ShaderMaterial, ShaderMaterialParameters,
} from 'three';
import React, { useRef,  useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

import { initCharges, moveChargesLinear } from './charges';
import vertexShader from './metaballs.vert';
import fragmentShader from './metaballs.frag';
import { Spheres } from './spheres';

// single quad object covering the screen,
// used to render the background + metaballs
export function MetaballsQuad() {
    const mesh = useRef<Mesh>(null);
    const matRef = useRef<ShaderMaterial>(null);
    let iResolution = useMemo(() => new Vector2(1920, 1080), []);
    let cameraPosition = useMemo(() => new Vector3(), []);

    let { size, camera } = useThree();
    iResolution.set(size.width, size.height);
    cameraPosition.copy(camera.position);

    const charges = useMemo(() => initCharges(), []);

    const uniformRef = useRef<ShaderMaterialParameters>(
        { uniforms: {
            time: { value: 0.5},
            iResolution: { value: iResolution },
            charges: { value: charges },
            cameraPosition: { value: cameraPosition },
        }}
    );

    useFrame((state, delta) => {
        const uniforms = uniformRef.current!.uniforms!;
        uniforms.time.value += delta;
        uniforms.cameraPosition.value.copy(state.camera.position);
        moveChargesLinear(charges);
    });

    return <>
        <Spheres charges={charges}/>
        <mesh ref={mesh}>
            <planeGeometry  args={[2,2]}/>
            <shaderMaterial
                ref={matRef}
                depthTest={false}
                depthWrite={false}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniformRef.current.uniforms}
                defines={{CHARGES_MAX: charges.length}}
            />
        </mesh>
    </>;
}
