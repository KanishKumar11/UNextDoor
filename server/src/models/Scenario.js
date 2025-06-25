import mongoose from 'mongoose';

const vocabularyItemSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
    },
    translation: {
      type: String,
      required: true,
    },
    examples: [String],
    notes: String,
  },
  { _id: false }
);

const grammarPointSchema = new mongoose.Schema(
  {
    pattern: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    examples: [String],
    notes: String,
  },
  { _id: false }
);

const scenarioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    category: {
      type: String,
      enum: [
        'daily_life',
        'travel',
        'business',
        'social',
        'emergency',
        'shopping',
        'dining',
        'education',
        'health',
        'entertainment',
      ],
      required: true,
    },
    tags: [String],
    imageUrl: String,
    systemPrompt: {
      type: String,
      required: true,
    },
    initialMessage: {
      type: String,
      required: true,
    },
    suggestedResponses: [String],
    vocabulary: [vocabularyItemSchema],
    grammarPoints: [grammarPointSchema],
    estimatedDuration: {
      type: Number, // Duration in minutes
      default: 10,
    },
    difficulty: {
      type: Number, // 1-10 scale
      min: 1,
      max: 10,
      required: true,
    },
    popularity: {
      type: Number, // Number of times this scenario has been used
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search
scenarioSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Add method to increment popularity
scenarioSchema.methods.incrementPopularity = function () {
  this.popularity += 1;
  return this;
};

// Add static method to find scenarios by level
scenarioSchema.statics.findByLevel = function (level) {
  return this.find({ level, isActive: true }).sort({ popularity: -1 });
};

// Add static method to find scenarios by category
scenarioSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({ popularity: -1 });
};

// Add static method to find popular scenarios
scenarioSchema.statics.findPopular = function (limit = 10) {
  return this.find({ isActive: true }).sort({ popularity: -1 }).limit(limit);
};

// Add static method to search scenarios
scenarioSchema.statics.search = function (query) {
  return this.find(
    { 
      $text: { $search: query },
      isActive: true,
    },
    {
      score: { $meta: 'textScore' },
    }
  ).sort({ score: { $meta: 'textScore' } });
};

const Scenario = mongoose.model('Scenario', scenarioSchema);

export default Scenario;
