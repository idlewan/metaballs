#pragma glslify: map = require('glsl-map/index.glsl')

uniform float time;
uniform vec2 iResolution;

uniform mat4 inverseMatrix;

#define MAX_MARGHING_STEPS 96
#define MINIMUM_HIT_DISTANCE 0.001
#define MAXIMUM_TRACE_DISTANCE 100.0

struct Charge {
    vec3 center;
};
uniform Charge charges[CHARGES_MAX];


void background() {
    // bllue-grey-ish background gradient
    // use same look regardless of ratio, by picking a ratio where it looks good
    const float aspect_ratio = 600. / 800.;
    vec2 res = iResolution;
    res.y = res.x * aspect_ratio;
    vec2 fragCoord = map(gl_FragCoord.xy,
        vec2(0.,0.), iResolution, vec2(0.,0.), res
    );

    vec2 uv = fragCoord.xy / (res.xx*0.5) -
              vec2(1.0, res.y / res.x);
    vec3 raybg = - normalize( vec3(uv.x, uv.y - 0.3, 1.0) );
    vec3 backcol = vec3(0.25, 0.35, 0.4) + smoothstep(0.0, 0.4, raybg.y - 0.1) * 0.4;
    gl_FragColor = vec4(sqrt(backcol) - dot(uv, uv) * 0.4, 1.0);
}


// polynomial smooth min 2 (k=0.1)
float smin( float a, float b, float k )
{
    float h = max( k - abs(a - b), 0.0 ) / k;
    return min( a, b ) - h * h * k * (1.0 / 4.0);
}

float distance_from_sphere(vec3 ray_point, vec3 sphere_center, float radius) {
    return length(ray_point - sphere_center) - radius;
}

// get shortest distance to the scene
float distance_from_world_objects(vec3 current_position) {
    float distance_to_closest = 1000.;

    float displacement = sin(5.0 * current_position.x/1.6) * sin(5.0 * current_position.y/4.) * sin(5.0 * current_position.z/3.) * 0.25;
    displacement *= 0.5;

    for (int charge_i = 0; charge_i < CHARGES_MAX; charge_i++) {
        vec3 charge_center = charges[charge_i].center;
        //distance_to_closest = min(distance_to_closest, distance_from_sphere(current_position, charge_center, 1.));
        distance_to_closest = smin(distance_to_closest, displacement + distance_from_sphere(current_position, charge_center, 1.6), 0.5);

        // if the distance is small enough
        // we found an intersection / are close enough to the surface
        // ---
        // -- can't exit early for smooth normals anymore, need all contributions!
        //if (distance_to_closest < MINIMUM_HIT_DISTANCE) {
        //    return distance_to_closest;
        //}
    }
    return distance_to_closest;
}

vec3 calculate_normal(vec3 point) {
    const vec3 small_step = vec3(0.001, 0.0, 0.0);

    float gradient_x = distance_from_world_objects(point + small_step.xyy) -
                       distance_from_world_objects(point - small_step.xyy);
    float gradient_y = distance_from_world_objects(point + small_step.yxy) -
                       distance_from_world_objects(point - small_step.yxy);
    float gradient_z = distance_from_world_objects(point + small_step.yyx) -
                       distance_from_world_objects(point - small_step.yyx);

    vec3 normal = vec3(gradient_x, gradient_y, gradient_z);
    return normalize(normal);
}

void raymarch(vec3 ray_origin, vec3 ray_direction) {
    vec3 current_position;

    float distance_traveled = 0.;
    int i = 0;
    for (; i < MAX_MARGHING_STEPS; i++) {
        current_position = ray_origin + ray_direction * distance_traveled;

        float distance_to_closest = distance_from_world_objects(current_position);

        // increment along the ray by the smallest distance to the scene
        distance_traveled += distance_to_closest;

        if (distance_to_closest < MINIMUM_HIT_DISTANCE) {
            vec3 normal = calculate_normal(current_position);

            // coloring with normal vector:
            // convert normal-range (-1..1) to colorable range (0..1)
            //gl_FragColor = vec4(normal * 0.5 + 0.5, 1.);

            // coloring with diffuse lighting
            vec3 light_position = vec3(2.0, -5.0, 3.0);
            vec3 direction_to_light = normalize(current_position - light_position);
            float diffusse_intensity = max(0.0, dot(normal, direction_to_light));
            //gl_FragColor = vec4(1.0 * diffusse_intensity, .0, .0, 1.);


            // coloring with cost of marching (halo-like shading)
            float cost = float(i) / float(MAX_MARGHING_STEPS);
            //gl_FragColor = vec4(cost);
            //gl_FragColor = vec4(cost) + vec4(0.3, 0., 0., 0.);

            // combine cost-halo + diffuse lighting
            gl_FragColor = vec4(.4 * diffusse_intensity, .0, .0, 1.) +
                vec4(cost) + vec4(0.15, 0., 0., 0.);

            return;
        }

        if (distance_traveled > MAXIMUM_TRACE_DISTANCE) break;
    }

    if (distance_traveled > MAXIMUM_TRACE_DISTANCE || i == MAX_MARGHING_STEPS) {
        background();
    } else {
        gl_FragColor = vec4(1.,1.,1., 1.);
    }
}

void main() {
    // get the fragment's coordinates
    vec2 UV = ( gl_FragCoord.xy / iResolution.xy ) * 2. - 1.;

    vec3 ray_direction = normalize(
        inverseMatrix*vec4(UV, 1., 1.)
    ).xyz;

    raymarch(cameraPosition, ray_direction);
}
