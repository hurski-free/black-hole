/**
 * Rules for constants
 * 
 * Short names:
 * 
 * BH - Black Hole
 * STR - Star, STRS - Stars
 * SNV - Supernova
 * PTC - Particle, PTCS - Particles
 * 
 * VELO - Velocity
 * MUL - Multiplier
 * INC - Increment
 * DEC - Decrement
 * COEF - Coefficient
 * EXPL - Explosion
 */

// *****************************************************
// * GLOBAL CONSTANTS PART
// *****************************************************

/**
 * Common gravitational constant, all gravity impacts will multiplies on this value
 */
export const COMMON_GRAVITY_CONSTANT = 0.0053;

export const PTC_ABSORBED_BY_BLACK_HOLE_SCORE = 0.01;
export const SNV_EXPLOSION_SCORE = 100;
// *****************************************************
// * STAR CONSTANTS PART
// *****************************************************

export const STR_GRAVITY_MPL = 3;

/**
 * Star will auto disappear if raduis is less than this value
 */
export const STR_DISAPPEAR_RADIUS = 3;

/**
 * Star auto decrease own radius each cycle
 */
export const STR_RADIUS_SUB_ON_UPDATE = 0.0008;

/**
 * Minimum radius to interact with star by hover
 */
export const STR_MIN_RADIUS = 10;
export const STR_MAX_RADIUS = 60;

/**
 * Helper for calculate color of star
 */
export const STR_MAX_MINUS_MIN = STR_MAX_RADIUS - STR_MIN_RADIUS;
export const STR_HOVER_RADIUS_INC = 0.66;

/**
 * If star X and star Y are closer than coefficient * (starX.radius + starY.radius), then they will collide
 */
export const STR_COLLISION_COEF = 0.8;

/**
 * If star X larger than star Y with coefficient, then star X will absorb star Y
 */
export const STR_ABSORB_MPL = 2;

// *****************************************************
// * SUPERNOVA CONSTANTS PART
// *****************************************************

export const SNV_RADIUS_INC = 2.8;
export const SNV_RADIUS_DEC = 3.8;
export const SNV_RADIUS_MIN = STR_MIN_RADIUS * 1.4;
export const SNV_RADIUS_MAX = STR_MAX_RADIUS * 1.8;
export const SNV_STAR_SPAWN_RADIUS = STR_MIN_RADIUS * 1.4;
export const SNV_MIN_STRS_SPAWN = 0.7;
export const SNV_MAX_STRS_SPAWN = 2.9;
export const SNV_STR_SPAWN_MIN_VELO = 0.2;
export const SNV_STR_SPAWN_MAX_VELO = 0.4;
export const SNV_MIN_PTC_SPAWN = 50;
export const SNV_MAX_PTC_SPAWN = 120;
export const SNV_PTC_SPAWN_MIN_VELO = 0.15; // * 60 = 9px/s
export const SNV_PTC_SPAWN_MAX_VELO = 0.3; // * 60 = 18px/s

// *****************************************************
// * PARTICLE CONSTANTS PART
// *****************************************************

export const PTC_RADIUS = 1;

/**
 * Coefficient of particles which must be multiplied with star radius to get the number of particles after explosion
 */
export const PTC_AFTER_STR_EXPL_MIN_COUNT = 15;
export const PTC_AFTER_STR_EXPL_MAX_COUNT = 40;
export const PTC_AFTER_STR_EXPL_MIN_RADIUS = 0.6;
export const PTC_AFTER_STR_EXPL_MAX_RADIUS = 0.95;

export const PTC_AFTER_STAR_EXPL_MIN_VELO = 0.2;
export const PTC_AFTER_STAR_EXPL_MAX_VELO = 0.22;

// *****************************************************
// * BLACK HOLE CONSTANTS PART
// *****************************************************

export const BH_FIRST_APPEAR_TIME_REMAINS = 5000; // ms
export const BH_NEXT_APPEAR_TIME_REMAINS = 60000; // ms
export const BH_APPEAR_RADIUS = 20;

/**
 * Show black hole time when remain 10 seconds
 */
export const BH_SHOW_TIME_APPEAR_MIN_TIME = 10000;

export const BH_GRAVITY_MPL = 450;


export const BH_STR_ABSORB_MIN_RADIUS = 250;
/**
 * Additional distance to absorb star, 
 */
export const BH_STR_ABSORB_RADIUS_MPL = 10;
export const BH_STR_ABSORB_PTCS_GENERATE_MPL = 0.3;
export const BH_STR_ABSORB_PTCS_MIN_RADIUS = 0.98;
export const BH_STR_ABSORB_PTCS_MAX_RADIUS = 1.03;
export const BH_STR_ABSORB_DELTA_RADIUS_MPL = 0.0017;

export const BG_COLLISION_COEF = 0.8;