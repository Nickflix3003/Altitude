# Altitude - Phone Throw Height Tracker

A fun app that measures how high you can throw your phone using the accelerometer.

## How to Run

1. Install Expo Go on your iPhone from the App Store.
2. Run the dev server:
   ```
   npm start
   ```
3. Scan the QR code with your iPhone camera to open in Expo Go.

**Important:** You must test on a physical device. The iOS simulator has no accelerometer.

## How to Use

1. Tap **Ready to throw** to arm the detector.
2. Throw your phone straight up (gently at first—try a soft surface like a bed!).
3. Catch it. The app calculates height from freefall time.
4. Tap **Throw again** for another attempt.

## Sensor Debug

Tap **Sensor Debug** (top right) to see raw accelerometer values and magnitude in real time. Use this to verify the sensor works on your device:

- At rest: magnitude ~1g
- During freefall: magnitude ~0g

## Calibration

If throws aren't detected reliably, adjust the thresholds in `src/hooks/useThrowDetector.js`:

- `FREEFALL_THRESHOLD` (default 0.2g): Below this = freefall
- `CATCH_THRESHOLD` (default 1.5g): Above this = caught
- `MIN_FREEFALL_MS` (default 200ms): Shorten to catch quick tosses; lengthen to ignore noise
