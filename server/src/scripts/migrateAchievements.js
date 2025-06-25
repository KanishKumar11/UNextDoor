#!/usr/bin/env node

/**
 * Achievement Migration Script
 *
 * This script handles:
 * 1. Initializing achievements in the database
 * 2. Setting up achievement tracking for existing users
 * 3. Backfilling user progress data for achievement calculations
 *
 * Usage:
 * node server/src/scripts/migrateAchievements.js [--force] [--users-only] [--achievements-only]
 */

import mongoose from "mongoose";
import config from "../config/index.js";
import { initializeAchievements } from "../services/achievementService.js";
import {
  batchInitializeUsers,
  ensureUserAchievementTracking,
} from "../services/userInitializationService.js";
import User from "../models/User.js";
import UserProgress from "../models/UserProgress.js";

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  force: args.includes("--force"),
  usersOnly: args.includes("--users-only"),
  achievementsOnly: args.includes("--achievements-only"),
  help: args.includes("--help") || args.includes("-h"),
};

// Help text
const HELP_TEXT = `
Achievement Migration Script

Usage: node server/src/scripts/migrateAchievements.js [options]

Options:
  --force              Force re-initialization even if data exists
  --users-only         Only migrate user data, skip achievement initialization
  --achievements-only  Only initialize achievements, skip user migration
  --help, -h          Show this help message

Examples:
  node server/src/scripts/migrateAchievements.js
  node server/src/scripts/migrateAchievements.js --force
  node server/src/scripts/migrateAchievements.js --users-only
`;

/**
 * Connect to MongoDB
 */
const connectDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(config.db.uri);
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("⚠️ Error disconnecting from MongoDB:", error);
  }
};

/**
 * Get all users that need achievement tracking setup
 */
const getUsersNeedingMigration = async () => {
  try {
    console.log("🔍 Finding users that need achievement tracking setup...");

    // Get all active users
    const users = await User.find({
      status: "active",
    })
      .select("_id email username")
      .lean();

    console.log(`📊 Found ${users.length} active users`);

    // Check which users don't have proper progress tracking
    const usersNeedingMigration = [];

    for (const user of users) {
      const userProgress = await UserProgress.findOne({ userId: user._id });

      if (!userProgress) {
        usersNeedingMigration.push(user);
        continue;
      }

      // Check if user progress has all required fields for achievement tracking
      const needsUpdate =
        !userProgress.skillProgress ||
        !userProgress.streak ||
        !userProgress.lessonProgress ||
        !userProgress.moduleProgress ||
        !userProgress.practiceSessions;

      if (needsUpdate) {
        usersNeedingMigration.push(user);
      }
    }

    console.log(
      `🎯 ${usersNeedingMigration.length} users need achievement tracking setup`
    );
    return usersNeedingMigration;
  } catch (error) {
    console.error("❌ Error finding users needing migration:", error);
    throw error;
  }
};

/**
 * Migrate achievements
 */
const migrateAchievements = async () => {
  try {
    console.log("🏆 Starting achievement migration...");

    const result = await initializeAchievements(flags.force);

    if (result.success) {
      console.log(`✅ Achievement migration completed: ${result.message}`);
      console.log(
        `📊 Stats: ${result.count} achievements, ${result.duration}ms duration`
      );
    } else {
      console.error("❌ Achievement migration failed:", result.error);
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error("❌ Error during achievement migration:", error);
    throw error;
  }
};

/**
 * Migrate users
 */
const migrateUsers = async () => {
  try {
    console.log("👥 Starting user migration...");

    const usersNeedingMigration = await getUsersNeedingMigration();

    if (usersNeedingMigration.length === 0) {
      console.log(
        "✅ All users already have proper achievement tracking setup"
      );
      return { success: true, migrated: 0 };
    }

    console.log(`🔄 Migrating ${usersNeedingMigration.length} users...`);

    // Process users in batches of 10 for better performance
    const batchSize = 10;
    let totalMigrated = 0;
    let totalFailed = 0;

    for (let i = 0; i < usersNeedingMigration.length; i += batchSize) {
      const batch = usersNeedingMigration.slice(i, i + batchSize);
      const userIds = batch.map((user) => user._id.toString());

      console.log(
        `📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          usersNeedingMigration.length / batchSize
        )}: ${userIds.length} users`
      );

      const batchResult = await batchInitializeUsers(userIds);

      if (batchResult.success) {
        totalMigrated += batchResult.results.successful;
        totalFailed += batchResult.results.failed;

        console.log(
          `✅ Batch completed: ${batchResult.results.successful}/${userIds.length} successful`
        );

        if (batchResult.results.errors.length > 0) {
          console.warn("⚠️ Batch errors:", batchResult.results.errors);
        }
      } else {
        console.error("❌ Batch failed:", batchResult.error);
        totalFailed += userIds.length;
      }
    }

    console.log(
      `🎉 User migration completed: ${totalMigrated} successful, ${totalFailed} failed`
    );

    return {
      success: true,
      migrated: totalMigrated,
      failed: totalFailed,
      total: usersNeedingMigration.length,
    };
  } catch (error) {
    console.error("❌ Error during user migration:", error);
    throw error;
  }
};

/**
 * Main migration function
 */
const runMigration = async () => {
  const startTime = Date.now();

  try {
    console.log("🚀 Starting Achievement System Migration");
    console.log("📅 Timestamp:", new Date().toISOString());
    console.log("🏷️ Flags:", flags);
    console.log("─".repeat(50));

    await connectDatabase();

    const results = {};

    // Run achievement migration
    if (!flags.usersOnly) {
      results.achievements = await migrateAchievements();
    }

    // Run user migration
    if (!flags.achievementsOnly) {
      results.users = await migrateUsers();
    }

    const duration = Date.now() - startTime;

    console.log("─".repeat(50));
    console.log("🎉 Migration completed successfully!");
    console.log(`⏱️ Total duration: ${duration}ms`);
    console.log("📊 Results:", JSON.stringify(results, null, 2));

    return results;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("─".repeat(50));
    console.error("❌ Migration failed!");
    console.error(`⏱️ Duration: ${duration}ms`);
    console.error("💥 Error:", error.message);

    if (process.env.NODE_ENV === "development") {
      console.error("📋 Stack trace:", error.stack);
    }

    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

/**
 * Entry point
 */
const main = async () => {
  if (flags.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  // Validate environment
  if (!config.db.uri) {
    console.error("❌ Database URI not configured");
    process.exit(1);
  }

  await runMigration();
};

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the migration
main().catch(console.error);
