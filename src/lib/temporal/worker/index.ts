'use server'
import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from '../activities';

import { Logger } from '../../logger';
import { env } from '../../utils/env.server';

async function runWorker() {
    const connection = await NativeConnection.connect({
        address: env.CONNECTION_ADDRESS,
    });
    try {
        const worker = await Worker.create({
            connection,
            workflowsPath: require.resolve('../workflows'),
            activities,
            taskQueue: env.QUEUE_NAME,
            namespace: env.NAMESPACE,
            bundlerOptions: {
              ignoreModules: ['fs', 'path', 'os', 'crypto'],
            }
        });
        Logger.info('Temporal Worker started. Listening for tasks...');
        await worker.run();
    } finally {
        await connection.close();
    }
}

runWorker().catch((err) => {
    Logger.error(err);
    process.exit(1);
});