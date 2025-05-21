import twilio from 'twilio';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Logger } from '../../lib/logger';
import { ErrorHandler } from '../../lib/utils/errorHandler';

interface ResponseData {
  message?: string;
  error?: string;
  workflowId?: string;
  ref?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsAppNumber = `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;

  if (!accountSid || !authToken || !fromWhatsAppNumber) {
    throw new Error('Missing Twilio credentials.');
  }

  const { recipient, message } = req.body;
  if (!recipient || !message) {
    return res.status(400).json({ error: 'Missing recipient or message in request body.' });
  }

  try {
    const client = twilio(accountSid, authToken);
    const response = await client.messages.create({
      body: message,
      from: fromWhatsAppNumber,
      to: `whatsapp:${recipient}`,
    });

    Logger.info(`Notification sent successfully. Message SID: ${response.sid}`);

    return res.status(200).json({ message: 'Notification sent successfully.', ref: response.sid });
  } catch (err: unknown) {
    console.error(`Notification err::`, err);

    const fallback = 'Failed to send notification via Twilio.';
    ErrorHandler.handle(err, fallback);
    return res.status(500).json({ error: fallback });
  }
}
