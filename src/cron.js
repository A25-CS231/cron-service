const dotenv = require("dotenv");
dotenv.config();

const cron = require("node-cron");
const pool = require("./config/database.js");
const runBatchComputation = require("./jobs/computeFeatures.js");
const logger = require("./utils/logger.js");

dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  "PGHOST",
  "PGPORT",
  "PGDATABASE",
  "PGUSER",
  "PGPASSWORD",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingEnvVars.length > 0) {
  logger.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

// Cron schedule = require(env or default to 2 AM daily
const cronSchedule = process.env.CRON_SCHEDULE || "0 2 * * *";

logger.info("╔═══════════════════════════════════════════════════════════╗");
logger.info("║          Feature Computation Cron Service Started         ║");
logger.info("╚═══════════════════════════════════════════════════════════╝");
logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
logger.info(`Cron Schedule: ${cronSchedule}`);
logger.info(
  `Database: ${process.env.PGDATABASE}@${process.env.PGHOST}:${process.env.PGPORT}`
);
logger.info(`Batch Size: ${process.env.BATCH_SIZE || 100}`);
logger.info(`Data Window: ${process.env.DATA_WINDOW_MONTHS || 6} months`);
logger.info("");

// Test database connection
async function testDatabaseConnection() {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    logger.info(`✓ Database connected successfully`);
    logger.info(`  Server time: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    logger.error("✗ Database connection failed:", error.message);
    return false;
  }
}

// Check if learner_features table exists
async function checkTableExists() {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'learner_features'
      );
    `);

    if (!result.rows[0].exists) {
      logger.error('✗ Table "learner_features" does not exist!');
      logger.error("  Please run the migration first.");
      return false;
    }

    logger.info('✓ Table "learner_features" exists');
    return true;
  } catch (error) {
    logger.error("✗ Error checking table:", error.message);
    return false;
  }
}

// Cron job handler
async function cronJobHandler() {
  logger.info("");
  logger.info("⏰ Cron job triggered");
  logger.info(`   Time: ${new Date().toISOString()}`);

  try {
    const result = await runBatchComputation();

    // Send notification if enabled
    if (process.env.ENABLE_NOTIFICATIONS === "true") {
      await sendNotification(result);
    }

    logger.info("✓ Cron job completed successfully");
  } catch (error) {
    logger.error("✗ Cron job failed:", error);

    // Send error notification if enabled
    if (process.env.ENABLE_NOTIFICATIONS === "true") {
      await sendErrorNotification(error);
    }
  }
}

async function sendNotification(result) {
  logger.info("Sending success notification...");
}

async function sendErrorNotification(error) {
  logger.info("Sending error notification...");
}

// Graceful shutdown handler
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    logger.info("");
    logger.info(`${signal} received. Shutting down gracefully...`);

    // Stop accepting new cron triggers
    if (global.cronTask) {
      global.cronTask.stop();
      logger.info("✓ Cron task stopped");
    }

    // Close database pool
    try {
      await pool.end();
      logger.info("✓ Database connections closed");
    } catch (error) {
      logger.error("Error closing database:", error);
    }

    logger.info("Goodbye! 👋");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

async function startCronService() {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      logger.error("Cannot start cron service without database connection");
      process.exit(1);
    }

    // Check if required table exists
    const tableExists = await checkTableExists();
    if (!tableExists) {
      logger.error("Cannot start cron service without required tables");
      process.exit(1);
    }

    // Validate cron schedule
    if (!cron.validate(cronSchedule)) {
      logger.error(`Invalid cron schedule: ${cronSchedule}`);
      process.exit(1);
    }

    logger.info("");
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.info("Starting cron scheduler...");

    // Schedule the cron job
    global.cronTask = cron.schedule(cronSchedule, cronJobHandler, {
      timezone: process.env.TZ || "Asia/Jakarta",
    });

    logger.info("✓ Cron job scheduled successfully");
    logger.info(`  Next run will be according to: ${cronSchedule}`);
    logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.info("");
    logger.info("Service is now running. Press Ctrl+C to stop.");
    logger.info("");

    // Optional: Run immediately on startup (comment out if not needed)
    if (process.env.RUN_ON_STARTUP === "true") {
      logger.info("RUN_ON_STARTUP enabled. Running initial computation...");
      setTimeout(() => {
        cronJobHandler();
      }, 5000); // Wait 5 seconds before first run
    }

    // Setup graceful shutdown
    setupGracefulShutdown();
  } catch (error) {
    logger.error("Failed to start cron service:", error);
    process.exit(1);
  }
}

startCronService();
