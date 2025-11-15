const pool = require("../config/database.js");
const logger = require("../utils/logger.js");

class FeatureEngineeringService {
  async computeFeaturesForUser(userId) {
    const client = await pool.connect();
    const startTime = Date.now();

    try {
      await client.query("BEGIN");

      // Check sufficient data
      const dataCheck = await this.checkSufficientData(client, userId);

      if (!dataCheck.has_data) {
        logger.info(`User ${userId} has insufficient data, skipping`);
        await client.query("ROLLBACK");
        return { success: false, reason: "insufficient_data" };
      }

      // Compute all 14 features
      let features = await this.computeAllFeatures(client, userId);

      // Sanitize features to handle edge cases and ensure consistency
      features = this.sanitizeFeatures(features);

      // Count how many features are filled
      const featuresFilled = this.countFilledFeatures(features);

      const computationDuration = Date.now() - startTime;

      // Upsert to learner_features table
      await client.query(
        `
        INSERT INTO learner_features (
          user_id,
          last_updated_at,
          total_journeys_started,
          total_journeys_completed,
          
          -- Speed (4)
          completion_rate,
          study_duration_ratio,
          avg_completion_time_per_tutorial,
          active_days_percentage,
          
          -- Consistency (3)
          learning_frequency_per_week,
          avg_enrolling_times,
          total_study_days,
          
          -- Review & Perfeksionisme (4)
          revisit_rate,
          revision_rate,
          avg_submission_rating,
          quiz_retake_rate,
          
          -- Performa (3)
          avg_exam_score,
          exam_pass_rate,
          total_submissions,
          
          -- Metadata
          computation_duration_ms,
          features_filled_count,
          has_sufficient_data
        ) VALUES (
          $1, NOW(), $2, $3,
          $4, $5, $6, $7,
          $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17,
          $18, $19, $20
        )
        ON CONFLICT (user_id) DO UPDATE SET
          last_updated_at = NOW(),
          total_journeys_started = EXCLUDED.total_journeys_started,
          total_journeys_completed = EXCLUDED.total_journeys_completed,
          completion_rate = EXCLUDED.completion_rate,
          study_duration_ratio = EXCLUDED.study_duration_ratio,
          avg_completion_time_per_tutorial = EXCLUDED.avg_completion_time_per_tutorial,
          active_days_percentage = EXCLUDED.active_days_percentage,
          learning_frequency_per_week = EXCLUDED.learning_frequency_per_week,
          avg_enrolling_times = EXCLUDED.avg_enrolling_times,
          total_study_days = EXCLUDED.total_study_days,
          revisit_rate = EXCLUDED.revisit_rate,
          revision_rate = EXCLUDED.revision_rate,
          avg_submission_rating = EXCLUDED.avg_submission_rating,
          quiz_retake_rate = EXCLUDED.quiz_retake_rate,
          avg_exam_score = EXCLUDED.avg_exam_score,
          exam_pass_rate = EXCLUDED.exam_pass_rate,
          total_submissions = EXCLUDED.total_submissions,
          computation_duration_ms = EXCLUDED.computation_duration_ms,
          features_filled_count = EXCLUDED.features_filled_count,
          has_sufficient_data = EXCLUDED.has_sufficient_data
      `,
        [
          userId,
          dataCheck.total_journeys_started,
          dataCheck.total_journeys_completed,
          features.completion_rate,
          features.study_duration_ratio,
          features.avg_completion_time_per_tutorial,
          features.active_days_percentage,
          features.learning_frequency_per_week,
          features.avg_enrolling_times,
          features.total_study_days,
          features.revisit_rate,
          features.revision_rate,
          features.avg_submission_rating,
          features.quiz_retake_rate,
          features.avg_exam_score,
          features.exam_pass_rate,
          features.total_submissions,
          computationDuration,
          featuresFilled,
          dataCheck.has_data,
        ]
      );

      await client.query("COMMIT");

      logger.info(
        `User ${userId}: ${featuresFilled}/14 features computed in ${computationDuration}ms`
      );

      return {
        success: true,
        duration: computationDuration,
        features_filled: featuresFilled,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error(`Error computing features for user ${userId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async checkSufficientData(client, userId) {
    const result = await client.query(
      `
      SELECT 
        COUNT(DISTINCT djt.journey_id) as total_journeys_started,
        COUNT(DISTINCT djc.journey_id) as total_journeys_completed
      FROM users u
      LEFT JOIN developer_journey_trackings djt ON u.id = djt.developer_id
      LEFT JOIN developer_journey_completions djc ON u.id = djc.user_id
      WHERE u.id = $1
    `,
      [userId]
    );

    const row = result.rows[0];
    return {
      has_data: parseInt(row.total_journeys_completed) >= 1,
      total_journeys_started: parseInt(row.total_journeys_started) || 0,
      total_journeys_completed: parseInt(row.total_journeys_completed) || 0,
    };
  }

  async computeAllFeatures(client, userId) {
    const result = await client.query(
      `
      WITH 
      -- Basic tracking stats
      tracking_stats AS (
        SELECT 
          COUNT(DISTINCT journey_id) as unique_journeys,
          COUNT(DISTINCT DATE(last_viewed)) as unique_days,
          MIN(first_opened_at) as first_activity,
          MAX(last_viewed) as last_activity,
          COUNT(*) as total_views,
          COUNT(DISTINCT tutorial_id) as unique_tutorials,
          COUNT(*) FILTER(WHERE completed_at IS NOT NULL) as completed_tutorials,
          COUNT(*) FILTER(WHERE completed_at IS NOT NULL AND last_viewed > completed_at) as revisited_tutorials,
          AVG(EXTRACT(EPOCH FROM (completed_at - first_opened_at)) / 3600) FILTER(
            WHERE completed_at IS NOT NULL 
              AND first_opened_at IS NOT NULL 
              AND completed_at > first_opened_at
              AND EXTRACT(EPOCH FROM (completed_at - first_opened_at)) < 3600 * 500
          ) as avg_hours_per_tutorial
        FROM developer_journey_trackings
        WHERE developer_id = $1
      ),
      
      -- Completion stats
      completion_stats AS (
        SELECT 
          COUNT(DISTINCT journey_id) as completed_journeys,
          MIN(created_at) as first_completion,
          AVG(study_duration) as avg_study_duration,
          AVG(enrolling_times) as avg_enrolling_times
        FROM developer_journey_completions
        WHERE user_id = $1
      ),
      
      -- Journey metadata (untuk study_duration_ratio)
      journey_ratios AS (
        SELECT 
          AVG(
            CASE 
              WHEN dj.hours_to_study > 0 AND dj.hours_to_study < 1000
              THEN ROUND(
                ((djc.study_duration)::numeric / dj.hours_to_study), 2
              )
              ELSE NULL
            END
          ) as avg_duration_ratio
        FROM developer_journey_completions djc
        LEFT JOIN developer_journeys dj ON djc.journey_id = dj.id
        WHERE djc.user_id = $1
      ),
      
      -- Submission stats
      submission_stats AS (
        SELECT 
          COUNT(DISTINCT quiz_id) as total_unique_quizzes,
          COUNT(DISTINCT CASE WHEN version_id > 1 THEN quiz_id END) as revised_quizzes,
          COUNT(*) as total_submissions,
          AVG(rating) FILTER(WHERE rating > 0) as avg_rating
        FROM developer_journey_submissions
        WHERE submitter_id = $1
      ),
      
      -- Exam stats
      exam_stats AS (
        SELECT 
          COUNT(DISTINCT er.id) as total_exams,
          COUNT(*) FILTER(WHERE ereg.deleted_at IS NOT NULL) as retaken_exams,
          COUNT(DISTINCT ereg.tutorial_id) as unique_exam_tutorials,
          AVG(er.score) as avg_score,
          COUNT(*) FILTER(WHERE er.is_passed = 1) as passed_exams
        FROM exam_results er
        JOIN exam_registrations ereg ON er.exam_registration_id = ereg.id
        WHERE ereg.examinees_id = $1
      )
      
      SELECT 
        -- SPEED FEATURES (5)
        COALESCE(
          cs.completed_journeys::FLOAT / NULLIF(ts.unique_journeys::FLOAT, 0),
          0
        )::DECIMAL(5,4) as completion_rate,
        
        COALESCE(jr.avg_duration_ratio, NULL)::DECIMAL(5,2) as study_duration_ratio,
        
        COALESCE(ts.avg_hours_per_tutorial, NULL)::DECIMAL(10,2) as avg_completion_time_per_tutorial,
        
        COALESCE(
          ts.unique_days::FLOAT / 
          NULLIF(EXTRACT(DAY FROM (ts.last_activity - ts.first_activity)) + 1, 0),
          0
        )::DECIMAL(5,4) as active_days_percentage,
        
        -- CONSISTENCY FEATURES (3)
        COALESCE(
          ts.unique_days::FLOAT / 
          NULLIF(EXTRACT(EPOCH FROM (ts.last_activity - ts.first_activity)) / 604800, 0),
          0
        )::DECIMAL(5,2) as learning_frequency_per_week,
        
        COALESCE(cs.avg_enrolling_times, NULL)::DECIMAL(5,2) as avg_enrolling_times,
        
        COALESCE(ts.unique_days, 0)::INTEGER as total_study_days,
        
        -- REVIEW & PERFEKSIONISME FEATURES (4)
        COALESCE(
          ts.revisited_tutorials::FLOAT / NULLIF(ts.completed_tutorials::FLOAT, 0),
          0
        )::DECIMAL(5,4) as revisit_rate,
        
        COALESCE(
          ss.revised_quizzes::FLOAT / NULLIF(ss.total_unique_quizzes::FLOAT, 0),
          0
        )::DECIMAL(5,4) as revision_rate,
        
        COALESCE(ss.avg_rating, NULL)::DECIMAL(3,2) as avg_submission_rating,
        
        COALESCE(
          es.retaken_exams::FLOAT / NULLIF(es.unique_exam_tutorials::FLOAT, 0),
          0
        )::DECIMAL(5,4) as quiz_retake_rate,
        
        -- PERFORMA FEATURES (3)
        COALESCE(es.avg_score, NULL)::DECIMAL(5,2) as avg_exam_score,
        
        COALESCE(
          es.passed_exams::FLOAT / NULLIF(es.total_exams::FLOAT, 0),
          0
        )::DECIMAL(5,4) as exam_pass_rate,
        
        COALESCE(ss.total_submissions, 0)::INTEGER as total_submissions
        
      FROM tracking_stats ts
      CROSS JOIN completion_stats cs
      CROSS JOIN journey_ratios jr
      CROSS JOIN submission_stats ss
      CROSS JOIN exam_stats es
    `,
      [userId]
    );

    return result.rows[0];
  }

  countFilledFeatures(features) {
    let filled = 0;
    const featureKeys = [
      "completion_rate",
      "study_duration_ratio",
      "avg_completion_time_per_tutorial",
      "active_days_percentage",
      "learning_frequency_per_week",
      "avg_enrolling_times",
      "total_study_days",
      "revisit_rate",
      "revision_rate",
      "avg_submission_rating",
      "quiz_retake_rate",
      "avg_exam_score",
      "exam_pass_rate",
      "total_submissions",
    ];

    featureKeys.forEach((key) => {
      const value = features[key];
      if (value !== null && value !== undefined && !isNaN(parseFloat(value))) {
        filled++;
      }
    });

    return filled;
  }
  sanitizeFeatures(features) {
    const sanitized = { ...features };

    // Ensure all numeric values are valid numbers
    Object.keys(sanitized).forEach((key) => {
      const value = sanitized[key];

      // Convert null to 0 for rate and count fields
      if (value === null || value === undefined) {
        if (
          key.includes("rate") ||
          key === "total_submissions" ||
          key === "total_study_days"
        ) {
          sanitized[key] = 0;
        }
      }

      // Cap learning_frequency_per_week at reasonable maximum (7 days)
      if (key === "learning_frequency_per_week" && parseFloat(value) > 7) {
        logger.warn(
          `learning_frequency_per_week value ${value} exceeds 7 days, capping to 7`
        );
        sanitized[key] = 7.0;
      }

      // Ensure rates are between 0 and 1
      if (key.includes("rate")) {
        const numValue = parseFloat(sanitized[key]);
        if (numValue > 1) {
          logger.warn(`${key} value ${numValue} exceeds 1.0, capping to 1.0`);
          sanitized[key] = 1.0;
        }
        if (numValue < 0) {
          logger.warn(`${key} value ${numValue} is negative, setting to 0`);
          sanitized[key] = 0;
        }
      }

      // Ensure exam score is between 0 and 100
      if (key === "avg_exam_score") {
        const numValue = parseFloat(sanitized[key]);
        if (numValue > 100) {
          logger.warn(`avg_exam_score value ${numValue} exceeds 100, capping`);
          sanitized[key] = 100;
        }
        if (numValue < 0) {
          sanitized[key] = 0;
        }
      }
    });

    return sanitized;
  }
}

module.exports = FeatureEngineeringService;
