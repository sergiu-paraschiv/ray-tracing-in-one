struct Ray {
  origin: v3;
  direction: v3;
};

fn ray_at(ray: Ray, t: f32) -> v3 {
    return ray.origin + ray.direction * t;
}

struct HitRecord {
  hit: bool;
  p: v3;
  normal: v3;
  t: f32;
  frontFace: bool;
  material: Material;
};

fn init_hit_record() -> HitRecord {
  return HitRecord(
    false,
    v3(0.0, 0.0, 0.0),
    v3(0.0, 0.0, 0.0),
    0.0,
    false,
    Material(material_lambertian, Color(0.0, 0.0, 0.0), 0.0)
  );
}
