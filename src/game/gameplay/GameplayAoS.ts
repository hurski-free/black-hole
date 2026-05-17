import type { ImmutableFrameView } from "../FrameView";
import type { IGameSession } from "../GameSession";
import { random } from "../math";
import { OBJ_STATE_EXIST } from "../objects/aos/Object";
import { BH_APPEAR_RADIUS, BH_FIRST_APPEAR_TIME_REMAINS, BH_NEXT_APPEAR_TIME_REMAINS, STR_HOVER_RADIUS_INC, STR_MIN_RADIUS } from "../objects/const";
import type { AoSWorld } from "../world/AoSWorld";
import type { IGameplay } from "./IGameplay";

export class GameplayAoS implements IGameplay<AoSWorld> {
  private starQueueIndex = 0;
  private blackHoleQueueIndex = 0;

  initStartData(world: AoSWorld, frameView: ImmutableFrameView, gameSession: IGameSession): void {
    const star1 = world.stars.getNewObject();
    star1.x = random(frameView.halfWidth * 0.2, frameView.halfWidth);
    star1.y = random(-frameView.halfHeight * 0.8, frameView.halfHeight * 0.8);
    star1.velocityX = 0;
    star1.velocityY = 0;
    star1.accelerationX = 0;
    star1.accelerationY = 0;
    star1.radius = 40;
    star1.deltaRadius = 0;
    star1.isSupernova = false;
    
    const star2 = world.stars.getNewObject();
    star2.x = random(-frameView.halfWidth, -frameView.halfWidth * 0.2);
    star2.y = random(-frameView.halfHeight * 0.8, frameView.halfHeight * 0.8);
    star2.velocityX = 0;
    star2.velocityY = 0;
    star2.accelerationX = 0;
    star2.accelerationY = 0;
    star2.radius = 40;
    star2.deltaRadius = 0;
    star2.isSupernova = false;

    gameSession.blackHoleTimeRemains = BH_FIRST_APPEAR_TIME_REMAINS;
  }

  tryBlackHoleAppear(world: AoSWorld, frameView: ImmutableFrameView, gameSession: IGameSession): void {
    const blackHole = world.blackHoles.getNewObject();

    let x = frameView.camera[0];
    let y = frameView.camera[1];

    if (world.stars.activeCount > 0) {
      const star = world.stars.at(0);

      x = star.x;
      y = star.y;
    } else if (world.blackHoles.activeCount > 0) {
      const blackHole = world.blackHoles.at(0);

      x = blackHole.x;
      y = blackHole.y;
    }

    blackHole.x = x + random(-frameView.halfWidth, frameView.halfWidth);
    blackHole.y = y + random(-frameView.halfHeight, frameView.halfHeight);
    blackHole.velocityX = 0;
    blackHole.velocityY = 0;
    blackHole.accelerationX = 0;
    blackHole.accelerationY = 0;
    blackHole.deltaRadius = 0;
    blackHole.radius = BH_APPEAR_RADIUS;

    gameSession.blackHoleTimeRemains = BH_NEXT_APPEAR_TIME_REMAINS;
  }

  hoverStar(world: AoSWorld, frameView: ImmutableFrameView, mouseX: number, mouseY: number): void {
    const x = mouseX + frameView.camera[0];
    const y = mouseY + frameView.camera[1];

    const starsCount = world.stars.activeCount;
    const stars = world.stars.getArray();
    
    for (let i = 0; i < starsCount; i++) {
      // avoid hover on not existing or supernova, also star less than disappear radius not affected by hover
      if (stars[i].state === OBJ_STATE_EXIST && !stars[i].isSupernova && stars[i].radius > STR_MIN_RADIUS) {
        const star = stars[i];
        const dis = Math.hypot(x - star.x, y - star.y);
        
        if (dis < star.radius) {
          star.deltaRadius += STR_HOVER_RADIUS_INC;
        }
      }
    }
  }

  moveToStar(world: AoSWorld, frameView: ImmutableFrameView): void {
    const starsCount = world.stars.activeCount;
    if (starsCount < 1) return;

    if (this.starQueueIndex >= starsCount) {
      this.starQueueIndex = 0;
    }

    
    const star = world.stars.at(this.starQueueIndex);
    frameView.camera[0] = star.x - frameView.halfWidth;
    frameView.camera[1] = star.y - frameView.halfHeight;

    this.starQueueIndex += 1;
    if (this.starQueueIndex >= starsCount) {
      this.starQueueIndex = 0;
    }
  }

  moveToBlackHole(world: AoSWorld, frameView: ImmutableFrameView): void {
    const blackHolesCount = world.blackHoles.activeCount;
    if (blackHolesCount < 1) return;

    if (this.blackHoleQueueIndex >= blackHolesCount) {
      this.blackHoleQueueIndex = 0;
    }

    const blackHole = world.blackHoles.at(this.blackHoleQueueIndex);
    frameView.camera[0] = blackHole.x - frameView.halfWidth;
    frameView.camera[1] = blackHole.y - frameView.halfHeight;

    this.blackHoleQueueIndex += 1;
    if (this.blackHoleQueueIndex >= blackHolesCount) {
      this.blackHoleQueueIndex = 0;
    }
  }
}