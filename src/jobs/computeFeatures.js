const pool = require("../config/database.js");
const FeatureEngineeringService = require("../services/featureEngineer.js");
const featureService = new FeatureEngineeringService();
const logger = require("../utils/logger.js");

const runBatchComputation = async function () {
  const startTime = Date.now();
  const batchSize = parseInt(process.env.BATCH_SIZE) || 100;

  logger.info("=".repeat(60));
  logger.info("Starting batch feature computation...");
  logger.info(`Batch size: ${batchSize}`);
  logger.info("Analyzing entire user history (no time window)");
  logger.info("=".repeat(60));
  try {
    // Get users who have activity in database
    const usersResult = await pool.query(`
      SELECT DISTINCT u.id, u.email, u.display_name
      FROM users u
      INNER JOIN developer_journey_trackings djt ON u.id = djt.developer_id
      ORDER BY u.id
    `);

    const totalUsers = usersResult.rows.length;
    logger.info(`Found ${totalUsers} active users to process`);

    if (totalUsers === 0) {
      logger.warn("No active users found. Exiting.");
      return {
        success: true,
        processed: 0,
        errors: 0,
        skipped: 0,
        duration: 0,
      };
    }

    let processed = 0;
    let errors = 0;
    let skipped = 0;
    const errorDetails = [];

    // Process in batches to avoid memory issues
    for (let i = 0; i < totalUsers; i += batchSize) {
      const batch = usersResult.rows.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(totalUsers / batchSize);

      logger.info(
        `Processing batch ${batchNum}/${totalBatches} (${batch.length} users)`
      );

      const batchResults = await Promise.allSettled(
        batch.map(async (user) => {
          try {
            const result = await featureService.computeFeaturesForUser(user.id);

            if (result.success) {
              processed++;

              if (processed % 50 === 0) {
                logger.info(
                  `Progress: ${processed}/${totalUsers} (${(
                    (processed / totalUsers) *
                    100
                  ).toFixed(1)}%)`
                );
              }
            } else {
              skipped++;
              logger.debug(`Skipped user ${user.id}: ${result.reason}`);
            }

            return result;
          } catch (error) {
            errors++;
            logger.error(
              `Error processing user ${user.id} (${user.email}):`,
              error.message
            );
            errorDetails.push({
              user_id: user.id,
              email: user.email,
              error: error.message,
            });
            throw error;
          }
        })
      );

      // Log batch completion
      const batchSuccess = batchResults.filter(
        (r) => r.status === "fulfilled"
      ).length;
      const batchFailed = batchResults.filter(
        (r) => r.status === "rejected"
      ).length;
      logger.info(
        `Batch ${batchNum} completed: ${batchSuccess} success, ${batchFailed} failed`
      );

      if (i + batchSize < totalUsers) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    const avgTimePerUser =
      processed > 0 ? (duration / processed).toFixed(2) : 0;

    // Summary
    logger.info("=".repeat(60));
    logger.info("Batch processing completed!");
    logger.info(`Total users found: ${totalUsers}`);
    logger.info(`Successfully processed: ${processed}`);
    logger.info(`Skipped (insufficient data): ${skipped}`);
    logger.info(`Errors: ${errors}`);
    logger.info(`Total duration: ${duration.toFixed(2)}s`);
    logger.info(`Average per user: ${avgTimePerUser}s`);
    logger.info("=".repeat(60));

    if (errorDetails.length > 0) {
      logger.error("Error summary:");
      errorDetails.slice(0, 10).forEach((err) => {
        logger.error(`  - User ${err.user_id} (${err.email}): ${err.error}`);
      });
      if (errorDetails.length > 10) {
        logger.error(`  ... and ${errorDetails.length - 10} more errors`);
      }
    }

    return {
      success: true,
      processed,
      errors,
      skipped,
      duration,
      avgTimePerUser,
      errorDetails: errorDetails.slice(0, 10),
    };
  } catch (error) {
    logger.error("Fatal error in batch computation:", error);
    throw error;
  }
};

module.exports = runBatchComputation;

// Allow running directly via: node src/jobs/computeFeatures.js
if (require.main === module) {
  logger.info("Running feature computation manually...");

  runBatchComputation()
    .then((result) => {
      logger.info("Manual execution completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Manual execution failed:", error);
      process.exit(1);
    });
}
