fn ray_color(ray: Ray, pixel: PixelCoords, maxDepth: u32, lightIndexes: array<u32, MAX_LIGHTS>) -> Color {
  var resultingColor = Color(0.0, 0.0, 0.0);
  var globalAttenuation = Color(1.0, 1.0, 1.0);

  var currentRay = ray;
  var rayHop: u32;
  for (rayHop = 0u; rayHop < maxDepth; rayHop = rayHop + 1u) {
    let hit = hit_world(currentRay, 0.001, infinity);

    if (!hit.hit) {
      break;
    }

    let emitResult = emit(hit);
    if (emitResult.emitted) {
      resultingColor = resultingColor + emitResult.color * globalAttenuation;
      if (rayHop == 0u) {
        break;
      }
    }
    else {
      var lightIndex: u32;
      for (lightIndex = 0u; lightIndex < MAX_LIGHTS; lightIndex = lightIndex + 1u) {
        if (lightIndexes[lightIndex] == 0u) {
          break;
        }

        let lightObjectType = get_object_type_at_index(lightIndexes[lightIndex]);
        var light: Material;
        var lightPoint: v3;
        if (lightObjectType == object_triangle) {
          let trg = get_triangle_at_index(lightIndexes[lightIndex]);
          lightPoint = random_on_triangle(pixel, trg);
          light = trg.material;
        }
        else {
          let sph = get_sphere_at_index(lightIndexes[lightIndex]);
          lightPoint = sph.center;
          light = sph.material;
        }

        let lh = lightPoint - hit.p;
        let dist = length(lh);

        let shadowRay = Ray(
          hit.p,
          normalize(lh)
        );

        let shadowHit = hit_world(shadowRay, epsilon, dist);

        if (!shadowHit.hit) {
          resultingColor = resultingColor + light.color * (1.0 / dist) * globalAttenuation;
        }
      }
    }

    let scatterResult = scatter(ray, hit, pixel);
    globalAttenuation = scatterResult.attenuation * globalAttenuation;
    if (!scatterResult.scattered) {
      break;
    }

    currentRay = scatterResult.ray;
  }

  return resultingColor;
}
