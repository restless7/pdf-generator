import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';
import { EnhancedPDFGenerator, GenerationOptions } from './pdf-generator';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const pdfQueue = new Queue('pdf-generation', { connection });
export const pdfQueueEvents = new QueueEvents('pdf-generation', { connection });

export async function setupWorker(pdfGenerator: EnhancedPDFGenerator) {
  const worker = new Worker('pdf-generation', async (job: Job) => {
    const options = job.data as GenerationOptions;
    
    // Pass the BullMQ job ID so the generator knows about it
    // Or let the generator use its own, but we can map them
    const result = await pdfGenerator.generatePDF(options);
    
    // Wait until it's completed (if generatePDF is async but handles the status internally,
    // wait, generatePDF in EnhancedPDFGenerator returns immediately with status 'pending'
    // Let's modify our usage to poll or wait.
    
    const maxWaitTime = 120000;
    const pollInterval = 1000;
    let elapsedTime = 0;
    
    let currentJob = await pdfGenerator.getJob(result.id);
    
    while (currentJob && currentJob.status !== 'completed' && currentJob.status !== 'failed' && elapsedTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      elapsedTime += pollInterval;
      
      const updatedJob = await pdfGenerator.getJob(result.id);
      if (updatedJob) {
        currentJob = updatedJob;
      }
      
      if (currentJob) {
        await job.updateProgress(currentJob.progress);
      }
    }
    
    if (currentJob?.status === 'completed') {
      return { 
        pdfPath: currentJob.result?.pdfPath,
        metadata: currentJob.result?.metadata
      };
    } else {
      throw new Error(currentJob?.error || 'PDF Generation failed or timed out');
    }
  }, { connection });

  worker.on('completed', job => {
    console.log(`[Queue] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Queue] Job ${job?.id} failed with error ${err.message}`);
  });

  return worker;
}
