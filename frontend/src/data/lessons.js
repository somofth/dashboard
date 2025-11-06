export const lessonTypeMap = {
  1: "개념 설명",
  2: "롤 플레이",
  3: "기타 실전",
};

export const statusMap = {
  pending: "대기 중",
  revision_requested: "수정 요청",
  approved: "승인 완료",
  rejected: "반려",
};

export const initialLessons = [
  {
    id: "05cc7111-40c5-4a09-9a3d-c41f82b1bc15",
    title: "B2 비즈니스 협상 전략 - 조건절 활용",
    targetLanguage: "en",
    summary:
      "해외 파트너와의 가격 협상 상황에서 가정법 과거 완료를 활용하는 전략을 설명합니다. 조건절을 이용해 타협안을 제시하는 표현을 집중적으로 다룹니다.",
    lessonType: 1,
    status: "pending",
    createdAt: "2024-07-18T08:20:00Z",
    updatedAt: "2024-07-18T08:20:00Z",
    reviewerNotes: "",
    submittedBy: "Pathflow AI Engine",
    tags: {
      CEFR_LEVEL: "B2",
      grammer_focus: "Third conditional",
      lesson_type: "1",
      theme_category: "business",
      TARGET_LANGUAGE: "en",
      uuid: "05cc7111-40c5-4a09-9a3d-c41f82b1bc15",
    },
    extraTags: [
      { key: "supporting_docs", value: "AI_KB_0321.pdf" },
      { key: "risk_score", value: "Medium" },
    ],
    content: [
      {
        heading: "핵심 구조 복습",
        body: [
          "B2 학습자님, 가정법 과거완료는 협상에서 '이미 지나간 조건을 되짚어 상대에게 책임을 환기'할 때 쓰입니다.",
          '화면의 문장 "If we had adjusted the MOQ earlier, we would have met your launch target." 를 살펴보세요. If 절에서 had + p.p.가 과거의 가정 조건을 만들고, 결과절의 would have + p.p.는 \'그랬더라면\'이라는 뉘앙스를 만듭니다.',
          "이 구조는 잘못을 직접 지적하지 않고, 상황을 공유하면서 해결책을 제안하는 고급 완곡 전략입니다.",
        ],
      },
      {
        heading: "협상 표현 비교",
        body: [
          '직설적 표현: "You missed the shipment window." → 책임을 바로 지적하기 때문에 방어적 반응을 유발할 수 있습니다.',
          '완곡한 조건절: "If the shipment had left Seoul on the 12th, we would already be on shelves." → 과거 사실을 공유하면서 공동 해결책 모드를 유지합니다.',
          '대안 제시: "If we secured a regional partner earlier, we would have prevented the cost overrun." → 앞으로의 협력 방향을 자연스럽게 제안합니다.',
        ],
      },
      {
        heading: "압박 협상 퀴즈",
        body: [
          "다음 문장 중 협상에서 정중한 압박으로 적절한 것은 무엇일까요?",
          'A) "You should have approved the terms yesterday."',
          'B) "If the revised payment plan had been cleared yesterday, we would already be shipping to Osaka."',
          "정답은 B입니다. 조건절을 활용하면 얼굴을 세워주면서도 긴박감을 전달할 수 있습니다.",
        ],
      },
    ],
    riskFlags: [
      "원본 자료에는 가격 조정 대신 배송 지연 사례가 수록되어 있어 맥락 불일치 가능성",
    ],
  },
  {
    id: "a3f2b71e-7446-4d15-bc83-42e5babbdc74",
    title: "Business Email Writing Basics",
    targetLanguage: "en",
    summary:
      "정중한 비즈니스 이메일 오프너와 요청 문장을 단계적으로 학습하고, 완곡 표현을 연습하는 개념 설명 레슨입니다.",
    lessonType: 1,
    status: "pending",
    createdAt: "2024-07-18T09:00:00Z",
    updatedAt: "2024-07-18T09:00:00Z",
    reviewerNotes: "",
    submittedBy: "Pathflow AI Engine",
    tags: {
      CEFR_LEVEL: "B1",
      grammer_focus: "Polite requests",
      lesson_type: "1",
      theme_category: "business",
      TARGET_LANGUAGE: "en",
      uuid: "a3f2b71e-7446-4d15-bc83-42e5babbdc74",
    },
    extraTags: [
      { key: "email_component", value: "Opening & Request" },
      { key: "review_required", value: "Tone validation" },
    ],
    content: [
      {
        heading: "기본 학습",
        body: [
          "학습자님, 비즈니스 이메일의 핵심은 정중함입니다. 화면의 문장을 보세요. 'I would be grateful' 블록은 '감사할 것입니다'라는 의미로, 다소 딱딱하게 들릴 수 있는 요청을 우회하는 완벽한 정중체 오프너입니다.",
          "이어서 'if you could provide' 블록을 보세요. Could라는 정중 조동사를 사용하여 요청의 강도를 낮춥니다. '해줄 수 있습니까?'가 아니라 '해주신다면 감사하겠습니다'라는 완벽한 완곡 표현을 완성하는 것이죠.",
          "두 블록을 결합함으로써, 우리는 B1 레벨의 복합 문장 구조를 활용하여 거절하기 어려운 정중한 요청을 전달하게 됩니다.",
        ],
      },
      {
        heading: "추가 예시와 비교",
        body: [
          "이 구조가 왜 중요한지 다른 표현과 비교해 볼까요?",
          '* 비격식/직설적: "Please send the documents now." (지금 당장 서류를 보내주세요.) → 명령처럼 들릴 수 있습니다.',
          '* 완곡: "I would be grateful if you could provide the documents by next Friday." → 상대방에게 선택권을 주어 훨씬 더 공손하게 느껴집니다.',
        ],
      },
      {
        heading: "간단한 퀴즈",
        body: [
          "자, 그럼 이해했는지 간단하게 확인해 봅시다!",
          '화면을 보세요. 다음 문장에서 정중함과 완곡함을 나타내는 조동사 블록은 무엇일까요?',
          '"I wonder if you should talk to the manager about the schedule."',
          "(정답은 'should'가 아닌 'I wonder if'와 'could'를 사용하는 것이 좋습니다.)",
        ],
      },
    ],
    riskFlags: ["AI 초안의 정중도 톤을 추가 검수할 필요가 있습니다."],
  },
  {
    id: "4f41c96e-21b3-45a1-8bf7-4b6689c4ac59",
    title: "A2 일상 대화 - 카페 주문 롤 플레이",
    targetLanguage: "ja",
    summary:
      "카페에서 음료와 간단한 디저트를 주문하는 상황을 롤 플레이 형태로 연습합니다. 학생이 조건부 요구(예: 무지방 우유 요청)를 영어로 전달할 수 있도록 돕습니다.",
    lessonType: 2,
    status: "revision_requested",
    createdAt: "2024-07-17T13:10:00Z",
    updatedAt: "2024-07-18T06:45:00Z",
    reviewerNotes: "음료 온도 관련 표현 제안이 부정확합니다. 수정 부탁드립니다.",
    submittedBy: "Pathflow AI Engine",
    tags: {
      CEFR_LEVEL: "A2",
      grammer_focus: "Polite requests",
      lesson_type: "2",
      theme_category: "everyday_life",
      TARGET_LANGUAGE: "ja",
      uuid: "4f41c96e-21b3-45a1-8bf7-4b6689c4ac59",
    },
    extraTags: [
      { key: "scenario_time", value: "오전 러시아워" },
      { key: "required_assets", value: "audio_roleplay_v02.mp3" },
    ],
    content: [
      {
        heading: "Role A (Learner)",
        body: [
          "Greet the barista and ask for the seasonal latte.",
          "Politely request to make it decaf if possible.",
          "Check if there is any gluten-free cake available today.",
        ],
      },
      {
        heading: "Role B (Barista)",
        body: [
          "Welcome the customer enthusiastically.",
          "Explain that decaf is only available for drip coffee (사실과 다름).",
          "Offer an alternative dessert with a conditional statement.",
        ],
      },
    ],
    riskFlags: [
      "실제 매장 메뉴 정책과 상충하는 정보가 포함되어 있음",
      "조건문 사용 예시가 문법적으로 어색함",
    ],
  },
  {
    id: "bcf9af63-75c2-410d-a541-1b61b099377f",
    title: "C1 테크 스타트업 - 투자자 브리핑 스크립트",
    targetLanguage: "en",
    summary:
      "신규 투자 라운드 IR 피칭을 준비하는 학습자를 위해, 가정법과 분사구문을 활용한 고급 표현을 제공하는 개념+실전 혼합형 레슨입니다.",
    lessonType: 3,
    status: "pending",
    createdAt: "2024-07-16T09:30:00Z",
    updatedAt: "2024-07-16T09:30:00Z",
    reviewerNotes: "",
    submittedBy: "Pathflow AI Engine",
    tags: {
      CEFR_LEVEL: "C1",
      grammer_focus: "Advanced participles",
      lesson_type: "3",
      theme_category: "tech_Coding",
      TARGET_LANGUAGE: "en",
      uuid: "bcf9af63-75c2-410d-a541-1b61b099377f",
    },
    extraTags: [
      { key: "pitch_target", value: "Series B" },
      { key: "compliance_notes", value: "재무지표 검증 필요" },
    ],
    content: [
      {
        heading: "Opening Statement",
        body: [
          "Having delivered consistent 30% QoQ growth, we are now poised to expand into LATAM.",
        ],
      },
      {
        heading: "Conditional Projections",
        body: [
          "If we secure the strategic partner in São Paulo, we project an additional $4M ARR within 12 months.",
        ],
      },
      {
        heading: "Closing Ask",
        body: [
          "Should you join us this round, we are prepared to extend a board observer seat.",
        ],
      },
    ],
    riskFlags: [],
  },
  {
    id: "f8d3af22-9bd4-46e2-8d52-4f1c6cb1edab",
    title: "B1 고객 지원 콜센터 롤 플레이 - 배송 지연 안내",
    targetLanguage: "zh",
    summary:
      "온라인 쇼핑몰 고객에게 배송 지연을 안내하는 상황을 다루며, 공손한 사과와 해결책 제시를 연습하도록 설계된 롤 플레이입니다.",
    lessonType: 2,
    status: "rejected",
    createdAt: "2024-07-15T15:45:00Z",
    updatedAt: "2024-07-18T07:10:00Z",
    reviewerNotes:
      "실제 배송 정책과 상충되는 허위 보상 정보를 제공하여 반려되었습니다.",
    submittedBy: "Pathflow AI Engine",
    tags: {
      CEFR_LEVEL: "B1",
      grammer_focus: "Apologizing politely",
      lesson_type: "2",
      theme_category: "everyday_life",
      TARGET_LANGUAGE: "zh",
      uuid: "f8d3af22-9bd4-46e2-8d52-4f1c6cb1edab",
    },
    extraTags: [
      { key: "call_duration", value: "3분 예상" },
      { key: "policy_check", value: "배송 보상 규정 확인 필요" },
    ],
    content: [
      {
        heading: "Role A (Agent)",
        body: [
          "Greet the customer and acknowledge the inconvenience politely.",
          "Explain that the shipment is delayed because it is still in customs clearance.",
          "Offer a 30% refund and a complimentary upgrade to express shipping (허위 정보).",
        ],
      },
      {
        heading: "Role B (Customer)",
        body: [
          "Express frustration about the delivery timeline.",
          "Ask whether the company can guarantee next-day delivery.",
          "Request to speak with a supervisor if compensation is not enough.",
        ],
      },
      {
        heading: "Coaching Notes",
        body: [
          "B1 학습자는 사과문 'I'm really sorry about the delay'를 자연스럽게 사용해야 합니다.",
          "현실적인 보상 범위 내에서 해결책을 제시하도록 가이드해 주세요.",
        ],
      },
    ],
    riskFlags: [
      "실제 운영 정책과 다른 허위 보상(30% 환불 + 무료 익일 배송)을 제안함",
      "배송 지연 사유를 '세관 문제'로 단정 지어 사실 확인 없이 안내함",
    ],
  },
];
