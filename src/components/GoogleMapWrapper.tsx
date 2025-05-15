'use client';

import { useJsApiLoader } from '@react-google-maps/api';
import { ReactNode } from 'react';

interface Props {
  apiKey: string;
  children: ReactNode;
}

export default function GoogleMapWrapper({ apiKey, children }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'script-loader',
    version: 'weekly',
    libraries: ['places', 'routes'],
    region: 'US',
    language: 'en',
  });

  if (!isLoaded) return <div className="p-4">🗺 Loading map...</div>;

  return <>{children}</>;
}
