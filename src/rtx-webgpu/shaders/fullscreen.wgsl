struct ColorData {
  data : array<f32>;
};

struct Uniforms {
  screenWidth: f32;
  screenHeight: f32;
};

@group(0)
@binding(0)
var<uniform> uniforms : Uniforms;

@group(0)
@binding(1)
var<storage, read> finalColorBuffer : ColorData;

struct VertexOutput {
  @builtin(position) Position : vec4<f32>;
};

@stage(vertex)
fn vertex_main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
  var pos = array<vec2<f32>, 6>(
      vec2<f32>( 1.0,  1.0),
      vec2<f32>( 1.0, -1.0),
      vec2<f32>(-1.0, -1.0),
      vec2<f32>( 1.0,  1.0),
      vec2<f32>(-1.0, -1.0),
      vec2<f32>(-1.0,  1.0)
  );

  var outputBuf: VertexOutput;
  outputBuf.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
  return outputBuf;
}

@stage(fragment)
fn fragment_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
  let X = floor(coord.x);
  let Y = floor(coord.y);
  let index = u32(X + (uniforms.screenHeight - Y) * uniforms.screenWidth) * 3u;

  let R = finalColorBuffer.data[index + 0u];
  let G = finalColorBuffer.data[index + 1u];
  let B = finalColorBuffer.data[index + 2u];

  let finalColor = vec4<f32>(R, G, B, 1.0);
  return finalColor;
}
