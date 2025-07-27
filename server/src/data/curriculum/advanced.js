/**
 * Advanced level curriculum content
 * Contains modules and lessons for the advanced level
 */

import { AI_TUTOR_NAME } from "../../constants/appConstants.js";

/**
 * Advanced level modules
 */
export const advancedModules = [
  {
    id: "advanced-cultural-fluency",
    name: "Cultural Fluency",
    description:
      "Develop deep understanding of Korean culture, customs, and social nuances.",
    requiredXp: 0,
    order: 1,
    icon: "globe-outline",
    color: "#8B5A96", // Deep Purple
    lessons: [
      {
        id: "advanced-culture-customs",
        name: "Korean Culture & Customs (한국 문화와 관습)",
        description:
          "Learn about Korean cultural concepts, social hierarchies, and customs.",
        objectives: [
          "Understand key cultural concepts",
          "Navigate social hierarchies",
          "Recognize and use cultural references",
        ],
        estimatedDuration: 40,
        xpReward: 200,
        requiredXp: 0,
        order: 1,
        content: {
          introduction: `안녕하세요! Welcome to this advanced lesson. I'm ${AI_TUTOR_NAME}, your Korean language tutor. Today we'll explore Korean culture and customs in depth. Understanding these cultural nuances will help you communicate more effectively and appropriately in Korean society.`,

          sections: [
            {
              title: "Key Cultural Concepts",
              type: "vocabulary",
              items: [
                {
                  korean: "정 (jeong)",
                  romanization: "jeong",
                  english: "affection/attachment",
                  example:
                    "한국 사람들은 정이 많아요. (Korean people have a lot of jeong.)",
                },
                {
                  korean: "눈치 (nunchi)",
                  romanization: "nunchi",
                  english: "social awareness",
                  example:
                    "눈치가 빠른 사람이에요. (He/she is a person with quick nunchi.)",
                },
                {
                  korean: "체면 (chemyeon)",
                  romanization: "chemyeon",
                  english: "social face/dignity",
                  example: "체면을 지키다 (to maintain one's social face)",
                },
                {
                  korean: "한 (han)",
                  romanization: "han",
                  english: "collective sorrow/resentment",
                  example:
                    "한국 문화에는 한의 정서가 있어요. (In Korean culture, there is the emotion of han.)",
                },
                {
                  korean: "우리 (uri)",
                  romanization: "uri",
                  english: "we/our (collective identity)",
                  example:
                    "우리 나라, 우리 회사, 우리 가족 (our country, our company, our family)",
                },
              ],
            },
            {
              title: "Social Hierarchy",
              type: "vocabulary",
              items: [
                {
                  korean: "존댓말",
                  romanization: "jondaetmal",
                  english: "honorific speech",
                  example:
                    "윗사람에게는 존댓말을 써야 해요. (You should use honorific speech to superiors.)",
                },
                {
                  korean: "반말",
                  romanization: "banmal",
                  english: "casual speech",
                  example:
                    "친한 친구에게는 반말을 써요. (You use casual speech with close friends.)",
                },
                {
                  korean: "선배",
                  romanization: "seonbae",
                  english: "senior (school/work)",
                  example:
                    "선배님께 조언을 구했어요. (I sought advice from my senior.)",
                },
                {
                  korean: "후배",
                  romanization: "hubae",
                  english: "junior (school/work)",
                  example:
                    "후배들을 잘 이끌어야 해요. (You should lead your juniors well.)",
                },
                {
                  korean: "윗사람",
                  romanization: "witsaram",
                  english: "superior/elder",
                  example:
                    "윗사람을 공경해야 해요. (You should respect your elders/superiors.)",
                },
              ],
            },
            {
              title: "Honorific Forms",
              type: "grammar",
              explanation:
                "Korean has an extensive honorific system that reflects social relationships. This includes special honorific vocabulary and grammatical forms.",
              examples: [
                {
                  korean: "드시다",
                  romanization: "deusida",
                  english: "to eat (honorific)",
                  explanation: "먹다 (to eat) → 드시다 (honorific form)",
                },
                {
                  korean: "주무시다",
                  romanization: "jumusida",
                  english: "to sleep (honorific)",
                  explanation: "자다 (to sleep) → 주무시다 (honorific form)",
                },
                {
                  korean: "계시다",
                  romanization: "gyesida",
                  english: "to be/exist (honorific)",
                  explanation: "있다 (to be/exist) → 계시다 (honorific form)",
                },
                {
                  korean: "말씀하시다",
                  romanization: "malsseumhasida",
                  english: "to speak (honorific)",
                  explanation:
                    "말하다 (to speak) → 말씀하시다 (honorific form)",
                },
              ],
            },
            {
              title: "Cultural Customs",
              type: "vocabulary",
              items: [
                {
                  korean: "세배",
                  romanization: "sebae",
                  english: "New Year's bow",
                  example:
                    "설날에 어른들께 세배를 드려요. (On Lunar New Year, we give a formal bow to elders.)",
                },
                {
                  korean: "명절",
                  romanization: "myeongjeol",
                  english: "traditional holiday",
                  example:
                    "한국의 가장 큰 명절은 설날과 추석이에요. (Korea's biggest traditional holidays are Lunar New Year and Chuseok.)",
                },
                {
                  korean: "제사",
                  romanization: "jesa",
                  english: "ancestral rite",
                  example:
                    "많은 가정에서 조상을 위한 제사를 지내요. (Many families perform ancestral rites for their ancestors.)",
                },
                {
                  korean: "상견례",
                  romanization: "sanggyeonrye",
                  english: "meeting between families before marriage",
                  example:
                    "결혼 전에 양가 가족이 만나는 상견례를 해요. (Before marriage, the two families meet in a formal meeting.)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "conversation",
                title: "Honorific Practice",
                description:
                  "Practice using appropriate honorific forms in different social situations",
                prompt:
                  "Have a conversation with your professor about your research",
              },
              {
                type: "game",
                title: "Cultural Scenario Navigation",
                description:
                  "Navigate through different cultural scenarios and choose appropriate responses",
                gameType: "scenario",
              },
              {
                type: "writing",
                title: "Cultural Concept Explanation",
                description:
                  "Write a short explanation of a Korean cultural concept in Korean",
                prompt: 'Explain the concept of "jeong" in Korean culture',
              },
            ],
          },

          conversation: {
            introduction: `Let's practice navigating a culturally nuanced situation in Korean.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "안녕하세요! 오늘은 회사 회식에 참석하는 상황을 연습해 볼게요. (Hello! Today we'll practice a situation where you're attending a company dinner.)",
              },
              {
                speaker: "tutor",
                text: "(당신은 한국 회사의 신입사원입니다. 부장님이 술을 따라주십니다.) (You are a new employee at a Korean company. The department head is pouring you a drink.)",
              },
              {
                speaker: "tutor",
                text: "부장님: 자, 한잔 하세요. (Here, have a drink.)",
              },
              {
                speaker: "user",
                text: "감사합니다. 제가 받겠습니다. (Thank you. I'll receive it.)",
              },
              {
                speaker: "tutor",
                text: "좋아요! 술을 받을 때는 두 손으로 받는 것이 예의 바른 행동이에요. (Good! When receiving a drink, it's polite to use both hands.)",
              },
              {
                speaker: "tutor",
                text: "부장님: 우리 회사에 온 소감이 어때요? (How do you feel about joining our company?)",
              },
              {
                speaker: "user",
                text: "정말 좋습니다. 많이 배우고 있습니다. (It's really good. I'm learning a lot.)",
              },
              {
                speaker: "tutor",
                text: "잘 했어요! 겸손하게 대답하는 것이 좋아요. 이제 부장님께 술을 따라드려야 할 때입니다. 어떻게 할까요? (Well done! It's good to answer humbly. Now it's time to pour a drink for the department head. What should you do?)",
              },
              {
                speaker: "user",
                text: "제가 한잔 따라드리겠습니다. (Let me pour you a drink.)",
              },
              {
                speaker: "tutor",
                text: "네, 좋아요! 그리고 술을 따를 때는 병을 두 손으로 잡고, 오른손으로 따르는 것이 예의 바른 행동이에요. (Yes, good! And when pouring a drink, it's polite to hold the bottle with both hands and pour with your right hand.)",
              },
            ],
          },

          review: {
            summary: `Today we explored Korean culture and customs, focusing on key cultural concepts, social hierarchy, honorific forms, and cultural customs. Understanding these aspects is crucial for navigating Korean society appropriately.`,
            keyPoints: [
              "Korean culture emphasizes concepts like jeong (정), nunchi (눈치), and chemyeon (체면)",
              "Social hierarchy is reflected in language through honorific forms",
              "Many everyday verbs have special honorific forms",
              "Traditional customs like sebae (세배) and jesa (제사) remain important in modern Korean society",
            ],
          },
        },
      },
      {
        id: "advanced-media-entertainment",
        name: "Media & Entertainment (미디어와 엔터테인먼트)",
        description:
          "Learn to discuss Korean films, music, and TV shows with cultural context.",
        objectives: [
          "Discuss Korean films, music, and TV",
          "Express opinions about media",
          "Understand cultural references in entertainment",
        ],
        estimatedDuration: 35,
        xpReward: 200,
        requiredXp: 200,
        order: 2,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll explore Korean media and entertainment. From K-dramas to K-pop, Korean entertainment has become a global phenomenon. Let's learn how to discuss and appreciate Korean media with proper cultural context.`,

          sections: [
            {
              title: "Korean Wave (한류)",
              type: "vocabulary",
              items: [
                {
                  korean: "한류",
                  romanization: "hallyu",
                  english: "Korean Wave",
                  example:
                    "한류가 전 세계로 퍼지고 있어요. (The Korean Wave is spreading worldwide.)",
                },
                {
                  korean: "케이팝",
                  romanization: "keipap",
                  english: "K-pop",
                  example:
                    "케이팝이 세계적으로 인기가 많아요. (K-pop is very popular worldwide.)",
                },
                {
                  korean: "드라마",
                  romanization: "deurama",
                  english: "drama/TV series",
                  example:
                    "한국 드라마를 보면서 한국어를 배워요. (I learn Korean by watching Korean dramas.)",
                },
                {
                  korean: "영화",
                  romanization: "yeonghwa",
                  english: "movie",
                  example:
                    "한국 영화가 칸 영화제에서 상을 받았어요. (A Korean movie won an award at the Cannes Film Festival.)",
                },
                {
                  korean: "예능",
                  romanization: "yeneung",
                  english: "variety show",
                  example:
                    "예능 프로그램을 보면 재미있어요. (Variety shows are fun to watch.)",
                },
              ],
            },
            {
              title: "Entertainment Vocabulary",
              type: "vocabulary",
              items: [
                {
                  korean: "배우",
                  romanization: "baeu",
                  english: "actor/actress",
                  example:
                    "그 배우는 연기를 정말 잘해요. (That actor/actress acts really well.)",
                },
                {
                  korean: "가수",
                  romanization: "gasu",
                  english: "singer",
                  example:
                    "제가 좋아하는 가수가 새 앨범을 냈어요. (My favorite singer released a new album.)",
                },
                {
                  korean: "아이돌",
                  romanization: "aidol",
                  english: "idol",
                  example:
                    "케이팝 아이돌들이 춤을 잘 춰요. (K-pop idols dance very well.)",
                },
                {
                  korean: "감독",
                  romanization: "gamdok",
                  english: "director",
                  example:
                    "봉준호 감독의 영화를 좋아해요. (I like director Bong Joon-ho's movies.)",
                },
                {
                  korean: "팬",
                  romanization: "paen",
                  english: "fan",
                  example:
                    "저는 BTS의 열렬한 팬이에요. (I'm an enthusiastic fan of BTS.)",
                },
              ],
            },
            {
              title: "Expressing Opinions",
              type: "grammar",
              explanation:
                "Learn how to express opinions about entertainment and media in Korean.",
              examples: [
                { korean: "제 생각에는...", explanation: "In my opinion..." },
                { korean: "...라고 생각해요", explanation: "I think that..." },
                { korean: "...는 것 같아요", explanation: "It seems like..." },
                {
                  korean: "정말 재미있어요",
                  explanation: "It's really interesting/fun",
                },
                { korean: "별로예요", explanation: "It's not that good" },
              ],
            },
            {
              title: "Media Genres",
              type: "vocabulary",
              items: [
                {
                  korean: "로맨스",
                  romanization: "romaenseu",
                  english: "romance",
                  example: "로맨스 드라마를 좋아해요. (I like romance dramas.)",
                },
                {
                  korean: "액션",
                  romanization: "aeksyeon",
                  english: "action",
                  example:
                    "액션 영화는 스릴이 있어요. (Action movies are thrilling.)",
                },
                {
                  korean: "코미디",
                  romanization: "komidi",
                  english: "comedy",
                  example:
                    "코미디 프로그램을 보면 웃겨요. (Comedy programs are funny to watch.)",
                },
                {
                  korean: "스릴러",
                  romanization: "seurilleo",
                  english: "thriller",
                  example:
                    "스릴러 영화는 긴장돼요. (Thriller movies are suspenseful.)",
                },
                {
                  korean: "다큐멘터리",
                  romanization: "dakyumeonteo",
                  english: "documentary",
                  example:
                    "다큐멘터리는 교육적이에요. (Documentaries are educational.)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "conversation",
                title: "Media Discussion",
                description:
                  "Discuss your favorite Korean entertainment with proper opinions",
                prompt:
                  "Talk about a Korean drama or movie you recently watched",
              },
              {
                type: "game",
                title: "Entertainment Quiz",
                description:
                  "Test your knowledge of Korean entertainment vocabulary",
                gameType: "quiz",
              },
              {
                type: "writing",
                title: "Media Review",
                description:
                  "Write a short review of a Korean entertainment piece",
                prompt: "Write a review of your favorite K-pop song or K-drama",
              },
            ],
          },

          conversation: {
            introduction: `Let's have a conversation about Korean entertainment.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "요즘 어떤 한국 드라마를 보고 있어요? (What Korean drama are you watching these days?)",
              },
              {
                speaker: "user",
                text: '요즘 "오징어 게임"을 보고 있어요. (I\'m watching "Squid Game" these days.)',
              },
              {
                speaker: "tutor",
                text: "아, 그 드라마 정말 유명하죠! 어떤 점이 좋았어요? (Ah, that drama is really famous! What did you like about it?)",
              },
              {
                speaker: "user",
                text: "스토리가 정말 흥미진진해요. 그리고 사회 문제도 다뤄서 생각할 거리가 많아요. (The story is really exciting. And it deals with social issues, so there's a lot to think about.)",
              },
              {
                speaker: "tutor",
                text: "맞아요. 한국 드라마는 재미와 함께 사회적 메시지도 전달하는 경우가 많아요. (That's right. Korean dramas often deliver social messages along with entertainment.)",
              },
              {
                speaker: "tutor",
                text: "케이팝도 좋아하세요? (Do you also like K-pop?)",
              },
              {
                speaker: "user",
                text: "네, BTS와 블랙핑크를 좋아해요. 음악도 좋고 춤도 멋있어요. (Yes, I like BTS and BLACKPINK. The music is good and the dancing is cool.)",
              },
              {
                speaker: "tutor",
                text: "한류가 전 세계적으로 인기인 이유를 알 것 같아요. 높은 퀄리티와 독특한 문화가 매력적이죠. (I can see why the Korean Wave is popular worldwide. The high quality and unique culture are attractive.)",
              },
            ],
          },

          review: {
            summary: `Today we explored Korean media and entertainment, learning about the Korean Wave, entertainment vocabulary, and how to express opinions about media. We also discussed various genres and cultural aspects of Korean entertainment.`,
            keyPoints: [
              "The Korean Wave (한류) has made Korean entertainment globally popular",
              "Key entertainment vocabulary includes 배우 (actor), 가수 (singer), 드라마 (drama)",
              'Use expressions like "제 생각에는..." to give opinions about media',
              "Korean entertainment often combines entertainment with social messages",
            ],
          },
        },
      },
    ],
  },
  {
    id: "advanced-professional",
    name: "Professional Korean",
    description: "Master Korean for professional and academic contexts.",
    requiredXp: 400,
    order: 2,
    icon: "business-outline",
    color: "#5BC4B3", // Explorer Teal
    lessons: [
      {
        id: "advanced-business",
        name: "Business Korean (비즈니스 한국어)",
        description:
          "Learn vocabulary and expressions for professional business settings.",
        objectives: [
          "Navigate professional settings",
          "Conduct business meetings",
          "Write professional emails",
        ],
        estimatedDuration: 40,
        xpReward: 200,
        requiredXp: 0,
        order: 1,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll learn Business Korean, essential for professional success in Korea. We'll cover formal business vocabulary, meeting etiquette, and professional communication skills.`,

          sections: [
            {
              title: "Business Vocabulary",
              type: "vocabulary",
              items: [
                {
                  korean: "회사",
                  romanization: "hoesa",
                  english: "company",
                  example:
                    "저희 회사는 IT 회사입니다. (Our company is an IT company.)",
                },
                {
                  korean: "사업",
                  romanization: "saeop",
                  english: "business",
                  example:
                    "새로운 사업을 시작했습니다. (We started a new business.)",
                },
                {
                  korean: "계약",
                  romanization: "gyeyak",
                  english: "contract",
                  example:
                    "계약서에 서명해 주세요. (Please sign the contract.)",
                },
                {
                  korean: "회의",
                  romanization: "hoeui",
                  english: "meeting",
                  example:
                    "오후에 중요한 회의가 있습니다. (There's an important meeting this afternoon.)",
                },
                {
                  korean: "프로젝트",
                  romanization: "peurojekteu",
                  english: "project",
                  example:
                    "이 프로젝트는 매우 중요합니다. (This project is very important.)",
                },
                {
                  korean: "매출",
                  romanization: "maechul",
                  english: "sales/revenue",
                  example:
                    "올해 매출이 증가했습니다. (This year's sales increased.)",
                },
              ],
            },
            {
              title: "Professional Titles",
              type: "vocabulary",
              items: [
                {
                  korean: "사장님",
                  romanization: "sajangnim",
                  english: "president/CEO",
                  example: "사장님께서 말씀하셨습니다. (The president said.)",
                },
                {
                  korean: "부장님",
                  romanization: "bujangnim",
                  english: "department head",
                  example:
                    "부장님께 보고드리겠습니다. (I will report to the department head.)",
                },
                {
                  korean: "과장님",
                  romanization: "gwajangnim",
                  english: "section chief",
                  example:
                    "과장님의 지시를 따르겠습니다. (I will follow the section chief's instructions.)",
                },
                {
                  korean: "대리님",
                  romanization: "daerinim",
                  english: "assistant manager",
                  example:
                    "대리님께서 도와주셨습니다. (The assistant manager helped.)",
                },
                {
                  korean: "팀장님",
                  romanization: "timjangnim",
                  english: "team leader",
                  example:
                    "팀장님과 상의하겠습니다. (I will consult with the team leader.)",
                },
              ],
            },
            {
              title: "Meeting Expressions",
              type: "vocabulary",
              items: [
                {
                  korean: "회의를 시작하겠습니다",
                  romanization: "hoeuireul sijakhagesseumnida",
                  english: "Let's start the meeting",
                  example:
                    "그럼 회의를 시작하겠습니다. (Then, let's start the meeting.)",
                },
                {
                  korean: "의견을 말씀해 주세요",
                  romanization: "uigyeoneul malsseumhae juseyo",
                  english: "Please share your opinion",
                  example:
                    "이 안건에 대한 의견을 말씀해 주세요. (Please share your opinion on this agenda item.)",
                },
                {
                  korean: "검토해 보겠습니다",
                  romanization: "geomtohae bogesseumnida",
                  english: "I will review it",
                  example:
                    "제안서를 검토해 보겠습니다. (I will review the proposal.)",
                },
                {
                  korean: "결정하겠습니다",
                  romanization: "gyeoljeonghagesseumnida",
                  english: "I will decide",
                  example:
                    "내일까지 결정하겠습니다. (I will decide by tomorrow.)",
                },
                {
                  korean: "보고드리겠습니다",
                  romanization: "bogodeurigesseumnida",
                  english: "I will report",
                  example:
                    "결과를 보고드리겠습니다. (I will report the results.)",
                },
              ],
            },
            {
              title: "Email Expressions",
              type: "vocabulary",
              items: [
                {
                  korean: "안녕하십니까",
                  romanization: "annyeonghasimnikka",
                  english: "formal greeting (email)",
                  example:
                    "안녕하십니까. 김철수입니다. (Hello. This is Kim Chul-su.)",
                },
                {
                  korean: "첨부파일",
                  romanization: "cheombupaeil",
                  english: "attachment",
                  example:
                    "첨부파일을 확인해 주세요. (Please check the attachment.)",
                },
                {
                  korean: "회신",
                  romanization: "hoesin",
                  english: "reply",
                  example: "빠른 회신 부탁드립니다. (Please reply quickly.)",
                },
                {
                  korean: "감사합니다",
                  romanization: "gamsahamnida",
                  english: "thank you (formal)",
                  example:
                    "협조해 주셔서 감사합니다. (Thank you for your cooperation.)",
                },
                {
                  korean: "수고하십시오",
                  romanization: "sugohasisio",
                  english: "formal closing",
                  example: "수고하십시오. (Take care/Good work.)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "conversation",
                title: "Business Meeting Simulation",
                description: "Practice conducting a formal business meeting",
                prompt: "Lead a project status meeting with your team",
              },
              {
                type: "writing",
                title: "Professional Email",
                description: "Write a formal business email",
                prompt: "Write an email to a client about a project update",
              },
              {
                type: "game",
                title: "Business Etiquette Quiz",
                description: "Test your knowledge of Korean business etiquette",
                gameType: "quiz",
              },
            ],
          },

          conversation: {
            introduction: `Let's practice a business meeting scenario.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "안녕하십니까. 오늘 회의에 참석해 주셔서 감사합니다. (Hello. Thank you for attending today's meeting.)",
              },
              {
                speaker: "user",
                text: "안녕하십니까. 참석할 수 있어서 영광입니다. (Hello. It's an honor to be able to attend.)",
              },
              {
                speaker: "tutor",
                text: "그럼 오늘의 안건부터 시작하겠습니다. 새 프로젝트에 대해 논의하겠습니다. (Then let's start with today's agenda. We'll discuss the new project.)",
              },
              {
                speaker: "user",
                text: "네, 좋습니다. 프로젝트 계획서를 준비했습니다. (Yes, good. I've prepared the project plan.)",
              },
              {
                speaker: "tutor",
                text: "훌륭합니다. 발표해 주시겠습니까? (Excellent. Would you please present it?)",
              },
              {
                speaker: "user",
                text: "네, 발표하겠습니다. 이 프로젝트의 목표는... (Yes, I'll present. The goal of this project is...)",
              },
              {
                speaker: "tutor",
                text: "좋은 제안입니다. 예산은 어떻게 계획하셨나요? (That's a good proposal. How did you plan the budget?)",
              },
              {
                speaker: "user",
                text: "예산은 총 1억 원으로 계획했습니다. 자세한 내용은 첨부파일을 참고해 주세요. (The budget is planned for a total of 100 million won. Please refer to the attachment for details.)",
              },
            ],
          },

          review: {
            summary: `Today we learned Business Korean, covering essential vocabulary for professional settings, meeting expressions, and email communication. These skills are crucial for success in Korean business environments.`,
            keyPoints: [
              "Use formal titles like 사장님, 부장님, 과장님 in business settings",
              "Business meetings require formal language and proper etiquette",
              "Email communication should use formal expressions like 안녕하십니까 and 수고하십시오",
              "Always show respect and use honorific forms when speaking to superiors",
            ],
          },
        },
      },
    ],
  },
];

export default advancedModules;
