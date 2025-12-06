'use strict';

const cron = require('node-cron');
const eventStateService = require('../services/eventStateService');

/**
 * Event State Job
 * Automatic background job that updates event states based on scheduled time
 * 
 * Schedule: Every minute (at 0 seconds)
 * 
 * Tasks:
 * 1. Find events where calculated state differs from stored state
 * 2. Update events to correct state
 * 3. Log results and any errors
 * 
 * State Transitions:
 * - CLOSED → OPEN: When current time reaches start_time
 * - OPEN → CLOSED: When current time reaches end_time (start_time + duration)
 */

let cronJob = null;

/**
 * Initialize the event state job
 * Starts the cron scheduler
 * 
 * @returns {Object} - Job info with schedule and status
 */
exports.initEventStateJob = () => {
  try {
    if (cronJob) {
      console.log('⚠ Event state job already initialized');
      return {
        status: 'already_running',
        message: 'Job was already initialized',
      };
    }

    /**
     * Cron pattern: '0 * * * * *'
     * 
     * Field     | Allowed Values
     * ------    | -------
     * Seconds   | 0-59
     * Minutes   | 0-59
     * Hours     | 0-23
     * Date      | 1-31
     * Month     | 0-11
     * Day       | 0-6
     * 
     * Pattern '0 * * * * *' = Every minute at 0 seconds
     */
    cronJob = cron.schedule('0 * * * * *', async () => {
      await executeEventStateSync();
    });

    console.log('✓ Event state job initialized (runs every minute)');

    return {
      status: 'initialized',
      message: 'Event state job started',
      schedule: 'Every minute at 0 seconds',
      nextRun: new Date(Date.now() + 60000).toISOString(),
    };
  } catch (error) {
    console.error('✗ Failed to initialize event state job:', error);
    return {
      status: 'error',
      message: 'Failed to initialize job',
      error: error.message,
    };
  }
};

/**
 * Stop the event state job
 * Gracefully stops the cron scheduler
 * 
 * @returns {Object} - Stop result
 */
exports.stopEventStateJob = () => {
  try {
    if (!cronJob) {
      console.log('⚠ Event state job is not running');
      return {
        status: 'not_running',
        message: 'Job was not initialized',
      };
    }

    cronJob.stop();
    cronJob = null;

    console.log('✓ Event state job stopped');

    return {
      status: 'stopped',
      message: 'Event state job stopped',
    };
  } catch (error) {
    console.error('✗ Failed to stop event state job:', error);
    return {
      status: 'error',
      message: 'Failed to stop job',
      error: error.message,
    };
  }
};

/**
 * Check if job is running
 * 
 * @returns {boolean} - True if job is running
 */
exports.isEventStateJobRunning = () => {
  return cronJob !== null;
};

/**
 * Get job status
 * 
 * @returns {Object} - Job status details
 */
exports.getEventStateJobStatus = () => {
  return {
    running: cronJob !== null,
    schedule: 'Every minute at 0 seconds',
    pattern: '0 * * * * *',
    nextExecution: cronJob ? new Date(Date.now() + 60000).toISOString() : null,
  };
};

/**
 * Execute event state synchronization
 * Internal function called by cron schedule
 * 
 * @private
 * @returns {Promise<Object>} - Sync result
 */
async function executeEventStateSync() {
  const executionId = `exec-${Date.now()}`;
  const startTime = Date.now();

  try {
    // Get health check first
    const health = await eventStateService.healthCheck();

    // Only proceed if service is healthy and there are events to check
    if (health.status !== 'healthy') {
      console.warn(
        `[${executionId}] Health check failed:`,
        health.error
      );
      return;
    }

    if (health.eventsNeedingUpdate === 0) {
      // Silently skip if no updates needed (too verbose for every minute)
      return;
    }

    // Perform state synchronization
    const syncResult = await eventStateService.syncAllEventStates();

    const duration = Date.now() - startTime;

    if (syncResult.success && syncResult.eventsUpdated > 0) {
      console.log(
        `[${executionId}] ✓ Event state sync completed: ${syncResult.eventsUpdated} events updated (${duration}ms)`
      );
    } else if (syncResult.success) {
      // No events needed update
      return;
    } else {
      console.error(
        `[${executionId}] ✗ Event state sync failed: ${syncResult.message}`,
        syncResult.error
      );
    }

    return syncResult;
  } catch (error) {
    console.error(
      `[${executionId}] ✗ Unexpected error in event state sync:`,
      error
    );
  }
}

/**
 * Manual trigger for event state sync
 * Useful for testing or emergency syncs
 * 
 * @returns {Promise<Object>} - Sync result
 */
exports.triggerEventStateSync = async () => {
  try {
    console.log('⏱ Manually triggering event state synchronization...');
    const result = await eventStateService.syncAllEventStates();
    return result;
  } catch (error) {
    console.error('✗ Manual sync failed:', error);
    return {
      success: false,
      message: 'Manual sync failed',
      error: error.message,
    };
  }
};

/**
 * Schedule alternative: Using setInterval instead of cron
 * This is a fallback if node-cron is not available
 * 
 * @param {number} intervalMs - Interval in milliseconds (default: 60000 = 1 minute)
 * @returns {Object} - Interval info
 * 
 * Note: Use initEventStateJob() for cron-based scheduling
 */
exports.initEventStateJobWithInterval = (intervalMs = 60000) => {
  try {
    if (cronJob) {
      console.log('⚠ Event state job already running');
      return {
        status: 'already_running',
      };
    }

    // Use setInterval as fallback
    const intervalId = setInterval(async () => {
      await executeEventStateSync();
    }, intervalMs);

    // Store interval ID in cronJob variable for consistency
    cronJob = {
      stop: () => clearInterval(intervalId),
    };

    console.log(
      `✓ Event state job initialized with setInterval (${intervalMs}ms)`
    );

    return {
      status: 'initialized',
      method: 'setInterval',
      interval: intervalMs,
      message: 'Event state job started',
    };
  } catch (error) {
    console.error('✗ Failed to initialize interval job:', error);
    return {
      status: 'error',
      error: error.message,
    };
  }
};

/**
 * Graceful job management for process termination
 * Ensures the job is properly stopped when process exits
 * 
 * Should be called in server shutdown sequence
 */
exports.gracefulShutdown = () => {
  if (cronJob) {
    console.log('Shutting down event state job...');
    exports.stopEventStateJob();
  }
};
