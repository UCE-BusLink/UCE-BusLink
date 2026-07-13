const EARTH_RADIUS_M: f64 = 6371000.0;

function toRad(deg: f64): f64 {
  return (deg * Math.PI) / 180.0;
}

export function haversineMeters(
  lat1: f64,
  lon1: f64,
  lat2: f64,
  lon2: f64
): f64 {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2.0) *
      Math.sin(dLon / 2.0);
  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  return EARTH_RADIUS_M * c;
}

export function estimateEtaMinutes(distanceMeters: f64, speedKmh: f64): f64 {
  if (speedKmh <= 0.5) return -1.0;
  const speedMetersPerMinute = (speedKmh * 1000.0) / 60.0;
  return distanceMeters / speedMetersPerMinute;
}
