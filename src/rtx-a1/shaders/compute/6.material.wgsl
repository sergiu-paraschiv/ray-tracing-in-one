type Color = vec3<f32>;

struct Material {
  scatterType: u32;
  color: Color;
  indexOfRefraction: f32;
};

fn material_reflectance(cosine: f32, refractionRatio: f32) -> f32 {
  var r0 = (1.0 - refractionRatio) / (1.0 + refractionRatio);
  r0 = r0 * r0;
  return r0 + (1.0 - r0) * pow(1.0 - cosine, 5.0);
}

struct ScatterResult {
  scattered: bool;
  ray: Ray;
  attenuation: Color;
};

fn scatter(ray: Ray, hit: HitRecord, pixel: PixelCoords) -> ScatterResult {
  let rayDirectionNormal = normalize(ray.direction);

  if (hit.material.scatterType == material_lambertian) {
      var scatterDirection = hit.normal + random_in_hemisphere(pixel, hit.normal);

      // Catch degenerate scatter direction
      if (v3_near_zero(scatterDirection)) {
        scatterDirection = hit.normal;
      }

      return ScatterResult(
        true,
        Ray(hit.p, scatterDirection),
        hit.material.color
      );
  }
  else if (hit.material.scatterType == material_metal) {
    let reflected = reflect(rayDirectionNormal, hit.normal);
    let scatteredRay = Ray(hit.p, reflected * random_in_unit_sphere(pixel));

    return ScatterResult(
      dot(scatteredRay.direction, hit.normal) > 0.0,
      scatteredRay,
      hit.material.color
    );
  }
  else if (hit.material.scatterType == material_dielectric) {
    let cosTheta = min(dot(-rayDirectionNormal, hit.normal), 1.0);
    let sinTheta = sqrt(1.0 - cosTheta * cosTheta);

    var refractionRatio = hit.material.indexOfRefraction;
    if (hit.frontFace) {
      refractionRatio = 1.0 / refractionRatio;
    }

    let cannotRefract = refractionRatio * sinTheta > 1.0;
    var direction: v3;

    if (
      cannotRefract
      || material_reflectance(cosTheta, refractionRatio) > random(pixel)
    ) {
      direction = reflect(rayDirectionNormal, hit.normal);
    }
    else {
      direction = refract(rayDirectionNormal, hit.normal, refractionRatio);
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

struct EmitResult {
  emitted: bool;
  color: Color;
};

fn emit(hit: HitRecord) -> EmitResult {
  if (hit.material.scatterType == material_difuse_light) {
    return EmitResult(
      true,
      hit.material.color
    );
  }

  return EmitResult(
    false,
    Color(0.0, 0.0, 0.0)
  );
}