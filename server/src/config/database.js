import mongoose from "mongoose";
import config from "./index.js";

/**
 * Connect to MongoDB database with retry mechanism
 * @param {number} retryAttempt - Current retry attempt (default: 0)
 * @param {number} maxRetries - Maximum number of retry attempts (default: 5)
 * @param {number} retryDelay - Delay between retries in ms (default: 5000)
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
export const connectDatabase = async (
  retryAttempt = 0,
  maxRetries = 5,
  retryDelay = 5000
) => {
  try {
    console.log(
      `Connecting to MongoDB (attempt ${retryAttempt + 1}/${maxRetries + 1})...`
    );

    // Set mongoose options
    mongoose.set("strictQuery", true);

    // Connect to MongoDB
    await mongoose.connect(config.db.uri, config.db.options);

    console.log("Connected to MongoDB database successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    // Retry logic
    if (retryAttempt < maxRetries) {
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return connectDatabase(retryAttempt + 1, maxRetries, retryDelay);
    }

    console.error(
      `Failed to connect to MongoDB after ${maxRetries + 1} attempts`
    );
    process.exit(1); // Exit with failure
  }
};

/**
 * Close MongoDB connection
 * @returns {Promise<void>}
 */
export const closeDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed successfully");
    }
  } catch (error) {
    console.error("Error closing MongoDB connection:", error.message);
  }
};

/**
 * Check if database is connected
 * @returns {boolean} True if connected, false otherwise
 */
export const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Set up mongoose event listeners
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

// Handle process termination
process.on("SIGINT", async () => {
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeDatabase();
  process.exit(0);
});
