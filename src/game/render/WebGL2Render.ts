import type { Game } from "../Game";
import { WEBGL_BLACK_HOLE_POOL_CAPACITY, WEBGL_PARTICLE_POOL_CAPACITY, WEBGL_STAR_POOL_CAPACITY } from "../game-webgl.const";
import type { BlackHole } from "../objects/class/BlackHole";
import type { Particle } from "../objects/class/Particle";
import type { Star } from "../objects/class/Star";
import type { GLProgram } from "../WebGL/WebGLProgram";
// import { BH_SHOW_TIME_APPEAR_MIN_TIME } from "../objects/const";
import type { IRender } from "./IRender";

export interface IWebGLRenderConfig {
  ctx: WebGL2RenderingContext;

  shaders: {
    starShader: GLProgram;
    particleShader: GLProgram;
    blackHoleShader: GLProgram;
  };
}

export class WebGL2dRender implements IRender<BlackHole, Star, Particle> {
  private _gl: WebGL2RenderingContext;
  private shaders: {
    starShader: GLProgram;
    particleShader: GLProgram;
    blackHoleShader: GLProgram;
  };
  
  private blackHolesVBO: WebGLBuffer;
  private blackHolesVAO: WebGLVertexArrayObject;
  private blackHolesArrayBuffer: Float32Array;
  
  private starsVBO: WebGLBuffer;
  private starsVAO: WebGLVertexArrayObject;
  private starsArrayBuffer: Float32Array;
  
  private particlesVBO: WebGLBuffer;
  private particlesVAO: WebGLVertexArrayObject;
  private particlesArrayBuffer: Float32Array;

  constructor(cfg: IWebGLRenderConfig) {
    const gl = cfg.ctx;

    this._gl = gl;
    this.shaders = cfg.shaders;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.blackHolesVBO = gl.createBuffer();
    this.starsVBO = gl.createBuffer();
    this.particlesVBO = gl.createBuffer();

    if (!this.starsVBO || !this.particlesVBO || !this.blackHolesVBO) {
      throw new Error('Failed to create buffers');
    }

    this.blackHolesArrayBuffer = new Float32Array(WEBGL_BLACK_HOLE_POOL_CAPACITY * 3);
    this.starsArrayBuffer = new Float32Array(WEBGL_STAR_POOL_CAPACITY * 6);
    this.particlesArrayBuffer = new Float32Array(WEBGL_PARTICLE_POOL_CAPACITY * 3);

    // setup VBO+VAO for black holes
    const blackHolesVao = gl.createVertexArray();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.blackHolesVBO);
    gl.bufferData(gl.ARRAY_BUFFER, WEBGL_BLACK_HOLE_POOL_CAPACITY * 3 * 4, gl.DYNAMIC_DRAW);

    gl.bindVertexArray(blackHolesVao);
    
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);

    // setup VBO+VAO for stars
    const starsVao = gl.createVertexArray();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.starsVBO);
    gl.bufferData(gl.ARRAY_BUFFER, WEBGL_STAR_POOL_CAPACITY * 6 * 4, gl.DYNAMIC_DRAW);

    gl.bindVertexArray(starsVao);
    
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0);

    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * 4, 3 * 4);

    gl.bindVertexArray(null);
    
    // setup VBO+VAO for particles
    const particlesVao = gl.createVertexArray();


    gl.bindBuffer(gl.ARRAY_BUFFER, this.particlesVBO);
    gl.bufferData(gl.ARRAY_BUFFER, WEBGL_PARTICLE_POOL_CAPACITY * 2 * 4, gl.DYNAMIC_DRAW);
  
    gl.bindVertexArray(particlesVao);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.blackHolesVAO = blackHolesVao;
    this.starsVAO = starsVao;
    this.particlesVAO = particlesVao;
  }

  render(game: Game<BlackHole, Star, Particle>): void {
    const gl = this._gl;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const countBlackHoles = game.blackHoles.activeCount;
    const countStars = game.stars.activeCount;
    const countParticles = game.particles.activeCount;

    const blackHolesArray = game.blackHoles.getArray();
    const starsArray = game.stars.getArray();
    const particlesArray = game.particles.getArray();

    if (countParticles > 0) {
      for (let i = 0; i < countParticles; i++) {
        const particle = particlesArray[i];

        this.particlesArrayBuffer[i * 2] = particle.x;
        this.particlesArrayBuffer[i * 2 + 1] = particle.y;
      }

      gl.useProgram(this.shaders.particleShader.program);
  
      const cameraLocation = gl.getUniformLocation(this.shaders.particleShader.program, 'u_camera');
      const projectionLocation = gl.getUniformLocation(this.shaders.particleShader.program, 'u_projection');
  
      gl.uniform2f(cameraLocation, game.camera.x, game.camera.y);
      gl.uniform2f(projectionLocation, 1.0 / game.width, 1.0 / game.height);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.particlesVBO);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.particlesArrayBuffer.subarray(0, countParticles * 2));
  
      gl.bindVertexArray(this.particlesVAO);
      gl.drawArrays(gl.POINTS, 0, countParticles);
    }

    if (countStars > 0) {
      for (let i = 0; i < countStars; i++) {
        const star = starsArray[i];
  
        this.starsArrayBuffer[i * 6] = star.x;
        this.starsArrayBuffer[i * 6 + 1] = star.y;
        this.starsArrayBuffer[i * 6 + 2] = star.radius;
        this.starsArrayBuffer[i * 6 + 3] = star.colorRGB[0];
        this.starsArrayBuffer[i * 6 + 4] = star.colorRGB[1];
        this.starsArrayBuffer[i * 6 + 5] = star.colorRGB[2];
      }
  
      gl.useProgram(this.shaders.starShader.program);
  
      const cameraLocation = gl.getUniformLocation(this.shaders.starShader.program, 'u_camera');
      const projectionLocation = gl.getUniformLocation(this.shaders.starShader.program, 'u_projection');
  
      gl.uniform2f(cameraLocation, game.camera.x, game.camera.y);
      gl.uniform2f(projectionLocation, 1.0 / game.width, 1.0 / game.height);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.starsVBO);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.starsArrayBuffer.subarray(0, countStars * 6));
      
      gl.bindVertexArray(this.starsVAO);
      gl.drawArrays(gl.POINTS, 0, countStars);
    }

    if (countBlackHoles > 0) {
      for (let i = 0; i < countBlackHoles; i++) {
        const blackHole = blackHolesArray[i];
  
        this.blackHolesArrayBuffer[i * 3] = blackHole.x;
        this.blackHolesArrayBuffer[i * 3 + 1] = blackHole.y;
        this.blackHolesArrayBuffer[i * 3 + 2] = blackHole.radius;
      }
  
      gl.useProgram(this.shaders.blackHoleShader.program);
  
      const cameraLocation = gl.getUniformLocation(this.shaders.blackHoleShader.program, 'u_camera');
      const projectionLocation = gl.getUniformLocation(this.shaders.blackHoleShader.program, 'u_projection');
  
      gl.uniform2f(cameraLocation, game.camera.x, game.camera.y);
      gl.uniform2f(projectionLocation, 1.0 / game.width, 1.0 / game.height);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.blackHolesVBO);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.blackHolesArrayBuffer.subarray(0, countBlackHoles * 3));
      
      gl.bindVertexArray(this.blackHolesVAO);
      gl.drawArrays(gl.POINTS, 0, countBlackHoles);
    }
  }
}
