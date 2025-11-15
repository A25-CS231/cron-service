/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // 1. Table: users
  pgm.createTable("users", {
    id: { type: "integer", primaryKey: true }, // Bukan serial karena ID sudah ada (96989, etc)
    display_name: { type: "varchar(255)", notNull: false },
    name: { type: "varchar(255)", notNull: false },
    email: { type: "varchar(255)", notNull: false },
    phone: { type: "varchar(50)", notNull: false },
    user_role: { type: "integer", notNull: false }, // Integer (2 di contoh)
    user_verification_status: { type: "integer", notNull: false }, // Integer (1 di contoh)
    created_at: { type: "timestamp", notNull: false },
    updated_at: { type: "timestamp", notNull: false },
    deleted_at: { type: "timestamp", notNull: false },
    remember_token: { type: "varchar(255)", notNull: false },
    image_path: { type: "varchar(500)", notNull: false },
    city: { type: "varchar(255)", notNull: false },
    city_id: { type: "integer", notNull: false },
    custom_city: { type: "varchar(255)", notNull: false },
    unsubscribe_link: { type: "varchar(500)", notNull: false },
    tz: { type: "varchar(100)", notNull: false },
    verified_at: { type: "timestamp", notNull: false },
    ama: { type: "integer", notNull: false }, // Integer (0 di contoh)
    phone_verification_status: { type: "integer", notNull: false }, // Integer (0 di contoh)
    phone_verified_with: { type: "varchar(255)", notNull: false },
    verified_certificate_name: { type: "varchar(255)", notNull: false },
    verified_identity_document: { type: "varchar(500)", notNull: false },
  });

  // 2. Table: developer_journeys (nama tabel TANPA 's' di akhir berdasarkan CSV)
  pgm.createTable("developer_journeys", {
    id: { type: "integer", primaryKey: true },
    name: { type: "text", notNull: false },
    summary: { type: "text", notNull: false },
    point: { type: "integer", notNull: false, default: 0 },
    required_point: { type: "integer", notNull: false, default: 0 },
    xp: { type: "integer", notNull: false, default: 0 },
    required_xp: { type: "integer", notNull: false, default: 0 },
    difficulty: { type: "integer", notNull: false }, // Integer (2 di contoh)
    image_path: { type: "varchar(500)", notNull: false },
    status: { type: "integer", notNull: false }, // Integer (1 di contoh)
    listed: { type: "integer", notNull: false }, // Integer (1 di contoh)
    created_at: { type: "timestamp", notNull: false },
    updated_at: { type: "timestamp", notNull: false },
    description: { type: "text", notNull: false },
    logo_path: { type: "varchar(500)", notNull: false },
    banner_path: { type: "varchar(500)", notNull: false },
    platform_id: { type: "integer", notNull: false },
    instructor_id: { type: "integer", notNull: false }, // Integer 56229 (format ribuan di CSV)
    reviewer_id: { type: "integer", notNull: false },
    deadline: { type: "integer", notNull: false },
    trial_deadline: { type: "integer", notNull: false }, // Integer (135, 1 di contoh)
    reviewer_incentive: { type: "integer", notNull: false }, // Integer (30 di contoh)
    type: { type: "integer", notNull: false }, // Integer (1 di contoh)
    discount: { type: "integer", notNull: false, default: 0 },
    discount_ends_at: { type: "timestamp", notNull: false },
    media_cover: { type: "varchar(500)", notNull: false },
    installment_plan_id: { type: "integer", notNull: false },
    graduation: { type: "integer", notNull: false }, // Integer (1 di contoh)
    position: { type: "integer", notNull: false, default: 0 },
    hours_to_study: { type: "integer", notNull: false },
    video_subtitle: { type: "text", notNull: false },
    partner_logo: { type: "varchar(500)", notNull: false },
    teaching_methods: { type: "text", notNull: false },
  });

  // 4. Table: developer_journey_trackings
  pgm.createTable("developer_journey_trackings", {
    id: { type: "integer", primaryKey: true },
    journey_id: {
      type: "integer",
      notNull: false,
      references: "developer_journeys",
      onDelete: "CASCADE",
    },
    tutorial_id: {
      type: "integer",
      notNull: false,
    },
    developer_id: {
      type: "integer",
      notNull: false,
      references: "users",
      onDelete: "CASCADE",
    },
    status: { type: "integer", notNull: false }, // Integer (1 di contoh)
    last_viewed: { type: "timestamp", notNull: false },
    first_opened_at: { type: "timestamp", notNull: false },
    completed_at: { type: "timestamp", notNull: false },
    developer_journey_status_hash: { type: "varchar(255)", notNull: false },
  });

  // 5. Table: developer_journey_submissions
  pgm.createTable("developer_journey_submissions", {
    id: { type: "integer", primaryKey: true },
    journey_id: {
      type: "integer",
      notNull: false,
      references: "developer_journeys",
      onDelete: "CASCADE",
    },
    quiz_id: { type: "integer", notNull: false },
    submitter_id: {
      type: "integer",
      notNull: false,
      references: "users",
      onDelete: "CASCADE",
    },
    version_id: { type: "integer", notNull: false },
    app_link: { type: "text", notNull: false },
    app_comment: { type: "text", notNull: false },
    status: { type: "integer", notNull: false }, // Integer (1 di contoh)
    as_trial_subscriber: { type: "integer", notNull: false }, // Integer (0 di contoh)
    created_at: { type: "timestamp", notNull: false },
    updated_at: { type: "timestamp", notNull: false },
    admin_comment: { type: "text", notNull: false },
    reviewer_id: { type: "integer", notNull: false }, // Integer 18176 (format ribuan di CSV)
    current_reviewer: { type: "integer", notNull: false },
    started_review_at: { type: "timestamp", notNull: false },
    ended_review_at: { type: "timestamp", notNull: false },
    rating: { type: "integer", notNull: false }, // Integer (4 di contoh, bukan decimal)
    note: { type: "text", notNull: false },
    first_opened_at: { type: "timestamp", notNull: false },
    submission_duration: { type: "integer", notNull: false },
    pass_auto_checker: { type: "integer" }, // Integer (0 di contoh)
  });

  // 6. Table: developer_journey_completions
  pgm.createTable("developer_journey_completions", {
    id: { type: "integer", primaryKey: true },
    user_id: {
      type: "integer",
      notNull: false,
      references: "users",
      onDelete: "CASCADE",
    },
    journey_id: {
      type: "integer",
      notNull: false,
      references: "developer_journeys",
      onDelete: "CASCADE",
    },
    created_at: { type: "timestamp", notNull: false },
    updated_at: { type: "timestamp", notNull: false },
    enrolling_times: { type: "integer", notNull: false, default: 0 },
    enrollments_at: { type: "text", notNull: false }, // Text/CSV format di contoh
    last_enrolled_at: { type: "timestamp", notNull: false },
    study_duration: { type: "integer", notNull: false },
    avg_submission_rating: { type: "decimal(3,1)", notNull: false }, // 4.5 di contoh
  });

  // 7. Table: exam_registrations
  pgm.createTable("exam_registrations", {
    id: { type: "integer", primaryKey: true },
    exam_module_id: { type: "integer", notNull: false },
    tutorial_id: {
      type: "integer",
      notNull: false,
    },
    examinees_id: {
      type: "integer",
      notNull: false,
      references: "users",
      onDelete: "CASCADE",
    },
    status: { type: "integer", notNull: false }, // Integer (2 di contoh)
    created_at: { type: "timestamp", notNull: false },
    updated_at: { type: "timestamp", notNull: false },
    deadline_at: { type: "timestamp", notNull: false },
    retake_limit_at: { type: "timestamp", notNull: false },
    exam_finished_at: { type: "timestamp", notNull: false },
    deleted_at: { type: "timestamp", notNull: false },
  });

  // 8. Table: exam_results
  pgm.createTable("exam_results", {
    id: { type: "integer", primaryKey: true },
    exam_registration_id: {
      type: "integer",
      notNull: false,
      references: "exam_registrations",
      onDelete: "CASCADE",
    },
    total_questions: { type: "integer", notNull: false },
    score: { type: "integer", notNull: false }, // Integer (68 di contoh, bukan decimal)
    is_passed: { type: "integer", notNull: false }, // Integer (0 di contoh)
    created_at: { type: "timestamp", notNull: false },
    look_report_at: { type: "timestamp", notNull: false },
  });

  // 9. Table: learner_features (Pre-computed ML features)
  pgm.createTable("learner_features", {
    id: { type: "serial", primaryKey: true },
    user_id: {
      type: "integer",
      notNull: true,
      unique: true,
      references: "users",
      onDelete: "CASCADE",
    },

    // ===== METADATA =====
    last_updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    total_journeys_started: { type: "integer", notNull: true, default: 0 },
    total_journeys_completed: { type: "integer", notNull: true, default: 0 },

    // ===== KATEGORI 1: KECEPATAN BELAJAR (4 fitur) =====
    completion_rate: {
      type: "decimal(5,4)",
      notNull: false,
      comment: "Persentase journey diselesaikan (0-1)",
    },
    study_duration_ratio: {
      type: "decimal(5,2)",
      notNull: false,
      comment: "Rasio waktu belajar aktual vs estimasi",
    },
    avg_completion_time_per_tutorial: {
      type: "decimal(10,2)",
      notNull: false,
      comment: "Rata-rata jam untuk menyelesaikan 1 tutorial",
    },
    active_days_percentage: {
      type: "decimal(5,4)",
      notNull: false,
      comment: "Persentase hari aktif dari total periode (0-1)",
    },

    // ===== KATEGORI 2: KONSISTENSI (3 fitur) =====
    learning_frequency_per_week: {
      type: "decimal(5,2)",
      notNull: false,
      comment: "Rata-rata hari belajar per minggu",
    },
    avg_enrolling_times: {
      type: "decimal(5,2)",
      notNull: false,
      comment: "Rata-rata berapa kali mengulang journey yang sama",
    },
    total_study_days: {
      type: "integer",
      notNull: false,
      comment: "Total hari unik belajar",
    },

    // ===== KATEGORI 3: REVIEW & PERFEKSIONISME (4 fitur) =====
    revisit_rate: {
      type: "decimal(5,4)",
      notNull: false,
      comment: "Persentase tutorial yang dibuka lagi setelah selesai (0-1)",
    },
    revision_rate: {
      type: "decimal(5,4)",
      notNull: false,
      comment: "Persentase submission yang direvisi >1x (0-1)",
    },
    avg_submission_rating: {
      type: "decimal(3,2)",
      notNull: false,
      comment: "Rata-rata rating submission (1-5)",
    },
    quiz_retake_rate: {
      type: "decimal(5,4)",
      notNull: false,
      comment: "Persentase kuis yang diulang (0-1+)",
    },

    // ===== KATEGORI 4: PERFORMA (3 fitur) =====
    avg_exam_score: {
      type: "decimal(5,2)",
      notNull: false,
      comment: "Rata-rata skor ujian (0-100)",
    },
    exam_pass_rate: {
      type: "decimal(5,4)",
      notNull: false,
      comment: "Persentase ujian yang lulus (0-1)",
    },
    total_submissions: {
      type: "integer",
      notNull: false,
      comment: "Total submission yang pernah dikumpulkan",
    },

    // ===== ML PREDICTION =====
    predicted_learner_type: {
      type: "varchar(20)",
      notNull: false,
      comment: "fast / consistent / reflective",
    },
    prediction_confidence: {
      type: "decimal(5,4)",
      notNull: false,
      comment: "Confidence score (0-1)",
    },
    predicted_at: { type: "timestamp", notNull: false },

    // ===== QUALITY METRICS =====
    computation_duration_ms: { type: "integer", notNull: false },
    features_filled_count: {
      type: "integer",
      notNull: false,
      comment: "Berapa fitur yang terisi (dari 14)",
    },
    has_sufficient_data: { type: "boolean", notNull: false, default: false },
  });

  // Indexes

  // Create indexes for better query performance
  pgm.createIndex("users", "email");
  pgm.createIndex("users", "id");

  pgm.createIndex("developer_journey_trackings", [
    "journey_id",
    "developer_id",
  ]);
  pgm.createIndex("developer_journey_trackings", "tutorial_id");
  pgm.createIndex("developer_journey_trackings", "developer_id");

  pgm.createIndex("developer_journey_submissions", [
    "journey_id",
    "submitter_id",
  ]);
  pgm.createIndex("developer_journey_submissions", "submitter_id");

  pgm.createIndex("developer_journey_completions", ["user_id", "journey_id"]);
  pgm.createIndex("developer_journey_completions", "user_id");

  pgm.createIndex("exam_registrations", ["tutorial_id", "examinees_id"]);
  pgm.createIndex("exam_registrations", "examinees_id");

  pgm.createIndex("exam_results", "exam_registration_id");

  // Indexes for learner_features table
  pgm.createIndex("learner_features", "user_id");
  pgm.createIndex("learner_features", "predicted_learner_type");
  pgm.createIndex("learner_features", "has_sufficient_data");
  pgm.createIndex("learner_features", "last_updated_at");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Drop tables in reverse order to handle foreign key dependencies
  pgm.dropTable("learner_features");
  pgm.dropTable("exam_results");
  pgm.dropTable("exam_registrations");
  pgm.dropTable("developer_journey_completions");
  pgm.dropTable("developer_journey_submissions");
  pgm.dropTable("developer_journey_trackings");
  pgm.dropTable("developer_journeys");
  pgm.dropTable("users");
};
