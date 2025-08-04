import Bull from 'bull';
import { EMAIL_CONFIG } from './email.config.js';

// Configuration des queues Redis
export const QUEUE_CONFIG = {
  redis: EMAIL_CONFIG.QUEUE.redis,
  
  // Options par défaut pour les jobs
  defaultJobOptions: EMAIL_CONFIG.QUEUE.defaultJobOptions,

  // Configuration spécifique pour chaque queue
  queues: {
    email: {
      name: 'email-queue',
      concurrency: 5, // Nombre de jobs traités en parallèle
      options: {
        ...EMAIL_CONFIG.QUEUE.defaultJobOptions,
        delay: 0 // Pas de délai par défaut
      }
    },
    notification: {
      name: 'notification-queue',
      concurrency: 10,
      options: {
        removeOnComplete: 200,
        removeOnFail: 100,
        attempts: 2,
        backoff: {
          type: 'fixed',
          delay: 1000
        }
      }
    },
    batch: {
      name: 'batch-queue',
      concurrency: 2,
      options: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 3000
        }
      }
    }
  }
};

// Création des instances de queues
// Nous allons créer et exporter directement la queue de notification
export const NotificationQueue = new Bull(
  QUEUE_CONFIG.queues.notification.name,
  {
    redis: QUEUE_CONFIG.redis,
    defaultJobOptions: QUEUE_CONFIG.queues.notification.options
  }
);

// Vous pouvez toujours garder createQueues si vous en avez besoin pour d'autres queues
export const createQueues = () => {
  const queues = {};
  
  Object.entries(QUEUE_CONFIG.queues).forEach(([key, config]) => {
    if (key !== 'notification') { // Ne pas recréer la queue de notification
      queues[key] = new Bull(config.name, {
        redis: QUEUE_CONFIG.redis,
        defaultJobOptions: config.options
      });
    }
  });
  queues.notification = NotificationQueue; // Assurez-vous que l'instance est incluse
  return queues;
};

// Configuration du monitoring des queues
export const setupQueueMonitoring = (queues) => {
  Object.entries(queues).forEach(([name, queue]) => {
    queue.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed in queue ${name}`);
    });

    queue.on('failed', (job, err) => {
      console.error(`❌ Job ${job.id} failed in queue ${name}:`, err.message);
    });

    queue.on('stalled', (job) => {
      console.warn(`⚠️ Job ${job.id} stalled in queue ${name}`);
    });

    queue.on('progress', (job, progress) => {
      console.log(`📊 Job ${job.id} progress in queue ${name}: ${progress}%`);
    });
  });
};
