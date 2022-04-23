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

fn set_pixel_color(pixel: PixelCoordsU, color: Color) {
  let pixelID = u32(pixel.x + (pixel.y * u32(uniforms.screenWidth))) * 3u;

  let prevColor = get_pixel_color(pixel);
  let newColor = (prevColor + color) / 2.0;

  let r = newColor[0];
  let g = newColor[1];
  let b = newColor[2];

  outputColorBuffer.values[pixelID + 0u] = clamp(r, 0.0, 0.999);
  outputColorBuffer.values[pixelID + 1u] = clamp(g, 0.0, 0.999);
  outputColorBuffer.values[pixelID + 2u] = clamp(b, 0.0, 0.999);
}

fn get_pixel_color(pixel: PixelCoordsU) -> Color {
  let pixelID = u32(pixel.x + (pixel.y * u32(uniforms.screenWidth))) * 3u;

  let r = outputColorBuffer.values[pixelID + 0u];
  let g = outputColorBuffer.values[pixelID + 1u];
  let b = outputColorBuffer.values[pixelID +2u];

  return Color(r, g, b);
}
