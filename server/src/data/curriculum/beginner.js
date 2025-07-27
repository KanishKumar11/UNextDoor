/**
 * Beginner level curriculum content
 * Contains modules and lessons for the beginner level
 */

import { AI_TUTOR_NAME } from "../../constants/appConstants.js";

/**
 * Beginner level modules
 */
export const beginnerModules = [
  {
    id: "beginner-foundations",
    name: "Foundations",
    description:
      "Learn the basics of Korean language including the alphabet, greetings, and numbers.",
    requiredXp: 0,
    order: 1,
    icon: "school-outline",
    color: "#5BC4B3", // Explorer Teal
    lessons: [
      {
        id: "beginner-korean-alphabet",
        name: "Korean Alphabet (한글)",
        description:
          "Learn the Korean alphabet (Hangul) and basic pronunciation.",
        objectives: [
          "Understand the basic structure of Hangul",
          "Recognize and pronounce vowels and consonants",
          "Practice writing basic characters",
        ],
        estimatedDuration: 30, // minutes
        xpReward: 100,
        requiredXp: 0,
        order: 1,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}, your Korean language tutor. Today we'll learn the Korean alphabet, called Hangul (한글). Hangul is a phonetic alphabet created by King Sejong the Great in 1443. Unlike many writing systems, Hangul was scientifically designed, making it one of the most logical and easy-to-learn writing systems in the world!`,

          sections: [
            {
              title: "Basic Vowels",
              type: "vocabulary",
              items: [
                {
                  character: "ㅏ",
                  romanization: "a",
                  sound: 'like "a" in "father"',
                  example: "아 (a)",
                },
                {
                  character: "ㅓ",
                  romanization: "eo",
                  sound: 'like "u" in "but"',
                  example: "어 (eo)",
                },
                {
                  character: "ㅗ",
                  romanization: "o",
                  sound: 'like "o" in "hope"',
                  example: "오 (o)",
                },
                {
                  character: "ㅜ",
                  romanization: "u",
                  sound: 'like "oo" in "moon"',
                  example: "우 (u)",
                },
                {
                  character: "ㅡ",
                  romanization: "eu",
                  sound: 'like "u" in "put"',
                  example: "으 (eu)",
                },
                {
                  character: "ㅣ",
                  romanization: "i",
                  sound: 'like "ee" in "see"',
                  example: "이 (i)",
                },
              ],
            },
            {
              title: "Basic Consonants",
              type: "vocabulary",
              items: [
                {
                  character: "ㄱ",
                  romanization: "g/k",
                  sound: 'between "g" and "k"',
                  example: "가 (ga)",
                },
                {
                  character: "ㄴ",
                  romanization: "n",
                  sound: 'like "n" in "net"',
                  example: "나 (na)",
                },
                {
                  character: "ㄷ",
                  romanization: "d/t",
                  sound: 'between "d" and "t"',
                  example: "다 (da)",
                },
                {
                  character: "ㄹ",
                  romanization: "r/l",
                  sound: 'between "r" and "l"',
                  example: "라 (ra)",
                },
                {
                  character: "ㅁ",
                  romanization: "m",
                  sound: 'like "m" in "mom"',
                  example: "마 (ma)",
                },
                {
                  character: "ㅂ",
                  romanization: "b/p",
                  sound: 'between "b" and "p"',
                  example: "바 (ba)",
                },
                {
                  character: "ㅅ",
                  romanization: "s",
                  sound: 'like "s" in "see"',
                  example: "사 (sa)",
                },
                {
                  character: "ㅇ",
                  romanization: "ng/silent",
                  sound: 'silent at beginning, "ng" at end',
                  example: "아 (a)",
                },
                {
                  character: "ㅈ",
                  romanization: "j",
                  sound: 'like "j" in "jump"',
                  example: "자 (ja)",
                },
                {
                  character: "ㅊ",
                  romanization: "ch",
                  sound: 'like "ch" in "chair"',
                  example: "차 (cha)",
                },
                {
                  character: "ㅋ",
                  romanization: "k",
                  sound: 'like "k" in "kite"',
                  example: "카 (ka)",
                },
                {
                  character: "ㅌ",
                  romanization: "t",
                  sound: 'like "t" in "time"',
                  example: "타 (ta)",
                },
                {
                  character: "ㅍ",
                  romanization: "p",
                  sound: 'like "p" in "pen"',
                  example: "파 (pa)",
                },
                {
                  character: "ㅎ",
                  romanization: "h",
                  sound: 'like "h" in "hat"',
                  example: "하 (ha)",
                },
              ],
            },
            {
              title: "Syllable Formation",
              type: "grammar",
              explanation:
                "Korean letters are grouped into syllable blocks. Each syllable must have at least one consonant and one vowel. The basic structure is consonant + vowel, but syllables can also end with a consonant.",
              examples: [
                { korean: "가", explanation: "ㄱ (g) + ㅏ (a) = 가 (ga)" },
                {
                  korean: "한",
                  explanation: "ㅎ (h) + ㅏ (a) + ㄴ (n) = 한 (han)",
                },
                {
                  korean: "글",
                  explanation: "ㄱ (g) + ㅡ (eu) + ㄹ (l) = 글 (geul)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Vowel Pronunciation",
                description: "Practice pronouncing the basic vowels",
                items: ["ㅏ", "ㅓ", "ㅗ", "ㅜ", "ㅡ", "ㅣ"],
              },
              {
                type: "pronunciation",
                title: "Consonant Pronunciation",
                description: "Practice pronouncing the basic consonants",
                items: [
                  "ㄱ",
                  "ㄴ",
                  "ㄷ",
                  "ㄹ",
                  "ㅁ",
                  "ㅂ",
                  "ㅅ",
                  "ㅇ",
                  "ㅈ",
                  "ㅊ",
                  "ㅋ",
                  "ㅌ",
                  "ㅍ",
                  "ㅎ",
                ],
              },
              {
                type: "game",
                title: "Character Match",
                description: "Match Korean characters with their romanizations",
                gameType: "matching",
              },
            ],
          },

          conversation: {
            introduction: `Now let's practice reading some simple Korean words using the characters we've learned.`,
            dialogue: [
              { speaker: "tutor", text: "안녕하세요! (annyeonghaseyo)" },
              { speaker: "user", text: "안녕하세요!" },
              {
                speaker: "tutor",
                text: "네, 잘했어요! (ne, jal haesseoyo) Yes, well done!",
              },
              {
                speaker: "tutor",
                text: '이것은 "나"입니다. (igeoseun "na"imnida) This is "나" (na).',
              },
              { speaker: "user", text: "나" },
              { speaker: "tutor", text: "좋아요! (joayo) Good!" },
            ],
          },

          review: {
            summary: `Today we learned the basic Korean alphabet (Hangul). We covered the basic vowels (ㅏ, ㅓ, ㅗ, ㅜ, ㅡ, ㅣ) and consonants (ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅅ, ㅇ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ). We also learned how to form syllables by combining consonants and vowels.`,
            keyPoints: [
              "Hangul is a phonetic alphabet created in 1443",
              "Each Korean syllable contains at least one consonant and one vowel",
              "Syllables are written in blocks, not linearly",
              "The consonant ㅇ is silent at the beginning of a syllable",
            ],
          },
        },
      },
      {
        id: "beginner-greetings",
        name: "Greetings & Introductions (인사와 소개)",
        description:
          "Learn basic greetings and how to introduce yourself in Korean.",
        objectives: [
          "Learn basic greetings for different times of day",
          "Introduce yourself in Korean",
          "Ask and respond to simple questions about identity",
        ],
        estimatedDuration: 25,
        xpReward: 100,
        requiredXp: 100,
        order: 2,
        content: {
          introduction: `안녕하세요! Welcome to your first conversation lesson. I'm ${AI_TUTOR_NAME}, your Korean language tutor. Today we'll learn basic greetings and how to introduce yourself in Korean. These phrases will help you start conversations and make a good first impression when meeting Korean speakers.`,

          sections: [
            {
              title: "Basic Greetings",
              type: "vocabulary",
              items: [
                {
                  korean: "안녕하세요",
                  romanization: "annyeonghaseyo",
                  english: "Hello/Good day",
                  example:
                    "안녕하세요, 만나서 반갑습니다. (Hello, nice to meet you.)",
                },
                {
                  korean: "안녕히 가세요",
                  romanization: "annyeonghi gaseyo",
                  english: "Goodbye (to someone leaving)",
                  example:
                    "안녕히 가세요, 내일 봐요. (Goodbye, see you tomorrow.)",
                },
                {
                  korean: "안녕히 계세요",
                  romanization: "annyeonghi gyeseyo",
                  english: "Goodbye (when you're leaving)",
                  example:
                    "저는 이제 가요. 안녕히 계세요. (I'm leaving now. Goodbye.)",
                },
                {
                  korean: "감사합니다",
                  romanization: "gamsahamnida",
                  english: "Thank you",
                  example: "도와주셔서 감사합니다. (Thank you for helping me.)",
                },
                {
                  korean: "죄송합니다",
                  romanization: "joesonghamnida",
                  english: "I'm sorry",
                  example: "늦어서 죄송합니다. (I'm sorry for being late.)",
                },
              ],
            },
            {
              title: "Self-Introduction",
              type: "vocabulary",
              items: [
                {
                  korean: "저는 ___ 입니다",
                  romanization: "jeoneun ___ imnida",
                  english: "I am ___",
                  example: "저는 John입니다. (I am John.)",
                },
                {
                  korean: "만나서 반갑습니다",
                  romanization: "mannaseo bangapseumnida",
                  english: "Nice to meet you",
                  example:
                    "만나서 반갑습니다, 잘 부탁드립니다. (Nice to meet you, please take care of me.)",
                },
                {
                  korean: "저는 미국에서 왔어요",
                  romanization: "jeoneun miguk-eseo wasseoyo",
                  english: "I'm from America",
                  example:
                    "저는 미국에서 왔어요. 한국은 처음이에요. (I'm from America. It's my first time in Korea.)",
                },
              ],
            },
            {
              title: "Basic Questions",
              type: "vocabulary",
              items: [
                {
                  korean: "이름이 뭐예요?",
                  romanization: "ireum-i mwoyeyo?",
                  english: "What is your name?",
                  example:
                    "실례지만, 이름이 뭐예요? (Excuse me, what is your name?)",
                },
                {
                  korean: "어디에서 왔어요?",
                  romanization: "eodie-eseo wasseoyo?",
                  english: "Where are you from?",
                  example:
                    "어디에서 왔어요? 한국 사람이에요? (Where are you from? Are you Korean?)",
                },
                {
                  korean: "잘 지내요?",
                  romanization: "jal jinaeyo?",
                  english: "How are you?",
                  example:
                    "잘 지내요? 요즘 어때요? (How are you? How have you been lately?)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Greeting Pronunciation",
                description: "Practice pronouncing the basic greetings",
                items: [
                  "안녕하세요",
                  "안녕히 가세요",
                  "안녕히 계세요",
                  "감사합니다",
                  "죄송합니다",
                ],
              },
              {
                type: "game",
                title: "Greeting Match",
                description: "Match Korean greetings with their meanings",
                gameType: "matching",
              },
              {
                type: "conversation",
                title: "Introduction Practice",
                description: "Practice introducing yourself in Korean",
                prompt:
                  "Introduce yourself with your name and where you're from",
              },
            ],
          },

          conversation: {
            introduction: `Let's practice a basic conversation using the greetings and introductions we've learned.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "안녕하세요! 저는 ${AI_TUTOR_NAME}입니다. 만나서 반갑습니다. (Hello! I am ${AI_TUTOR_NAME}. Nice to meet you.)",
              },
              {
                speaker: "user",
                text: "안녕하세요! 저는 [User Name]입니다. 만나서 반갑습니다.",
              },
              {
                speaker: "tutor",
                text: "[User Name]님, 어디에서 왔어요? (Where are you from?)",
              },
              { speaker: "user", text: "저는 [Country]에서 왔어요." },
              {
                speaker: "tutor",
                text: "아, 그렇군요! [Country]은/는 아름다운 나라예요. 한국어 공부는 어때요? (Oh, I see! [Country] is a beautiful country. How is your Korean study?)",
              },
              { speaker: "user", text: "재미있어요! (It's fun!)" },
              {
                speaker: "tutor",
                text: "좋아요! 열심히 하세요! (Great! Keep up the good work!)",
              },
            ],
          },

          review: {
            summary: `Today we learned basic Korean greetings and how to introduce ourselves. We covered formal greetings like '안녕하세요' (hello) and '안녕히 가세요/계세요' (goodbye), as well as how to say 'My name is...' and ask basic questions.`,
            keyPoints: [
              "Korean has different goodbye expressions depending on who is staying and who is leaving",
              "Formal speech endings (-습니다, -세요) are used with people you meet for the first time",
              'The particle "은/는" is used to mark the topic of a sentence',
              "In Korean culture, a slight bow often accompanies greetings",
            ],
          },
        },
      },
    ],
  },
  {
    id: "beginner-daily-life",
    name: "Daily Life",
    description:
      "Learn essential vocabulary and phrases for everyday situations.",
    requiredXp: 200,
    order: 2,
    icon: "cafe-outline",
    color: "#A3E8DC", // Sky Aqua
    lessons: [
      {
        id: "beginner-numbers",
        name: "Numbers & Counting (숫자와 세기)",
        description: "Learn Korean number systems and how to count in Korean.",
        objectives: [
          "Learn Korean native numbers (1-100)",
          "Learn Sino-Korean numbers (1-100)",
          "Understand when to use each number system",
        ],
        estimatedDuration: 30,
        xpReward: 100,
        requiredXp: 200,
        order: 1,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll learn about Korean numbers. Korean has two number systems: native Korean numbers and Sino-Korean numbers. Each system is used in different situations, so it's important to learn both!`,

          sections: [
            {
              title: "Native Korean Numbers (1-10)",
              type: "vocabulary",
              items: [
                {
                  korean: "하나",
                  romanization: "hana",
                  english: "one",
                  example: "사과 하나 (one apple)",
                },
                {
                  korean: "둘",
                  romanization: "dul",
                  english: "two",
                  example: "책 둘 (two books)",
                },
                {
                  korean: "셋",
                  romanization: "set",
                  english: "three",
                  example: "연필 셋 (three pencils)",
                },
                {
                  korean: "넷",
                  romanization: "net",
                  english: "four",
                  example: "의자 넷 (four chairs)",
                },
                {
                  korean: "다섯",
                  romanization: "daseot",
                  english: "five",
                  example: "손가락 다섯 (five fingers)",
                },
                {
                  korean: "여섯",
                  romanization: "yeoseot",
                  english: "six",
                  example: "달걀 여섯 (six eggs)",
                },
                {
                  korean: "일곱",
                  romanization: "ilgop",
                  english: "seven",
                  example: "요일 일곱 (seven days)",
                },
                {
                  korean: "여덟",
                  romanization: "yeodeol",
                  english: "eight",
                  example: "다리 여덟 (eight legs)",
                },
                {
                  korean: "아홉",
                  romanization: "ahop",
                  english: "nine",
                  example: "구름 아홉 (nine clouds)",
                },
                {
                  korean: "열",
                  romanization: "yeol",
                  english: "ten",
                  example: "손가락 열 (ten fingers)",
                },
              ],
            },
            {
              title: "Sino-Korean Numbers (1-10)",
              type: "vocabulary",
              items: [
                {
                  korean: "일",
                  romanization: "il",
                  english: "one",
                  example: "일월 (January)",
                },
                {
                  korean: "이",
                  romanization: "i",
                  english: "two",
                  example: "이월 (February)",
                },
                {
                  korean: "삼",
                  romanization: "sam",
                  english: "three",
                  example: "삼월 (March)",
                },
                {
                  korean: "사",
                  romanization: "sa",
                  english: "four",
                  example: "사월 (April)",
                },
                {
                  korean: "오",
                  romanization: "o",
                  english: "five",
                  example: "오월 (May)",
                },
                {
                  korean: "육",
                  romanization: "yuk",
                  english: "six",
                  example: "육월 (June)",
                },
                {
                  korean: "칠",
                  romanization: "chil",
                  english: "seven",
                  example: "칠월 (July)",
                },
                {
                  korean: "팔",
                  romanization: "pal",
                  english: "eight",
                  example: "팔월 (August)",
                },
                {
                  korean: "구",
                  romanization: "gu",
                  english: "nine",
                  example: "구월 (September)",
                },
                {
                  korean: "십",
                  romanization: "sip",
                  english: "ten",
                  example: "십월 (October)",
                },
              ],
            },
            {
              title: "When to Use Each System",
              type: "grammar",
              explanation:
                "Native Korean numbers are used for counting objects, age, and hours. Sino-Korean numbers are used for dates, minutes, money, and phone numbers.",
              examples: [
                {
                  korean: "사람 세 명",
                  explanation: "Native Korean: three people (counting people)",
                },
                { korean: "3시", explanation: "Sino-Korean: 3 o'clock (time)" },
                {
                  korean: "스무 살",
                  explanation: "Native Korean: 20 years old (age)",
                },
                { korean: "3월", explanation: "Sino-Korean: March (month)" },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Number Pronunciation",
                description: "Practice pronouncing Korean numbers",
                items: [
                  "하나",
                  "둘",
                  "셋",
                  "넷",
                  "다섯",
                  "일",
                  "이",
                  "삼",
                  "사",
                  "오",
                ],
              },
              {
                type: "game",
                title: "Number Match",
                description: "Match Korean numbers with their values",
                gameType: "matching",
              },
              {
                type: "conversation",
                title: "Counting Practice",
                description: "Practice counting objects and telling time",
                prompt: "Count objects and tell the time",
              },
            ],
          },

          conversation: {
            introduction: `Let's practice using Korean numbers in conversation.`,
            dialogue: [
              { speaker: "tutor", text: "몇 개 있어요? (How many are there?)" },
              {
                speaker: "user",
                text: "사과 다섯 개 있어요. (There are five apples.)",
              },
              {
                speaker: "tutor",
                text: "지금 몇 시예요? (What time is it now?)",
              },
              { speaker: "user", text: "지금 3시예요. (It's 3 o'clock now.)" },
              { speaker: "tutor", text: "몇 살이에요? (How old are you?)" },
              {
                speaker: "user",
                text: "스물다섯 살이에요. (I'm 25 years old.)",
              },
              {
                speaker: "tutor",
                text: "잘했어요! 숫자를 잘 사용하네요. (Well done! You use numbers well.)",
              },
            ],
          },

          review: {
            summary: `Today we learned about Korean number systems. We covered native Korean numbers (하나, 둘, 셋...) and Sino-Korean numbers (일, 이, 삼...), and when to use each system.`,
            keyPoints: [
              "Korean has two number systems: native Korean and Sino-Korean",
              "Native Korean numbers are used for counting objects and age",
              "Sino-Korean numbers are used for dates, time, and money",
              "Both systems are essential for daily communication",
            ],
          },
        },
      },
      {
        id: "beginner-family",
        name: "Family & Relationships (가족과 관계)",
        description:
          "Learn vocabulary for family members and how to talk about relationships.",
        objectives: [
          "Learn family member vocabulary",
          "Describe family relationships",
          "Talk about ages and occupations",
        ],
        estimatedDuration: 25,
        xpReward: 100,
        requiredXp: 300,
        order: 2,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll learn about family and relationships in Korean. Family is very important in Korean culture, so learning these words will help you connect with Korean people.`,

          sections: [
            {
              title: "Family Members",
              type: "vocabulary",
              items: [
                {
                  korean: "가족",
                  romanization: "gajok",
                  english: "family",
                  example:
                    "우리 가족은 네 명이에요. (Our family has four people.)",
                },
                {
                  korean: "아버지",
                  romanization: "abeoji",
                  english: "father (formal)",
                  example:
                    "아버지는 회사원이에요. (My father is an office worker.)",
                },
                {
                  korean: "어머니",
                  romanization: "eomeoni",
                  english: "mother (formal)",
                  example: "어머니는 선생님이에요. (My mother is a teacher.)",
                },
                {
                  korean: "아빠",
                  romanization: "appa",
                  english: "dad",
                  example: "아빠가 집에 왔어요. (Dad came home.)",
                },
                {
                  korean: "엄마",
                  romanization: "eomma",
                  english: "mom",
                  example: "엄마는 요리를 잘해요. (Mom cooks well.)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Family Vocabulary Pronunciation",
                description: "Practice pronouncing family member words",
                items: ["가족", "아버지", "어머니", "아빠", "엄마"],
              },
            ],
          },

          conversation: {
            introduction: `Let's practice talking about family.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "가족이 몇 명이에요? (How many people are in your family?)",
              },
              {
                speaker: "user",
                text: "네 명이에요. 아버지, 어머니, 형, 그리고 저예요. (Four people. Father, mother, older brother, and me.)",
              },
            ],
          },

          review: {
            summary: `Today we learned about family in Korean. We covered basic family member vocabulary.`,
            keyPoints: [
              "Use formal terms 아버지/어머니 or casual 아빠/엄마 for parents",
              "Family is very important in Korean culture",
            ],
          },
        },
      },
    ],
  },
  {
    id: "beginner-essentials",
    name: "Essential Vocabulary",
    description:
      "Learn essential vocabulary for colors, food, shopping, and daily activities.",
    requiredXp: 400,
    order: 3,
    icon: "library-outline",
    color: "#A46E3E", // Rucksack Brown
    lessons: [
      {
        id: "beginner-colors",
        name: "Colors & Descriptions (색깔과 묘사)",
        description: "Learn colors and basic descriptive words in Korean.",
        objectives: [
          "Learn basic color vocabulary",
          "Describe objects using colors",
          "Use descriptive adjectives",
        ],
        estimatedDuration: 25,
        xpReward: 100,
        requiredXp: 400,
        order: 1,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll learn about colors and descriptions in Korean. Colors are essential vocabulary that you'll use every day to describe objects, clothes, and the world around you.`,

          sections: [
            {
              title: "Basic Colors",
              type: "vocabulary",
              items: [
                {
                  korean: "빨간색",
                  romanization: "ppalgansaek",
                  english: "red",
                  example: "빨간색 사과 (red apple)",
                },
                {
                  korean: "파란색",
                  romanization: "paransaek",
                  english: "blue",
                  example: "파란색 하늘 (blue sky)",
                },
                {
                  korean: "노란색",
                  romanization: "noransaek",
                  english: "yellow",
                  example: "노란색 바나나 (yellow banana)",
                },
                {
                  korean: "초록색",
                  romanization: "choroksaek",
                  english: "green",
                  example: "초록색 나무 (green tree)",
                },
                {
                  korean: "검은색",
                  romanization: "geomeunsaek",
                  english: "black",
                  example: "검은색 고양이 (black cat)",
                },
                {
                  korean: "흰색",
                  romanization: "huinsaek",
                  english: "white",
                  example: "흰색 눈 (white snow)",
                },
                {
                  korean: "갈색",
                  romanization: "galsaek",
                  english: "brown",
                  example: "갈색 머리 (brown hair)",
                },
                {
                  korean: "분홍색",
                  romanization: "bunhongsaek",
                  english: "pink",
                  example: "분홍색 꽃 (pink flower)",
                },
              ],
            },
            {
              title: "Descriptive Adjectives",
              type: "vocabulary",
              items: [
                {
                  korean: "크다",
                  romanization: "keuda",
                  english: "big/large",
                  example: "큰 집 (big house)",
                },
                {
                  korean: "작다",
                  romanization: "jakda",
                  english: "small",
                  example: "작은 강아지 (small dog)",
                },
                {
                  korean: "길다",
                  romanization: "gilda",
                  english: "long",
                  example: "긴 머리 (long hair)",
                },
                {
                  korean: "짧다",
                  romanization: "jjalpda",
                  english: "short",
                  example: "짧은 치마 (short skirt)",
                },
                {
                  korean: "예쁘다",
                  romanization: "yeppeuda",
                  english: "pretty/beautiful",
                  example: "예쁜 꽃 (pretty flower)",
                },
                {
                  korean: "멋있다",
                  romanization: "meositda",
                  english: "cool/handsome",
                  example: "멋있는 차 (cool car)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Color Pronunciation",
                description: "Practice pronouncing Korean colors",
                items: [
                  "빨간색",
                  "파란색",
                  "노란색",
                  "초록색",
                  "검은색",
                  "흰색",
                ],
              },
              {
                type: "game",
                title: "Color Match",
                description: "Match objects with their colors",
                gameType: "matching",
              },
            ],
          },

          conversation: {
            introduction: `Let's practice describing things using colors.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "이것은 무슨 색이에요? (What color is this?)",
              },
              { speaker: "user", text: "빨간색이에요. (It's red.)" },
              {
                speaker: "tutor",
                text: "맞아요! 빨간색 사과네요. (That's right! It's a red apple.)",
              },
            ],
          },

          review: {
            summary: `Today we learned about colors and descriptive words in Korean. We covered basic colors and how to use them to describe objects.`,
            keyPoints: [
              "Korean colors end with -색 (saek) meaning 'color'",
              "Adjectives come before nouns in Korean",
              "Use descriptive words to make your Korean more expressive",
            ],
          },
        },
      },
      {
        id: "beginner-food",
        name: "Food & Dining (음식과 식사)",
        description: "Learn food vocabulary and dining expressions.",
        objectives: [
          "Learn basic food vocabulary",
          "Order food at restaurants",
          "Express food preferences",
        ],
        estimatedDuration: 30,
        xpReward: 100,
        requiredXp: 500,
        order: 2,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll learn about food and dining in Korean. Food is a huge part of Korean culture, so this vocabulary will be very useful!`,

          sections: [
            {
              title: "Basic Foods",
              type: "vocabulary",
              items: [
                {
                  korean: "밥",
                  romanization: "bap",
                  english: "rice/meal",
                  example: "밥 먹었어요? (Did you eat?)",
                },
                {
                  korean: "김치",
                  romanization: "gimchi",
                  english: "kimchi",
                  example: "김치가 맛있어요. (Kimchi is delicious.)",
                },
                {
                  korean: "불고기",
                  romanization: "bulgogi",
                  english: "bulgogi (Korean BBQ)",
                  example: "불고기를 좋아해요. (I like bulgogi.)",
                },
                {
                  korean: "비빔밥",
                  romanization: "bibimbap",
                  english: "bibimbap (mixed rice)",
                  example: "비빔밥 하나 주세요. (One bibimbap, please.)",
                },
                {
                  korean: "물",
                  romanization: "mul",
                  english: "water",
                  example: "물 좀 주세요. (Please give me some water.)",
                },
                {
                  korean: "커피",
                  romanization: "keopi",
                  english: "coffee",
                  example: "커피 한 잔 주세요. (One cup of coffee, please.)",
                },
              ],
            },
            {
              title: "Restaurant Expressions",
              type: "vocabulary",
              items: [
                {
                  korean: "주문하다",
                  romanization: "jumunhada",
                  english: "to order",
                  example: "주문할게요. (I'll order.)",
                },
                {
                  korean: "맛있다",
                  romanization: "masitda",
                  english: "delicious",
                  example: "정말 맛있어요! (It's really delicious!)",
                },
                {
                  korean: "배고프다",
                  romanization: "baegopeuda",
                  english: "hungry",
                  example: "배고파요. (I'm hungry.)",
                },
                {
                  korean: "목마르다",
                  romanization: "mongmareuda",
                  english: "thirsty",
                  example: "목말라요. (I'm thirsty.)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Food Pronunciation",
                description: "Practice pronouncing Korean food words",
                items: ["밥", "김치", "불고기", "비빔밥", "물", "커피"],
              },
              {
                type: "conversation",
                title: "Restaurant Ordering",
                description: "Practice ordering food at a restaurant",
                prompt: "Order your favorite Korean dish",
              },
            ],
          },

          conversation: {
            introduction: `Let's practice ordering food at a Korean restaurant.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "어서 오세요! 뭘 드릴까요? (Welcome! What would you like?)",
              },
              {
                speaker: "user",
                text: "비빔밥 하나 주세요. (One bibimbap, please.)",
              },
              {
                speaker: "tutor",
                text: "음료수는 뭘 드릴까요? (What would you like to drink?)",
              },
              { speaker: "user", text: "물 주세요. (Water, please.)" },
              {
                speaker: "tutor",
                text: "네, 비빔밥 하나, 물 하나요. (Yes, one bibimbap and one water.)",
              },
            ],
          },

          review: {
            summary: `Today we learned about food and dining in Korean. We covered basic food vocabulary and restaurant expressions.`,
            keyPoints: [
              "밥 means both 'rice' and 'meal' in Korean",
              "Korean food names are often compound words",
              "Use 주세요 to politely ask for something",
              "Food is central to Korean culture and social life",
            ],
          },
        },
      },
    ],
  },
  {
    id: "beginner-practical",
    name: "Practical Communication",
    description:
      "Learn practical vocabulary for shopping, weather, time, and directions.",
    requiredXp: 600,
    order: 4,
    icon: "compass-outline",
    color: "#FF6B6B", // Warm Coral
    lessons: [
      {
        id: "beginner-shopping",
        name: "Shopping & Money (쇼핑과 돈)",
        description:
          "Learn shopping vocabulary and how to handle money transactions.",
        objectives: [
          "Learn shopping vocabulary",
          "Ask about prices",
          "Handle money transactions",
        ],
        estimatedDuration: 25,
        xpReward: 100,
        requiredXp: 600,
        order: 1,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll learn about shopping and money in Korean. This will help you navigate stores and markets in Korea.`,

          sections: [
            {
              title: "Shopping Vocabulary",
              type: "vocabulary",
              items: [
                {
                  korean: "가게",
                  romanization: "gage",
                  english: "store/shop",
                  example: "가게에 가요. (I'm going to the store.)",
                },
                {
                  korean: "시장",
                  romanization: "sijang",
                  english: "market",
                  example:
                    "시장에서 과일을 샀어요. (I bought fruit at the market.)",
                },
                {
                  korean: "돈",
                  romanization: "don",
                  english: "money",
                  example: "돈이 없어요. (I don't have money.)",
                },
                {
                  korean: "얼마예요?",
                  romanization: "eolmayeyo?",
                  english: "How much is it?",
                  example: "이거 얼마예요? (How much is this?)",
                },
                {
                  korean: "비싸다",
                  romanization: "bissada",
                  english: "expensive",
                  example: "너무 비싸요. (It's too expensive.)",
                },
                {
                  korean: "싸다",
                  romanization: "ssada",
                  english: "cheap",
                  example: "이거 싸네요! (This is cheap!)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Shopping Pronunciation",
                description: "Practice shopping-related vocabulary",
                items: ["가게", "시장", "돈", "얼마예요", "비싸다", "싸다"],
              },
            ],
          },

          conversation: {
            introduction: `Let's practice shopping in Korean.`,
            dialogue: [
              { speaker: "tutor", text: "어서 오세요! (Welcome!)" },
              {
                speaker: "user",
                text: "이 사과 얼마예요? (How much are these apples?)",
              },
              { speaker: "tutor", text: "5000원이에요. (It's 5000 won.)" },
              {
                speaker: "user",
                text: "좀 비싸네요. (That's a bit expensive.)",
              },
            ],
          },

          review: {
            summary: `Today we learned shopping vocabulary and how to ask about prices in Korean.`,
            keyPoints: [
              "Use 얼마예요? to ask about prices",
              "Korean won (원) is the currency",
              "Bargaining is common in traditional markets",
            ],
          },
        },
      },
      {
        id: "beginner-weather-time",
        name: "Weather & Time (날씨와 시간)",
        description: "Learn to talk about weather and tell time in Korean.",
        objectives: [
          "Describe weather conditions",
          "Tell time in Korean",
          "Talk about daily schedules",
        ],
        estimatedDuration: 30,
        xpReward: 100,
        requiredXp: 700,
        order: 2,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll learn about weather and time in Korean. These are essential topics for daily conversation.`,

          sections: [
            {
              title: "Weather Vocabulary",
              type: "vocabulary",
              items: [
                {
                  korean: "날씨",
                  romanization: "nalssi",
                  english: "weather",
                  example: "오늘 날씨가 좋아요. (The weather is nice today.)",
                },
                {
                  korean: "맑다",
                  romanization: "makda",
                  english: "clear/sunny",
                  example: "하늘이 맑아요. (The sky is clear.)",
                },
                {
                  korean: "비",
                  romanization: "bi",
                  english: "rain",
                  example: "비가 와요. (It's raining.)",
                },
                {
                  korean: "눈",
                  romanization: "nun",
                  english: "snow",
                  example: "눈이 와요. (It's snowing.)",
                },
                {
                  korean: "춥다",
                  romanization: "chupda",
                  english: "cold",
                  example: "오늘 추워요. (It's cold today.)",
                },
                {
                  korean: "덥다",
                  romanization: "deopda",
                  english: "hot",
                  example: "여름에는 더워요. (It's hot in summer.)",
                },
              ],
            },
            {
              title: "Time Expressions",
              type: "vocabulary",
              items: [
                {
                  korean: "시간",
                  romanization: "sigan",
                  english: "time",
                  example: "지금 몇 시예요? (What time is it now?)",
                },
                {
                  korean: "아침",
                  romanization: "achim",
                  english: "morning",
                  example: "아침에 운동해요. (I exercise in the morning.)",
                },
                {
                  korean: "점심",
                  romanization: "jeomsim",
                  english: "lunch/noon",
                  example: "점심 먹었어요? (Did you eat lunch?)",
                },
                {
                  korean: "저녁",
                  romanization: "jeonyeok",
                  english: "evening/dinner",
                  example: "저녁에 만나요. (Let's meet in the evening.)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Weather & Time Pronunciation",
                description: "Practice weather and time vocabulary",
                items: ["날씨", "맑다", "비", "눈", "시간", "아침"],
              },
            ],
          },

          conversation: {
            introduction: `Let's practice talking about weather and time.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "오늘 날씨 어때요? (How's the weather today?)",
              },
              {
                speaker: "user",
                text: "맑고 따뜻해요. (It's clear and warm.)",
              },
              {
                speaker: "tutor",
                text: "지금 몇 시예요? (What time is it now?)",
              },
              { speaker: "user", text: "2시예요. (It's 2 o'clock.)" },
            ],
          },

          review: {
            summary: `Today we learned about weather and time expressions in Korean.`,
            keyPoints: [
              "Weather adjectives change form when used in sentences",
              "Time is told using Sino-Korean numbers",
              "Weather is a common conversation starter",
            ],
          },
        },
      },
    ],
  },
];

export default beginnerModules;
