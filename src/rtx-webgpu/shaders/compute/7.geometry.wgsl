struct Sphere {
  center: v3;
  radius: f32;
  material: Material;
};

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

struct Triangle {
  v0: v3;
  v1: v3;
  v2: v3;
  material: Material;
};

fn hit_triangle(trg: Triangle, ray: Ray, tMin: f32, tMax: f32) -> HitRecord {
  var hit = init_hit_record();

  let v0 = trg.v0;
  let v1 = trg.v1;
  let v2 = trg.v2;

  let edge1 = v1 - v0;
  let edge2 = v2 - v0;

  let pvec = cross(ray.direction, edge2);
  let det = dot(edge1, pvec);
  let invDet = 1.0 / det;

  var t: f32;
  var u: f32;
  var v: f32;

  if (det < epsilon) {
    return hit;
  }

  let tvec = ray.origin - v0;
  u = dot(tvec, pvec);
  if ( u < 0.0 || u > det) {
    return hit;
  }

  let qvec = cross(tvec, edge1);
  v = dot(ray.direction, qvec);
  if (v < 0.0 || u + v > det) {
    return hit;
  }

  t = dot(edge2, qvec);

  t = t * invDet;
  u = u * invDet;
  v = v * invDet;

  if (t < epsilon) {
    return hit;
  }

  hit.hit = true;
  hit.t = t;
  hit.p = ray_at(ray, hit.t);
  hit.frontFace = true;
  hit.material = trg.material;

  return hit;
}
