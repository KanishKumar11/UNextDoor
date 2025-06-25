/**
 * Level definitions for the XP system
 * Each level has a name, description, and XP requirement
 */

export const levels = [
  {
    level: 1,
    name: 'Novice',
    description: 'Just starting your Korean language journey',
    xpRequired: 0,
    icon: 'leaf-outline',
    color: '#6FC935', // Primary green color
    rewards: [
      {
        type: 'feature_unlock',
        id: 'basic_conversations',
        name: 'Basic Conversations',
        description: 'Unlock basic conversation scenarios',
        icon: 'chatbubble-outline',
      },
    ],
  },
  {
    level: 2,
    name: 'Beginner',
    description: 'Learning the basics of Korean',
    xpRequired: 100,
    icon: 'seedling-outline',
    color: '#6FC935',
    rewards: [
      {
        type: 'badge',
        id: 'beginner_badge',
        name: 'Beginner Badge',
        description: 'You\'ve reached Beginner level!',
        icon: 'ribbon-outline',
      },
    ],
  },
  {
    level: 3,
    name: 'Elementary',
    description: 'Building your Korean foundation',
    xpRequired: 300,
    icon: 'flower-outline',
    color: '#6FC935',
    rewards: [
      {
        type: 'feature_unlock',
        id: 'daily_challenges',
        name: 'Daily Challenges',
        description: 'Unlock daily language challenges',
        icon: 'calendar-outline',
      },
    ],
  },
  {
    level: 4,
    name: 'Pre-Intermediate',
    description: 'Expanding your Korean vocabulary',
    xpRequired: 600,
    icon: 'nutrition-outline',
    color: '#F39C12', // Orange color
    rewards: [
      {
        type: 'badge',
        id: 'vocabulary_explorer',
        name: 'Vocabulary Explorer',
        description: 'You\'re expanding your Korean vocabulary!',
        icon: 'book-outline',
      },
    ],
  },
  {
    level: 5,
    name: 'Intermediate',
    description: 'Conversing in everyday Korean',
    xpRequired: 1000,
    icon: 'tree-outline',
    color: '#F39C12',
    rewards: [
      {
        type: 'feature_unlock',
        id: 'intermediate_conversations',
        name: 'Intermediate Conversations',
        description: 'Unlock more complex conversation scenarios',
        icon: 'chatbubbles-outline',
      },
    ],
  },
  {
    level: 6,
    name: 'Upper Intermediate',
    description: 'Handling complex Korean conversations',
    xpRequired: 1500,
    icon: 'planet-outline',
    color: '#F39C12',
    rewards: [
      {
        type: 'badge',
        id: 'conversation_master',
        name: 'Conversation Master',
        description: 'You can handle complex Korean conversations!',
        icon: 'chatbox-ellipses-outline',
      },
    ],
  },
  {
    level: 7,
    name: 'Advanced',
    description: 'Speaking Korean with confidence',
    xpRequired: 2200,
    icon: 'rocket-outline',
    color: '#E74C3C', // Red color
    rewards: [
      {
        type: 'feature_unlock',
        id: 'advanced_conversations',
        name: 'Advanced Conversations',
        description: 'Unlock advanced conversation scenarios',
        icon: 'globe-outline',
      },
    ],
  },
  {
    level: 8,
    name: 'Expert',
    description: 'Near-native Korean proficiency',
    xpRequired: 3000,
    icon: 'star-outline',
    color: '#E74C3C',
    rewards: [
      {
        type: 'badge',
        id: 'korean_expert',
        name: 'Korean Expert',
        description: 'You\'ve reached expert level in Korean!',
        icon: 'trophy-outline',
      },
    ],
  },
  {
    level: 9,
    name: 'Master',
    description: 'Mastering the nuances of Korean',
    xpRequired: 4000,
    icon: 'diamond-outline',
    color: '#9B59B6', // Purple color
    rewards: [
      {
        type: 'feature_unlock',
        id: 'cultural_insights',
        name: 'Cultural Insights',
        description: 'Unlock deep cultural insights in conversations',
        icon: 'compass-outline',
      },
    ],
  },
  {
    level: 10,
    name: 'Fluent',
    description: 'Fluent in Korean language and culture',
    xpRequired: 5000,
    icon: 'infinite-outline',
    color: '#9B59B6',
    rewards: [
      {
        type: 'badge',
        id: 'korean_fluency',
        name: 'Korean Fluency',
        description: 'You\'ve achieved fluency in Korean!',
        icon: 'ribbon-outline',
      },
      {
        type: 'feature_unlock',
        id: 'mentor_mode',
        name: 'Mentor Mode',
        description: 'Help others learn Korean',
        icon: 'people-outline',
      },
    ],
  },
];
