/**
 * Comprehensive game content database
 * Contains extensive content pools for all four games with proper categorization
 */

/**
 * Match Word Game Content
 * Organized by difficulty level and category for better content distribution
 */
import { TUTOR_NAME } from "../constants/tutorConstants.js";
export const matchWordContent = {
  beginner: {
    greetings: [
      {
        korean: "안녕하세요",
        english: "Hello",
        romanization: "annyeonghaseyo",
      },
      {
        korean: "안녕히 가세요",
        english: "Goodbye (to someone leaving)",
        romanization: "annyeonghi gaseyo",
      },
      {
        korean: "안녕히 계세요",
        english: "Goodbye (when you're leaving)",
        romanization: "annyeonghi gyeseyo",
      },
      {
        korean: "감사합니다",
        english: "Thank you",
        romanization: "gamsahamnida",
      },
      {
        korean: "죄송합니다",
        english: "I'm sorry",
        romanization: "joesonghamnida",
      },
      {
        korean: "실례합니다",
        english: "Excuse me",
        romanization: "sillyehamnida",
      },
      {
        korean: "처음 뵙겠습니다",
        english: "Nice to meet you",
        romanization: "cheoeum boepgetseumnida",
      },
      {
        korean: "만나서 반갑습니다",
        english: "Pleased to meet you",
        romanization: "mannaseo bangapseumnida",
      },
      {
        korean: "잘 부탁드립니다",
        english: "Please take care of me",
        romanization: "jal butakdeurimnida",
      },
      {
        korean: "수고하세요",
        english: "Good work/Take care",
        romanization: "sugohaseyo",
      },
    ],

    basicWords: [
      { korean: "네", english: "Yes", romanization: "ne" },
      { korean: "아니요", english: "No", romanization: "aniyo" },
      { korean: "이름", english: "Name", romanization: "ireum" },
      { korean: "나이", english: "Age", romanization: "nai" },
      { korean: "학생", english: "Student", romanization: "haksaeng" },
      { korean: "선생님", english: "Teacher", romanization: "seonsaengnim" },
      { korean: "친구", english: "Friend", romanization: "chingu" },
      { korean: "가족", english: "Family", romanization: "gajok" },
      { korean: "집", english: "House/Home", romanization: "jip" },
      { korean: "학교", english: "School", romanization: "hakgyo" },
      { korean: "회사", english: "Company", romanization: "hoesa" },
      { korean: "병원", english: "Hospital", romanization: "byeongwon" },
      { korean: "은행", english: "Bank", romanization: "eunhaeng" },
      { korean: "시장", english: "Market", romanization: "sijang" },
      { korean: "공원", english: "Park", romanization: "gongwon" },
    ],

    numbers: [
      { korean: "하나", english: "One", romanization: "hana" },
      { korean: "둘", english: "Two", romanization: "dul" },
      { korean: "셋", english: "Three", romanization: "set" },
      { korean: "넷", english: "Four", romanization: "net" },
      { korean: "다섯", english: "Five", romanization: "daseot" },
      { korean: "여섯", english: "Six", romanization: "yeoseot" },
      { korean: "일곱", english: "Seven", romanization: "ilgop" },
      { korean: "여덟", english: "Eight", romanization: "yeodeol" },
      { korean: "아홉", english: "Nine", romanization: "ahop" },
      { korean: "열", english: "Ten", romanization: "yeol" },
      { korean: "스무", english: "Twenty", romanization: "seumu" },
      { korean: "서른", english: "Thirty", romanization: "seoreun" },
      { korean: "마흔", english: "Forty", romanization: "maheun" },
      { korean: "쉰", english: "Fifty", romanization: "swin" },
      { korean: "백", english: "Hundred", romanization: "baek" },
    ],

    colors: [
      { korean: "빨간색", english: "Red", romanization: "ppalgansaek" },
      { korean: "파란색", english: "Blue", romanization: "paransaek" },
      { korean: "노란색", english: "Yellow", romanization: "noransaek" },
      { korean: "초록색", english: "Green", romanization: "choroksaek" },
      { korean: "검은색", english: "Black", romanization: "geomeunsaek" },
      { korean: "흰색", english: "White", romanization: "huinsaek" },
      { korean: "보라색", english: "Purple", romanization: "borasaek" },
      { korean: "주황색", english: "Orange", romanization: "juhwangsaek" },
      { korean: "분홍색", english: "Pink", romanization: "bunhongsaek" },
      { korean: "갈색", english: "Brown", romanization: "galsaek" },
    ],

    food: [
      { korean: "밥", english: "Rice", romanization: "bap" },
      { korean: "물", english: "Water", romanization: "mul" },
      { korean: "김치", english: "Kimchi", romanization: "gimchi" },
      { korean: "고기", english: "Meat", romanization: "gogi" },
      { korean: "생선", english: "Fish", romanization: "saengseon" },
      { korean: "야채", english: "Vegetables", romanization: "yachae" },
      { korean: "과일", english: "Fruit", romanization: "gwail" },
      { korean: "빵", english: "Bread", romanization: "ppang" },
      { korean: "우유", english: "Milk", romanization: "uyu" },
      { korean: "커피", english: "Coffee", romanization: "keopi" },
      { korean: "차", english: "Tea", romanization: "cha" },
      { korean: "맥주", english: "Beer", romanization: "maekju" },
      { korean: "소주", english: "Soju", romanization: "soju" },
      { korean: "라면", english: "Ramen", romanization: "ramyeon" },
      { korean: "비빔밥", english: "Bibimbap", romanization: "bibimbap" },
    ],

    family: [
      { korean: "아버지", english: "Father", romanization: "abeoji" },
      { korean: "어머니", english: "Mother", romanization: "eomeoni" },
      { korean: "아들", english: "Son", romanization: "adeul" },
      { korean: "딸", english: "Daughter", romanization: "ttal" },
      {
        korean: "형",
        english: "Older brother (for males)",
        romanization: "hyeong",
      },
      {
        korean: "누나",
        english: "Older sister (for males)",
        romanization: "nuna",
      },
      {
        korean: "오빠",
        english: "Older brother (for females)",
        romanization: "oppa",
      },
      {
        korean: "언니",
        english: "Older sister (for females)",
        romanization: "eonni",
      },
      { korean: "동생", english: "Younger sibling", romanization: "dongsaeng" },
      { korean: "할아버지", english: "Grandfather", romanization: "harabeoji" },
      { korean: "할머니", english: "Grandmother", romanization: "halmeoni" },
      { korean: "삼촌", english: "Uncle", romanization: "samchon" },
      { korean: "이모", english: "Aunt (mother's side)", romanization: "imo" },
      { korean: "고모", english: "Aunt (father's side)", romanization: "gomo" },
      { korean: "사촌", english: "Cousin", romanization: "sachon" },
    ],

    time: [
      { korean: "오늘", english: "Today", romanization: "oneul" },
      { korean: "어제", english: "Yesterday", romanization: "eoje" },
      { korean: "내일", english: "Tomorrow", romanization: "naeil" },
      { korean: "아침", english: "Morning", romanization: "achim" },
      { korean: "점심", english: "Lunch", romanization: "jeomsim" },
      { korean: "저녁", english: "Evening", romanization: "jeonyeok" },
      { korean: "밤", english: "Night", romanization: "bam" },
      { korean: "시간", english: "Time", romanization: "sigan" },
      { korean: "분", english: "Minute", romanization: "bun" },
      { korean: "초", english: "Second", romanization: "cho" },
      { korean: "주", english: "Week", romanization: "ju" },
      { korean: "달", english: "Month", romanization: "dal" },
      { korean: "년", english: "Year", romanization: "nyeon" },
      { korean: "요일", english: "Day of the week", romanization: "yoil" },
      { korean: "날짜", english: "Date", romanization: "naljja" },
    ],
  },

  intermediate: {
    emotions: [
      { korean: "기쁘다", english: "Happy", romanization: "gippeuda" },
      { korean: "슬프다", english: "Sad", romanization: "seulpeuda" },
      { korean: "화나다", english: "Angry", romanization: "hwanada" },
      { korean: "무섭다", english: "Scared", romanization: "museopda" },
      { korean: "놀라다", english: "Surprised", romanization: "nollada" },
      { korean: "걱정하다", english: "Worried", romanization: "geokjeonghada" },
      {
        korean: "실망하다",
        english: "Disappointed",
        romanization: "silmanghada",
      },
      {
        korean: "감동하다",
        english: "Moved/Touched",
        romanization: "gamdonghada",
      },
      {
        korean: "부끄럽다",
        english: "Embarrassed",
        romanization: "bukkeureupda",
      },
      {
        korean: "자랑스럽다",
        english: "Proud",
        romanization: "jarangseureupda",
      },
      { korean: "질투하다", english: "Jealous", romanization: "jiltuhada" },
      { korean: "외롭다", english: "Lonely", romanization: "oeropda" },
      {
        korean: "편안하다",
        english: "Comfortable",
        romanization: "pyeonanhada",
      },
      {
        korean: "스트레스받다",
        english: "Stressed",
        romanization: "seuteureseubaetda",
      },
      { korean: "만족하다", english: "Satisfied", romanization: "manjokhada" },
    ],

    activities: [
      { korean: "공부하다", english: "Study", romanization: "gongbuhada" },
      { korean: "일하다", english: "Work", romanization: "ilhada" },
      { korean: "운동하다", english: "Exercise", romanization: "undonghada" },
      { korean: "요리하다", english: "Cook", romanization: "yorihada" },
      { korean: "청소하다", english: "Clean", romanization: "cheongsohada" },
      { korean: "쇼핑하다", english: "Shop", romanization: "syopinghada" },
      { korean: "여행하다", english: "Travel", romanization: "yeohaenghada" },
      { korean: "독서하다", english: "Read", romanization: "dokseohada" },
      {
        korean: "영화보다",
        english: "Watch movies",
        romanization: "yeonghwaboda",
      },
      {
        korean: "음악듣다",
        english: "Listen to music",
        romanization: "eumakdeutda",
      },
      { korean: "게임하다", english: "Play games", romanization: "geimhada" },
      {
        korean: "산책하다",
        english: "Take a walk",
        romanization: "sanchaekhada",
      },
      { korean: "수영하다", english: "Swim", romanization: "suyeonghada" },
      { korean: "춤추다", english: "Dance", romanization: "chumchuda" },
      { korean: "노래하다", english: "Sing", romanization: "noraehada" },
    ],

    weather: [
      { korean: "날씨", english: "Weather", romanization: "nalssi" },
      { korean: "맑다", english: "Clear", romanization: "makda" },
      { korean: "흐리다", english: "Cloudy", romanization: "heurida" },
      { korean: "비오다", english: "Rainy", romanization: "bioda" },
      { korean: "눈오다", english: "Snowy", romanization: "nunoda" },
      { korean: "바람불다", english: "Windy", romanization: "barambulda" },
      { korean: "덥다", english: "Hot", romanization: "deopda" },
      { korean: "춥다", english: "Cold", romanization: "chupda" },
      { korean: "따뜻하다", english: "Warm", romanization: "ttatteuthada" },
      { korean: "시원하다", english: "Cool", romanization: "siwonhada" },
      { korean: "습하다", english: "Humid", romanization: "seupada" },
      { korean: "건조하다", english: "Dry", romanization: "geonjohada" },
      { korean: "안개끼다", english: "Foggy", romanization: "angaekkida" },
      {
        korean: "천둥치다",
        english: "Thunder",
        romanization: "cheondungchida",
      },
      {
        korean: "번개치다",
        english: "Lightning",
        romanization: "beongaechida",
      },
    ],

    transportation: [
      { korean: "버스", english: "Bus", romanization: "beoseu" },
      { korean: "지하철", english: "Subway", romanization: "jihacheol" },
      { korean: "택시", english: "Taxi", romanization: "taeksi" },
      { korean: "기차", english: "Train", romanization: "gicha" },
      { korean: "비행기", english: "Airplane", romanization: "bihaenggi" },
      { korean: "배", english: "Ship", romanization: "bae" },
      { korean: "자동차", english: "Car", romanization: "jadongcha" },
      { korean: "자전거", english: "Bicycle", romanization: "jajeongeo" },
      { korean: "오토바이", english: "Motorcycle", romanization: "otobai" },
      { korean: "걷다", english: "Walk", romanization: "geotda" },
      { korean: "운전하다", english: "Drive", romanization: "unjeonhada" },
      { korean: "타다", english: "Ride", romanization: "tada" },
      { korean: "내리다", english: "Get off", romanization: "naerida" },
      { korean: "갈아타다", english: "Transfer", romanization: "garatada" },
      { korean: "정류장", english: "Bus stop", romanization: "jeongnyujang" },
    ],

    shopping: [
      { korean: "가게", english: "Store", romanization: "gage" },
      {
        korean: "백화점",
        english: "Department store",
        romanization: "baekhwajeom",
      },
      { korean: "마트", english: "Mart", romanization: "mateu" },
      {
        korean: "편의점",
        english: "Convenience store",
        romanization: "pyeonijeom",
      },
      { korean: "약국", english: "Pharmacy", romanization: "yakguk" },
      { korean: "서점", english: "Bookstore", romanization: "seojeom" },
      { korean: "옷가게", english: "Clothing store", romanization: "otgage" },
      { korean: "신발가게", english: "Shoe store", romanization: "sinbalgage" },
      { korean: "가격", english: "Price", romanization: "gagyeok" },
      { korean: "돈", english: "Money", romanization: "don" },
      { korean: "카드", english: "Card", romanization: "kadeu" },
      { korean: "현금", english: "Cash", romanization: "hyeongeum" },
      { korean: "할인", english: "Discount", romanization: "harin" },
      { korean: "세일", english: "Sale", romanization: "seil" },
      { korean: "영수증", english: "Receipt", romanization: "yeongsujeung" },
    ],
  },

  advanced: {
    business: [
      { korean: "회의", english: "Meeting", romanization: "hoeui" },
      { korean: "발표", english: "Presentation", romanization: "balpyo" },
      { korean: "계약", english: "Contract", romanization: "gyeyak" },
      { korean: "협상", english: "Negotiation", romanization: "hyeopsang" },
      { korean: "프로젝트", english: "Project", romanization: "peurojekteu" },
      { korean: "마케팅", english: "Marketing", romanization: "maketing" },
      { korean: "영업", english: "Sales", romanization: "yeongop" },
      { korean: "관리", english: "Management", romanization: "gwalli" },
      { korean: "전략", english: "Strategy", romanization: "jeollyak" },
      { korean: "예산", english: "Budget", romanization: "yesan" },
      { korean: "수익", english: "Profit", romanization: "sueik" },
      { korean: "손실", english: "Loss", romanization: "sonsil" },
      { korean: "투자", english: "Investment", romanization: "tuja" },
      { korean: "경쟁", english: "Competition", romanization: "gyeongjaeng" },
      { korean: "혁신", english: "Innovation", romanization: "hyeoksin" },
    ],

    technology: [
      { korean: "컴퓨터", english: "Computer", romanization: "keompyuteo" },
      {
        korean: "스마트폰",
        english: "Smartphone",
        romanization: "seumateupon",
      },
      { korean: "인터넷", english: "Internet", romanization: "inteonet" },
      {
        korean: "소프트웨어",
        english: "Software",
        romanization: "sopeuteuweeeo",
      },
      { korean: "하드웨어", english: "Hardware", romanization: "hadeuweeeo" },
      { korean: "데이터", english: "Data", romanization: "deiteo" },
      { korean: "프로그램", english: "Program", romanization: "peurogeuraem" },
      {
        korean: "애플리케이션",
        english: "Application",
        romanization: "aepeullikeisyeon",
      },
      { korean: "웹사이트", english: "Website", romanization: "wepsaiteu" },
      { korean: "이메일", english: "Email", romanization: "imeil" },
      { korean: "비밀번호", english: "Password", romanization: "bimilbeonho" },
      { korean: "보안", english: "Security", romanization: "boan" },
      { korean: "네트워크", english: "Network", romanization: "neteuwokeu" },
      { korean: "클라우드", english: "Cloud", romanization: "keullaudeu" },
      {
        korean: "인공지능",
        english: "Artificial Intelligence",
        romanization: "ingongjineung",
      },
    ],

    culture: [
      { korean: "전통", english: "Tradition", romanization: "jeontong" },
      { korean: "문화", english: "Culture", romanization: "munhwa" },
      { korean: "예술", english: "Art", romanization: "yesul" },
      { korean: "역사", english: "History", romanization: "yeoksa" },
      { korean: "철학", english: "Philosophy", romanization: "cheolhak" },
      { korean: "종교", english: "Religion", romanization: "jonggyo" },
      { korean: "축제", english: "Festival", romanization: "chukje" },
      { korean: "공연", english: "Performance", romanization: "gongyeon" },
      { korean: "전시회", english: "Exhibition", romanization: "jeonsihoe" },
      { korean: "박물관", english: "Museum", romanization: "bangmulgwan" },
      { korean: "미술관", english: "Art gallery", romanization: "misulgwan" },
      { korean: "도서관", english: "Library", romanization: "doseogwan" },
      { korean: "극장", english: "Theater", romanization: "geukjang" },
      {
        korean: "콘서트홀",
        english: "Concert hall",
        romanization: "konseoteuhal",
      },
      { korean: "문학", english: "Literature", romanization: "munhak" },
    ],
  },
};

/**
 * Sentence Scramble Game Content
 * Organized by difficulty level with proper sentence structure
 */
export const sentenceScrambleContent = {
  beginner: [
    {
      korean: "저는 한국어를 공부해요",
      english: "I study Korean",
      words: ["저는", "한국어를", "공부해요"],
      category: "study",
    },
    {
      korean: "오늘 날씨가 좋아요",
      english: "The weather is good today",
      words: ["오늘", "날씨가", "좋아요"],
      category: "weather",
    },
    {
      korean: "내일 친구를 만날 거예요",
      english: "I will meet my friend tomorrow",
      words: ["내일", "친구를", "만날", "거예요"],
      category: "plans",
    },
    {
      korean: "한국 음식을 좋아해요",
      english: "I like Korean food",
      words: ["한국", "음식을", "좋아해요"],
      category: "food",
    },
    {
      korean: "서울에 가고 싶어요",
      english: "I want to go to Seoul",
      words: ["서울에", "가고", "싶어요"],
      category: "travel",
    },
    {
      korean: "책을 읽는 것을 좋아해요",
      english: "I like reading books",
      words: ["책을", "읽는", "것을", "좋아해요"],
      category: "hobbies",
    },
    {
      korean: "매일 운동을 해요",
      english: "I exercise every day",
      words: ["매일", "운동을", "해요"],
      category: "health",
    },
    {
      korean: "가족과 함께 살아요",
      english: "I live with my family",
      words: ["가족과", "함께", "살아요"],
      category: "family",
    },
    {
      korean: "학교에서 공부를 해요",
      english: "I study at school",
      words: ["학교에서", "공부를", "해요"],
      category: "education",
    },
    {
      korean: "커피를 마시고 있어요",
      english: "I am drinking coffee",
      words: ["커피를", "마시고", "있어요"],
      category: "food",
    },
    {
      korean: "영화를 보러 갈 거예요",
      english: "I will go to watch a movie",
      words: ["영화를", "보러", "갈", "거예요"],
      category: "entertainment",
    },
    {
      korean: "한국어가 어려워요",
      english: "Korean is difficult",
      words: ["한국어가", "어려워요"],
      category: "study",
    },
    {
      korean: "집에서 요리를 해요",
      english: "I cook at home",
      words: ["집에서", "요리를", "해요"],
      category: "home",
    },
    {
      korean: "친구들과 놀고 있어요",
      english: "I am playing with friends",
      words: ["친구들과", "놀고", "있어요"],
      category: "social",
    },
    {
      korean: "주말에 쇼핑을 해요",
      english: "I shop on weekends",
      words: ["주말에", "쇼핑을", "해요"],
      category: "shopping",
    },
    {
      korean: "아침에 일찍 일어나요",
      english: "I wake up early in the morning",
      words: ["아침에", "일찍", "일어나요"],
      category: "daily",
    },
    {
      korean: "저녁에 텔레비전을 봐요",
      english: "I watch television in the evening",
      words: ["저녁에", "텔레비전을", "봐요"],
      category: "entertainment",
    },
    {
      korean: "버스를 타고 회사에 가요",
      english: "I take the bus to go to work",
      words: ["버스를", "타고", "회사에", "가요"],
      category: "transportation",
    },
    {
      korean: "한국 드라마를 자주 봐요",
      english: "I often watch Korean dramas",
      words: ["한국", "드라마를", "자주", "봐요"],
      category: "entertainment",
    },
    {
      korean: "공원에서 산책을 해요",
      english: "I take a walk in the park",
      words: ["공원에서", "산책을", "해요"],
      category: "exercise",
    },
  ],

  intermediate: [
    {
      korean: "어제 친구와 함께 영화를 봤어요",
      english: "Yesterday I watched a movie with my friend",
      words: ["어제", "친구와", "함께", "영화를", "봤어요"],
      category: "past_activities",
    },
    {
      korean: "내년에 한국에 여행을 갈 계획이에요",
      english: "I plan to travel to Korea next year",
      words: ["내년에", "한국에", "여행을", "갈", "계획이에요"],
      category: "future_plans",
    },
    {
      korean: "한국어를 배우는 것이 정말 재미있어요",
      english: "Learning Korean is really fun",
      words: ["한국어를", "배우는", "것이", "정말", "재미있어요"],
      category: "opinions",
    },
    {
      korean: "비가 와서 집에 있었어요",
      english: "It rained so I stayed at home",
      words: ["비가", "와서", "집에", "있었어요"],
      category: "weather_activities",
    },
    {
      korean: "시간이 없어서 빨리 가야 해요",
      english: "I don't have time so I have to go quickly",
      words: ["시간이", "없어서", "빨리", "가야", "해요"],
      category: "necessity",
    },
    {
      korean: "한국 음식 중에서 김치가 가장 맛있어요",
      english: "Among Korean foods, kimchi is the most delicious",
      words: ["한국", "음식", "중에서", "김치가", "가장", "맛있어요"],
      category: "preferences",
    },
    {
      korean: "매주 토요일마다 친구들을 만나요",
      english: "I meet my friends every Saturday",
      words: ["매주", "토요일마다", "친구들을", "만나요"],
      category: "routine",
    },
    {
      korean: "한국어 공부를 시작한 지 6개월이 됐어요",
      english: "It's been 6 months since I started studying Korean",
      words: ["한국어", "공부를", "시작한", "지", "6개월이", "됐어요"],
      category: "duration",
    },
    {
      korean: "요즘 날씨가 너무 더워서 에어컨을 켜요",
      english:
        "The weather is too hot these days so I turn on the air conditioner",
      words: ["요즘", "날씨가", "너무", "더워서", "에어컨을", "켜요"],
      category: "weather_response",
    },
    {
      korean: "한국 문화에 대해 더 알고 싶어요",
      english: "I want to know more about Korean culture",
      words: ["한국", "문화에", "대해", "더", "알고", "싶어요"],
      category: "interests",
    },
    {
      korean: "지하철이 버스보다 더 빨라요",
      english: "The subway is faster than the bus",
      words: ["지하철이", "버스보다", "더", "빨라요"],
      category: "comparisons",
    },
    {
      korean: "숙제를 다 끝내고 나서 게임을 할 거예요",
      english: "I will play games after finishing all my homework",
      words: ["숙제를", "다", "끝내고", "나서", "게임을", "할", "거예요"],
      category: "sequence",
    },
    {
      korean: "한국어 실력이 많이 늘었다고 생각해요",
      english: "I think my Korean skills have improved a lot",
      words: ["한국어", "실력이", "많이", "늘었다고", "생각해요"],
      category: "self_assessment",
    },
    {
      korean: "건강을 위해서 매일 물을 많이 마셔요",
      english: "I drink a lot of water every day for my health",
      words: ["건강을", "위해서", "매일", "물을", "많이", "마셔요"],
      category: "health_habits",
    },
    {
      korean: "한국 친구가 생겨서 정말 기뻐요",
      english: "I'm really happy because I made a Korean friend",
      words: ["한국", "친구가", "생겨서", "정말", "기뻐요"],
      category: "emotions",
    },
  ],

  advanced: [
    {
      korean: "경제 상황이 좋지 않아서 많은 사람들이 걱정하고 있어요",
      english:
        "Many people are worried because the economic situation is not good",
      words: [
        "경제",
        "상황이",
        "좋지",
        "않아서",
        "많은",
        "사람들이",
        "걱정하고",
        "있어요",
      ],
      category: "economics",
    },
    {
      korean: "환경 보호를 위해 플라스틱 사용을 줄여야 한다고 생각해요",
      english:
        "I think we should reduce plastic use for environmental protection",
      words: [
        "환경",
        "보호를",
        "위해",
        "플라스틱",
        "사용을",
        "줄여야",
        "한다고",
        "생각해요",
      ],
      category: "environment",
    },
    {
      korean: "기술 발전으로 인해 우리의 생활이 많이 편리해졌어요",
      english:
        "Our lives have become much more convenient due to technological advancement",
      words: [
        "기술",
        "발전으로",
        "인해",
        "우리의",
        "생활이",
        "많이",
        "편리해졌어요",
      ],
      category: "technology",
    },
    {
      korean: "교육 제도를 개선하기 위한 다양한 방안이 논의되고 있어요",
      english:
        "Various measures to improve the education system are being discussed",
      words: [
        "교육",
        "제도를",
        "개선하기",
        "위한",
        "다양한",
        "방안이",
        "논의되고",
        "있어요",
      ],
      category: "education_policy",
    },
    {
      korean: "문화적 차이를 이해하고 존중하는 것이 중요해요",
      english: "It's important to understand and respect cultural differences",
      words: ["문화적", "차이를", "이해하고", "존중하는", "것이", "중요해요"],
      category: "cultural_awareness",
    },
    {
      korean: "글로벌화가 진행되면서 언어 능력의 중요성이 더욱 커지고 있어요",
      english:
        "As globalization progresses, the importance of language skills is growing",
      words: [
        "글로벌화가",
        "진행되면서",
        "언어",
        "능력의",
        "중요성이",
        "더욱",
        "커지고",
        "있어요",
      ],
      category: "globalization",
    },
    {
      korean: "인공지능 기술이 발달하면서 많은 직업이 변화할 것으로 예상돼요",
      english: "Many jobs are expected to change as AI technology develops",
      words: [
        "인공지능",
        "기술이",
        "발달하면서",
        "많은",
        "직업이",
        "변화할",
        "것으로",
        "예상돼요",
      ],
      category: "future_work",
    },
    {
      korean: "사회적 책임을 다하는 기업들이 소비자들에게 더 선호받고 있어요",
      english:
        "Companies that fulfill social responsibility are more preferred by consumers",
      words: [
        "사회적",
        "책임을",
        "다하는",
        "기업들이",
        "소비자들에게",
        "더",
        "선호받고",
        "있어요",
      ],
      category: "corporate_responsibility",
    },
    {
      korean: "건강한 생활 습관을 유지하는 것이 장기적으로 매우 중요해요",
      english:
        "Maintaining healthy lifestyle habits is very important in the long term",
      words: [
        "건강한",
        "생활",
        "습관을",
        "유지하는",
        "것이",
        "장기적으로",
        "매우",
        "중요해요",
      ],
      category: "health_philosophy",
    },
    {
      korean: "다양한 관점에서 문제를 분석하고 해결책을 찾아야 해요",
      english:
        "We need to analyze problems from various perspectives and find solutions",
      words: [
        "다양한",
        "관점에서",
        "문제를",
        "분석하고",
        "해결책을",
        "찾아야",
        "해요",
      ],
      category: "problem_solving",
    },
  ],
};

/**
 * Pronunciation Challenge Game Content
 * Organized by difficulty level with phonetic focus
 */
export const pronunciationChallengeContent = {
  beginner: [
    {
      korean: "안녕하세요",
      english: "Hello",
      romanization: "annyeonghaseyo",
      difficulty: "easy",
      focus: "basic_greeting",
    },
    {
      korean: "감사합니다",
      english: "Thank you",
      romanization: "gamsahamnida",
      difficulty: "easy",
      focus: "politeness",
    },
    {
      korean: "죄송합니다",
      english: "I'm sorry",
      romanization: "joesonghamnida",
      difficulty: "medium",
      focus: "politeness",
    },
    {
      korean: "네",
      english: "Yes",
      romanization: "ne",
      difficulty: "easy",
      focus: "basic_response",
    },
    {
      korean: "아니요",
      english: "No",
      romanization: "aniyo",
      difficulty: "easy",
      focus: "basic_response",
    },
    {
      korean: "저는 학생입니다",
      english: "I am a student",
      romanization: "jeoneun haksaengimnida",
      difficulty: "medium",
      focus: "self_introduction",
    },
    {
      korean: "한국어를 공부해요",
      english: "I study Korean",
      romanization: "hangugeo-reul gongbuhaeyo",
      difficulty: "medium",
      focus: "activities",
    },
    {
      korean: "물 주세요",
      english: "Please give me water",
      romanization: "mul juseyo",
      difficulty: "easy",
      focus: "requests",
    },
    {
      korean: "얼마예요?",
      english: "How much is it?",
      romanization: "eolmayeyo?",
      difficulty: "medium",
      focus: "shopping",
    },
    {
      korean: "화장실이 어디예요?",
      english: "Where is the bathroom?",
      romanization: "hwajangsiri eodiyeyo?",
      difficulty: "medium",
      focus: "directions",
    },
    {
      korean: "맛있어요",
      english: "It's delicious",
      romanization: "masisseoyo",
      difficulty: "medium",
      focus: "food_opinions",
    },
    {
      korean: "좋아요",
      english: "It's good/I like it",
      romanization: "joayo",
      difficulty: "easy",
      focus: "opinions",
    },
    {
      korean: "이름이 뭐예요?",
      english: "What is your name?",
      romanization: "ireumi mwoyeyo?",
      difficulty: "medium",
      focus: "questions",
    },
    {
      korean: "처음 뵙겠습니다",
      english: "Nice to meet you",
      romanization: "cheoeum boepgetseumnida",
      difficulty: "hard",
      focus: "formal_greeting",
    },
    {
      korean: "도와주세요",
      english: "Please help me",
      romanization: "dowajuseyo",
      difficulty: "medium",
      focus: "requests",
    },
  ],

  intermediate: [
    {
      korean: "오늘 날씨가 정말 좋네요",
      english: "The weather is really nice today",
      romanization: "oneul nalssiga jeongmal jonneyo",
      difficulty: "medium",
      focus: "weather_conversation",
    },
    {
      korean: "한국 음식을 좋아하세요?",
      english: "Do you like Korean food?",
      romanization: "hanguk eumsigeul joahaseyo?",
      difficulty: "medium",
      focus: "preference_questions",
    },
    {
      korean: "지하철역이 어디에 있어요?",
      english: "Where is the subway station?",
      romanization: "jihacheol-yeogi eodie isseoyo?",
      difficulty: "medium",
      focus: "transportation",
    },
    {
      korean: "한국어가 어려워요",
      english: "Korean is difficult",
      romanization: "hangugeoga eoryeowoyo",
      difficulty: "medium",
      focus: "language_learning",
    },
    {
      korean: "시간이 없어서 빨리 가야 해요",
      english: "I don't have time so I have to go quickly",
      romanization: "sigani eopseoseo ppalli gaya haeyo",
      difficulty: "hard",
      focus: "time_pressure",
    },
    {
      korean: "친구와 함께 영화를 봤어요",
      english: "I watched a movie with my friend",
      romanization: "chinguwa hamkke yeonghwareul bwasseoyo",
      difficulty: "hard",
      focus: "past_activities",
    },
    {
      korean: "내일 회의가 있어서 준비해야 해요",
      english: "I have a meeting tomorrow so I need to prepare",
      romanization: "naeil hoeui-ga isseoseo junbihaeya haeyo",
      difficulty: "hard",
      focus: "work_obligations",
    },
    {
      korean: "한국 문화에 관심이 많아요",
      english: "I'm very interested in Korean culture",
      romanization: "hanguk munhwa-e gwansimi manayo",
      difficulty: "medium",
      focus: "cultural_interest",
    },
    {
      korean: "건강을 위해 운동을 시작했어요",
      english: "I started exercising for my health",
      romanization: "geongangeul wihae undongeul sijakhaesseoyo",
      difficulty: "hard",
      focus: "health_habits",
    },
    {
      korean: "요즘 바빠서 친구들을 못 만나요",
      english: "I'm busy these days so I can't meet my friends",
      romanization: "yojeum bappaseo chingudeureul mot mannayo",
      difficulty: "hard",
      focus: "busy_life",
    },
    {
      korean: "한국어 실력이 늘고 있는 것 같아요",
      english: "I think my Korean skills are improving",
      romanization: "hangugeo sillyeogi neulgo inneun geot gatayo",
      difficulty: "hard",
      focus: "self_assessment",
    },
    {
      korean: "주말에 뭐 하실 거예요?",
      english: "What will you do on the weekend?",
      romanization: "jumare mwo hasil geoyeyo?",
      difficulty: "medium",
      focus: "weekend_plans",
    },
    {
      korean: "이 음식은 너무 매워요",
      english: "This food is too spicy",
      romanization: "i eumsigeun neomu maewoyo",
      difficulty: "medium",
      focus: "food_complaints",
    },
    {
      korean: "길을 잃어버렸어요",
      english: "I got lost",
      romanization: "gireul ireobeolyeosseoyo",
      difficulty: "hard",
      focus: "emergency_situations",
    },
    {
      korean: "한국에 온 지 얼마나 됐어요?",
      english: "How long has it been since you came to Korea?",
      romanization: "hanguge on ji eolmana dwaesseoyo?",
      difficulty: "hard",
      focus: "duration_questions",
    },
  ],

  advanced: [
    {
      korean: "경제 상황이 좋지 않아서 걱정이에요",
      english: "I'm worried because the economic situation is not good",
      romanization: "gyeongje sanghwang-i jochi anaseo geokjeongieoyo",
      difficulty: "hard",
      focus: "economic_concerns",
    },
    {
      korean: "환경 보호를 위해 노력해야 한다고 생각해요",
      english: "I think we should make efforts for environmental protection",
      romanization:
        "hwangyeong bohoreul wihae noryeokhaeya handago saenggakhaeyo",
      difficulty: "very_hard",
      focus: "environmental_issues",
    },
    {
      korean: "기술 발전이 우리 생활에 미치는 영향이 커요",
      english:
        "The impact of technological advancement on our lives is significant",
      romanization:
        "gisul baljeon-i uri saenghware michineun yeonghyang-i keoyo",
      difficulty: "very_hard",
      focus: "technology_impact",
    },
    {
      korean: "교육 제도 개선에 대한 논의가 필요해요",
      english: "Discussion about improving the education system is necessary",
      romanization: "gyoyuk jedo gaeseon-e daehan nonui-ga piryohaeyo",
      difficulty: "very_hard",
      focus: "education_policy",
    },
    {
      korean: "문화적 다양성을 존중하는 것이 중요해요",
      english: "It's important to respect cultural diversity",
      romanization:
        "munhwajeok dayangseong-eul jongjunghaneun geosi jungyohaeyo",
      difficulty: "very_hard",
      focus: "cultural_awareness",
    },
    {
      korean: "글로벌화 시대에 언어 능력은 필수예요",
      english: "Language skills are essential in the era of globalization",
      romanization: "geulleobeolhwa sidae-e eoneo neungryeogeun pilsuyeyo",
      difficulty: "very_hard",
      focus: "globalization",
    },
    {
      korean: "인공지능이 인간의 일자리를 대체할 가능성이 있어요",
      english: "There's a possibility that AI will replace human jobs",
      romanization:
        "ingongji-neung-i ingan-ui iljari-reul daecheal ganeungseong-i isseoyo",
      difficulty: "very_hard",
      focus: "ai_future",
    },
    {
      korean: "사회적 책임을 다하는 기업이 성공할 거예요",
      english: "Companies that fulfill social responsibility will succeed",
      romanization:
        "sahoejeok chaegimeul dahaneun gieop-i seonggonghal geoyeyo",
      difficulty: "very_hard",
      focus: "corporate_responsibility",
    },
    {
      korean: "건강한 생활 습관을 유지하는 것이 장수의 비결이에요",
      english:
        "Maintaining healthy lifestyle habits is the secret to longevity",
      romanization:
        "geonganhan saenghwal seupgwan-eul yujihaneun geosi jangsu-ui bigyeol-ieoyo",
      difficulty: "very_hard",
      focus: "health_philosophy",
    },
    {
      korean: "창의적 사고가 문제 해결의 열쇠예요",
      english: "Creative thinking is the key to problem solving",
      romanization: "changui-jeok sagoga munje haegyeol-ui yeolsoeyeyo",
      difficulty: "very_hard",
      focus: "creative_thinking",
    },
  ],
};

/**
 * Conversation Quest Game Content
 * Comprehensive scenarios for real-time conversation practice
 */
export const conversationQuestContent = {
  beginner: [
    {
      id: "basic-greetings",
      title: "Basic Greetings",
      description: "Practice saying hello and introducing yourself",
      estimatedDuration: 5,
      difficulty: "easy",
      category: "social",
      systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor. Help the student practice basic greetings in Korean.

INTERACTIVE CONVERSATION FLOW:
1. Start with casual English greeting: "Hi! How are you doing today?"
2. Wait for their response and engage naturally
3. Ask engagement question: "Have you tried greeting people in Korean before?"
4. Transition smoothly: "Great! Ready to practice some Korean greetings?"
5. Introduce ONE greeting at a time with immediate practice
6. Keep each response to 1-2 sentences maximum
7. Always wait for user practice between new concepts

TEACHING APPROACH:
- Use 85% English, 15% Korean for beginners
- Start with "안녕하세요" (Hello) first, get them to practice it
- Then move to one greeting at a time
- Always provide English translations in parentheses
- Give lots of encouragement for attempts
- Never overwhelm with multiple concepts at once

NEVER deliver long explanations - always short, interactive exchanges.`,

      vocabulary: [
        { korean: "안녕하세요", english: "Hello" },
        { korean: "만나서 반갑습니다", english: "Nice to meet you" },
        { korean: "이름이 뭐예요?", english: "What's your name?" },
        { korean: "저는", english: "I am" },
        { korean: "감사합니다", english: "Thank you" },
      ],
    },

    {
      id: "ordering-food",
      title: "Ordering Food",
      description: "Learn to order food at a Korean restaurant",
      estimatedDuration: 7,
      difficulty: "medium",
      category: "dining",
      systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor helping with restaurant ordering.

INTERACTIVE CONVERSATION FLOW:
1. Start with casual English greeting: "Hi! How's your day going?"
2. Wait for their response and engage naturally
3. Ask engagement question: "Do you enjoy trying Korean food?"
4. Transition smoothly: "Great! Ready to practice ordering at a Korean restaurant?"
5. Introduce ONE ordering phrase at a time with immediate practice
6. Keep each response to 1-2 sentences maximum
7. Always wait for user practice between new concepts

TEACHING APPROACH:
- Use 85% English, 15% Korean for beginners
- Start with "주세요" (please give me) first, get them to practice it
- Then move to one food item at a time
- Always provide English translations in parentheses
- Give lots of encouragement for attempts
- Never overwhelm with multiple concepts at once

NEVER deliver long explanations - always short, interactive exchanges.

Example menu items to practice:
- 김치찌개 (kimchi stew)
- 불고기 (bulgogi)
- 비빔밥 (bibimbap)
- 물 (water)
- 밥 (rice)`,

      vocabulary: [
        { korean: "어서 오세요", english: "Welcome" },
        { korean: "뭘 드릴까요?", english: "What would you like?" },
        { korean: "주세요", english: "Please give me" },
        { korean: "얼마예요?", english: "How much is it?" },
        { korean: "맛있어요", english: "It's delicious" },
      ],
    },

    {
      id: "asking-directions",
      title: "Asking for Directions",
      description: "Practice asking for and understanding directions",
      estimatedDuration: 6,
      difficulty: "medium",
      category: "navigation",
      systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor helping with asking directions.

INTERACTIVE CONVERSATION FLOW:
1. Start with casual English greeting: "Hi! How are you doing?"
2. Wait for their response and engage naturally
3. Ask engagement question: "Have you ever gotten lost in a new city?"
4. Transition smoothly: "Great! Ready to practice asking for directions in Korean?"
5. Introduce ONE direction phrase at a time with immediate practice
6. Keep each response to 1-2 sentences maximum
7. Always wait for user practice between new concepts

TEACHING APPROACH:
- Use 85% English, 15% Korean for beginners
- Start with "어디예요?" (Where is...?) first, get them to practice it
- Then move to one direction word at a time
- Always provide English translations in parentheses
- Give lots of encouragement for attempts
- Never overwhelm with multiple concepts at once

NEVER deliver long explanations - always short, interactive exchanges.
- 은행 (bank)
- 병원 (hospital)
- 편의점 (convenience store)`,

      vocabulary: [
        { korean: "어디예요?", english: "Where is it?" },
        { korean: "지하철역", english: "Subway station" },
        { korean: "직진", english: "Straight" },
        { korean: "왼쪽", english: "Left" },
        { korean: "오른쪽", english: "Right" },
      ],
    },

    {
      id: "shopping-basics",
      title: "Shopping Basics",
      description: "Learn essential shopping phrases and numbers",
      estimatedDuration: 8,
      difficulty: "medium",
      category: "shopping",
      systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor helping with shopping conversations.

INTERACTIVE CONVERSATION FLOW:
1. Start with casual English greeting: "Hi! How's your day going?"
2. Wait for their response and engage naturally
3. Ask engagement question: "Do you enjoy shopping?"
4. Transition smoothly: "Great! Ready to practice shopping in Korean?"
5. Introduce ONE shopping phrase at a time with immediate practice
6. Keep each response to 1-2 sentences maximum
7. Always wait for user practice between new concepts

TEACHING APPROACH:
- Use 85% English, 15% Korean for beginners
- Start with "얼마예요?" (How much is it?) first, get them to practice it
- Then move to one shopping concept at a time
- Always provide English translations in parentheses
- Give lots of encouragement for attempts
- Never overwhelm with multiple concepts at once

NEVER deliver long explanations - always short, interactive exchanges.
- Asking for help finding items
- Comparing prices
- Payment process`,

      vocabulary: [
        { korean: "얼마예요?", english: "How much?" },
        { korean: "이거", english: "This" },
        { korean: "저거", english: "That" },
        { korean: "크기", english: "Size" },
        { korean: "카드", english: "Card" },
      ],
    },

    {
      id: "family-introduction",
      title: "Family Introduction",
      description: "Practice talking about family members",
      estimatedDuration: 6,
      difficulty: "easy",
      category: "personal",
      systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor helping with family conversations.

INTERACTIVE CONVERSATION FLOW:
1. Start with casual English greeting: "Hi! How are you doing?"
2. Wait for their response and engage naturally
3. Ask engagement question: "Tell me about your family"
4. Transition smoothly: "Great! Ready to practice talking about family in Korean?"
5. Introduce ONE family word at a time with immediate practice
6. Keep each response to 1-2 sentences maximum
7. Always wait for user practice between new concepts

TEACHING APPROACH:
- Use 85% English, 15% Korean for beginners
- Start with "가족" (family) first, get them to practice it
- Then move to one family member at a time
- Always provide English translations in parentheses
- Give lots of encouragement for attempts
- Never overwhelm with multiple concepts at once

NEVER deliver long explanations - always short, interactive exchanges.
- 누나/언니 (older sister)
- 동생 (younger sibling)`,

      vocabulary: [
        { korean: "가족", english: "Family" },
        { korean: "아버지", english: "Father" },
        { korean: "어머니", english: "Mother" },
        { korean: "형제", english: "Brothers" },
        { korean: "몇 명", english: "How many people" },
      ],
    },

    {
      id: "weather-talk",
      title: "Weather Conversation",
      description: "Practice talking about weather and seasons",
      estimatedDuration: 5,
      difficulty: "easy",
      category: "daily_life",
      systemPrompt: `You are ${TUTOR_NAME}, a friendly Korean language tutor helping with weather conversations.

INTERACTIVE CONVERSATION FLOW:
1. Start with casual English greeting: "Hi! How's your day going?"
2. Wait for their response and engage naturally
3. Ask engagement question: "How's the weather where you are?"
4. Transition smoothly: "Great! Ready to practice talking about weather in Korean?"
5. Introduce ONE weather word at a time with immediate practice
6. Keep each response to 1-2 sentences maximum
7. Always wait for user practice between new concepts

TEACHING APPROACH:
- Use 85% English, 15% Korean for beginners
- Start with "날씨" (weather) first, get them to practice it
- Then move to one weather condition at a time
- Always provide English translations in parentheses
- Give lots of encouragement for attempts
- Never overwhelm with multiple concepts at once

NEVER deliver long explanations - always short, interactive exchanges.
- 추워요 (it's cold)`,

      vocabulary: [
        { korean: "날씨", english: "Weather" },
        { korean: "덥다", english: "Hot" },
        { korean: "춥다", english: "Cold" },
        { korean: "비", english: "Rain" },
        { korean: "맑다", english: "Clear" },
      ],
    },
  ],

  intermediate: [
    {
      id: "job-interview",
      title: "Job Interview Practice",
      description: "Practice formal conversation for job interviews",
      estimatedDuration: 10,
      difficulty: "hard",
      category: "professional",
      systemPrompt: `You are ${TUTOR_NAME}, acting as a Korean job interviewer. Help practice formal interview Korean.

Guidelines:
- Use formal speech (습니다/ㅂ니다 endings)
- Ask about background, experience, and goals
- Practice self-introduction in formal setting
- Include workplace vocabulary
- Help with humble and honorific expressions
- Focus on: 자기소개, 경험, 목표, 회사, 일

Interview questions to practice:
- 자기소개를 해주세요 (Please introduce yourself)
- 경험이 어떻게 되세요? (What's your experience?)
- 왜 우리 회사에서 일하고 싶으세요? (Why do you want to work at our company?)
- 장점과 단점은 무엇인가요? (What are your strengths and weaknesses?)`,

      vocabulary: [
        { korean: "자기소개", english: "Self-introduction" },
        { korean: "경험", english: "Experience" },
        { korean: "회사", english: "Company" },
        { korean: "목표", english: "Goal" },
        { korean: "장점", english: "Strength" },
      ],
    },

    {
      id: "doctor-visit",
      title: "Doctor's Visit",
      description: "Practice describing symptoms and health issues",
      estimatedDuration: 8,
      difficulty: "medium",
      category: "health",
      systemPrompt: `You are ${TUTOR_NAME}, acting as a Korean doctor. Help practice medical conversations.

Guidelines:
- Ask about symptoms professionally
- Teach body parts vocabulary
- Practice describing pain and discomfort
- Include medical advice vocabulary
- Help with health-related expressions
- Focus on: 아프다, 증상, 몸, 약, 병원

Medical vocabulary to practice:
- 머리가 아파요 (I have a headache)
- 열이 나요 (I have a fever)
- 기침이 나요 (I have a cough)
- 배가 아파요 (I have a stomachache)
- 약을 먹어야 해요 (I need to take medicine)`,

      vocabulary: [
        { korean: "아프다", english: "To hurt/be sick" },
        { korean: "증상", english: "Symptoms" },
        { korean: "약", english: "Medicine" },
        { korean: "열", english: "Fever" },
        { korean: "기침", english: "Cough" },
      ],
    },

    {
      id: "travel-planning",
      title: "Travel Planning",
      description: "Practice planning trips and discussing travel",
      estimatedDuration: 9,
      difficulty: "medium",
      category: "travel",
      systemPrompt: `You are ${TUTOR_NAME}, helping plan a trip to Korea. Practice travel-related conversations.

Guidelines:
- Discuss travel destinations in Korea
- Practice booking accommodations
- Include transportation planning
- Help with tourist activity vocabulary
- Practice asking for recommendations
- Focus on: 여행, 호텔, 관광지, 예약, 계획

Travel topics to practice:
- 어디에 가고 싶어요? (Where do you want to go?)
- 호텔을 예약했어요? (Did you book a hotel?)
- 뭘 하고 싶어요? (What do you want to do?)
- 얼마나 머물 거예요? (How long will you stay?)`,

      vocabulary: [
        { korean: "여행", english: "Travel" },
        { korean: "호텔", english: "Hotel" },
        { korean: "관광지", english: "Tourist attraction" },
        { korean: "예약", english: "Reservation" },
        { korean: "계획", english: "Plan" },
      ],
    },

    {
      id: "hobby-discussion",
      title: "Hobby Discussion",
      description: "Talk about hobbies and leisure activities",
      estimatedDuration: 7,
      difficulty: "medium",
      category: "personal",
      systemPrompt: `You are ${TUTOR_NAME}, having a casual conversation about hobbies and interests.

Guidelines:
- Ask about their hobbies and interests
- Share your own interests (as Cooper)
- Practice expressing preferences
- Include activity vocabulary
- Help with frequency expressions
- Focus on: 취미, 좋아하다, 싫어하다, 자주, 가끔

Hobby vocabulary to practice:
- 독서 (reading)
- 운동 (exercise)
- 음악 듣기 (listening to music)
- 영화 보기 (watching movies)
- 요리 (cooking)
- 여행 (traveling)`,

      vocabulary: [
        { korean: "취미", english: "Hobby" },
        { korean: "좋아하다", english: "To like" },
        { korean: "자주", english: "Often" },
        { korean: "가끔", english: "Sometimes" },
        { korean: "운동", english: "Exercise" },
      ],
    },
  ],

  advanced: [
    {
      id: "business-meeting",
      title: "Business Meeting",
      description: "Practice formal business discussions and presentations",
      estimatedDuration: 12,
      difficulty: "very_hard",
      category: "professional",
      systemPrompt: `You are ${TUTOR_NAME}, acting as a Korean business partner in a formal meeting.

Guidelines:
- Use very formal business Korean
- Practice presentation vocabulary
- Include negotiation phrases
- Help with business etiquette
- Practice expressing opinions professionally
- Focus on: 회의, 발표, 계약, 협상, 제안

Business topics:
- 프로젝트 진행 상황 (project progress)
- 예산 논의 (budget discussion)
- 일정 조정 (schedule adjustment)
- 계약 조건 (contract terms)
- 향후 계획 (future plans)`,

      vocabulary: [
        { korean: "회의", english: "Meeting" },
        { korean: "발표", english: "Presentation" },
        { korean: "계약", english: "Contract" },
        { korean: "협상", english: "Negotiation" },
        { korean: "제안", english: "Proposal" },
      ],
    },

    {
      id: "cultural-discussion",
      title: "Cultural Discussion",
      description: "Discuss Korean culture, traditions, and social issues",
      estimatedDuration: 10,
      difficulty: "hard",
      category: "culture",
      systemPrompt: `You are ${TUTOR_NAME}, engaging in deep cultural discussions about Korea.

Guidelines:
- Discuss Korean traditions and customs
- Practice expressing complex opinions
- Include cultural comparison vocabulary
- Help with abstract concepts
- Practice debate and discussion skills
- Focus on: 문화, 전통, 사회, 의견, 비교

Cultural topics:
- 한국의 전통 (Korean traditions)
- 현대 사회 문제 (modern social issues)
- 교육 시스템 (education system)
- 가족 관계 (family relationships)
- 세대 차이 (generational differences)`,

      vocabulary: [
        { korean: "문화", english: "Culture" },
        { korean: "전통", english: "Tradition" },
        { korean: "사회", english: "Society" },
        { korean: "의견", english: "Opinion" },
        { korean: "세대", english: "Generation" },
      ],
    },

    {
      id: "academic-discussion",
      title: "Academic Discussion",
      description: "Practice academic and intellectual conversations",
      estimatedDuration: 11,
      difficulty: "very_hard",
      category: "academic",
      systemPrompt: `You are ${TUTOR_NAME}, engaging in academic-level Korean discussions.

Guidelines:
- Use sophisticated vocabulary and grammar
- Practice academic argument structure
- Include research and study vocabulary
- Help with complex sentence structures
- Practice expressing hypotheses and conclusions
- Focus on: 연구, 이론, 분석, 결론, 가설

Academic topics:
- 연구 방법론 (research methodology)
- 데이터 분석 (data analysis)
- 이론적 배경 (theoretical background)
- 실험 결과 (experimental results)
- 향후 연구 방향 (future research directions)`,

      vocabulary: [
        { korean: "연구", english: "Research" },
        { korean: "이론", english: "Theory" },
        { korean: "분석", english: "Analysis" },
        { korean: "결론", english: "Conclusion" },
        { korean: "가설", english: "Hypothesis" },
      ],
    },
  ],
};

/**
 * Content Selection and Randomization Utilities
 * Advanced algorithms for content delivery and replayability
 */

/**
 * Fisher-Yates shuffle algorithm for proper randomization
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get content for Match Word Game with smart selection
 * @param {string} level - User's proficiency level
 * @param {number} count - Number of words needed
 * @param {Array} recentlyUsed - Recently used words to avoid
 * @param {string} category - Optional category filter
 * @returns {Array} - Selected word objects
 */
export const getMatchWordContent = (
  level = "beginner",
  count = 10,
  recentlyUsed = [],
  category = null
) => {
  const levelContent = matchWordContent[level] || matchWordContent.beginner;
  let allWords = [];

  if (category && levelContent[category]) {
    // Use specific category
    allWords = [...levelContent[category]];
  } else {
    // Combine all categories for the level
    Object.values(levelContent).forEach((categoryWords) => {
      allWords.push(...categoryWords);
    });
  }

  // Filter out recently used words
  const availableWords = allWords.filter(
    (word) => !recentlyUsed.some((used) => used.korean === word.korean)
  );

  // If not enough unique words, include some recent ones
  const finalPool = availableWords.length >= count ? availableWords : allWords;

  // Shuffle and select
  const shuffled = shuffleArray(finalPool);
  return shuffled.slice(0, count);
};

/**
 * Get content for Sentence Scramble Game with difficulty progression
 * @param {string} level - User's proficiency level
 * @param {number} count - Number of sentences needed
 * @param {Array} recentlyUsed - Recently used sentences to avoid
 * @param {string} category - Optional category filter
 * @returns {Array} - Selected sentence objects
 */
export const getSentenceScrambleContent = (
  level = "beginner",
  count = 5,
  recentlyUsed = [],
  category = null
) => {
  const levelContent =
    sentenceScrambleContent[level] || sentenceScrambleContent.beginner;
  let availableSentences = [...levelContent];

  // Filter by category if specified
  if (category) {
    availableSentences = availableSentences.filter(
      (sentence) => sentence.category === category
    );
  }

  // Filter out recently used sentences
  const filteredSentences = availableSentences.filter(
    (sentence) => !recentlyUsed.some((used) => used.korean === sentence.korean)
  );

  // If not enough unique sentences, include some recent ones
  const finalPool =
    filteredSentences.length >= count ? filteredSentences : availableSentences;

  // Shuffle and select
  const shuffled = shuffleArray(finalPool);
  return shuffled.slice(0, count);
};

/**
 * Get content for Pronunciation Challenge Game with phonetic focus
 * @param {string} level - User's proficiency level
 * @param {number} count - Number of phrases needed
 * @param {Array} recentlyUsed - Recently used phrases to avoid
 * @param {string} focus - Optional phonetic focus filter
 * @returns {Array} - Selected phrase objects
 */
export const getPronunciationContent = (
  level = "beginner",
  count = 5,
  recentlyUsed = [],
  focus = null
) => {
  const levelContent =
    pronunciationChallengeContent[level] ||
    pronunciationChallengeContent.beginner;
  let availablePhrases = [...levelContent];

  // Filter by focus area if specified
  if (focus) {
    availablePhrases = availablePhrases.filter(
      (phrase) => phrase.focus === focus
    );
  }

  // Filter out recently used phrases
  const filteredPhrases = availablePhrases.filter(
    (phrase) => !recentlyUsed.some((used) => used.korean === phrase.korean)
  );

  // If not enough unique phrases, include some recent ones
  const finalPool =
    filteredPhrases.length >= count ? filteredPhrases : availablePhrases;

  // Shuffle and select
  const shuffled = shuffleArray(finalPool);
  return shuffled.slice(0, count);
};

/**
 * Get scenario for Conversation Quest Game with smart selection
 * @param {string} level - User's proficiency level
 * @param {Array} recentlyUsed - Recently used scenario IDs to avoid
 * @param {string} category - Optional category filter
 * @returns {Object} - Selected scenario object
 */
export const getConversationScenario = (
  level = "beginner",
  recentlyUsed = [],
  category = null
) => {
  const levelContent =
    conversationQuestContent[level] || conversationQuestContent.beginner;
  let availableScenarios = [...levelContent];

  // Filter by category if specified
  if (category) {
    availableScenarios = availableScenarios.filter(
      (scenario) => scenario.category === category
    );
  }

  // Filter out recently used scenarios
  const filteredScenarios = availableScenarios.filter(
    (scenario) => !recentlyUsed.includes(scenario.id)
  );

  // If no unique scenarios, use all available
  const finalPool =
    filteredScenarios.length > 0 ? filteredScenarios : availableScenarios;

  // Select random scenario
  const randomIndex = Math.floor(Math.random() * finalPool.length);
  return finalPool[randomIndex];
};

// In-memory storage for recently used content (server-side)
// In production, this should be moved to Redis or database
const recentlyUsedCache = new Map();

/**
 * Track and manage recently used content to minimize repetition
 * @param {string} gameType - Type of game
 * @param {string} userId - User ID
 * @param {Array} usedContent - Content that was used in this session
 * @returns {Promise<void>}
 */
export const trackUsedContent = async (gameType, userId, usedContent) => {
  const storageKey = `${gameType}_recent_${userId}`;
  const maxRecentItems = {
    "match-word": 50,
    "sentence-scramble": 25,
    "pronunciation-challenge": 25,
    "conversation-quest": 10,
  };

  try {
    const existing = recentlyUsedCache.get(storageKey) || [];
    const updated = [...usedContent, ...existing].slice(
      0,
      maxRecentItems[gameType] || 25
    );
    recentlyUsedCache.set(storageKey, updated);
    console.log(`📝 Tracked ${usedContent.length} used items for ${gameType}`);
  } catch (error) {
    console.warn("Could not track used content:", error);
  }
};

/**
 * Get recently used content for a user and game type
 * @param {string} gameType - Type of game
 * @param {string} userId - User ID
 * @returns {Array} - Recently used content
 */
export const getRecentlyUsedContent = (gameType, userId) => {
  const storageKey = `${gameType}_recent_${userId}`;
  try {
    const recent = recentlyUsedCache.get(storageKey) || [];
    console.log(
      `📖 Retrieved ${recent.length} recently used items for ${gameType}`
    );
    return recent;
  } catch (error) {
    console.warn("Could not get recently used content:", error);
    return [];
  }
};

/**
 * Get content statistics for analysis
 * @returns {Object} - Content statistics
 */
export const getContentStatistics = () => {
  const stats = {
    matchWord: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      total: 0,
    },
    sentenceScramble: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      total: 0,
    },
    pronunciationChallenge: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      total: 0,
    },
    conversationQuest: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      total: 0,
    },
  };

  // Count Match Word content
  Object.keys(matchWordContent).forEach((level) => {
    let count = 0;
    Object.values(matchWordContent[level]).forEach((category) => {
      count += category.length;
    });
    stats.matchWord[level] = count;
    stats.matchWord.total += count;
  });

  // Count Sentence Scramble content
  Object.keys(sentenceScrambleContent).forEach((level) => {
    const count = sentenceScrambleContent[level].length;
    stats.sentenceScramble[level] = count;
    stats.sentenceScramble.total += count;
  });

  // Count Pronunciation Challenge content
  Object.keys(pronunciationChallengeContent).forEach((level) => {
    const count = pronunciationChallengeContent[level].length;
    stats.pronunciationChallenge[level] = count;
    stats.pronunciationChallenge.total += count;
  });

  // Count Conversation Quest content
  Object.keys(conversationQuestContent).forEach((level) => {
    const count = conversationQuestContent[level].length;
    stats.conversationQuest[level] = count;
    stats.conversationQuest.total += count;
  });

  return stats;
};
