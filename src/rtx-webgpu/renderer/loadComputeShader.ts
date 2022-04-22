// @ts-ignore
import constants from '../shaders/compute/0.constants.wgsl';
// @ts-ignore
import math from '../shaders/compute/1.math.wgsl';
// @ts-ignore
import io from '../shaders/compute/2.io.wgsl';
// @ts-ignore
import rand from '../shaders/compute/3.rand.wgsl';
// @ts-ignore
import ray from '../shaders/compute/4.ray.wgsl';
// @ts-ignore
import camera from '../shaders/compute/5.camera.wgsl';
// @ts-ignore
import material from '../shaders/compute/6.material.wgsl';
// @ts-ignore
import geometry from '../shaders/compute/7.geometry.wgsl';
// @ts-ignore
import world from '../shaders/compute/8.world.wgsl';
// @ts-ignore
import rayColor from '../shaders/compute/20.rayColor.wgsl';
// @ts-ignore
import main from '../shaders/compute/50.main.wgsl';


export default function loadComputeShader() {
    return [
        constants,
        math,
        io,
        rand,
        ray,
        camera,
        material,
        geometry,
        world,
        rayColor,
        main
    ].join('\n');
}