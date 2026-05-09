import type { Game } from "../Game";
import { WEBGL_BLACK_HOLE_POOL_CAPACITY, WEBGL_PARTICLE_POOL_CAPACITY, WEBGL_STAR_POOL_CAPACITY } from "../game-webgl.const";
import type { vec4 } from "../math";
import type { BlackHole } from "../objects/class/BlackHole";
import type { Particle } from "../objects/class/Particle";
import type { Star } from "../objects/class/Star";
import { BH_SHOW_TIME_APPEAR_MIN_TIME } from "../objects/const";
import type { GLProgram } from "../WebGL/WebGLProgram";
import { WebGLText } from "../WebGL/WebGLText";
// import { BH_SHOW_TIME_APPEAR_MIN_TIME } from "../objects/const";
import type { IRender } from "./IRender";

interface IDrawTextParams {
  x: number;
  y: number;
  /**
   * Default is white: [1.0, 1.0, 1.0, 1.0]
   */
  color?: vec4;
}

export interface IWebGLRenderConfig {
  ctx: WebGL2RenderingContext;

  shaders: {
    starShader: GLProgram;
    particleShader: GLProgram;
    blackHoleShader: GLProgram;
    textShader: GLProgram;
  };
}

export class WebGL2dRender implements IRender<BlackHole, Star, Particle> {
  private _gl: WebGL2RenderingContext;
  private shaders: {
    starShader: GLProgram;
    particleShader: GLProgram;
    blackHoleShader: GLProgram;
    textShader: GLProgram;
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
  private textVBO: WebGLBuffer;
  private textVAO: WebGLVertexArrayObject;
  private textArrayBuffer: Float32Array;

  private readonly maxTextGlyphs = 256;

  private textRenderer: WebGLText;

  constructor(cfg: IWebGLRenderConfig) {
    const gl = cfg.ctx;

    this._gl = gl;
    this.shaders = cfg.shaders;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.blackHolesVBO = gl.createBuffer();
    this.starsVBO = gl.createBuffer();
    this.particlesVBO = gl.createBuffer();
    this.textVBO = gl.createBuffer();

    if (!this.starsVBO || !this.particlesVBO || !this.blackHolesVBO || !this.textVBO) {
      throw new Error('Failed to create buffers');
    }

    this.blackHolesArrayBuffer = new Float32Array(WEBGL_BLACK_HOLE_POOL_CAPACITY * 3);
    this.starsArrayBuffer = new Float32Array(WEBGL_STAR_POOL_CAPACITY * 6);
    this.particlesArrayBuffer = new Float32Array(WEBGL_PARTICLE_POOL_CAPACITY * 3);
    this.textArrayBuffer = new Float32Array(this.maxTextGlyphs * 6 * 4);

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

    // setup VBO+VAO for text quads
    const textVao = gl.createVertexArray();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.textVBO);
    gl.bufferData(gl.ARRAY_BUFFER, this.maxTextGlyphs * 6 * 4 * 4, gl.DYNAMIC_DRAW);

    gl.bindVertexArray(textVao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * 4, 0);

    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
    gl.bindVertexArray(null);

    this.blackHolesVAO = blackHolesVao;
    this.starsVAO = starsVao;
    this.particlesVAO = particlesVao;
    this.textVAO = textVao;

    this.textRenderer = new WebGLText({
      gl,
      font: '700 24px Inter, Arial, sans-serif',
      padding: 8,
    });
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
    
    this.renderText(game, `Score: ${game._score.toFixed(3)}`, { x: 16, y: 16 });
    this.renderText(game, `Stars: ${countStars}`, { x: 16, y: 46 });
    this.renderText(game, `Black holes: ${countBlackHoles}`, { x: 16, y: 76 });
    this.renderText(game, `Particles: ${countParticles}`, { x: 16, y: game.height - 50 });
    this.renderText(game, `Particles absorbed: ${game._particlesAbsorbedByBlackHoles}`, { x: 16, y: game.height - 20 });

    if (game.blackHoleTimeRemains <= BH_SHOW_TIME_APPEAR_MIN_TIME) {
      const timeRemain = (game.blackHoleTimeRemains / 1000).toFixed(1); // round to 0.1 seconds
      const blackHoleColor = game.blackHoleTimeRemains / BH_SHOW_TIME_APPEAR_MIN_TIME;

      const text = `Black hole time remains: ${timeRemain}`;
      const textWidth = this.textRenderer.getTextWidth(text);
      this.renderText(game, text, { x: game.halfWidth - textWidth / 2, y: game.height - 20, color: [1.0, blackHoleColor, blackHoleColor, 1.0] });
    }
  }

  private renderText(game: Game<BlackHole, Star, Particle>, text: string, params: IDrawTextParams): void {
    const gl = this._gl;

    const color = params.color ?? [1.0, 1.0, 1.0, 1.0];
    const layout = this.textRenderer.layoutText(text, params.x, params.y);
    const glyphCount = Math.min(layout.glyphs.length, this.maxTextGlyphs);

    if (glyphCount > 0) {
      for (let i = 0; i < glyphCount; i++) {
        const glyph = layout.glyphs[i];
        const base = i * 24;

        const x0 = glyph.penX + glyph.offsetX;
        const y0 = glyph.penY + glyph.offsetY;
        const x1 = x0 + glyph.width;
        const y1 = y0 + glyph.height;

        // triangle 1
        this.textArrayBuffer[base] = x0;
        this.textArrayBuffer[base + 1] = y0;
        this.textArrayBuffer[base + 2] = glyph.u0;
        this.textArrayBuffer[base + 3] = glyph.v0;

        this.textArrayBuffer[base + 4] = x1;
        this.textArrayBuffer[base + 5] = y0;
        this.textArrayBuffer[base + 6] = glyph.u1;
        this.textArrayBuffer[base + 7] = glyph.v0;

        this.textArrayBuffer[base + 8] = x1;
        this.textArrayBuffer[base + 9] = y1;
        this.textArrayBuffer[base + 10] = glyph.u1;
        this.textArrayBuffer[base + 11] = glyph.v1;

        // triangle 2
        this.textArrayBuffer[base + 12] = x0;
        this.textArrayBuffer[base + 13] = y0;
        this.textArrayBuffer[base + 14] = glyph.u0;
        this.textArrayBuffer[base + 15] = glyph.v0;

        this.textArrayBuffer[base + 16] = x1;
        this.textArrayBuffer[base + 17] = y1;
        this.textArrayBuffer[base + 18] = glyph.u1;
        this.textArrayBuffer[base + 19] = glyph.v1;

        this.textArrayBuffer[base + 20] = x0;
        this.textArrayBuffer[base + 21] = y1;
        this.textArrayBuffer[base + 22] = glyph.u0;
        this.textArrayBuffer[base + 23] = glyph.v1;
      }

      gl.useProgram(this.shaders.textShader.program);

      const projectionLocation = gl.getUniformLocation(this.shaders.textShader.program, 'u_projection');
      const tintLocation = gl.getUniformLocation(this.shaders.textShader.program, 'u_tint');
      const textTextureLocation = gl.getUniformLocation(this.shaders.textShader.program, 'u_textTexture');

      gl.uniform2f(projectionLocation, 1.0 / game.width, 1.0 / game.height);
      gl.uniform4fv(tintLocation, color);
      gl.uniform1i(textTextureLocation, 0);

      this.textRenderer.bind(0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.textVBO);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.textArrayBuffer.subarray(0, glyphCount * 24));

      gl.bindVertexArray(this.textVAO);
      gl.drawArrays(gl.TRIANGLES, 0, glyphCount * 6);
      gl.bindVertexArray(null);
    }
  }
}
