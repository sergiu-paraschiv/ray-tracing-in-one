struct CameraBuffer {
  values: array<f32>;
};

struct Camera {
  lookFrom: v3;
  lookAt: v3;
  vup: v3;
  vfov: f32;
  aspectRatio: f32;
  aperture: f32;
  focusDistance: f32;
};

fn camera_get_ray(camera: Camera, pixel: PixelCoords) -> Ray {
  let theta = radians(camera.vfov);
  let h = tan(theta / 2.0);
  let viewportHeight = 2.0 * h;
  let viewportWidth = camera.aspectRatio * viewportHeight;

  let w = normalize(camera.lookFrom - camera.lookAt);
  let u = normalize(cross(camera.vup, w));
  let v = cross(w, u);

  let origin = camera.lookFrom;
  let horizontal = camera.focusDistance * u * viewportWidth;
  let vertical = camera.focusDistance * v * viewportHeight;
  let lowerLeftCorner = origin - horizontal / 2.0 - vertical / 2.0 - camera.focusDistance * w;
  let lensRadius = camera.aperture / 2.0;

  let rd = lensRadius * random_in_unit_disk(pixel);
  let offset = u * rd[0] + v * rd[1];

  let s = f32(pixel.x);
  let t = f32(pixel.y);

  return Ray(
    origin + offset,
    lowerLeftCorner + horizontal * s / (uniforms.screenWidth - 1.0) + vertical * t / (uniforms.screenHeight - 1.0) - origin - offset
  );
}

fn camera_from_input() -> Camera {
  let aspectRatio = uniforms.screenWidth / uniforms.screenHeight;

  return Camera(
    v3(camera.values[0u], camera.values[1u], camera.values[2u]),
    v3(camera.values[3u], camera.values[4u], camera.values[5u]),
    v3(0.0, 1.0, 0.0),
    camera.values[6u],
    aspectRatio,
    camera.values[7u],
    camera.values[8u]
  );
}