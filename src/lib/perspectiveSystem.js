/**
 * Perspective System - Mathematical depth and scale calculation
 * 
 * Camera setup:
 * - FOV: 45 degrees vertical
 * - Camera height: 100 units (normalized)
 * - Render plane (closest): 10 units
 * - Far plane: 500 units
 */

const CAMERA_HEIGHT = 100;
const NEAR_PLANE = 10;
const FAR_PLANE = 500;
const FOV_VERTICAL = 45; // degrees
const FOV_RADIANS = (FOV_VERTICAL * Math.PI) / 180;

/**
 * Layer definitions: 6 layers from closest to farthest
 * Each layer has:
 * - depth: distance from camera (Z-axis)
 * - parallaxSpeed: 0-1 (1 = moves with camera at ground level, lower = slower parallax)
 * - scaleFactor: relative size of objects (1 = reference scale at depth)
 * - verticalOffset: % from bottom of viewport
 */
export const LAYERS = [
  {
    id: "foreground", // Layer 0: Closest grass/ground detail
    depth: 15,
    parallaxSpeed: 1.0,
    scaleFactor: 1.0,
    verticalOffset: 80,
    description: "Foreground grass - closest to camera"
  },
  {
    id: "near-shrubs", // Layer 1: Bushes/shrubs
    depth: 25,
    parallaxSpeed: 0.85,
    scaleFactor: 0.84,
    verticalOffset: 70,
    description: "Near shrubs and vegetation"
  },
  {
    id: "front-trees", // Layer 2: Front treeline
    depth: 40,
    parallaxSpeed: 0.65,
    scaleFactor: 0.67,
    verticalOffset: 50,
    description: "Front treeline with trunks and canopy"
  },
  {
    id: "mid-trees", // Layer 3: Middle treeline
    depth: 80,
    parallaxSpeed: 0.35,
    scaleFactor: 0.44,
    verticalOffset: 35,
    description: "Middle distance trees"
  },
  {
    id: "far-mountains", // Layer 4: Far mountains
    depth: 150,
    parallaxSpeed: 0.18,
    scaleFactor: 0.27,
    verticalOffset: 25,
    description: "Far mountain range"
  },
  {
    id: "sky", // Layer 5: Sky/stars - farthest
    depth: 300,
    parallaxSpeed: 0.01,
    scaleFactor: 0.11,
    verticalOffset: 0,
    description: "Sky and distant elements"
  }
];

/**
 * Calculate scale factor for an object at a given depth
 * Uses perspective formula: scale = 1 / (depth / NEAR_PLANE)
 */
export function getScaleAtDepth(depth) {
  return NEAR_PLANE / depth;
}

/**
 * Calculate parallax speed based on depth
 * Linear relationship: speed = 1 - (depth / FAR_PLANE)
 * Closer objects move faster, farther objects move slower
 */
export function getParallaxSpeedAtDepth(depth) {
  return Math.max(0.01, 1 - depth / FAR_PLANE);
}

/**
 * Calculate vertical position for a layer based on its depth
 * Objects farther away appear higher in the viewport
 * Formula: 1 - (depth / FAR_PLANE) * screenHeight
 */
export function getVerticalPositionAtDepth(depth, viewportHeight = 100) {
  const depthRatio = depth / FAR_PLANE;
  return (1 - depthRatio) * viewportHeight;
}

/**
 * Get a layer by its ID
 */
export function getLayer(id) {
  return LAYERS.find(l => l.id === id);
}

/**
 * Verify layer consistency - check that mathematical relationships are correct
 * Returns object with validation results
 */
export function validateLayers() {
  const results = [];
  
  LAYERS.forEach((layer, index) => {
    const calcScale = getScaleAtDepth(layer.depth);
    const calcParallax = getParallaxSpeedAtDepth(layer.depth);
    const calcVertical = getVerticalPositionAtDepth(layer.depth);
    
    results.push({
      id: layer.id,
      depth: layer.depth,
      configScale: layer.scaleFactor,
      calculatedScale: parseFloat(calcScale.toFixed(2)),
      configParallax: layer.parallaxSpeed,
      calculatedParallax: parseFloat(calcParallax.toFixed(2)),
      configVertical: layer.verticalOffset,
      calculatedVertical: parseFloat(calcVertical.toFixed(1)),
      index
    });
  });
  
  return results;
}

/**
 * Calculate object count for a layer based on viewport width and object size
 * Wider objects = fewer needed due to scaling
 */
export function calculateObjectCountForLayer(layerId, viewportWidth = 1280, baseObjectWidth = 50) {
  const layer = getLayer(layerId);
  if (!layer) return 0;
  
  // Scale object width based on layer depth
  const scaledWidth = baseObjectWidth * layer.scaleFactor;
  
  // Account for parallax tiling: need to cover faster-scrolling layers with more objects
  const tilingMultiplier = 1 / (Math.max(0.1, layer.parallaxSpeed) * 0.5);
  
  return Math.ceil((viewportWidth / scaledWidth) * tilingMultiplier);
}

/**
 * Export all layer configs for quick reference
 */
export const PERSPECTIVE_MATH = {
  CAMERA_HEIGHT,
  NEAR_PLANE,
  FAR_PLANE,
  FOV_VERTICAL,
  getScaleAtDepth,
  getParallaxSpeedAtDepth,
  getVerticalPositionAtDepth,
  validateLayers
};