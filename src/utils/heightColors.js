/**
 * Returns a color corresponding to throw height (in feet).
 * Low = soft blue/green → orange/red (higher) → purple → black (way too high).
 */
export function getColorForHeight(heightFeet) {
  if (heightFeet == null || heightFeet < 0) return '#94a3b8';
  if (heightFeet < 2) return '#93c5fd';   // soft blue
  if (heightFeet < 4) return '#67d4a2';   // soft green
  if (heightFeet < 6) return '#fbbf24';   // soft amber
  if (heightFeet < 8) return '#fb923c';   // orange
  if (heightFeet < 10) return '#f87171';  // soft red
  if (heightFeet < 14) return '#a78bfa';  // purple
  if (heightFeet < 20) return '#6366f1';  // indigo
  return '#1f2937';                        // dark / black - way too high
}

/**
 * Returns gradient colors for a given height (for buttons, cards, etc.).
 */
export function getGradientForHeight(heightFeet) {
  if (heightFeet == null || heightFeet < 0) return ['#94a3b8', '#64748b'];
  if (heightFeet < 2) return ['#93c5fd', '#bfdbfe'];
  if (heightFeet < 4) return ['#67d4a2', '#86efac'];
  if (heightFeet < 6) return ['#fbbf24', '#fde68a'];
  if (heightFeet < 8) return ['#fb923c', '#fdba74'];
  if (heightFeet < 10) return ['#f87171', '#fca5a5'];
  if (heightFeet < 14) return ['#a78bfa', '#c4b5fd'];
  if (heightFeet < 20) return ['#6366f1', '#818cf8'];
  return ['#1f2937', '#374151'];
}
