import * as THREE from 'three';
import { Vector3, Mesh } from 'three';
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useThree, useFrame, ThreeElements } from '@react-three/fiber';

import vertexShader from './metaballs.vert';
import fragmentShader from './metaballs.frag';

const boundingBox = new THREE.Box3(
    new Vector3(5, 3, 5),
    new Vector3(0, 0, 0),
);

type Charge = {
    center: Vector3,
    velocity: Vector3,
    acceleration: Vector3,
};
const CHARGES_MAX = 12;
const charges: Charge[] = [];

const Sphere = React.forwardRef(
    (props: ThreeElements['mesh'] & { radius: number }, ref: React.Ref<Mesh>) => {

    return (<mesh {... props} ref={ref}>
        <sphereGeometry args={[props.radius, 32, 16]} />
        <meshStandardMaterial color='coral' />
    </mesh>);
});


function moveChargesLinear() {
    for (const charge of charges) {
        charge.center.add(charge.velocity);

        if (charge.center.x < -boundingBox.min.x/2) {
            charge.center.x = -boundingBox.min.x/2;
            charge.velocity.x *= -0.99;
        } else if (charge.center.x > boundingBox.min.x/2) {
            charge.center.x = boundingBox.min.x/2;
            charge.velocity.x *= -0.99;
        }

        if (charge.center.y < -boundingBox.min.y/2) {
            charge.center.y = -boundingBox.min.y/2;
            charge.velocity.y *= -0.99;
        } else if (charge.center.y > boundingBox.min.y/2) {
            charge.center.y = boundingBox.min.y/2;
            charge.velocity.y *= -0.99;
        }

        if (charge.center.z < -boundingBox.min.z/2) {
            charge.center.z = -boundingBox.min.z/2;
            charge.velocity.z *= -0.99;
        } else if (charge.center.z > boundingBox.min.z/2) {
            charge.center.z = boundingBox.min.z/2;
            charge.velocity.z *= -0.99;
        }
    }
}

function moveChargesShoot() {
    const vec = new Vector3();
    for (const charge of charges) {
        charge.center.add(charge.velocity);
        vec.copy(charge.center);
        vec.negate();
        vec.multiplyScalar(0.001);
        charge.acceleration.add(vec);

        vec.copy(charge.acceleration);
        vec.multiplyScalar(0.0001);
        charge.velocity.add(vec);

        /*
        if (charge.center.x < -boundingBox.min.x/2) {
            charge.center.x = -boundingBox.min.x/2;
            charge.acceleration.x *= -0.99;
        } else if (charge.center.x > boundingBox.min.x/2) {
            charge.center.x = boundingBox.min.x/2;
            charge.acceleration.x *= -0.99;
        }

        if (charge.center.y < -boundingBox.min.y/2) {
            charge.center.y = -boundingBox.min.y/2;
            charge.acceleration.y *= -0.99;
        } else if (charge.center.y > boundingBox.min.y/2) {
            charge.center.y = boundingBox.min.y/2;
            charge.acceleration.y *= -0.99;
        }

        if (charge.center.z < -boundingBox.min.z/2) {
            charge.center.z = -boundingBox.min.z/2;
            charge.acceleration.z *= -0.99;
        } else if (charge.center.z > boundingBox.min.z/2) {
            charge.center.z = boundingBox.min.z/2;
            charge.acceleration.z *= -0.99;
        }
         */
    }
}


function Spheres() {
    const meshes: React.RefObject<Mesh>[] = [];
    for (let i = 0; i < CHARGES_MAX; i++) {
        const randX = Math.random() * boundingBox.min.x;
        const randY = Math.random() * boundingBox.min.y;
        const randZ = Math.random() * boundingBox.min.z;
        const center = new Vector3(
            randX - boundingBox.min.x / 2,
            randY - boundingBox.min.y / 2,
            randZ - boundingBox.min.z / 2,
        );
        const velocity = new Vector3(
            (0.5 - Math.random()) * 0.03,
            (0.5 - Math.random()) * 0.03,
            (0.5 - Math.random()) * 0.03,
        );
        const acceleration = new Vector3().copy(velocity).multiplyScalar(0.1);
        let charge: Charge = {
            center: center,
            velocity: velocity,
            acceleration: acceleration,
        };
        charges.push(charge);
        meshes.push(useRef<Mesh>(null));
    }

    useFrame((state, delta) => {
        moveChargesLinear();
        //moveChargesShoot();
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].current!.position.copy(charges[i].center);
        }
    });

     return <>{charges.map((charge, i) =>
        <Sphere key={i} ref={meshes[i]}
            visible={false}
            radius={0.2}
            position={charge.center}
        />
    )}</>;
}

function ShaderObject() {
    const mesh = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.ShaderMaterial>(null);
    let iResolution = useMemo(() => new THREE.Vector2(1920, 1080), []);
    let cameraPosition = useMemo(() => new THREE.Vector3(), []);

    let { size, camera } = useThree();
    iResolution.set(size.width, size.height);
    cameraPosition.copy(camera.position);

    const uniformRef = useRef<THREE.ShaderMaterialParameters>(
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
    });

    return <mesh ref={mesh}>
        <planeGeometry  args={[2,2]}/>
        <shaderMaterial
            ref={matRef}
            depthTest={false}
            depthWrite={false}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniformRef.current.uniforms}
        />
    </mesh>;
}

export { Sphere, Spheres, ShaderObject };
