import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    audioUrl: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    grammar: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      corrections: [
        {
          original: String,
          corrected: String,
          explanation: String,
        },
      ],
    },
    vocabulary: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      suggestions: [
        {
          original: String,
          suggested: String,
          explanation: String,
        },
      ],
    },
    pronunciation: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      issues: [
        {
          word: String,
          correctSound: String,
          explanation: String,
        },
      ],
    },
    overall: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      strengths: [String],
      weaknesses: [String],
      advice: String,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    scenarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scenario",
      // Make scenarioId optional for free conversations
      required: false,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    languageCode: {
      type: String,
      default: "ko",
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    messages: [messageSchema],
    feedback: feedbackSchema,
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0,
    },
    performance: {
      type: Number, // Overall performance score (0-100)
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search
// Explicitly exclude languageCode from text index to avoid language override issues
conversationSchema.index(
  { title: "text" },
  { language_override: "indexLanguage" }
);

// Add method to add a message
conversationSchema.methods.addMessage = function (
  role,
  content,
  audioUrl = null
) {
  this.messages.push({
    role,
    content,
    audioUrl,
    timestamp: new Date(),
  });
  this.lastMessageAt = new Date();
  return this;
};

// Add method to add feedback
conversationSchema.methods.addFeedback = function (feedback) {
  this.feedback = feedback;
  return this;
};

// Add method to complete conversation
conversationSchema.methods.complete = function (performance) {
  this.status = "completed";
  this.performance = performance;
  return this;
};

// Add method to calculate duration
conversationSchema.methods.calculateDuration = function () {
  if (this.messages.length < 2) {
    return 0;
  }

  const firstMessage = this.messages[0];
  const lastMessage = this.messages[this.messages.length - 1];

  const durationMs = lastMessage.timestamp - firstMessage.timestamp;
  this.duration = Math.floor(durationMs / 1000); // Convert to seconds

  return this.duration;
};

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
