struct ColorBuffer {
  values: array<f32>;
};

struct Uniforms {
  screenWidth: f32;
  screenHeight: f32;
  frameIndex: u32;
};

struct PixelCoords {
  x: f32;
  y: f32;
};

struct PixelCoordsU {
  x: u32;
  y: u32;
};

fn pixel_coords_f(pixelId: vec3<u32>) -> PixelCoords {
    let y = f32(pixelId.x) / uniforms.screenWidth;
    let x = f32(pixelId.x) % uniforms.screenWidth;

    return PixelCoords(x, y);
}

fn pixel_coords_u(pixelId: vec3<u32>) -> PixelCoordsU {
    let y = pixelId.x / u32(uniforms.screenWidth);
    let x = pixelId.x % u32(uniforms.screenWidth);

    return PixelCoordsU(x, y);
}

fn color_pixel(pixel: PixelCoordsU, color: Color, samplesPerPixel: u32) {
  let pixelID = u32(pixel.x + (pixel.y * u32(uniforms.screenWidth))) * 3u;

  var r = color[0];
  var g = color[1];
  var b = color[2];

  let scale = 1.0 / f32(samplesPerPixel);
  r = sqrt(r * scale);
  g = sqrt(g * scale);
  b = sqrt(b * scale);


  r = (outputColorBuffer.values[pixelID + 0u] + r) / 2.0;
  g = (outputColorBuffer.values[pixelID + 1u] + g) / 2.0;
  b = (outputColorBuffer.values[pixelID + 2u] + b) / 2.0;


  outputColorBuffer.values[pixelID + 0u] = clamp(r, 0.0, 0.999);
  outputColorBuffer.values[pixelID + 1u] = clamp(g, 0.0, 0.999);
  outputColorBuffer.values[pixelID + 2u] = clamp(b, 0.0, 0.999);
}
