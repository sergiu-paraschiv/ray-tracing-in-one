fn ray_color(ray: Ray, pixel: PixelCoords, maxDepth: u32) -> Color {
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
