import cron from 'node-cron';
import { prisma } from '../configs/prisma';

  const job = cron.schedule(' 0 * * * * ', async () => {
    console.log('Running session cleanup...', new Date().toISOString());
    
    try {
        const cutoffDate = new Date();
      
        const result = await prisma.session.deleteMany({
          where: {
            expires: {
              lt: cutoffDate
            }
          }
        });

      console.log(`Successfully cleaned up ${result.count} expired sessions at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Failed to clean up sessions:', error);
    }
  });

  // Start the job
job.start();

