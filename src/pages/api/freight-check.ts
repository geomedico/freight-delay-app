import { Connection, WorkflowClient } from '@temporalio/client';
import type { NextApiRequest, NextApiResponse } from 'next'

import { FreightDeliveryDelayWorkflow } from '@/lib/temporal/workflows';
import { ErrorHandler } from '../../lib/utils/errorHandler';
import { env } from '../../lib/utils/env.server'

interface ResponseData {
    message?: string;
    error?: string;
    workflowId?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {

    if (req.method === 'POST') {
        try {
            const { origin, destination, contact } = req.body;

            if (!origin || !destination || !contact) {
                return res.status(400).json(
                    { error: 'origin, destination, and contact are required fields' },
                );
            }

            const connection = await Connection.connect();
            const client = new WorkflowClient({
                connection,
            });

            const handle = await client.start(FreightDeliveryDelayWorkflow, {
                args: [origin, destination, contact, env.DELAY_THRESHOLD],
                taskQueue: env.QUEUE_NAME,
                workflowId: `freight-delay-${Date.now()}`,
            });
            const payload = await client.getHandle(handle.workflowId).result();

            return res.status(200).json({
                message: 'Freight Delivery Delay Workflow started',
                workflowId: handle.workflowId,
                ...payload
            });
        } catch (err: unknown) {
            return res.status(500).json(
                { error: ErrorHandler.handle(err, 'Unknown error occurred', 'FreightCheck') },
            );
        }
    } else {
        res.status(200).json({ message: 'Hello from freight delay app!' })
    }
}