export interface FetchDirectionsInput {
  from: string;
  to: string;
  apiKey?: string;
}

export interface DirectionsResult {
  success: true;
  origin: string;
  destination: string;
  duration: number; // in seconds
  durationInTraffic: number; // in seconds
  delay: number; // in seconds
  delayMinutes: number; // in minutes
  polyline: string | null;
  ref?:string;
}

export interface DirectionsError {
  success: false;
  error: string;
}

export type FetchDirectionsOutput = DirectionsResult | DirectionsError;