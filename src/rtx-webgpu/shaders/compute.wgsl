let infinity = 1e20;
let lambertian = 1u;
let metal = 2u;
let dielectric = 3u;

let MATERIAL_DATA_SIZE = 6u;
let SPHERE_DATA_SIZE = 5u;

struct ColorBuffer {
  values: array<f32>;
};

struct Uniforms {
  screenWidth: f32;
  screenHeight: f32;
};

struct WorldBuffer {
  values: array<f32>;
};

struct CameraBuffer {
  values: array<f32>;
};

struct PixelCoords {
  x: f32;
  y: f32;
};

type p3 = vec3<f32>;
type v3 = vec3<f32>;
type Color = vec3<f32>;

fn v3_len_sqr(p: v3) -> f32 {
   return p[0] * p[0] + p[1] * p[1] + p[2] * p[2];
}

fn rand(pixel: vec2<f32>) -> f32 {
  //return fract(sin(dot(pixel, vec2<f32>(127.1, 311.7)))*43758.5453123);
  // return fract(sin(dot(pixel, vec2<f32>(12.9898, 78.233))) * 43758.5453);

  var p3 = fract(pixel * .1031);
  p3 = p3 + dot(p3, p3 + 33.33);
  return fract((p3.x + p3.y) * p3.x);
}

fn rand_between(pixel: vec2<f32>, min: f32, max: f32) -> f32 {
  let delta = max - min;
  return min + rand(pixel) * delta;
}

fn random_v3_unit(pixel: vec2<f32>, sampleIndex: u32) -> v3 {
  return normalize(v3(
    rand_between(pixel * 1.0, -1.0, 1.0),
    rand_between(pixel * 2.0, -1.0, 1.0),
    rand_between(pixel * 3.0, -1.0, 1.0)
  ));
}

fn random_in_hemisphere(pixel: vec2<f32>, sampleIndex: u32, normal: v3) -> v3 {
  var r = random_v3_unit(pixel, sampleIndex);

  if (dot(r, normal) > 0.0) {
    return r;
  }

  return -r;
}

fn random_in_disk(pixel: vec2<f32>, sampleIndex: u32) -> v3 {
  var r = random_v3_unit(pixel, sampleIndex);
  var loopLimit = 50u;
  loop {
    if (loopLimit <= 0u) {
      break;
    }
    if (v3_len_sqr(r) < 1.0) {
      break;
    }

    loopLimit = loopLimit - 1u;
  }

  return r;
}

struct Ray {
  origin: p3;
  direction: v3;
};

fn ray_at(ray: Ray, t: f32) -> v3 {
    return ray.origin + ray.direction * t;
}

struct Camera {
  lookFrom: p3;
  lookAt: p3;
  vup: v3;
  vfov: f32;
  aspectRatio: f32;
  aperture: f32;
  focusDistance: f32;
};

fn camera_get_ray(camera: Camera, pixel: PixelCoords, sampleIndex: u32) -> Ray {
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

  let rd = lensRadius * random_in_disk(vec2<f32>(pixel.x, pixel.y), sampleIndex + 10u);
  let offset = u * rd[0] + v * rd[1];

  let s = f32(pixel.x);
  let t = f32(pixel.y);

  return Ray(
    origin + offset,
    lowerLeftCorner + horizontal * s / (uniforms.screenWidth - 1.0) + vertical * t / (uniforms.screenHeight - 1.0) - origin - offset
  );
}

struct Material {
  scatterType: u32;
  color: Color;
  fuzz: f32;
  indexOfRefraction: f32;
};

fn material_reflectance(cosine: f32, refractionRatio: f32) -> f32 {
  var r0 = (1.0 - refractionRatio) / (1.0 + refractionRatio);
  r0 = r0 * r0;
  return r0 + (1.0 - r0) * pow(1.0 - cosine, 5.0);
}

struct HitRecord {
  hit: bool;
  p: p3;
  normal: v3;
  t: f32;
  frontFace: bool;
  material: Material;
};

fn init_hit_record() -> HitRecord {
  return HitRecord(
    false,
    p3(0.0, 0.0, 0.0),
    v3(0.0, 0.0, 0.0),
    0.0,
    false,
    Material(lambertian, Color(0.0, 0.0, 0.0), 0.0, 0.0)
  );
}

struct Sphere {
  center: p3;
  radius: f32;
  material: Material;
};

fn pixel_coords(pixelId: vec3<u32>) -> PixelCoords {
    let y = f32(pixelId.x) / uniforms.screenWidth;
    let x = f32(pixelId.x) % uniforms.screenWidth;

    return PixelCoords(x, y);
}

fn sample_pixel(pixel: PixelCoords, sampleIndex: u32) -> PixelCoords {
  return PixelCoords(
    (pixel.x + rand(vec2<f32>(pixel.x, pixel.y) * f32(sampleIndex))),
    (pixel.y + rand(vec2<f32>(pixel.x, pixel.y) * f32(sampleIndex)))
  );
}

fn color_pixel(pixel: PixelCoords, color: Color, samplesPerPixel: u32) {
  let pixelID = u32(u32(pixel.x) + (u32(pixel.y) * u32(uniforms.screenWidth))) * 3u;

  var r = color[0];
  var g = color[1];
  var b = color[2];

  let scale = 1.0 / f32(samplesPerPixel);
  r = sqrt(r * scale);
  g = sqrt(g * scale);
  b = sqrt(b * scale);

  outputColorBuffer.values[pixelID + 0u] = clamp(r, 0.0, 0.999);
  outputColorBuffer.values[pixelID + 1u] = clamp(g, 0.0, 0.999);
  outputColorBuffer.values[pixelID + 2u] = clamp(b, 0.0, 0.999);
}

fn hit_sphere(sphere: Sphere, ray: Ray, tMin: f32, tMax: f32) -> HitRecord {
  var hit = init_hit_record();

  let oc = ray.origin - sphere.center;
  let a = v3_len_sqr(ray.direction);
  let halfB = dot(oc, ray.direction);
  let c = v3_len_sqr(oc) - sphere.radius * sphere.radius;
  let discriminant = halfB * halfB - a * c;

  if (discriminant < 0.0) {
    return hit;
  }

  let sqrtd = sqrt(discriminant);

  var root = (-halfB - sqrtd) / a;

  if (root < tMin || tMax < root) {
    root = (-halfB + sqrtd) / a;

    if (root < tMin || tMax < root) {
      return hit;
    }
  }

  hit.hit = true;
  hit.t = root;
  hit.p = ray_at(ray, hit.t);

  let outwardNormal = (hit.p - sphere.center) / sphere.radius;
  hit.frontFace = dot(ray.direction, outwardNormal) < 0.0;
  if (hit.frontFace) {
    hit.normal = outwardNormal;
  }
  else {
    hit.normal = -outwardNormal;
  }

  hit.material = sphere.material;

  return hit;
}

fn hit_world(ray: Ray, tMin: f32, tMax: f32) -> HitRecord {
  let numMaterials = u32(world.values[0u]);
  let numSpheres = u32(world.values[1u]);
  let materialsDataStart = 2u;
  let spheresDataStart = materialsDataStart + numMaterials * MATERIAL_DATA_SIZE;

  var hit = init_hit_record();
  var closestSoFar = tMax;
  var sphereIndex: u32;
  for (sphereIndex = 0u; sphereIndex < numSpheres; sphereIndex = sphereIndex + 1u) {
    let sphereDataIndex = spheresDataStart + sphereIndex * SPHERE_DATA_SIZE;
    let materialDataIndex = u32(world.values[sphereDataIndex + 4u]);

    let material = Material(
      u32(world.values[materialDataIndex + 0u]),
      Color(
        world.values[materialDataIndex + 1u],
        world.values[materialDataIndex + 2u],
        world.values[materialDataIndex + 3u]
      ),
      world.values[materialDataIndex + 4u],
      world.values[materialDataIndex + 5u]
    );

    let sphere = Sphere(
      p3(
        world.values[sphereDataIndex + 0u],
        world.values[sphereDataIndex + 1u],
        world.values[sphereDataIndex + 2u]
      ),
      world.values[sphereDataIndex + 3u],
      material
    );

    let sphereHit = hit_sphere(sphere, ray, tMin, closestSoFar);
    if (sphereHit.hit) {
       closestSoFar = sphereHit.t;
       hit = sphereHit;
    }
  }

  return hit;
}

fn vec3_near_zero(v: v3) -> bool {
  let s = 1e-8;
  return (abs(v[0]) < s) && (abs(v[1]) < s) && (abs(v[2]) < s);
}

struct ScatterResult {
  scattered: bool;
  ray: Ray;
  attenuation: Color;
};

fn scatter(ray: Ray, hit: HitRecord, pixel: PixelCoords, sampleIndex: u32) -> ScatterResult {
  if (hit.material.scatterType == lambertian) {
      var scatterDirection = hit.normal + random_in_hemisphere(vec2<f32>(pixel.x, pixel.y), sampleIndex, hit.normal);

      // Catch degenerate scatter direction
      if (vec3_near_zero(scatterDirection)) {
        scatterDirection = hit.normal;
      }

      return ScatterResult(
        true,
        Ray(hit.p, scatterDirection),
        hit.material.color
      );
  }
  else if (hit.material.scatterType == metal) {
    let reflected = reflect(normalize(ray.direction), hit.normal);
    let scatteredRay = Ray(hit.p, reflected + random_v3_unit(vec2<f32>(pixel.x, pixel.y), sampleIndex + 10u) * hit.material.fuzz);
    if (dot(scatteredRay.direction, hit.normal) > 0.0) {
      return ScatterResult(
        true,
        scatteredRay,
        hit.material.color
      );
    }
  }
  else if (hit.material.scatterType == dielectric) {
    var refractionRatio = hit.material.indexOfRefraction;
    if (hit.frontFace) {
      refractionRatio = 1.0 / refractionRatio;
    }

    let cosTheta = min(dot(-normalize(ray.direction), hit.normal), 1.0);
    let sinTheta = sqrt(1.0 - cosTheta * cosTheta);

    let cannotRefract = refractionRatio * sinTheta > 1.0;
    var direction: v3;

    if (
      cannotRefract
      || material_reflectance(cosTheta, refractionRatio) > rand(vec2<f32>(pixel.x, pixel.y))
    ) {
      direction = reflect(normalize(ray.direction), hit.normal);
    }
    else {
      direction = refract(normalize(ray.direction), hit.normal, refractionRatio);
    }

    return ScatterResult(
      true,
      Ray(hit.p, direction),
      Color(1.0, 1.0, 1.0)
    );
  }

  return ScatterResult(
    false,
    ray,
    Color(0.0, 0.0, 0.0)
  );
}

fn ray_color(ray: Ray, pixel: PixelCoords, sampleIndex: u32, maxDepth: u32) -> Color {
  var depth = maxDepth;
  var stepRay = ray;
  var hit: HitRecord;

  let unitDirection = normalize(ray.direction);
  let t = 0.5 * (unitDirection.y + 1.0);
  var color = Color(1.0, 1.0, 1.0) * (1.0 - t) + Color(0.5, 0.7, 1.0) * t;

  loop {
    if (depth <= 0u) {
      break;
    }

    hit = hit_world(stepRay, 0.001, infinity);

    if (!hit.hit) {
      break;
    }

    let scatterResult = scatter(ray, hit, pixel, sampleIndex);
    if (scatterResult.scattered) {
      stepRay = scatterResult.ray;
      color = scatterResult.attenuation * color;
    }
    else {
      break;
    }

    depth = depth - 1u;
  }

  return color;
}

@group(0)
@binding(0)
var<storage, write> outputColorBuffer : ColorBuffer;

@group(0)
@binding(1)
var<uniform> uniforms : Uniforms;

@group(0)
@binding(2)
var<storage> world : WorldBuffer;

@group(0)
@binding(3)
var<storage> camera : CameraBuffer;

@stage(compute)
@workgroup_size(256, 1)
fn compute_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  if (global_id.x >= arrayLength(&outputColorBuffer.values)) {
    return;
  }

  let aspectRatio = uniforms.screenWidth / uniforms.screenHeight;
  let pixel = pixel_coords(global_id);

  let samplesPerPixel = 5u;
  let maxDepth = 9u;

  let camera = Camera(
    p3(camera.values[0u], camera.values[1u], camera.values[2u]),
    p3(camera.values[3u], camera.values[4u], camera.values[5u]),
    v3(0.0, 1.0, 0.0),
    camera.values[6u],
    aspectRatio,
    camera.values[7u],
    camera.values[8u]
  );

  var color = Color(0.0, 0.0, 0.0);
  var sampleIndex: u32;
  for (sampleIndex = 0u; sampleIndex < samplesPerPixel; sampleIndex = sampleIndex + 1u) {
    let samplePixel = sample_pixel(pixel, sampleIndex);
    let ray = camera_get_ray(camera, samplePixel, sampleIndex);
    color = color + ray_color(ray, samplePixel, sampleIndex, maxDepth);
  }

  color_pixel(pixel, color, samplesPerPixel);
}