const cron = require('node-cron');
const NotificationManager = require('./notificationManager');

class NotificationScheduler {
  constructor() {
    this.notificationManager = new NotificationManager();
    this.jobs = new Map();
  }

  /**
   * Start all scheduled notification jobs
   */
  start() {
    console.log('🕐 Starting notification scheduler...');

    // Weekly reports - Every Monday at 9 AM
    const weeklyReportsJob = cron.schedule('0 9 * * 1', async () => {
      console.log('📊 Running weekly reports job...');
      try {
        await this.notificationManager.sendWeeklyReports();
      } catch (error) {
        console.error('Weekly reports job failed:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/New_York"
    });

    // Rage spike monitoring - Every 30 minutes
    const rageSpikeJob = cron.schedule('*/30 * * * *', async () => {
      console.log('🚨 Checking for rage spikes...');
      try {
        await this.checkAllBrandsForRageSpikes();
      } catch (error) {
        console.error('Rage spike monitoring job failed:', error);
      }
    }, {
      scheduled: false
    });

    // Daily summary - Every day at 6 PM
    const dailySummaryJob = cron.schedule('0 18 * * *', async () => {
      console.log('📈 Running daily summary job...');
      try {
        await this.sendDailySummaries();
      } catch (error) {
        console.error('Daily summary job failed:', error);
      }
    }, {
      scheduled: false,
      timezone: "America/New_York"
    });

    // Store jobs for management
    this.jobs.set('weeklyReports', weeklyReportsJob);
    this.jobs.set('rageSpikes', rageSpikeJob);
    this.jobs.set('dailySummary', dailySummaryJob);

    // Start all jobs
    weeklyReportsJob.start();
    rageSpikeJob.start();
    dailySummaryJob.start();

    console.log('✅ Notification scheduler started with jobs:');
    console.log('  - Weekly reports: Mondays at 9 AM');
    console.log('  - Rage spike monitoring: Every 30 minutes');
    console.log('  - Daily summaries: Daily at 6 PM');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log('🛑 Stopping notification scheduler...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`  - Stopped ${name} job`);
    });

    this.jobs.clear();
    console.log('✅ Notification scheduler stopped');
  }

  /**
   * Check all brands for rage spikes
   */
  async checkAllBrandsForRageSpikes() {
    try {
      const admin = require('firebase-admin');
      const db = admin.firestore();

      // Get all brands
      const brandsSnapshot = await db.collection('brands').get();
      
      for (const brandDoc of brandsSnapshot.docs) {
        const brandData = brandDoc.data();
        const brandId = brandDoc.id;

        // Get recent sentiment data for this brand
        const recentAnalysisSnapshot = await db.collection('analysis')
          .where('brandId', '==', brandId)
          .orderBy('timestamp', 'desc')
          .limit(2)
          .get();

        if (recentAnalysisSnapshot.docs.length >= 2) {
          const [current, previous] = recentAnalysisSnapshot.docs;
          const currentSentiment = current.data().overallSentiment;
          const previousSentiment = previous.data().overallSentiment;

          // Check for rage spike
          await this.notificationManager.checkRageSpikes(
            brandId,
            currentSentiment,
            previousSentiment
          );
        }
      }
    } catch (error) {
      console.error('Error checking brands for rage spikes:', error);
    }
  }

  /**
   * Send daily summaries to users who have them enabled
   */
  async sendDailySummaries() {
    try {
      const admin = require('firebase-admin');
      const db = admin.firestore();

      // Get users with daily summaries enabled
      const usersSnapshot = await db.collection('users')
        .where('notifications.dailySummary.enabled', '==', true)
        .get();

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;

        try {
          // Generate daily summary data
          const summaryData = await this.generateDailySummaryData(userId);
          
          if (summaryData.totalMentions > 0) {
            // Send daily summary email
            await this.notificationManager.emailService.sendSystemNotification(
              userData.email,
              'daily_summary',
              `Your daily RageRadar summary is ready with ${summaryData.totalMentions} new mentions.`,
              {
                additionalInfo: `Average sentiment: ${summaryData.avgSentiment.toFixed(1)}`,
                actionUrl: `${process.env.CLIENT_URL}/dashboard`,
                actionText: 'View Dashboard'
              }
            );
          }
        } catch (error) {
          console.error(`Error sending daily summary to user ${userId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error sending daily summaries:', error);
    }
  }

  /**
   * Generate daily summary data for a user
   */
  async generateDailySummaryData(userId) {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Get user's brands
    const brandsSnapshot = await db.collection('brands')
      .where('userId', '==', userId)
      .get();

    let totalMentions = 0;
    let totalSentiment = 0;
    let sentimentCount = 0;

    for (const brandDoc of brandsSnapshot.docs) {
      const brandId = brandDoc.id;

      // Get mentions for this brand in the last day
      const mentionsSnapshot = await db.collection('mentions')
        .where('brandId', '==', brandId)
        .where('timestamp', '>=', oneDayAgo)
        .get();

      const mentions = mentionsSnapshot.docs.map(doc => doc.data());
      totalMentions += mentions.length;

      // Calculate sentiment
      mentions.forEach(mention => {
        if (mention.score !== undefined) {
          totalSentiment += mention.score;
          sentimentCount++;
        }
      });
    }

    const avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0;

    return {
      totalMentions,
      avgSentiment
    };
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    const status = {
      running: this.jobs.size > 0,
      jobs: []
    };

    this.jobs.forEach((job, name) => {
      status.jobs.push({
        name,
        running: job.running || false,
        lastDate: job.lastDate || null,
        nextDate: job.nextDate || null
      });
    });

    return status;
  }

  /**
   * Manually trigger a specific job
   */
  async triggerJob(jobName) {
    switch (jobName) {
      case 'weeklyReports':
        return await this.notificationManager.sendWeeklyReports();
      case 'rageSpikes':
        return await this.checkAllBrandsForRageSpikes();
      case 'dailySummary':
        return await this.sendDailySummaries();
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }
}

module.exports = NotificationScheduler;