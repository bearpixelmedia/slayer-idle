export function formatNumber(num) {
  if (num === undefined || num === null || !isFinite(num)) return "0";
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs < 1000) return sign + Math.floor(abs).toString();
  if (abs < 1e6) return sign + (abs / 1e3).toFixed(1) + "K";
  if (abs < 1e9) return sign + (abs / 1e6).toFixed(1) + "M";
  if (abs < 1e12) return sign + (abs / 1e9).toFixed(1) + "B";
  if (abs < 1e15) return sign + (abs / 1e12).toFixed(1) + "T";
  return sign + (abs / 1e15).toFixed(1) + "Q";
}