const G = 9.81; // m/s^2
const METERS_TO_FEET = 3.28084;
const CALIBRATION_FACTOR = 1.45; // Tune based on real throws (7 ft actual ~ 4.8 ft raw)

/**
 * Calculate throw height from freefall airtime.
 * Formula: height = g * t^2 / 8
 * (Phone spends half the time going up, half coming down)
 * @param {number} airtimeSeconds - Total time in freefall (seconds)
 * @returns {{ meters: number, feet: number }}
 */
export function heightFromAirtime(airtimeSeconds) {
  if (airtimeSeconds <= 0 || !Number.isFinite(airtimeSeconds)) {
    return { meters: 0, feet: 0 };
  }
  let meters = (G * airtimeSeconds * airtimeSeconds) / 8;
  meters *= CALIBRATION_FACTOR;
  const feet = meters * METERS_TO_FEET;
  return { meters, feet };
}

/**
 * Parabolic height at time t for throw with max height H and total airtime T.
 * h(t) = 4 * H * (t/T) * (1 - t/T)
 */
export function heightAtTime(t, maxHeight, totalTime) {
  if (totalTime <= 0) return 0;
  const ratio = t / totalTime;
  return 4 * maxHeight * ratio * (1 - ratio);
}
