/**
 * @jest-environment node
 */

import { fetchTrafficData, generateDelayMessage, sendNotification } from '../src/lib/temporal/activities';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

global.fetch = jest.fn();

describe('fetchTrafficData', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
  });

  it('should return traffic data correctly', async () => {
    const mockResponse = (duration: string, polyline = 'abc123') => ({
      routes: [
        {
          duration,
          polyline: {
            encodedPolyline: polyline,
          },
        },
      ],
    });

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse('600s'), // traffic-aware
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse('0s'), // traffic-unaware
      });

    const result = await fetchTrafficData({ from: 'Zurich', to: 'Bern' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.delayMinutes).toBe(10);
      expect(result.polyline).toBe('abc123');
    }
  });
});


describe('generateDelayMessage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
  });

  it('should return message from OpenAI', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'There is a delay of 10 minutes. Thank you for your patience.',
            },
          },
        ],
      }),
    });

    const msg = await generateDelayMessage(10);
    expect(msg).toContain('There is a delay');
  });

  it('should fallback on OpenAI error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => 'API error',
      status: 500,
    });

    const msg = await generateDelayMessage(10);
    expect(msg).toContain('unexpected delay');
  });
});

describe('sendNotification', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
  });

  it('should send notification successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Notification sent successfully.' }),
      text: async () => 'Notification sent successfully.',
      headers: {
        get: () => 'application/json',
      },
    });

    await expect(
      sendNotification('+1234567890', 'Your package is delayed')
    ).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/send-wa-message',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: '+1234567890',
          message: 'Your package is delayed',
        }),
      })
    );
  });

  it('should throw on failed notification with known error', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: 400,
    json: async () => ({ error: 'Failed to send' }),
    text: async () => 'Failed to send',
    headers: {
      get: () => 'application/json',
    },
  });

  await expect(
    sendNotification('+1234567890', 'Your package is delayed')
  ).rejects.toThrow('Failed to send notification.');
});
});


