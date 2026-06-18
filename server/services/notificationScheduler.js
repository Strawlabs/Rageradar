const cron = require('node-cron');
const NotificationManager = require('./notificationManager');
const { supabase } = require('../supabase');

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
      // Get all unique brand_ids from analyses
      const { data: analyses, error } = await supabase
        .from('analyses')
        .select('brand_id, user_id, brand_name');
      
      const uniqueBrands = new Map();
      if (analyses) {
        analyses.forEach(row => {
          if (row.brand_id) {
            uniqueBrands.set(row.brand_id, {
              id: row.brand_id,
              userId: row.user_id,
              name: row.brand_name
            });
          }
        });
      }
      
      for (const brand of uniqueBrands.values()) {
        const brandId = brand.id;

        // Get 2 recent analyses for this brand
        const { data: recentAnalyses, error: recentError } = await supabase
          .from('analyses')
          .select('weighted_sentiment_score')
          .eq('brand_id', brandId)
          .order('created_at', { ascending: false })
          .limit(2);

        if (recentAnalyses && recentAnalyses.length >= 2) {
          const currentSentiment = recentAnalyses[0].weighted_sentiment_score;
          const previousSentiment = recentAnalyses[1].weighted_sentiment_score;

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
      const { data: users, error } = await supabase
        .from('users')
        .select('*');

      if (error || !users) return;

      const enabledUsers = users.filter(u => {
        const prefs = u.notifications || { dailySummary: { enabled: true } };
        return prefs.dailySummary?.enabled !== false;
      });

      for (const userData of enabledUsers) {
        const userId = userData.id;

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
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Get user's unique brand names from analyses
    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('brand_id, brand_name')
      .eq('user_id', userId);
    
    const uniqueBrands = [];
    const seen = new Set();
    if (analyses) {
      analyses.forEach(row => {
        if (row.brand_name && !seen.has(row.brand_name.toLowerCase())) {
          seen.add(row.brand_name.toLowerCase());
          uniqueBrands.push({
            id: row.brand_id,
            name: row.brand_name
          });
        }
      });
    }

    let totalMentions = 0;
    let totalSentiment = 0;
    let sentimentCount = 0;

    for (const brand of uniqueBrands) {
      // Get analyses for this brand in the last day
      const { data: dailyAnalyses } = await supabase
        .from('analyses')
        .select('search_results, weighted_sentiment_score')
        .eq('brand_id', brand.id)
        .gte('created_at', oneDayAgo.toISOString());
      
      if (dailyAnalyses && dailyAnalyses.length > 0) {
        dailyAnalyses.forEach(row => {
          const list = row.search_results || [];
          totalMentions += list.length;
          totalSentiment += row.weighted_sentiment_score;
          sentimentCount++;
        });
      }
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