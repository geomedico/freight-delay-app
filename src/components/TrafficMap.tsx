'use client';

import { useEffect, useState, useCallback } from 'react';
import { FetchDirectionsOutput } from '@/lib/temporal/interfaces';
import { decodePolyline } from '@/lib/utils/decodePolyline';
import RouteStats from './RouteStats';
import MapRenderer from './MapRenderer';
import GoogleMapWrapper from './GoogleMapWrapper';

type Props = {
  origin: string;
  destination: string;
  contact: string;
};

export default function TrafficMap({ origin, destination, contact }: Props) {
  const [path, setPath] = useState<{ lat: number; lng: number }[]>([]);
  const [routeInfo, setRouteInfo] = useState<null | FetchDirectionsOutput>(null);
  const [apiKey] = useState<string | null>(process.env.NEXT_PUBLIC_TRAFFIC_API_KEY!);

  const loadRoute = useCallback(async() => {
      const res = await fetch('/api/freight-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, contact }),
      });

      const result: FetchDirectionsOutput = await res.json();

      if (result.success && result.polyline) {
        const decoded = decodePolyline(result.polyline);
        setPath(decoded);
      }

      setRouteInfo(result);
    }, [origin, destination, contact]);

  useEffect(() => {
    if (!apiKey) return;

    loadRoute();
  }, [apiKey, loadRoute]);

  if (!apiKey) return <div className="p-4">🔐 Loading API key...</div>;

  return (
    <GoogleMapWrapper apiKey={apiKey}>
      <div className="p-4 bg-white rounded shadow space-y-6">
        {routeInfo?.success ? (
          <>
            <RouteStats
              origin={routeInfo.origin}
              destination={routeInfo.destination}
              duration={routeInfo.duration}
              twilioRef={routeInfo.ref}
              durationInTraffic={routeInfo.durationInTraffic}
              delayMinutes={routeInfo.delayMinutes ?? null}
            />

            <div className="w-full h-[500px] border rounded overflow-hidden">
              {path.length > 0 && (
                <MapRenderer
                  polylineTrigger={Boolean(routeInfo.ref)}
                  path={path}
                />
              )}
            </div>
          </>
        ) : (
          <div className="p-4 flex items-center justify-center gap-2 bg-blue-100 text-blue-800 border border-blue-300 rounded animate-pulse">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span>Loading traffic data...</span>
          </div>
        )}
      </div>
    </GoogleMapWrapper>
  );
}
