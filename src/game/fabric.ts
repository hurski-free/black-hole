import type { Translator } from "../i18n";
import type { IFrameView } from "./FrameView";
import { EngineAoS } from "./engine/EngineAoS";
import { Game } from "./Game";
import { CANVAS2D_BLACK_HOLE_POOL_CAPACITY, CANVAS2D_PARTICLE_POOL_CAPACITY, CANVAS2D_STAR_POOL_CAPACITY } from "./game-canvas2d.const";
import { WEBGL2_BLACK_HOLE_POOL_CAPACITY, WEBGL2_PARTICLE_POOL_CAPACITY, WEBGL2_STAR_POOL_CAPACITY } from "./game-webgl2.const";
import { Canvas2dAoSRender } from "./render/Canvas2dAoSRender";
import { WebGL2AosRender } from "./render/WebGL2AosRender";
import { AoSWorld } from "./world/AoSWorld";
import { GameplayAoS } from "./gameplay/GameplayAoS";

type GameMode = 'canvas2d-aos' | 'webgl2-aos' | 'canvas2d-soa' | 'webgl2-soa';

export function createGame(
  mode: GameMode,
  ctx: CanvasRenderingContext2D | WebGL2RenderingContext,
  translator: Translator
) {
  if (!(ctx instanceof CanvasRenderingContext2D || ctx instanceof WebGL2RenderingContext)) {
    throw new Error('ctx must be a CanvasRenderingContext2D or WebGL2RenderingContext');
  }

  const frameView = {
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    halfWidth: ctx.canvas.width / 2,
    halfHeight: ctx.canvas.height / 2,
    camera: [0, 0],
    gameState: 'wait_for_start',
    score: 0,
    particlesAbsorbedByBlackHoles: 0,
    blackHoleTimeRemains: 0,
  } satisfies IFrameView;

  switch (mode) {
    case 'webgl2-aos':
      if (!(ctx instanceof WebGL2RenderingContext)) {
        throw new Error('ctx must be a WebGL2RenderingContext');
      }

      const aosWebgl2World = new AoSWorld({
        blackHolePoolCapacity: WEBGL2_BLACK_HOLE_POOL_CAPACITY,
        starPoolCapacity: WEBGL2_STAR_POOL_CAPACITY,
        particlePoolCapacity: WEBGL2_PARTICLE_POOL_CAPACITY,
      });
      const aosWebgl2Engine = new EngineAoS();
      const aosWebgl2Renderer = new WebGL2AosRender({
        ctx,
        translator,
      });
      const aosWebgl2Gameplay = new GameplayAoS();
      return new Game(aosWebgl2World, aosWebgl2Engine, aosWebgl2Renderer, aosWebgl2Gameplay, frameView);
    case 'canvas2d-aos':
    default:
      if (!(ctx instanceof CanvasRenderingContext2D)) {
        throw new Error('ctx must be a CanvasRenderingContext2D');
      }

      const aosCanvas2dWorld = new AoSWorld({
        blackHolePoolCapacity: CANVAS2D_BLACK_HOLE_POOL_CAPACITY,
        starPoolCapacity: CANVAS2D_STAR_POOL_CAPACITY,
        particlePoolCapacity: CANVAS2D_PARTICLE_POOL_CAPACITY,
      });
      const aosCanvas2dEngine = new EngineAoS();
      const aosCanvas2dRenderer = new Canvas2dAoSRender({
        ctx,
        translator,
      });
      const aosCanvas2dGameplay = new GameplayAoS();
      return new Game(aosCanvas2dWorld, aosCanvas2dEngine, aosCanvas2dRenderer, aosCanvas2dGameplay, frameView);
  }
}