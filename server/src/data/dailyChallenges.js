import { ChallengeType, ChallengeDifficulty } from '../models/DailyChallenge.js';

/**
 * Sample daily challenges
 * These will be used to generate daily challenges for users
 */
export const sampleDailyChallenges = [
  // Vocabulary challenges
  {
    title: 'Learn 5 New Words',
    description: 'Learn 5 new Korean vocabulary words related to food',
    type: ChallengeType.VOCABULARY,
    difficulty: ChallengeDifficulty.BEGINNER,
    xpReward: 50,
    streakPoints: 1,
    content: {
      category: 'food',
      words: [
        { korean: '밥', english: 'Rice' },
        { korean: '물', english: 'Water' },
        { korean: '김치', english: 'Kimchi' },
        { korean: '고기', english: 'Meat' },
        { korean: '과일', english: 'Fruit' },
      ],
    },
    requirements: {
      type: 'learn_vocabulary',
      count: 5,
    },
  },
  {
    title: 'Master Travel Vocabulary',
    description: 'Learn 5 new Korean vocabulary words related to travel',
    type: ChallengeType.VOCABULARY,
    difficulty: ChallengeDifficulty.INTERMEDIATE,
    xpReward: 75,
    streakPoints: 1,
    content: {
      category: 'travel',
      words: [
        { korean: '여행', english: 'Travel' },
        { korean: '비행기', english: 'Airplane' },
        { korean: '호텔', english: 'Hotel' },
        { korean: '여권', english: 'Passport' },
        { korean: '관광', english: 'Sightseeing' },
      ],
    },
    requirements: {
      type: 'learn_vocabulary',
      count: 5,
    },
  },
  
  // Conversation challenges
  {
    title: 'Practice Ordering Food',
    description: 'Complete a conversation scenario about ordering food in a restaurant',
    type: ChallengeType.CONVERSATION,
    difficulty: ChallengeDifficulty.BEGINNER,
    xpReward: 100,
    streakPoints: 2,
    content: {
      scenarioId: 'ordering-food',
      minDuration: 3, // minutes
    },
    requirements: {
      type: 'complete_conversation',
      count: 1,
      targetId: 'ordering-food',
    },
  },
  {
    title: 'Business Meeting Practice',
    description: 'Complete a conversation scenario about a business meeting',
    type: ChallengeType.CONVERSATION,
    difficulty: ChallengeDifficulty.ADVANCED,
    xpReward: 150,
    streakPoints: 2,
    content: {
      scenarioId: 'business-meeting',
      minDuration: 5, // minutes
    },
    requirements: {
      type: 'complete_conversation',
      count: 1,
      targetId: 'business-meeting',
    },
  },
  
  // Game challenges
  {
    title: 'Match the Word Challenge',
    description: 'Score at least 100 points in the Match the Word game',
    type: ChallengeType.GAME,
    difficulty: ChallengeDifficulty.ALL_LEVELS,
    xpReward: 75,
    streakPoints: 1,
    content: {
      gameId: 'match-word',
      minScore: 100,
    },
    requirements: {
      type: 'play_game',
      count: 1,
      targetId: 'match-word',
      additionalParams: {
        minScore: 100,
      },
    },
  },
  {
    title: 'Pronunciation Practice',
    description: 'Complete a pronunciation challenge with at least 80% accuracy',
    type: ChallengeType.PRONUNCIATION,
    difficulty: ChallengeDifficulty.INTERMEDIATE,
    xpReward: 100,
    streakPoints: 2,
    content: {
      phrases: [
        '안녕하세요',
        '감사합니다',
        '실례합니다',
        '다시 말씀해 주세요',
        '천천히 말씀해 주세요',
      ],
      minAccuracy: 80, // percent
    },
    requirements: {
      type: 'practice_pronunciation',
      count: 5,
      additionalParams: {
        minAccuracy: 80,
      },
    },
  },
  
  // Grammar challenges
  {
    title: 'Past Tense Practice',
    description: 'Practice using the past tense in Korean',
    type: ChallengeType.GRAMMAR,
    difficulty: ChallengeDifficulty.INTERMEDIATE,
    xpReward: 100,
    streakPoints: 2,
    content: {
      grammarPoint: 'past_tense',
      examples: [
        { korean: '저는 어제 학교에 갔어요', english: 'I went to school yesterday' },
        { korean: '그는 밥을 먹었어요', english: 'He ate rice' },
        { korean: '우리는 영화를 봤어요', english: 'We watched a movie' },
      ],
    },
    requirements: {
      type: 'answer_questions',
      count: 5,
      additionalParams: {
        grammarPoint: 'past_tense',
      },
    },
  },
  
  // Lesson challenges
  {
    title: 'Complete Today\'s Lesson',
    description: 'Complete the recommended lesson for today',
    type: ChallengeType.READING,
    difficulty: ChallengeDifficulty.ALL_LEVELS,
    xpReward: 100,
    streakPoints: 2,
    content: {
      lessonType: 'daily_recommended',
    },
    requirements: {
      type: 'complete_lesson',
      count: 1,
    },
  },
];

/**
 * Generate a daily challenge for a user based on their level
 * @param {string} level - User's proficiency level
 * @returns {Object} A daily challenge object
 */
export const generateDailyChallenge = (level = 'beginner') => {
  // Filter challenges by level
  let eligibleChallenges = sampleDailyChallenges.filter(challenge => 
    challenge.difficulty === level || challenge.difficulty === 'all-levels'
  );
  
  // If no challenges match the level, use all challenges
  if (eligibleChallenges.length === 0) {
    eligibleChallenges = sampleDailyChallenges;
  }
  
  // Select a random challenge
  const randomIndex = Math.floor(Math.random() * eligibleChallenges.length);
  const challenge = { ...eligibleChallenges[randomIndex] };
  
  // Set availability dates
  const now = new Date();
  challenge.availableDate = now;
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  challenge.expiryDate = tomorrow;
  
  return challenge;
};
