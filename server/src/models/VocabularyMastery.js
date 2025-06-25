import mongoose from 'mongoose';

/**
 * Schema for tracking vocabulary mastery
 * Implements spaced repetition concepts with familiarity levels
 */
const vocabularyItemMasterySchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      trim: true,
    },
    translation: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    familiarity: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    correctAttempts: {
      type: Number,
      default: 0,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    lastPracticed: {
      type: Date,
      default: null,
    },
    nextReviewDate: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ['game', 'conversation', 'lesson'],
      default: 'game',
    },
    notes: String,
  },
  { _id: false }
);

const vocabularyMasterySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    masteredWords: [vocabularyItemMasterySchema],
    totalMastered: {
      type: Number,
      default: 0,
    },
    beginnerMastered: {
      type: Number,
      default: 0,
    },
    intermediateMastered: {
      type: Number,
      default: 0,
    },
    advancedMastered: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Method to update word mastery
vocabularyMasterySchema.methods.updateWordMastery = function(wordData, isCorrect) {
  const { word, translation, category, level } = wordData;
  
  // Find the word in the masteredWords array
  const wordIndex = this.masteredWords.findIndex(
    item => item.word === word && item.translation === translation
  );
  
  if (wordIndex >= 0) {
    // Update existing word
    const existingWord = this.masteredWords[wordIndex];
    
    // Update attempts
    existingWord.totalAttempts += 1;
    if (isCorrect) {
      existingWord.correctAttempts += 1;
    }
    
    // Calculate accuracy
    const accuracy = existingWord.correctAttempts / existingWord.totalAttempts;
    
    // Update familiarity based on accuracy and current familiarity
    if (isCorrect) {
      // Increase familiarity if correct (max 5)
      existingWord.familiarity = Math.min(5, existingWord.familiarity + 0.5);
    } else {
      // Decrease familiarity if incorrect (min 0)
      existingWord.familiarity = Math.max(0, existingWord.familiarity - 1);
    }
    
    // Update last practiced date
    existingWord.lastPracticed = new Date();
    
    // Calculate next review date based on spaced repetition algorithm
    // Higher familiarity = longer interval between reviews
    const reviewIntervals = [1, 3, 7, 14, 30, 90]; // days
    const intervalIndex = Math.floor(existingWord.familiarity);
    const interval = reviewIntervals[intervalIndex];
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    existingWord.nextReviewDate = nextReview;
    
    this.masteredWords[wordIndex] = existingWord;
  } else {
    // Add new word
    const newWord = {
      word,
      translation,
      category,
      level,
      familiarity: isCorrect ? 1 : 0,
      correctAttempts: isCorrect ? 1 : 0,
      totalAttempts: 1,
      lastPracticed: new Date(),
      source: 'game',
    };
    
    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + (isCorrect ? 3 : 1));
    newWord.nextReviewDate = nextReview;
    
    this.masteredWords.push(newWord);
  }
  
  // Update mastery counts
  this.updateMasteryCounts();
  
  // Update last updated timestamp
  this.lastUpdated = new Date();
};

// Method to update mastery counts
vocabularyMasterySchema.methods.updateMasteryCounts = function() {
  // Count words with familiarity >= 3 as "mastered"
  const masteredWords = this.masteredWords.filter(word => word.familiarity >= 3);
  
  this.totalMastered = masteredWords.length;
  this.beginnerMastered = masteredWords.filter(word => word.level === 'beginner').length;
  this.intermediateMastered = masteredWords.filter(word => word.level === 'intermediate').length;
  this.advancedMastered = masteredWords.filter(word => word.level === 'advanced').length;
};

// Create and export the VocabularyMastery model
const VocabularyMastery = mongoose.model('VocabularyMastery', vocabularyMasterySchema);
export default VocabularyMastery;
