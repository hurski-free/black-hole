import type { IWebGLProgramConfig } from "../WebGLProgram";

const vertexShader = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

uniform vec2 u_projection;

out vec2 v_uv;

void main() {
  vec2 worldToScreen = a_position * u_projection;
  vec2 clip = worldToScreen * 2.0 - 1.0;
  clip.y = -clip.y;

  gl_Position = vec4(clip, 0.0, 1.0);
  v_uv = a_uv;
}
`;

const fragmentShader = `#version 300 es
precision highp float;

in vec2 v_uv;

uniform sampler2D u_textTexture;
uniform vec4 u_tint;

out vec4 out_color;

void main() {
  vec4 texel = texture(u_textTexture, v_uv);
  vec4 color = texel * u_tint;

  if (color.a < 0.001) discard;

  out_color = color;
}
`;

export const textShader: IWebGLProgramConfig = {
  name: "TEXT_SHADER",
  vertexShader,
  fragmentShader,
};
