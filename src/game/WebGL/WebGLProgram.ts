export interface IWebGLProgramConfig {
  name: string;
  vertexShader: string;
  fragmentShader: string;
}

export class GLProgram {
  private _program: WebGLProgram;

  constructor(gl: WebGLRenderingContext, programConfig: IWebGLProgramConfig) {
    const vertexShader = this.createShader(gl, programConfig.vertexShader, gl.VERTEX_SHADER, programConfig.name);
    const fragmentShader = this.createShader(gl, programConfig.fragmentShader, gl.FRAGMENT_SHADER, programConfig.name);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`[${programConfig.name}] Failed to link program: ${info}`);
  }

    this._program = program;
  }

  get program() {
    return this._program;
  }

  private createShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number, pName: string) {
    const shader = gl.createShader(shaderType);

    if (!shader) {
      throw new Error('Failed to create shader');
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`[${pName}] Failed to compile shader: ${info}`);
    }

    return shader;
  }
}