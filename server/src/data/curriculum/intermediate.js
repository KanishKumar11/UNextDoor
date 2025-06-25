/**
 * Intermediate level curriculum content
 * Contains modules and lessons for the intermediate level
 */

import { AI_TUTOR_NAME } from "../../constants/appConstants.js";

/**
 * Intermediate level modules
 */
export const intermediateModules = [
  {
    id: "intermediate-communication",
    name: "Communication Skills",
    description:
      "Develop more advanced communication skills for various social situations.",
    requiredXp: 0,
    order: 1,
    icon: "chatbubbles-outline",
    color: "#3498db", // Blue color
    lessons: [
      {
        id: "intermediate-making-plans",
        name: "Making Plans (계획 세우기)",
        description:
          "Learn how to make plans, arrange meetings, and discuss schedules in Korean.",
        objectives: [
          "Arrange meetings and appointments",
          "Discuss schedules and availability",
          "Make suggestions for activities",
        ],
        estimatedDuration: 35,
        xpReward: 150,
        requiredXp: 0,
        order: 1,
        content: {
          introduction: `안녕하세요! Welcome to this intermediate lesson. I'm ${AI_TUTOR_NAME}, your Korean language tutor. Today we'll learn how to make plans in Korean. This is an essential skill for socializing with Korean speakers and arranging meetings or activities.`,

          sections: [
            {
              title: "Time Expressions",
              type: "vocabulary",
              items: [
                {
                  korean: "언제",
                  romanization: "eonje",
                  english: "when",
                  example: "언제 만날까요? (When shall we meet?)",
                },
                {
                  korean: "오늘",
                  romanization: "oneul",
                  english: "today",
                  example: "오늘 시간 있어요? (Do you have time today?)",
                },
                {
                  korean: "내일",
                  romanization: "naeil",
                  english: "tomorrow",
                  example:
                    "내일 같이 점심 먹을래요? (Would you like to have lunch together tomorrow?)",
                },
                {
                  korean: "모레",
                  romanization: "more",
                  english: "day after tomorrow",
                  example:
                    "모레 시간이 있어요. (I have time the day after tomorrow.)",
                },
                {
                  korean: "주말",
                  romanization: "jumal",
                  english: "weekend",
                  example:
                    "주말에 뭐 할 거예요? (What will you do on the weekend?)",
                },
                {
                  korean: "평일",
                  romanization: "pyeongil",
                  english: "weekday",
                  example: `평일에는 바빠요. (I'm busy on weekdays.)`,
                },
              ],
            },
            {
              title: "Suggesting Activities",
              type: "vocabulary",
              items: [
                {
                  korean: "~(으)ㄹ래요?",
                  romanization: "~(eu)llaeyo?",
                  english: "Would you like to...?",
                  example: "영화 볼래요? (Would you like to watch a movie?)",
                },
                {
                  korean: "~(으)ㄹ까요?",
                  romanization: "~(eu)lkkayo?",
                  english: "Shall we...?",
                  example: "카페에 갈까요? (Shall we go to a cafe?)",
                },
                {
                  korean: "~하고 싶어요",
                  romanization: "~hago sipeoyo",
                  english: "I want to...",
                  example:
                    "한국 음식을 먹고 싶어요. (I want to eat Korean food.)",
                },
                {
                  korean: "어때요?",
                  romanization: "eottaeyo?",
                  english: "How about...?",
                  example:
                    "토요일 오후는 어때요? (How about Saturday afternoon?)",
                },
              ],
            },
            {
              title: "Accepting and Declining",
              type: "vocabulary",
              items: [
                {
                  korean: "좋아요",
                  romanization: "joayo",
                  english: "Sounds good",
                  example:
                    "좋아요, 그때 만나요. (Sounds good, let's meet then.)",
                },
                {
                  korean: "괜찮아요",
                  romanization: "gwaenchanayo",
                  english: "That's fine/okay",
                  example:
                    "3시에 만나는 거 괜찮아요? (Is it okay to meet at 3?)",
                },
                {
                  korean: "미안해요",
                  romanization: "mianhaeyo",
                  english: "I'm sorry",
                  example:
                    "미안해요, 그때 약속이 있어요. (I'm sorry, I have an appointment then.)",
                },
                {
                  korean: "다음에",
                  romanization: "daeume",
                  english: "Next time",
                  example: "다음에 같이 가요. (Let's go together next time.)",
                },
                {
                  korean: "바빠요",
                  romanization: "bappayo",
                  english: "I'm busy",
                  example: "이번 주말에는 바빠요. (I'm busy this weekend.)",
                },
              ],
            },
            {
              title: "Future Tense",
              type: "grammar",
              explanation:
                "In Korean, the future tense is formed by adding ~(으)ㄹ 거예요 to the verb stem. This is used to express plans or intentions for the future.",
              examples: [
                {
                  korean: "공부할 거예요",
                  romanization: "gongbuhal geoyeyo",
                  english: "I will study",
                  explanation:
                    "공부하다 (to study) + ~ㄹ 거예요 = 공부할 거예요",
                },
                {
                  korean: "만날 거예요",
                  romanization: "mannal geoyeyo",
                  english: "I will meet",
                  explanation: "만나다 (to meet) + ~ㄹ 거예요 = 만날 거예요",
                },
                {
                  korean: "갈 거예요",
                  romanization: "gal geoyeyo",
                  english: "I will go",
                  explanation: "가다 (to go) + ~ㄹ 거예요 = 갈 거예요",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Time Expression Pronunciation",
                description: "Practice pronouncing time-related vocabulary",
                items: ["언제", "오늘", "내일", "모레", "주말", "평일"],
              },
              {
                type: "game",
                title: "Plan Making Simulation",
                description: "Create a dialogue to make plans with a friend",
                gameType: "roleplay",
              },
              {
                type: "conversation",
                title: "Schedule Planning",
                description:
                  "Practice suggesting activities and responding to suggestions",
                prompt: "Suggest meeting for coffee and negotiate a time",
              },
            ],
          },

          conversation: {
            introduction: `Let's practice making plans in Korean with a realistic conversation.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "안녕하세요! 이번 주말에 시간 있어요? (Hello! Do you have time this weekend?)",
              },
              {
                speaker: "user",
                text: "네, 토요일 오후에 시간 있어요. (Yes, I have time on Saturday afternoon.)",
              },
              {
                speaker: "tutor",
                text: "좋아요! 같이 영화 볼래요? 새로운 한국 영화가 개봉했어요. (Great! Would you like to watch a movie together? A new Korean movie has been released.)",
              },
              {
                speaker: "user",
                text: "좋아요. 몇 시에 만날까요? (Sounds good. What time shall we meet?)",
              },
              {
                speaker: "tutor",
                text: "3시 어때요? 영화는 4시에 시작해요. (How about 3 o'clock? The movie starts at 4.)",
              },
              {
                speaker: "user",
                text: "3시 괜찮아요. 어디에서 만날까요? (3 o'clock is fine. Where shall we meet?)",
              },
              {
                speaker: "tutor",
                text: "영화관 앞에서 만나요. 그럼 토요일 3시에 봐요! (Let's meet in front of the movie theater. See you Saturday at 3!)",
              },
              {
                speaker: "user",
                text: "네, 토요일에 봐요! (Yes, see you on Saturday!)",
              },
            ],
          },

          review: {
            summary: `Today we learned how to make plans in Korean. We covered time expressions, suggesting activities, accepting and declining invitations, and using the future tense. These skills will help you arrange social activities with Korean speakers.`,
            keyPoints: [
              "Use ~(으)ㄹ래요? to suggest activities in a casual way",
              "Use ~(으)ㄹ까요? to make suggestions as questions",
              "The future tense is formed with ~(으)ㄹ 거예요",
              "Time expressions like 오늘, 내일, 모레, and 주말 are essential for scheduling",
            ],
          },
        },
      },
      {
        id: "intermediate-transportation",
        name: "Transportation (교통)",
        description:
          "Learn vocabulary and phrases for using public transportation and giving directions.",
        objectives: [
          "Navigate public transportation",
          "Ask for and give directions",
          "Describe locations and routes",
        ],
        estimatedDuration: 30,
        xpReward: 150,
        requiredXp: 150,
        order: 2,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll learn about transportation in Korea. This lesson will help you navigate public transportation, ask for directions, and describe locations. These skills are essential for getting around in Korea!`,

          sections: [
            {
              title: "Transportation Vocabulary",
              type: "vocabulary",
              items: [
                {
                  korean: "지하철",
                  romanization: "jihacheol",
                  english: "subway",
                  example: "지하철로 갈게요. (I'll go by subway.)",
                },
                {
                  korean: "버스",
                  romanization: "beoseu",
                  english: "bus",
                  example: "버스 정류장이 어디예요? (Where is the bus stop?)",
                },
                {
                  korean: "택시",
                  romanization: "taeksi",
                  english: "taxi",
                  example: "택시를 타고 싶어요. (I want to take a taxi.)",
                },
                {
                  korean: "기차",
                  romanization: "gicha",
                  english: "train",
                  example:
                    "기차표를 사야 해요. (I need to buy a train ticket.)",
                },
                {
                  korean: "비행기",
                  romanization: "bihaenggi",
                  english: "airplane",
                  example:
                    "비행기로 부산에 갔어요. (I went to Busan by plane.)",
                },
                {
                  korean: "자전거",
                  romanization: "jajeongeo",
                  english: "bicycle",
                  example: "자전거를 빌릴 수 있어요? (Can I rent a bicycle?)",
                },
              ],
            },
            {
              title: "Asking for Directions",
              type: "vocabulary",
              items: [
                {
                  korean: "어디예요?",
                  romanization: "eodiyeyo?",
                  english: "Where is...?",
                  example: "화장실이 어디예요? (Where is the bathroom?)",
                },
                {
                  korean: "어떻게 가요?",
                  romanization: "eotteoke gayo?",
                  english: "How do I get there?",
                  example: "명동에 어떻게 가요? (How do I get to Myeongdong?)",
                },
                {
                  korean: "길을 잃었어요",
                  romanization: "gireul ireosseoyo",
                  english: "I'm lost",
                  example: "죄송해요, 길을 잃었어요. (Sorry, I'm lost.)",
                },
                {
                  korean: "도와주세요",
                  romanization: "dowajuseyo",
                  english: "Please help me",
                  example:
                    "길 좀 도와주세요. (Please help me with directions.)",
                },
              ],
            },
            {
              title: "Giving Directions",
              type: "vocabulary",
              items: [
                {
                  korean: "직진하세요",
                  romanization: "jikjinhaseyo",
                  english: "Go straight",
                  example: "이 길로 직진하세요. (Go straight on this road.)",
                },
                {
                  korean: "왼쪽으로 가세요",
                  romanization: "oenjjogeuro gaseyo",
                  english: "Go left",
                  example:
                    "신호등에서 왼쪽으로 가세요. (Turn left at the traffic light.)",
                },
                {
                  korean: "오른쪽으로 가세요",
                  romanization: "oreunjjogeuro gaseyo",
                  english: "Go right",
                  example:
                    "은행 앞에서 오른쪽으로 가세요. (Turn right in front of the bank.)",
                },
                {
                  korean: "건너편",
                  romanization: "geonneopyeon",
                  english: "across/opposite side",
                  example: "길 건너편에 있어요. (It's across the street.)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Transportation Pronunciation",
                description: "Practice pronouncing transportation vocabulary",
                items: ["지하철", "버스", "택시", "기차", "비행기", "자전거"],
              },
              {
                type: "game",
                title: "Direction Match",
                description: "Match Korean directions with their meanings",
                gameType: "matching",
              },
              {
                type: "conversation",
                title: "Navigation Practice",
                description: "Practice asking for and giving directions",
                prompt: "Ask how to get to a popular tourist destination",
              },
            ],
          },

          conversation: {
            introduction: `Let's practice asking for directions and discussing transportation.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "실례합니다. 명동에 어떻게 가요? (Excuse me. How do I get to Myeongdong?)",
              },
              {
                speaker: "user",
                text: "지하철을 타세요. 2호선으로 가면 돼요. (Take the subway. You can go on Line 2.)",
              },
              {
                speaker: "tutor",
                text: "지하철역이 어디예요? (Where is the subway station?)",
              },
              {
                speaker: "user",
                text: "이 길로 직진하세요. 5분 정도 걸어가면 있어요. (Go straight on this road. Walk for about 5 minutes and you'll find it.)",
              },
              {
                speaker: "tutor",
                text: "감사합니다! 명동역에서 내리면 되나요? (Thank you! Should I get off at Myeongdong Station?)",
              },
              {
                speaker: "user",
                text: "네, 맞아요. 명동역 4번 출구로 나오세요. (Yes, that's right. Come out of Exit 4 at Myeongdong Station.)",
              },
            ],
          },

          review: {
            summary: `Today we learned about transportation and directions in Korean. We covered various modes of transportation, how to ask for and give directions, and essential vocabulary for navigating in Korea.`,
            keyPoints: [
              "Korean transportation vocabulary includes 지하철 (subway), 버스 (bus), and 택시 (taxi)",
              "Use 어디예요? to ask where something is",
              "Use 어떻게 가요? to ask how to get somewhere",
              "Direction words: 직진 (straight), 왼쪽 (left), 오른쪽 (right)",
            ],
          },
        },
      },
    ],
  },
  {
    id: "intermediate-practical",
    name: "Practical Korean",
    description:
      "Learn practical Korean for real-life situations like health, hobbies, and work.",
    requiredXp: 300,
    order: 2,
    icon: "briefcase-outline",
    color: "#e74c3c", // Red color
    lessons: [
      {
        id: "intermediate-health",
        name: "Health & Wellness (건강과 웰빙)",
        description:
          "Learn vocabulary and phrases related to health, medical situations, and wellness.",
        objectives: [
          "Describe symptoms and illnesses",
          "Navigate healthcare situations",
          "Discuss wellness routines",
        ],
        estimatedDuration: 35,
        xpReward: 150,
        requiredXp: 0,
        order: 1,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll learn about health and wellness in Korean. This lesson will help you describe symptoms, navigate healthcare situations, and discuss wellness routines. These skills are important for taking care of your health while in Korea.`,

          sections: [
            {
              title: "Body Parts",
              type: "vocabulary",
              items: [
                {
                  korean: "머리",
                  romanization: "meori",
                  english: "head",
                  example: "머리가 아파요. (My head hurts.)",
                },
                {
                  korean: "목",
                  romanization: "mok",
                  english: "neck/throat",
                  example: "목이 아파요. (My throat hurts.)",
                },
                {
                  korean: "배",
                  romanization: "bae",
                  english: "stomach",
                  example: "배가 고파요. (I'm hungry.)",
                },
                {
                  korean: "다리",
                  romanization: "dari",
                  english: "leg",
                  example: "다리가 아파요. (My leg hurts.)",
                },
                {
                  korean: "팔",
                  romanization: "pal",
                  english: "arm",
                  example: "팔을 다쳤어요. (I hurt my arm.)",
                },
                {
                  korean: "눈",
                  romanization: "nun",
                  english: "eye",
                  example: "눈이 아파요. (My eyes hurt.)",
                },
              ],
            },
            {
              title: "Symptoms & Illnesses",
              type: "vocabulary",
              items: [
                {
                  korean: "아파요",
                  romanization: "apayo",
                  english: "it hurts",
                  example: "어디가 아파요? (Where does it hurt?)",
                },
                {
                  korean: "감기",
                  romanization: "gamgi",
                  english: "cold",
                  example: "감기에 걸렸어요. (I caught a cold.)",
                },
                {
                  korean: "열",
                  romanization: "yeol",
                  english: "fever",
                  example: "열이 나요. (I have a fever.)",
                },
                {
                  korean: "기침",
                  romanization: "gichim",
                  english: "cough",
                  example: "기침이 나와요. (I have a cough.)",
                },
                {
                  korean: "두통",
                  romanization: "dutong",
                  english: "headache",
                  example: "두통이 있어요. (I have a headache.)",
                },
                {
                  korean: "피곤해요",
                  romanization: "pigonhaeyo",
                  english: "tired",
                  example: "너무 피곤해요. (I'm very tired.)",
                },
              ],
            },
            {
              title: "Medical Situations",
              type: "vocabulary",
              items: [
                {
                  korean: "병원",
                  romanization: "byeongwon",
                  english: "hospital",
                  example: "병원에 가야 해요. (I need to go to the hospital.)",
                },
                {
                  korean: "의사",
                  romanization: "uisa",
                  english: "doctor",
                  example: "의사를 만나고 싶어요. (I want to see a doctor.)",
                },
                {
                  korean: "약",
                  romanization: "yak",
                  english: "medicine",
                  example: "약을 먹어야 해요. (I need to take medicine.)",
                },
                {
                  korean: "약국",
                  romanization: "yakguk",
                  english: "pharmacy",
                  example: "약국이 어디예요? (Where is the pharmacy?)",
                },
                {
                  korean: "진료",
                  romanization: "jinryo",
                  english: "medical treatment",
                  example:
                    "진료를 받고 싶어요. (I want to receive medical treatment.)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "pronunciation",
                title: "Health Vocabulary Pronunciation",
                description: "Practice pronouncing health-related vocabulary",
                items: ["머리", "목", "배", "다리", "팔", "눈"],
              },
              {
                type: "game",
                title: "Symptom Description",
                description: "Match symptoms with their Korean descriptions",
                gameType: "matching",
              },
              {
                type: "conversation",
                title: "Doctor Visit Simulation",
                description: "Practice describing symptoms to a doctor",
                prompt: "Describe your symptoms and ask for help",
              },
            ],
          },

          conversation: {
            introduction: `Let's practice a conversation at a doctor's office.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "안녕하세요. 어디가 아프세요? (Hello. Where does it hurt?)",
              },
              {
                speaker: "user",
                text: "머리가 아파요. 그리고 열도 나요. (My head hurts. And I have a fever too.)",
              },
              {
                speaker: "tutor",
                text: "언제부터 아프셨어요? (Since when have you been in pain?)",
              },
              {
                speaker: "user",
                text: "어제부터요. 감기인 것 같아요. (Since yesterday. I think it's a cold.)",
              },
              {
                speaker: "tutor",
                text: "다른 증상도 있어요? 기침이나 목 아픔은 어때요? (Do you have other symptoms? How about cough or sore throat?)",
              },
              {
                speaker: "user",
                text: "네, 기침도 조금 나와요. (Yes, I have a little cough too.)",
              },
              {
                speaker: "tutor",
                text: "약을 처방해 드릴게요. 하루에 세 번 드세요. (I'll prescribe medicine for you. Take it three times a day.)",
              },
            ],
          },

          review: {
            summary: `Today we learned about health and wellness in Korean. We covered body parts, symptoms and illnesses, and medical situations. These skills will help you communicate about health issues and navigate healthcare in Korea.`,
            keyPoints: [
              "Use 아파요 to say something hurts",
              "Common symptoms: 감기 (cold), 열 (fever), 기침 (cough), 두통 (headache)",
              "Important places: 병원 (hospital), 약국 (pharmacy)",
              "Key people: 의사 (doctor)",
            ],
          },
        },
      },
    ],
  },
  {
    id: "intermediate-travel",
    name: "Travel & Tourism",
    description:
      "Learn vocabulary and phrases for traveling in Korea and discussing tourist attractions.",
    requiredXp: 300,
    order: 3,
    icon: "airplane-outline",
    color: "#e74c3c", // Red color
    lessons: [
      {
        id: "intermediate-travel-planning",
        name: "Travel Planning (여행 계획)",
        description:
          "Learn how to plan trips, book accommodations, and discuss travel itineraries.",
        objectives: [
          "Plan travel itineraries",
          "Book hotels and transportation",
          "Discuss tourist attractions",
        ],
        estimatedDuration: 30,
        xpReward: 150,
        requiredXp: 0,
        order: 1,
        content: {
          introduction: `안녕하세요! I'm ${AI_TUTOR_NAME}. Today we'll learn about travel planning in Korea. This lesson will help you plan trips, book accommodations, and discuss popular tourist destinations.`,

          sections: [
            {
              title: "Travel Vocabulary",
              type: "vocabulary",
              items: [
                {
                  korean: "여행",
                  romanization: "yeohaeng",
                  english: "travel",
                  example:
                    "한국 여행을 계획하고 있어요. (I'm planning a trip to Korea.)",
                },
                {
                  korean: "관광",
                  romanization: "gwangwang",
                  english: "tourism",
                  example:
                    "관광지를 구경하고 싶어요. (I want to see tourist attractions.)",
                },
                {
                  korean: "호텔",
                  romanization: "hotel",
                  english: "hotel",
                  example: "호텔을 예약했어요. (I booked a hotel.)",
                },
                {
                  korean: "예약",
                  romanization: "yeyak",
                  english: "reservation",
                  example:
                    "예약을 확인해 주세요. (Please confirm the reservation.)",
                },
                {
                  korean: "일정",
                  romanization: "iljeong",
                  english: "schedule/itinerary",
                  example: "여행 일정을 짰어요. (I made a travel itinerary.)",
                },
              ],
            },
            {
              title: "Tourist Attractions",
              type: "vocabulary",
              items: [
                {
                  korean: "경복궁",
                  romanization: "gyeongbokgung",
                  english: "Gyeongbok Palace",
                  example:
                    "경복궁에서 사진을 찍었어요. (I took photos at Gyeongbok Palace.)",
                },
                {
                  korean: "남산타워",
                  romanization: "namsantawo",
                  english: "Namsan Tower",
                  example:
                    "남산타워에서 서울을 내려다봤어요. (I looked down at Seoul from Namsan Tower.)",
                },
                {
                  korean: "제주도",
                  romanization: "jejudo",
                  english: "Jeju Island",
                  example:
                    "제주도는 아름다운 섬이에요. (Jeju Island is a beautiful island.)",
                },
                {
                  korean: "부산",
                  romanization: "busan",
                  english: "Busan",
                  example:
                    "부산의 해변이 유명해요. (Busan's beaches are famous.)",
                },
              ],
            },
          ],

          practice: {
            activities: [
              {
                type: "conversation",
                title: "Travel Planning Discussion",
                description: "Plan a trip to Korea with a friend",
                prompt: "Discuss where to go and what to see in Korea",
              },
            ],
          },

          conversation: {
            introduction: `Let's plan a trip to Korea together.`,
            dialogue: [
              {
                speaker: "tutor",
                text: "한국 여행을 계획하고 있다고 들었어요. (I heard you're planning a trip to Korea.)",
              },
              {
                speaker: "user",
                text: "네, 맞아요. 어디를 가면 좋을까요? (Yes, that's right. Where would be good to go?)",
              },
              {
                speaker: "tutor",
                text: "서울과 부산을 추천해요. 서울에는 경복궁과 남산타워가 있어요. (I recommend Seoul and Busan. Seoul has Gyeongbok Palace and Namsan Tower.)",
              },
            ],
          },

          review: {
            summary: `Today we learned about travel planning in Korea, including travel vocabulary and famous tourist attractions.`,
            keyPoints: [
              "Use 여행 (travel) and 관광 (tourism) for trip-related conversations",
              "Popular destinations include 경복궁, 남산타워, 제주도, and 부산",
              "Always make 예약 (reservations) in advance",
            ],
          },
        },
      },
    ],
  },
];

export default intermediateModules;
