import { Vector3, Box3 } from 'three';

const CHARGES_MAX = 12;
const boundingBox = new Box3(
    new Vector3(5, 3, 5),
    new Vector3(0, 0, 0),
);


export type Charge = {
    center: Vector3,
    velocity: Vector3,
};

export function initCharges() {
    const charges: Charge[] = [];
    // initialize spheres positions
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
        charges.push({ center, velocity });
    }
    return charges;
}

export function moveChargesLinear(charges: Charge[]) {
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
