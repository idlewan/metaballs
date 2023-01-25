import { Mesh } from 'three';
import { useFrame, ThreeElements } from '@react-three/fiber';
import React, { useRef } from 'react';

import { Charge } from './charges';

const Sphere = React.forwardRef((
    props: ThreeElements['mesh'] & { radius: number },
    ref: React.Ref<Mesh>) => {

    return (<mesh {... props} ref={ref}>
        <sphereGeometry args={[props.radius, 32, 16]} />
        <meshStandardMaterial color='coral' />
    </mesh>);
});

// debug spheres, used to visualize the position of the charges
// that define the attraction field for the metaballs
export function Spheres(props: { charges: Charge[] }) {
    const meshes: React.RefObject<Mesh>[] = [];

    for (let charge of props.charges) {
        meshes.push(useRef<Mesh>(null));
    }

    useFrame((state, delta) => {
        // update spheres position on each frame
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].current!.position.copy(props.charges[i].center);
        }
    });

     return <>{props.charges.map((charge, i) =>
        <Sphere key={i} ref={meshes[i]}
            visible={false}
            radius={0.2}
            position={charge.center}
        />
    )}</>;
}


