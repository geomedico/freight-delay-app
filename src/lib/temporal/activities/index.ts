
import { Logger } from '../../logger';
import { FetchDirectionsOutput, FetchDirectionsInput } from '../interfaces';
import { ErrorHandler } from '../../utils/errorHandler';
import { env } from '../../utils/env.server';

/**
 * Fetches an approximate travel time from the Google MAP API
 * using the `driving-traffic` profile, and returns it in minutes.
 *
 * @param from        String in the format City Name
 * @param to          String in the format City Name
 * @returns           Estimated travel time (minutes) polyline from Google
 */
export async function fetchTrafficData(
  params: FetchDirectionsInput
): Promise<FetchDirectionsOutput> {
  try {
    const { from, to } = params;

    const apiKey = env.NEXT_PUBLIC_TRAFFIC_API_KEY;
    if (!apiKey) throw new Error('Missing NEXT_PUBLIC_TRAFFIC_API_KEY');

    const endpoint = 'https://routes.googleapis.com/directions/v2:computeRoutes';
    const departureTime = new Date();
    departureTime.setMinutes(departureTime.getMinutes() + 1);

    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'routes.duration,routes.polyline.encodedPolyline',
    };

    const makeRequestBody = (routingPreference: 'TRAFFIC_AWARE' | 'TRAFFIC_UNAWARE') => ({
      origin: { address: from },
      destination: { address: to },
      travelMode: 'DRIVE',
      routingPreference,
      computeAlternativeRoutes: false,
      ...(routingPreference === 'TRAFFIC_AWARE' && {
        departureTime: departureTime.toISOString(),
      }),
    });

    const [resTraffic, resNoTraffic] = await Promise.all([
      fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(makeRequestBody('TRAFFIC_AWARE')),
      }),
      fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(makeRequestBody('TRAFFIC_UNAWARE')),
      }),
    ]);
 
    const [dataTraffic, dataNoTraffic] = await Promise.all([
      resTraffic.json(),
      resNoTraffic.json(),
    ]);

    const trafficDurationRaw = dataTraffic.routes?.[0]?.duration;
    const normalDurationRaw = dataNoTraffic.routes?.[0]?.duration;

    if (!trafficDurationRaw || !normalDurationRaw) {
      throw new Error('Missing duration fields in response');
    }

    const durationInTraffic = parseInt(trafficDurationRaw.replace('s', '').trim(), 10) || 5000;
    const duration = parseInt(normalDurationRaw.replace('s', '').trim(), 10);
    const delay = Math.abs(durationInTraffic - duration);
    const delayMinutes = Math.round(delay / 60);

    const polyline = dataTraffic.routes?.[0]?.polyline?.encodedPolyline ?? null;

    console.debug(`[Traffic] from=${from} to=${to} delay=${delayMinutes}min`);

    return {
      success: true,
      origin: from,
      destination: to,
      duration,
      durationInTraffic,
      delay,
      delayMinutes,
      polyline,
    };
  } catch (err: unknown) {
    console.log(err)
    return {
      success: false,
      error: ErrorHandler.handle(err, 'Failed to fetch traffic data.', 'TrafficService'),
    };
  }
}

/**
 * Generate a message via OpenAI
 * @param delayMinutes number
 * @returns Promise<string> - AI message or fallback on error
 */
export async function generateDelayMessage(delayMinutes: number): Promise<string> {
  try {
    Logger.info(`Generating message for delay of ${delayMinutes} minutes.`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly, helpful assistant generating delay notifications.'
          },
          {
            role: 'user',
            content: `We have a delay of ${delayMinutes} minutes. Please generate a short, empathetic message for cargo delivery.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const responseMsg = data?.choices?.[0]?.message?.content?.trim();

    if (!responseMsg) {
      throw new Error('No valid message found in response');
    }

    Logger.info(`Generated message: ${responseMsg}`);
    return responseMsg;
  } catch (err: unknown) {
    return ErrorHandler.handle(err, 'We are experiencing an unexpected delay. Thank you for your patience.', 'Open AI');
  }
}

/**
 * Send an SMS via Twilio.
 *
 * @param recipient The "to" phone number (E.164 format, e.g. "+1234567890")
 * @param message   The message text
 * @returns         Promise<string> (Twilio sid reference number)
 */

export async function sendNotification(recipient: string, message: string): Promise<string> {

  try {
    const res = await fetch('http://localhost:3000/api/send-wa-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, message }),
    });
    console.log('[DEBUG] fetch result:', res);
    Logger.info(`[sendNotification] status: ${res?.status}, ok: ${res?.ok}`);    // Logger.info(`[sendNotification] ok:, ${res.ok}`);

    if (!res || !res.ok) {
      let errText = 'Unknown error';
      try {
        const errData = await res.json();
        errText = errData.error || errText;
      } catch {
        errText = await res.text();
      }

      throw new Error(`Request failed: ${errText}`);
    }

    Logger.info('Notification sent successfully.');

    const result = await res.json();

    return result.ref;
  } catch (err) {
    console.log('errText::', err)

    const fallback = 'Failed to send notification.';
    ErrorHandler.handle(err, fallback, 'NotificationWAService');
    throw new Error(fallback);
  }
}
