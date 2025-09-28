#!/usr/bin/env node

/**
 * Monthly Usage Reset Script
 *
 * This script should be run at the beginning of each month to reset
 * all users' usage statistics. You can set this up as a cron job or
 * run it manually.
 *
 * To run: node scripts/monthly-reset.js
 */

const { SubscriptionService } = require('../services/SubscriptionService');

async function runMonthlyReset() {
  console.log('🔄 Starting monthly usage reset for all users...');

  try {
    await SubscriptionService.resetAllUsersMonthly();
    console.log('✅ Monthly reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Monthly reset failed:', error);
    process.exit(1);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  runMonthlyReset();
}

module.exports = { runMonthlyReset };