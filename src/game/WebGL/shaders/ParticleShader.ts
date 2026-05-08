import type { IWebGLProgramConfig } from "../WebGLProgram";

const vertexShader = `#version 300 es
layout(location = 0) in vec2 a_position;

uniform vec2 u_camera;
uniform vec2 u_projection;

void main() {
  vec2 worldToScreen = (a_position - u_camera) * u_projection;
  vec2 clip = worldToScreen * 2.0 - 1.0;
  clip.y = -clip.y;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = 1.5;
}
`;

export const fragmentShader = `#version 300 es
precision highp float;

out vec4 out_color;

const vec4 PARTICLE_COLOR = vec4(0.9, 0.83, 0.95, 1.0);

void main() {
  out_color = PARTICLE_COLOR;
}
`;

export const particleShader: IWebGLProgramConfig = {
  name: 'PARTICLE_SHADER',
  vertexShader,
  fragmentShader,
};