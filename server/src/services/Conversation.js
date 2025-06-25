import mongoose from "mongoose";

/**
 * Message role enum
 * @enum {string}
 */
export const MessageRole = {
  SYSTEM: "system",
  USER: "user",
  ASSISTANT: "assistant",
};

/**
 * Conversation schema
 * Represents a conversation between a user and the AI tutor
 */
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
      index: true,
    },
    scenarioTitle: {
      type: String,
      default: "Free Conversation",
      trim: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: Object.values(MessageRole),
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        audioUrl: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        feedback: {
          grammar: {
            errors: [
              {
                text: String,
                correction: String,
                explanation: String,
              },
            ],
            score: Number,
          },
          vocabulary: {
            level: String,
            suggestions: [String],
          },
          pronunciation: {
            difficultSounds: [String],
            tips: [String],
          },
        },
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
conversationSchema.index({ userId: 1, lastMessageAt: -1 });
conversationSchema.index({ userId: 1, scenarioId: 1 });

/**
 * Add a message to the conversation
 * @param {Object} message - Message object
 * @returns {Promise<void>}
 */
conversationSchema.methods.addMessage = async function (message) {
  this.messages.push(message);
  this.lastMessageAt = new Date();
  
  if (this.messages.length > 1) {
    const firstMessageTime = this.messages[0].timestamp || this.startedAt;
    const lastMessageTime = new Date();
    this.duration = Math.floor((lastMessageTime - firstMessageTime) / 1000);
  }
  
  await this.save();
};

/**
 * Get the last message in the conversation
 * @returns {Object|null} Last message or null if no messages
 */
conversationSchema.methods.getLastMessage = function () {
  if (this.messages.length === 0) {
    return null;
  }
  
  return this.messages[this.messages.length - 1];
};

/**
 * Get the conversation history in OpenAI format
 * @returns {Array} Array of messages in OpenAI format
 */
conversationSchema.methods.getOpenAIMessages = function () {
  return this.messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
};

/**
 * Complete the conversation
 * @returns {Promise<void>}
 */
conversationSchema.methods.complete = async function () {
  this.isCompleted = true;
  await this.save();
};

// Create and export the Conversation model
const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
