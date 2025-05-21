import { proxyActivities } from '@temporalio/workflow';
import { Logger } from '../../logger';
import { FetchDirectionsOutput } from '../../temporal/interfaces'
import { ErrorHandler } from '../../utils/errorHandler';

import type * as Activities from '../activities';

const {
  fetchTrafficData,
  generateDelayMessage,
  sendNotification
} = proxyActivities<typeof Activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
  },
});

export async function FreightDeliveryDelayWorkflow(
  origin: string,
  destination: string,
  contact: string,
  delayThreshold: number
): Promise<FetchDirectionsOutput> {

  try {
    const result = await fetchTrafficData({ from: origin, to: destination });
    
    if (result.success && result.delayMinutes > delayThreshold) {
      const message = await generateDelayMessage(result.delayMinutes);
      const ref = await sendNotification(contact, message);
      result.ref = ref;
    } else {
      Logger.info(`Delay is under threshold: ${result.success && result.delayMinutes} min. No notification sent.`);
    }
    return result;

  } catch (err: unknown) {
    return {
      success: false,
      error: ErrorHandler.handle(err, 'Failed workflow.', 'Workflow'),
    };  
  }
}