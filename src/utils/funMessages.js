/**
 * Height-based messages - passive aggressive devil on your shoulder.
 */
export function getFunMessage(heightFeet) {
  if (heightFeet == null || heightFeet <= 0) return null;
  if (heightFeet < 2) return "That's it? Really?";
  if (heightFeet < 4) return "A toddler could do better.";
  if (heightFeet < 6) return "Could've been worse.";
  if (heightFeet < 8) return "Okay, that wasn't terrible.";
  if (heightFeet < 10) return "Not bad, not bad at all.";
  if (heightFeet < 14) return "Hellyeah.";
  if (heightFeet < 20) return "Hory Mory.";
  return "Hm. Interesting...";
}
