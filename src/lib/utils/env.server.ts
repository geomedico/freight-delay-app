'use server'
import dotenv from 'dotenv';

dotenv.config();

import { cleanEnv, str, num } from 'envalid';

export const env = cleanEnv(process?.env, {
  OPENAI_API_KEY: str(),
  NEXT_PUBLIC_TRAFFIC_API_KEY: str(),
  QUEUE_NAME: str(),
  NAMESPACE: str(),
  CONNECTION_ADDRESS: str(),
  TWILIO_ACCOUNT_SID: str(),
  TWILIO_AUTH_TOKEN: str(),
  TWILIO_PHONE_NUMBER: str(),
  DELAY_THRESHOLD: num({ default: 30 })
});
