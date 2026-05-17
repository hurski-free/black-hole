export interface IWebGLTextConfig {
  gl: WebGL2RenderingContext;
  font?: string;
  fillStyle?: string;
  padding?: number;
  atlasWidth?: number;
  atlasHeight?: number;
  chars?: string;
}

export interface IGlyphMetric {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  advance: number;
  offsetX: number;
  offsetY: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

export interface ITextLayoutGlyph extends IGlyphMetric {
  penX: number;
  penY: number;
}

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789.,:;!?+-*/=_()[]{}<>\"'`~@#$%^&|\\ ";

export class WebGLText {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private _texture: WebGLTexture;
  private _glyphs = new Map<string, IGlyphMetric>();

  private _width = 1;
  private _height = 1;
  private lineAscent = 0;
  private lineDescent = 0;
  private lineHeight = 0;
  private font: string;
  private fillStyle: string;
  private padding: number;
  private chars: string;

  constructor(cfg: IWebGLTextConfig) {
    this.gl = cfg.gl;
    this.font = cfg.font ?? "700 24px Inter, Arial, sans-serif";
    this.fillStyle = cfg.fillStyle ?? "#FFFFFF";
    this.padding = cfg.padding ?? 8;
    this.chars = cfg.chars ?? DEFAULT_CHARSET;
    this._width = cfg.atlasWidth ?? 1024;
    this._height = cfg.atlasHeight ?? 1024;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this._width;
    this.canvas.height = this._height;
    const ctx = this.canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      throw new Error("Failed to create 2D canvas context for WebGL2 text");
    }
    this.ctx = ctx;

    const texture = this.gl.createTexture();
    if (!texture) {
      throw new Error("Failed to create texture for WebGL2 text");
    }
    this._texture = texture;
    this.buildAtlas();

    this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this._width,
      this._height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.canvas,
    );
  }

  get glyphs(): ReadonlyMap<string, IGlyphMetric> {
    return this._glyphs;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  public getGlyph(char: string): IGlyphMetric | undefined {
    return this._glyphs.get(char);
  }

  public hasGlyph(char: string): boolean {
    return this._glyphs.has(char);
  }

  public layoutText(text: string, startX = 0, startY = 0): { glyphs: ITextLayoutGlyph[]; width: number; height: number } {
    const glyphs: ITextLayoutGlyph[] = [];
    let x = startX;
    let maxBottom = startY;

    for (const ch of text) {
      const glyph = this._glyphs.get(ch) ?? this._glyphs.get(" ");
      if (!glyph) {
        continue;
      }

      glyphs.push({
        ...glyph,
        penX: x,
        penY: startY,
      });

      x += glyph.advance;
      maxBottom = Math.max(maxBottom, startY + glyph.height);
    }

    return {
      glyphs,
      width: Math.max(0, x - startX),
      height: Math.max(0, maxBottom - startY),
    };
  }

  /**
   * Return text width in pixels
   * @param text 
   */
  public getTextWidth(text: string) {
    let width = 0;

    for (const ch of text) {
      const glyph = this._glyphs.get(ch) ?? this._glyphs.get(" ");
      if (!glyph) {
        continue;
      }
      width += glyph.width;
    }

    return width;
  }

  private buildAtlas(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this._width, this._height);
    this.ctx.font = this.font;
    this.ctx.textBaseline = "alphabetic";
    this.ctx.fillStyle = this.fillStyle;
    this.ctx.imageSmoothingEnabled = true;

    const lineProbe = this.ctx.measureText("Mg");
    this.lineAscent = Math.ceil(lineProbe.actualBoundingBoxAscent || this.extractFontPx(this.font));
    this.lineDescent = Math.ceil(lineProbe.actualBoundingBoxDescent || this.lineAscent * 0.3);
    this.lineHeight = this.lineAscent + this.lineDescent;

    let penX = this.padding;
    let penY = this.padding + this.lineAscent;

    for (const ch of this.chars) {
      const measured = this.ctx.measureText(ch);
      const glyphW = Math.max(1, Math.ceil(measured.width));
      const glyphAscent = Math.ceil(measured.actualBoundingBoxAscent || this.lineHeight * 0.75);
      const glyphDescent = Math.ceil(measured.actualBoundingBoxDescent || this.lineHeight * 0.25);
      const glyphH = Math.max(1, glyphAscent + glyphDescent);
      const advance = Math.ceil(measured.width);

      if (penX + glyphW + this.padding > this._width) {
        penX = this.padding;
        penY += this.lineHeight + this.padding;
      }

      if (penY + glyphDescent + this.padding > this._height) {
        throw new Error("WebGLText atlas is too small for configured glyph set");
      }

      this.ctx.fillText(ch, penX, penY);

      const x = penX;
      const y = penY - glyphAscent;
      const metric: IGlyphMetric = {
        char: ch,
        x,
        y,
        width: glyphW,
        height: glyphH,
        advance,
        offsetX: 0,
        // Align all glyphs to the same baseline on the rendered line.
        offsetY: this.lineAscent - glyphAscent,
        u0: x / this._width,
        v0: y / this._height,
        u1: (x + glyphW) / this._width,
        v1: (y + glyphH) / this._height,
      };

      this._glyphs.set(ch, metric);
      penX += glyphW + this.padding;
    }
  }

  public bind(textureUnit = 0): void {
    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this._texture);
  }

  public destroy(): void {
    this.gl.deleteTexture(this._texture);
  }

  private extractFontPx(font: string): number {
    const size = /(\d+(?:\.\d+)?)px/.exec(font);
    if (!size) return 24;
    return Number(size[1]);
  }
}
