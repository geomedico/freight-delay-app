'use client';

import { useRef, useEffect } from 'react';
import { GoogleMap, Polyline, MarkerF } from '@react-google-maps/api';

type LatLng = { lat: number; lng: number };

interface Props {
  path: LatLng[];
  polylineTrigger: boolean; 
};
export default function MapRenderer({ path, polylineTrigger }: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!window.google || typeof window.google.maps.Map !== 'function') {
      console.error('🛑 Google Maps JS library is not loaded!');
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || path.length < 2) {
      console.warn('Insufficient path points to draw polyline or center map');
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    path.forEach((coord) => {
      bounds.extend(coord);
    });

    console.log('🗺 Fitting bounds to:', {
      start: path[0],
      end: path[path.length - 1],
      totalPoints: path.length,
    });

    mapRef.current.fitBounds(bounds, 80);
  }, [path]);

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={path[0] || { lat: 47, lng: 7 }} 
      zoom={6}
      onLoad={(map) => {
        mapRef.current = map;

        if (path.length >= 2) {
          const bounds = new google.maps.LatLngBounds();
          path.forEach((coord) => bounds.extend(coord));
          map.fitBounds(bounds, 80);
        }
      }}
    >
      {path.length > 0 && (
        <>
          <Polyline
            path={path}
            options={{
              strokeColor: polylineTrigger ? '#FF0000' : '#0000FF',
              strokeOpacity: 0.9,
              strokeWeight: 4,
            }}
          />
          <MarkerF position={path[0]} label="A" title="Start" />
          <MarkerF position={path[path.length - 1]} label="B" title="End" />
        </>
      )}
    </GoogleMap>
  );
}
