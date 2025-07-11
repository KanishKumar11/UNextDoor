import mongoose from 'mongoose';
import config from '../config/index.js';
import Scenario from '../models/Scenario.js';

async function main() {
  try {
    await mongoose.connect(config.dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');

    const scenarios = [
      {
        title: 'Dorm Life',
        description: 'Conversational practice about living in a dormitory, roommates, and daily routines.',
        level: 'beginner',
        category: 'education',
        tags: ['dorm', 'roommates', 'daily routine'],
        systemPrompt: 'You are a helpful Korean language tutor focusing on dorm life conversations. Teach phrases for talking about roommates, chores, and daily routines. Respond in both Korean and English.',
        initialMessage: '안녕하세요! 오늘은 기숙사 생활에 대해 이야기해볼까요? (Hello! Shall we talk about dorm life today?)',
        suggestedResponses: [],
        vocabulary: [],
        grammarPoints: [],
        estimatedDuration: 10,
        difficulty: 3,
      },
      {
        title: 'Group Projects',
        description: 'Practice discussing roles, deadlines, and collaboration in a group project setting.',
        level: 'intermediate',
        category: 'education',
        tags: ['project', 'teamwork', 'collaboration'],
        systemPrompt: 'You are a helpful Korean language tutor focusing on group project discussions. Teach phrases for assigning tasks, setting deadlines, and collaborating effectively. Respond in both Korean and English.',
        initialMessage: '프로젝트에서 역할 분담에 대해 이야기해볼까요? (Shall we discuss role assignments in the project?)',
        suggestedResponses: [],
        vocabulary: [],
        grammarPoints: [],
        estimatedDuration: 12,
        difficulty: 5,
      },
      {
        title: 'Class Interactions',
        description: 'Engage in conversations about asking questions in class, participating in discussions, and giving presentations.',
        level: 'intermediate',
        category: 'education',
        tags: ['class', 'questions', 'presentations'],
        systemPrompt: 'You are a helpful Korean language tutor focusing on class interactions. Teach phrases for asking questions, participating in discussions, and presenting. Respond in both Korean and English.',
        initialMessage: '수업 중에 질문하는 방법을 연습해볼까요? (Shall we practice asking questions during class?)',
        suggestedResponses: [],
        vocabulary: [],
        grammarPoints: [],
        estimatedDuration: 10,
        difficulty: 4,
      },
      {
        title: 'Buying Tickets',
        description: 'Practice dialogues for buying tickets at stations, events, or cinemas.',
        level: 'beginner',
        category: 'travel',
        tags: ['tickets', 'station', 'cinema'],
        systemPrompt: 'You are a helpful Korean language tutor focusing on buying tickets. Teach phrases for purchasing tickets at stations, theaters, and events. Respond in both Korean and English.',
        initialMessage: '티켓을 구매하는 대화를 시작해볼까요? (Shall we start a conversation about buying tickets?)',
        suggestedResponses: [],
        vocabulary: [],
        grammarPoints: [],
        estimatedDuration: 8,
        difficulty: 3,
      },
      {
        title: 'Going to a Café',
        description: 'Learn how to order drinks, ask about menu items, and chat in a café setting.',
        level: 'beginner',
        category: 'dining',
        tags: ['café', 'ordering', 'menu'],
        systemPrompt: 'You are a helpful Korean language tutor focusing on café conversations. Teach phrases for ordering drinks, asking about menu items, and small talk. Respond in both Korean and English.',
        initialMessage: '카페에서 음료를 주문하는 문장을 연습해볼까요? (Shall we practice ordering drinks at a café?)',
        suggestedResponses: [],
        vocabulary: [],
        grammarPoints: [],
        estimatedDuration: 8,
        difficulty: 2,
      },
      {
        title: 'Job Interviews',
        description: 'Prepare for job interviews by practicing common questions and responses.',
        level: 'advanced',
        category: 'business',
        tags: ['interview', 'job', 'questions'],
        systemPrompt: 'You are a helpful Korean language tutor focusing on job interview preparation. Teach phrases for answering common interview questions and presenting qualifications. Respond in both Korean and English.',
        initialMessage: '면접 질문에 답변해볼까요? (Shall we practice answering interview questions?)',
        suggestedResponses: [],
        vocabulary: [],
        grammarPoints: [],
        estimatedDuration: 15,
        difficulty: 7,
      },
      {
        title: 'Meetings',
        description: 'Practice language for participating in and leading business meetings.',
        level: 'advanced',
        category: 'business',
        tags: ['meeting', 'agenda', 'discussion'],
        systemPrompt: 'You are a helpful Korean language tutor focusing on business meeting language. Teach phrases for setting agendas, giving opinions, and summarizing. Respond in both Korean and English.',
        initialMessage: '회의에서 의견을 제시하는 문장을 연습해볼까요? (Shall we practice giving opinions in a meeting?)',
        suggestedResponses: [],
        vocabulary: [],
        grammarPoints: [],
        estimatedDuration: 12,
        difficulty: 6,
      },
      {
        title: 'Resumes',
        description: 'Learn how to write and discuss resume entries and qualifications.',
        level: 'advanced',
        category: 'business',
        tags: ['resume', 'qualifications', 'experience'],
        systemPrompt: 'You are a helpful Korean language tutor focusing on resumes. Teach phrases for describing work experience, skills, and education in a resume context. Respond in both Korean and English.',
        initialMessage: '이력서에 경력을 작성하는 문장을 연습해볼까요? (Shall we practice writing work experience on a resume?)',
        suggestedResponses: [],
        vocabulary: [],
        grammarPoints: [],
        estimatedDuration: 10,
        difficulty: 8,
      },
    ];

    for (const scenarioData of scenarios) {
      const existing = await Scenario.findOne({ title: scenarioData.title });
      if (existing) {
        console.log(`Skipping existing scenario: ${scenarioData.title}`);
      } else {
        await Scenario.create(scenarioData);
        console.log(`Created scenario: ${scenarioData.title}`);
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding scenarios:', error);
    process.exit(1);
  }
}

main();
