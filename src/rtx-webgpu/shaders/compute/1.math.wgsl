type v3 = vec3<f32>;

fn v3_len_sqr(p: v3) -> f32 {
   return p[0] * p[0] + p[1] * p[1] + p[2] * p[2];
}

fn v3_near_zero(v: v3) -> bool {
  let s = 1e-8;
  return (abs(v[0]) < s) && (abs(v[1]) < s) && (abs(v[2]) < s);
}
