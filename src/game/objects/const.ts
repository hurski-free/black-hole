export const COMMON_GRAVITATIONAL_CONSTANT = 0.001;
export const BLACK_HOLE_GRAVITY_COEFFICIENT = 10;
export const STAR_GRAVITY_COEFFICIENT = 1;

export const PARTICLE_RADIUS = 1;

export const STAR_DISAPPEAR_RADIUS = 5;
export const STAR_RADIUS_SUB_ON_UPDATE = 0.003;
export const STAR_MIN_SIZE = 20;
export const STAR_MAX_SIZE = 70;
export const STAR_MAX_MINUS_MIN = STAR_MAX_SIZE - STAR_MIN_SIZE;

export const BLACK_HOLE_POOL_CAPACITY = 1000;
export const STAR_POOL_CAPACITY = 5000;
export const PARTICLE_POOL_CAPACITY = 50000;

export const INITIAL_STAR_COUNT = 2;
export const INITIAL_BLACK_HOLE_COUNT = 1;
export const INITIAL_BLACK_HOLE_RADIUS = 10;

export const STAR_COLLISION_COEFFICIENT = 0.8;
export const STAR_ABSORB_MULTIPLIER = 2;

/**
 * Coefficient of particles which must be multiplied with star mass to get the number of particles after explosion
 */
export const PARTICLES_AFTER_STAR_EXP_MIN_COUNT = 15;
export const PARTICLES_AFTER_STAR_EXP_MAX_COUNT = 40;
export const PARTICLES_AFTER_STAR_EXP_MIN_R = 0.6;
export const PARTICLES_AFTER_STAR_EXP_MAX_R = 0.95;

export const PARTICLES_AFTER_STAR_EXP_MIN_V = 0.2;
export const PARTICLES_AFTER_STAR_EXP_MAX_V = 0.22;

/**
 * 5 seconds
 */
export const FIRST_BLACK_HOLE_TIME_REMAINS = 5000;
/**
 * 60 seconds
 */
export const NEXT_BLACK_HOLE_TIME_REMAINS = 60000;
/**
 * Show black hole time when remain 10 seconds
 */
export const BLACK_HOLE_TIME_APPEAR_MIN_TIME = 10000;

export const BLACK_HOLE_STAR_ABSORB_DISTANCE_MULTIPLIER = 3;
export const BLACK_HOLE_STAR_ABSORB_DISTANCE_MIN = 300;
export const BLACK_HOLE_STAR_ABSORB_PARTICLES_GENERATE_MULTIPLIER = 3;
export const BLACK_HOLE_STAR_ABSORB_RADIUS_MULTIPLIER = 0.02;
export const BLACK_HOLE_STAR_ABSORB_PARTICLES_MIN_R = 0.99;
export const BLACK_HOLE_STAR_ABSORB_PARTICLES_MAX_R = 1.05;
