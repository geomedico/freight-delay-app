import polyline from '@mapbox/polyline';

export function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  return polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));
}
