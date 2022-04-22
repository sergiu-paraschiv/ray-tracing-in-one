@group(0)
@binding(0)
var<storage, write> outputColorBuffer: ColorBuffer;

@group(0)
@binding(1)
var<uniform> uniforms: Uniforms;

@group(0)
@binding(2)
var<storage> world: WorldBuffer;

@group(0)
@binding(3)
var<storage> camera: CameraBuffer;

@stage(compute)
@workgroup_size(256)
fn compute_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  if (global_id.x >= arrayLength(&outputColorBuffer.values)) {
    return;
  }

  let pixel = pixel_coords_f(global_id);
  let pixelU = pixel_coords_u(global_id);

  init_seed(pixelU.x * pixelU.y * uniforms.frameIndex * 100000u);

  let samplesPerPixel = 20u;
  let maxDepth = 10u;

  let camera = camera_from_input();

  var color = Color(0.0, 0.0, 0.0);
  var sampleIndex: u32;
  for (sampleIndex = 0u; sampleIndex < samplesPerPixel; sampleIndex = sampleIndex + 1u) {
    let samplePixel = sample_pixel(pixel);
    let ray = camera_get_ray(camera, samplePixel);
    color = color + ray_color(ray, pixel, maxDepth);
  }

  color_pixel(pixelU, color, samplesPerPixel);
}
