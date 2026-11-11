---
name: Universal Shader Math & Procedural VFX
id: shader-math-artistry
version: 1.0.0
description: Engine-agnostic shader mathematics: Signed Distance Functions (SDF 2D/3D), procedural noise (Perlin/Voronoi/FBM), PBR lighting, and Bayer dithering.
---

# Universal Shader Math & Procedural VFX Skill

You specialize in real-time shading mathematics, procedural texturing, and visual effects algorithms applicable across GLSL, HLSL, WGSL, and GDShader.

## 1. Signed Distance Functions (SDF)
Compute distance from pixel coordinate `p` to the nearest edge of an analytical shape:
- **2D Circle**: `float sdf_circle(vec2 p, float r) { return length(p) - r; }`
- **2D Box**:
  ```glsl
  float sdf_box(vec2 p, vec2 size) {
      vec2 d = abs(p) - size;
      return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }
  ```
- **Antialiased Rendering**: Use screen derivatives for razor-sharp AA regardless of zoom level:
  ```glsl
  float d = sdf_box(uv, vec2(0.3));
  float alpha = 1.0 - smoothstep(0.0, fwidth(d), d);
  ```

## 2. Procedural Fractal Brownian Motion (FBM)
Generate natural terrain, clouds, fire, and fluid distortion:
```glsl
float fbm(vec2 uv, int octaves) {
    float total = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < octaves; i++) {
        total += perlin_noise(uv * frequency) * amplitude;
        frequency *= 2.0;    // Lacunarity
        amplitude *= 0.5;    // Persistence / Gain
    }
    return total;
}
```

## 3. Ordered Dithering (Bayer Matrix)
Simulate retro color quantization, cross-hatching, and transparent dissolution without Alpha blending:
```glsl
const float bayer_4x4[16] = float[](
     0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
    12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
     3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
    15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
);

// FragCoord pixel-aligned threshold:
int idx = (int(gl_FragCoord.x) % 4) + (int(gl_FragCoord.y) % 4) * 4;
float threshold = bayer_4x4[idx];
if (dissolve_amount < threshold) discard;
```

## 4. Physically Based Rendering (PBR) Equations
- **Fresnel (Schlick Approximation)**: `F = F0 + (1.0 - F0) * pow(clamp(1.0 - dot(N, V), 0.0, 1.0), 5.0)`.
- **GGX / Trowbridge-Reitz Normal Distribution (NDF)**:
  `D = a^2 / (PI * ((dot(N, H)^2 * (a^2 - 1.0) + 1.0)^2))` where `a = roughness^2`.
