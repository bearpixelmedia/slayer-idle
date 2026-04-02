import React from "react";

/**
 * Parallax mountain fallbacks inspired by typical vector “jagged range” silhouettes
 * (sharp peaks, cols, overlapping masses) — see e.g. stock silhouette references.
 * Far vs mid use different ridge spacing so scrolling separates the shapes and reads
 * as depth; scroll multipliers are tuned in ParallaxBackground (slow far / faster mid).
 */

const WRAP_STYLE = {
  display: "flex",
  width: "200%",
  height: "100%",
  alignItems: "flex-end",
  flexShrink: 0,
};

function seamlessStrip(viewH, defs, renderTile) {
  return (
    <div style={WRAP_STYLE}>
      <svg
        viewBox={`0 0 1920 ${viewH}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", minWidth: 0, display: "block" }}
        aria-hidden
      >
        <defs>{defs}</defs>
        <g>{renderTile()}</g>
        <g transform="translate(960,0)">{renderTile()}</g>
      </svg>
    </div>
  );
}

/** Distant range: low contrast, broad massifs + soft haze (moves very slowly in parallax). */
export function ParallaxMountainFarFallback() {
  const h = 200;
  return seamlessStrip(
    h,
    <>
      <linearGradient id="pm_far_mist" x1="0" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#1a3352" stopOpacity="0.32" />
        <stop offset="50%" stopColor="#3a5874" stopOpacity="0.24" />
        <stop offset="100%" stopColor="#5c7a90" stopOpacity="0.18" />
      </linearGradient>
      <linearGradient id="pm_far_back" x1="0" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#152a45" stopOpacity="0.68" />
        <stop offset="72%" stopColor="#2e4d6e" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#4a6a86" stopOpacity="0.34" />
      </linearGradient>
      <linearGradient id="pm_far_front" x1="0" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#1c3858" stopOpacity="0.82" />
        <stop offset="78%" stopColor="#385e82" stopOpacity="0.62" />
        <stop offset="100%" stopColor="#6e92ad" stopOpacity="0.32" />
      </linearGradient>
    </>,
    () => (
      <>
        <path
          d="M0,200 L0,136 Q 190,124 380,118 Q 580,112 770,120 Q 880,126 960,136 L960,200 Z"
          fill="url(#pm_far_mist)"
        />
        <path
          d="M0,200 L0,124
             C 72,124 92,108 142,106 C 192,104 228,122 288,112 C 348,102 388,120 448,112 C 508,104 548,122 612,114 C 676,106 722,124 782,116 C 842,108 888,122 932,118 C 952,116 960,124 960,124
             L960,200 Z"
          fill="url(#pm_far_back)"
        />
        <path
          d="M0,200 L0,110
             C 48,110 62,90 98,86 C 134,82 162,100 202,90 C 242,80 272,102 318,92 C 364,82 398,104 448,94 C 498,84 528,98 578,88 C 628,78 658,96 708,86 C 758,76 792,94 842,88 C 892,82 922,98 960,110
             L960,200 Z"
          fill="url(#pm_far_front)"
        />
      </>
    )
  );
}

/**
 * Mid range: sawtooth / jagged profile (cols between peaks), like common “mountain peaks
 * silhouette” vectors — moves faster than far layer so parallax separation is obvious.
 */
export function ParallaxMountainMidFallback() {
  const h = 228;
  return seamlessStrip(
    h,
    <>
      <linearGradient id="pm_mid_foot" x1="0" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#123222" stopOpacity="0.78" />
        <stop offset="62%" stopColor="#285536" stopOpacity="0.52" />
        <stop offset="100%" stopColor="#3d6e44" stopOpacity="0.36" />
      </linearGradient>
      <linearGradient id="pm_mid_main" x1="0" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#163828" stopOpacity="0.96" />
        <stop offset="70%" stopColor="#2a6238" stopOpacity="0.84" />
        <stop offset="100%" stopColor="#5aa060" stopOpacity="0.42" />
      </linearGradient>
      <linearGradient id="pm_mid_rim" x1="0" x2="0" y1="0" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0%" stopColor="#a8d4a8" stopOpacity="0.26" />
        <stop offset="40%" stopColor="#4a8a52" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#163828" stopOpacity="0" />
      </linearGradient>
    </>,
    () => (
      <>
        <path
          d="M0,228 L0,156
             C 88,156 112,138 188,132 C 264,126 312,148 398,140 C 484,132 532,152 618,144 C 704,136 752,154 838,148 C 898,144 938,158 960,156
             L960,228 Z"
          fill="url(#pm_mid_foot)"
        />
        <path
          d="M0,228 L0,118
             L 44,92 L 64,106 L 82,78 L 102,98 L 128,66 L 148,88 L 170,72 L 198,56 L 224,82 L 250,66 L 280,90 L 306,70 L 338,86 L 368,60 L 402,80 L 432,66 L 466,94 L 498,74 L 532,90 L 566,68 L 598,96 L 632,70 L 668,88 L 702,62 L 738,82 L 772,66 L 808,92 L 842,72 L 878,94 L 912,76 L 942,102 L 960,118
             L960,228 Z"
          fill="url(#pm_mid_main)"
        />
        <path
          d="M0,118
             L 44,92 L 64,106 L 82,78 L 102,98 L 128,66 L 148,88 L 170,72 L 198,56 L 224,82 L 250,66 L 280,90 L 306,70 L 338,86 L 368,60 L 402,80 L 432,66 L 466,94 L 498,74 L 532,90 L 566,68 L 598,96 L 632,70 L 668,88 L 702,62 L 738,82 L 772,66 L 808,92 L 842,72 L 878,94 L 912,76 L 942,102 L 960,118"
          fill="none"
          stroke="url(#pm_mid_rim)"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="miter"
        />
      </>
    )
  );
}
