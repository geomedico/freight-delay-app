interface Props {
  origin: string;
  destination: string;
  duration: number;
  durationInTraffic: number;
  delayMinutes: number | null;
  twilioRef?: string;
};

export default function RouteStats({ twilioRef, origin, destination, duration, durationInTraffic, delayMinutes }: Props) {
  return (
    <div className="text-sm text-gray-700 space-y-1">
      <h2 className="text-lg font-semibold">Route from {origin} to {destination}</h2>
      <p><strong>Normal duration:</strong> {(duration / 60).toFixed(1)} min</p>
      <p><strong>With traffic:</strong> {(durationInTraffic / 60).toFixed(1)} min</p>
      <p><strong>Delay:</strong> {delayMinutes ?? '0'} min</p>
      { twilioRef && <p><strong>Twilio:</strong> { twilioRef } </p> }
    </div>
  );
}
