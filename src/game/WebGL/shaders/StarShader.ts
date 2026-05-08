import type { IWebGLProgramConfig } from "../WebGLProgram";

const vertexShader = `#version 300 es
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_color;

uniform vec2 u_camera;
uniform vec2 u_projection;

out vec3 v_color;

void main() {
  vec2 worldToScreen = (a_position.xy - u_camera) * u_projection;
  vec2 clip = worldToScreen * 2.0 - 1.0;
  clip.y = -clip.y;

  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = a_position.z * 3.4;

  v_color = a_color;
}
`;

export const fragmentShader = `#version 300 es
precision highp float;

in vec3 v_color;

out vec4 out_color;

const float MAX_POINT_RADIUS = 0.5;
const float CORE_RADIUS = MAX_POINT_RADIUS / 1.7;

void main() {
  float dist = length(gl_PointCoord - 0.5);
  float alpha = 1.0;

  if (dist > CORE_RADIUS) {
    alpha -= pow((dist - CORE_RADIUS) / (MAX_POINT_RADIUS - CORE_RADIUS), 0.5);
  }

  if (alpha < 0.001) discard;

  out_color = vec4(v_color, alpha);
}
`;

export const starShader: IWebGLProgramConfig = {
  name: 'STAR_SHADER',
  vertexShader,
  fragmentShader,
};