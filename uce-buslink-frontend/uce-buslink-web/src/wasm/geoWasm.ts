import initGeoWasm from './geo.wasm?init';

interface GeoWasmExports {
  haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number;
  estimateEtaMinutes(distanceMeters: number, speedKmh: number): number;
}

let exportsPromise: Promise<GeoWasmExports> | null = null;

function loadGeoWasm(): Promise<GeoWasmExports> {
  if (!exportsPromise) {
    exportsPromise = initGeoWasm().then(
      (instance) => instance.exports as unknown as GeoWasmExports
    );
  }
  return exportsPromise;
}

export async function distanceToStopMeters(
  busLat: number,
  busLon: number,
  stopLat: number,
  stopLon: number
): Promise<number> {
  const geo = await loadGeoWasm();
  return geo.haversineMeters(busLat, busLon, stopLat, stopLon);
}

export async function etaToStopMinutes(
  distanceMeters: number,
  speedKmh: number
): Promise<number | null> {
  const geo = await loadGeoWasm();
  const eta = geo.estimateEtaMinutes(distanceMeters, speedKmh);
  return eta < 0 ? null : eta;
}
