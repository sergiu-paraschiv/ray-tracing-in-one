var<private> seed: u32;

fn init_seed(s: u32) {
    seed = s;
}

fn tau_step(z: u32, s1: u32, s2: u32, s3: u32, M: u32) -> u32 {
  let b: u32 = (((z << s1) ^ z) >> s2);
  let z1 = (((z & M) << s3) ^ b);

  return z1;
}

fn random(pixel: PixelCoords) -> f32 {
  let z1 = tau_step(seed, 13u, 19u, 12u, 429496729u);
  let z2 = tau_step(seed, 2u, 25u, 4u, 4294967288u);
  let z3 = tau_step(seed, 3u, 11u, 17u, 429496280u);
  let z4 = 1664525u * seed + 1013904223u;

  seed = (z1 ^ z2 ^ z3 ^ z4);

  return f32(seed) * 2.3283064365387e-10;
}

fn random_between(pixel: PixelCoords, lo: f32, hi: f32) -> f32 {
  return lo + (hi - lo) * random(pixel);
}

fn random_v3_lohi(pixel: PixelCoords, lo: f32, hi: f32) -> vec3<f32> {
  return v3(
    random_between(pixel, lo, hi),
    random_between(pixel, lo, hi),
    random_between(pixel, lo, hi)
  );
}

fn random_in_unit_sphere(pixel: PixelCoords) -> v3 {
  var notInSphere = true;
  var p: v3;

  loop {
    if (notInSphere == false) {
      break;
    }

    p = random_v3_lohi(pixel, -1.0, 1.0);
    if (v3_len_sqr(p) < 1.0) {
      notInSphere = false;
    }
  }

  return p;
}

fn random_in_hemisphere(pixel: PixelCoords, normal: v3) -> v3 {
  var r = random_in_unit_sphere(pixel);

  if (dot(r, normal) > 0.0) {
    return r;
  }

  return -r;
}

fn random_in_unit_disk(pixel: PixelCoords) -> v3 {
  var r = v3(random_between(pixel, -1.0, 1.0), random_between(pixel, -1.0, 1.0), 0.0);

  return normalize(r);
}

fn random_on_triangle(pixel: PixelCoords, trg: Triangle) -> v3 {
  var r = random(pixel);
  var s = random(pixel);

  if (r + s > 1.0) {
    r = 1.0 - r;
    s = 1.0 - s;
  }

  let t = 1.0 - r - s;
  let area = length(cross(trg.v1 - trg.v0, trg.v2 - trg.v0)) * 0.5;

  return trg.v0 * r + trg.v1 * s + trg.v2 * t;
}