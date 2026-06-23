export type ReviewCategory = "필수 검토" | "조건부 검토" | "추가 확인";
export type YesNoUnknown = "예" | "아니오" | "잘 모르겠음";
export type PublicPrivate = "공공" | "민간";

export type ChecklistCardConditions = {
  always?: boolean;
  constructionActions?: string[];
  districtUnitPlan?: YesNoUnknown[];
  publicPrivate?: PublicPrivate[];
  heritageRelated?: YesNoUnknown[];
  riverRelated?: YesNoUnknown[];
  schoolEnvironmentRelated?: YesNoUnknown[];
  mountainRelated?: YesNoUnknown[];
  farmlandRelated?: YesNoUnknown[];
};

export type ChecklistCard = {
  id: string;
  title: string;
  category: ReviewCategory;
  description: string;
  quickChecks: string[];
  reason: string;
  relatedLaws: string[];
  checkPoints: string[];
  searchKeywords: string[];
  warning: string;
  conditions: ChecklistCardConditions;
};

export const defaultWarning =
  "본 결과는 법적 확정 판단이 아니며, 공식 법령과 인허가권자 확인이 필요합니다.";

const card = (
  input: Omit<ChecklistCard, "warning"> & {
    warning?: string;
  },
): ChecklistCard => ({
  ...input,
  warning: input.warning ?? defaultWarning,
});

export const checklistCards: ChecklistCard[] = [
  card({
    id: "site-road-relationship",
    title: "이 땅이 건축 가능한 조건인지 확인",
    category: "필수 검토",
    description:
      "건물을 짓거나 고치기 전에, 먼저 이 땅이 도로와 제대로 연결되어 있는지 확인해야 합니다.",
    quickChecks: ["도로와 맞닿아 있는지", "차량과 보행자 진입이 가능한지"],
    reason:
      "도로와의 관계는 허가 가능 여부와 배치 계획에 큰 영향을 줍니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "대지가 법에서 정한 도로에 접하고 있는지 확인합니다.",
      "진입 폭, 막다른도로 여부, 소방차 진입 가능성도 함께 살펴봅니다.",
    ],
    searchKeywords: ["건축법 대지와 도로", "건축법 도로 접도 요건"],
    conditions: { always: true },
  }),
  card({
    id: "building-use-classification",
    title: "원하는 건물 종류를 이곳에 둘 수 있는지 확인",
    category: "필수 검토",
    description:
      "땅마다 들어올 수 있는 건물 종류가 다를 수 있어, 먼저 허용되는 용도를 살펴봐야 합니다.",
    quickChecks: ["허용되는 건물 종류", "지자체 기준과 충돌 없는지"],
    reason:
      "건물 종류에 따라 허가 가능 여부와 필요한 기준이 크게 달라집니다.",
    relatedLaws: ["건축법 시행령", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "입력한 건물 종류가 법에서 정한 용도 분류상 어디에 해당하는지 확인합니다.",
      "토지이용계획과 지자체 기준에서 허용되는 용도인지 함께 봅니다.",
    ],
    searchKeywords: ["건축물 용도분류", "용도지역 허용 용도"],
    conditions: { always: true },
  }),
  card({
    id: "building-coverage-ratio",
    title: "땅 위에 건물을 얼마나 넓게 올릴 수 있는지 확인",
    category: "필수 검토",
    description:
      "건물이 땅 위를 차지하는 비율에는 기준이 있어서, 평면 계획 전에 확인해두는 것이 좋습니다.",
    quickChecks: ["건물 바닥면적 한도", "지자체 완화 여부"],
    reason: "배치와 규모를 정할 때 가장 먼저 영향을 주는 기준 중 하나입니다.",
    relatedLaws: ["국토의 계획 및 이용에 관한 법률", "지자체 건축조례"],
    checkPoints: [
      "해당 땅의 기준 비율을 확인합니다.",
      "조례상 완화나 추가 제한이 있는지도 함께 살펴봅니다.",
    ],
    searchKeywords: ["건폐율 확인", "지자체 건축조례 건폐율"],
    conditions: { always: true },
  }),
  card({
    id: "floor-area-ratio",
    title: "전체 건물 규모가 허용 범위 안인지 확인",
    category: "필수 검토",
    description:
      "건물 전체 면적에도 상한이 있을 수 있어, 층수와 프로그램을 정하기 전에 확인이 필요합니다.",
    quickChecks: ["전체 면적 한도", "제외 가능한 면적이 있는지"],
    reason:
      "사업 규모와 층수 계획이 가능한지 판단하는 데 직접 연결되는 기준입니다.",
    relatedLaws: ["국토의 계획 및 이용에 관한 법률", "지자체 건축조례"],
    checkPoints: [
      "해당 땅의 허용 범위를 확인합니다.",
      "제외되는 면적이나 조례상 완화 기준이 있는지도 검토합니다.",
    ],
    searchKeywords: ["용적률 확인", "지자체 건축조례 용적률"],
    conditions: { always: true },
  }),
  card({
    id: "parking-review",
    title: "주차 공간을 얼마나 확보해야 하는지 확인",
    category: "필수 검토",
    description:
      "건물 종류와 규모에 따라 필요한 주차대수가 달라질 수 있어 초기에 함께 계산해보는 것이 좋습니다.",
    quickChecks: ["필요한 주차대수", "주차 동선과 배치 가능성"],
    reason: "주차 기준은 대지 활용도와 사업성에 큰 영향을 줍니다.",
    relatedLaws: ["주차장법", "지자체 주차장 조례"],
    checkPoints: [
      "건물 종류와 면적 기준으로 필요한 주차대수를 확인합니다.",
      "장애인 주차와 차량 회차 동선도 함께 검토합니다.",
    ],
    searchKeywords: ["주차장 조례 법정주차대수", "장애인 주차 기준"],
    conditions: { always: true },
  }),
  card({
    id: "egress-fire-basic",
    title: "비상시에 안전하게 나갈 수 있는 구조인지 확인",
    category: "필수 검토",
    description:
      "계단, 출구, 불이 번지는 것을 막는 구획 등 기본 안전 조건은 초기에 방향을 잡아두는 편이 좋습니다.",
    quickChecks: ["계단과 출구 계획", "불이 번지는 구획 기준"],
    reason:
      "안전 기준은 건물 배치와 평면 계획을 크게 바꾸게 만들 수 있습니다.",
    relatedLaws: [
      "건축법",
      "건축법 시행령",
      "소방시설 설치 및 관리에 관한 법률",
    ],
    checkPoints: [
      "직통계단, 피난거리, 방화구획 기준을 살펴봅니다.",
      "용도와 규모에 따라 추가 소방시설 기준도 함께 확인합니다.",
    ],
    searchKeywords: ["건축법 직통계단", "소방시설 설치 및 관리 피난"],
    conditions: { always: true },
  }),
  card({
    id: "building-permit-basic",
    title: "새 건물을 짓기 전에 기본 허가 흐름 확인",
    category: "필수 검토",
    description:
      "새로 짓는 경우에는 어떤 허가와 사전 검토가 필요한지 먼저 파악해두는 것이 좋습니다.",
    quickChecks: ["허가 대상인지", "사전 협의가 필요한지"],
    reason: "새 건물은 가장 기본적인 행정 절차부터 차근차근 확인해야 합니다.",
    relatedLaws: ["건축법"],
    checkPoints: [
      "허가 대상인지 신고 대상인지 확인합니다.",
      "지자체별 추가 협의나 제출 서류가 있는지도 검토합니다.",
    ],
    searchKeywords: ["건축법 건축허가", "신축 허가 절차"],
    conditions: { constructionActions: ["새로 짓기"] },
  }),
  card({
    id: "open-space-inside-site",
    title: "건물 주변에 비워두어야 하는 공간 확인",
    category: "추가 확인",
    description:
      "건물 주위에는 비워두어야 하는 거리나 공간이 있을 수 있어 배치 전에 함께 살펴봐야 합니다.",
    quickChecks: ["건물과 경계 사이 거리", "출입과 관리 공간 확보"],
    reason: "배치 계획을 잡은 뒤 다시 수정하게 되는 경우가 많은 항목입니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "건물 경계선과의 이격 기준을 확인합니다.",
      "출입 동선과 유지관리 공간이 필요한지도 검토합니다.",
    ],
    searchKeywords: ["건축법 대지안의 공지", "건축물 이격거리"],
    conditions: { constructionActions: ["새로 짓기"] },
  }),
  card({
    id: "height-limit",
    title: "건물 높이에 제한이 있는지 확인",
    category: "조건부 검토",
    description:
      "주변 도로, 인접 대지, 지역 기준에 따라 건물 높이에 제한이 걸릴 수 있습니다.",
    quickChecks: ["높이 상한", "사선 제한 여부"],
    reason: "층수와 외관 계획이 달라질 수 있어 초기에 체크할 가치가 큽니다.",
    relatedLaws: ["건축법", "건축법 시행령", "지구단위계획 시행지침"],
    checkPoints: [
      "높이 제한과 사선 제한 적용 여부를 확인합니다.",
      "지구단위계획이나 지자체 추가 기준도 살펴봅니다.",
    ],
    searchKeywords: ["건축법 높이제한", "사선제한 건축"],
    conditions: { constructionActions: ["새로 짓기"] },
  }),
  card({
    id: "sunlight-right",
    title: "주변 건물에 햇빛 영향이 큰지 확인",
    category: "조건부 검토",
    description:
      "주거지 주변에서는 햇빛과 일조 관련 기준 때문에 건물 모양과 배치가 달라질 수 있습니다.",
    quickChecks: ["일조 제한 여부", "주변 주거지 영향"],
    reason: "허가 검토뿐 아니라 민원 가능성에도 영향을 줄 수 있습니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "일조 사선 제한 적용 여부를 확인합니다.",
      "주변 주거지와의 거리, 방향도 함께 검토합니다.",
    ],
    searchKeywords: ["건축법 일조권", "일조 사선 제한"],
    conditions: { constructionActions: ["새로 짓기"] },
  }),
  card({
    id: "existing-building-legality",
    title: "기존 건물이 현재 기준상 문제 없는지 확인",
    category: "필수 검토",
    description:
      "기존 건물을 넓히기 전에는 현재 건물이 허가 내용과 맞는지 먼저 확인하는 것이 중요합니다.",
    quickChecks: ["기존 건물 도면과 현황 일치", "위반 여부"],
    reason: "기존 상태에 문제가 있으면 추가 공사가 어려워질 수 있습니다.",
    relatedLaws: ["건축법"],
    checkPoints: [
      "기존 건축물대장과 실제 사용 현황이 일치하는지 봅니다.",
      "위반건축물 여부와 기존 허가 범위를 확인합니다.",
    ],
    searchKeywords: ["기존 건축물 적법성", "위반건축물 증축"],
    conditions: { constructionActions: ["기존 건물 넓히기"] },
  }),
  card({
    id: "expansion-area",
    title: "얼마나 더 넓힐 수 있는지 확인",
    category: "필수 검토",
    description:
      "남아 있는 면적 여유가 있는지 확인해야 증축 가능 범위를 가늠할 수 있습니다.",
    quickChecks: ["남아 있는 면적 여유", "증가 후 기준 초과 여부"],
    reason: "면적 기준을 넘으면 증축 자체가 어려울 수 있습니다.",
    relatedLaws: ["건축법", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "현재와 계획 면적을 비교해 남은 여유를 계산합니다.",
      "주차나 안전 기준도 함께 다시 맞춰지는지 확인합니다.",
    ],
    searchKeywords: ["증축 가능 면적", "증축 건폐율 용적률"],
    conditions: { constructionActions: ["기존 건물 넓히기"] },
  }),
  card({
    id: "structural-impact-expansion",
    title: "건물을 넓힐 때 구조적으로 안전한지 확인",
    category: "필수 검토",
    description:
      "기존 건물에 하중이 더해질 수 있어, 구조 안전 검토가 중요할 수 있습니다.",
    quickChecks: ["기존 구조 여유", "보강 필요 여부"],
    reason: "기존 구조가 버틸 수 있는지가 공사 가능성을 좌우합니다.",
    relatedLaws: ["건축법", "건축구조기준"],
    checkPoints: [
      "기존 구조 형식과 추가 하중 영향을 검토합니다.",
      "보강이 필요한지 구조 검토서가 필요한지 확인합니다.",
    ],
    searchKeywords: ["증축 구조 안전", "건축구조기준 증축"],
    conditions: { constructionActions: ["기존 건물 넓히기"] },
  }),
  card({
    id: "existing-egress-impact",
    title: "건물을 넓힌 뒤에도 안전한 대피가 가능한지 확인",
    category: "추가 확인",
    description:
      "면적이 늘어나면 계단, 출구, 소방 기준도 함께 달라질 수 있습니다.",
    quickChecks: ["출구 수와 거리", "소방시설 추가 필요 여부"],
    reason: "조금만 넓혀도 전체 건물 기준이 달라지는 경우가 있습니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "증축 후 피난거리와 계단 기준을 다시 확인합니다.",
      "소방시설 추가 설치 필요 여부도 함께 봅니다.",
    ],
    searchKeywords: ["증축 피난거리", "증축 방화구획"],
    conditions: { constructionActions: ["기존 건물 넓히기"] },
  }),
  card({
    id: "change-of-use-eligibility",
    title: "건물 쓰임을 바꿔도 되는지 확인",
    category: "필수 검토",
    description:
      "주택을 카페로 바꾸는 것처럼 건물 쓰임을 바꾸려면, 그 변경이 허용되는지 먼저 확인해야 합니다.",
    quickChecks: ["새 쓰임 허용 여부", "지자체 제한 여부"],
    reason: "쓰임 변경 자체가 허용되지 않으면 다음 단계 검토가 무의미해질 수 있습니다.",
    relatedLaws: ["건축법", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "바꾸려는 건물 쓰임이 해당 지역에서 허용되는지 확인합니다.",
      "지구단위계획이나 지자체 제한이 있는지도 함께 봅니다.",
    ],
    searchKeywords: ["건축법 용도변경", "용도지역 허용 용도"],
    conditions: { constructionActions: ["건물 쓰임 바꾸기"] },
  }),
  card({
    id: "parking-change",
    title: "건물 쓰임 변경 후 주차 기준이 달라지는지 확인",
    category: "조건부 검토",
    description:
      "건물 종류가 바뀌면 필요한 주차대수도 달라질 수 있습니다.",
    quickChecks: ["변경 전후 주차대수 비교", "추가 주차 확보 필요 여부"],
    reason: "주차 기준 변화는 사업 가능성에 직접 영향을 줄 수 있습니다.",
    relatedLaws: ["주차장법", "지자체 주차장 조례"],
    checkPoints: [
      "변경 전후 기준을 비교해 필요한 주차대수를 다시 계산합니다.",
      "기존 주차 공간으로 충족 가능한지도 함께 확인합니다.",
    ],
    searchKeywords: ["용도변경 주차대수", "주차장 조례 용도변경"],
    conditions: { constructionActions: ["건물 쓰임 바꾸기"] },
  }),
  card({
    id: "egress-fire-change",
    title: "건물 쓰임 변경 후 안전 기준이 달라지는지 확인",
    category: "필수 검토",
    description:
      "건물 종류가 달라지면 계단, 출구, 소방 기준도 더 강화될 수 있습니다.",
    quickChecks: ["변경 후 계단과 출구 기준", "소방시설 추가 여부"],
    reason: "건물 쓰임이 바뀌면 안전 기준이 크게 달라질 수 있습니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "변경 후 용도에 맞는 피난 기준을 다시 적용합니다.",
      "소방시설 보강이 필요한지도 함께 확인합니다.",
    ],
    searchKeywords: ["용도변경 피난 기준", "용도변경 소방시설"],
    conditions: { constructionActions: ["건물 쓰임 바꾸기"] },
  }),
  card({
    id: "accessibility-change",
    title: "이용하기 쉬운 시설 기준이 추가되는지 확인",
    category: "추가 확인",
    description:
      "건물 쓰임이 바뀌면 장애인 편의시설이나 접근성 기준이 더 필요해질 수 있습니다.",
    quickChecks: ["장애인 화장실 필요 여부", "출입 동선과 주차 기준"],
    reason: "이용 대상이 달라지면 편의시설 기준도 함께 달라질 수 있습니다.",
    relatedLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
    checkPoints: [
      "변경 후 용도에 따라 편의시설 추가 설치가 필요한지 확인합니다.",
      "장애인 주차와 화장실, 출입 동선 기준도 함께 봅니다.",
    ],
    searchKeywords: ["용도변경 장애인 편의시설", "BF 인증 용도변경"],
    conditions: { constructionActions: ["건물 쓰임 바꾸기"] },
  }),
  card({
    id: "major-structure-change",
    title: "큰 공사에 해당하는지 먼저 확인",
    category: "필수 검토",
    description:
      "기존 건물을 크게 고치는 경우에는 단순 수선이 아니라 더 큰 절차가 필요한 공사일 수 있습니다.",
    quickChecks: ["뼈대 변경 여부", "허가나 신고 대상인지"],
    reason: "공사 종류를 잘못 이해하면 준비해야 할 절차를 놓칠 수 있습니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "기둥, 보, 내력벽, 바닥, 지붕 등 주요 부분을 바꾸는지 확인합니다.",
      "단순 보수인지 큰 공사인지 구분합니다.",
    ],
    searchKeywords: ["건축법 시행령 대수선", "주요구조부 변경 여부"],
    conditions: { constructionActions: ["기존 건물 크게 고치기"] },
  }),
  card({
    id: "major-renovation-permit",
    title: "허가나 신고가 필요한 공사인지 확인",
    category: "필수 검토",
    description:
      "크게 고치는 공사는 범위에 따라 허가나 신고가 필요할 수 있습니다.",
    quickChecks: ["허가 대상인지", "추가 협의가 필요한지"],
    reason: "행정 절차를 놓치면 일정과 비용에 바로 영향이 생깁니다.",
    relatedLaws: ["건축법"],
    checkPoints: [
      "공사 범위에 따라 허가 대상인지 신고 대상인지 확인합니다.",
      "지자체별 추가 협의가 필요한지도 검토합니다.",
    ],
    searchKeywords: ["대수선 허가 신고", "건축법 대수선 허가"],
    conditions: { constructionActions: ["기존 건물 크게 고치기"] },
  }),
  card({
    id: "fire-compartment-impact",
    title: "벽을 바꾸면서 불 확산 방지 기준이 깨지지 않는지 확인",
    category: "추가 확인",
    description:
      "내부 벽을 철거하거나 문을 바꾸면 방화 구획 기준에 영향이 생길 수 있습니다.",
    quickChecks: ["방화구획 유지 여부", "방화문 기준"],
    reason: "평면 변경 과정에서 놓치기 쉬운 항목이지만 영향은 큽니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "벽체 철거나 천장 변경이 방화구획에 미치는 영향을 확인합니다.",
      "방화문과 마감 기준도 함께 검토합니다.",
    ],
    searchKeywords: ["대수선 방화구획", "방화문 설치 기준"],
    conditions: { constructionActions: ["기존 건물 크게 고치기"] },
  }),
  card({
    id: "structural-safety-major-renovation",
    title: "큰 공사 후에도 구조적으로 안전한지 확인",
    category: "조건부 검토",
    description:
      "벽이나 구조 부재를 바꾸면 별도의 구조 검토가 필요할 수 있습니다.",
    quickChecks: ["구조 검토서 필요 여부", "보강 계획 필요 여부"],
    reason: "안전성과 공사 범위 판단에 구조 검토가 중요한 기준이 됩니다.",
    relatedLaws: ["건축법", "건축구조기준"],
    checkPoints: [
      "철거 범위와 보강 범위를 함께 검토합니다.",
      "구조 계산이나 별도 검토서가 필요한지 확인합니다.",
    ],
    searchKeywords: ["대수선 구조 안전", "구조계산 대수선"],
    conditions: { constructionActions: ["기존 건물 크게 고치기"] },
  }),
  card({
    id: "district-unit-plan-guideline",
    title: "이 지역만의 추가 기준이 있는지 확인",
    category: "조건부 검토",
    description:
      "일부 지역은 일반 법 기준 외에 지역별 세부 지침이 따로 있을 수 있습니다.",
    quickChecks: ["추가 높이와 배치 기준", "허용 용도 제한"],
    reason: "토지이용계획에서 놓치기 쉬운 별도 기준이 들어 있을 수 있습니다.",
    relatedLaws: ["지구단위계획 시행지침", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "허용 용도, 높이, 공개공지, 배치 기준을 확인합니다.",
      "지자체 고시문과 세부 지침도 함께 검토합니다.",
    ],
    searchKeywords: ["지구단위계획 시행지침 건축물 용도 제한", "지구단위계획 건축 기준"],
    conditions: { districtUnitPlan: ["예"] },
  }),
  card({
    id: "public-architecture-review",
    title: "공공 사업이라면 별도 심의가 필요한지 확인",
    category: "조건부 검토",
    description:
      "공공 사업은 일반 민간 사업과 다른 심의 절차가 추가될 수 있습니다.",
    quickChecks: ["공공건축 심의 대상", "발주 방식 확인"],
    reason: "공공 사업은 별도 절차를 먼저 확인해야 일정 계획이 쉬워집니다.",
    relatedLaws: ["건축서비스산업 진흥법"],
    checkPoints: [
      "공공건축 심의 대상인지 확인합니다.",
      "사업 규모와 발주 방식에 따라 추가 절차를 검토합니다.",
    ],
    searchKeywords: ["공공건축 심의", "건축서비스산업 진흥법 공공건축"],
    conditions: { publicPrivate: ["공공"] },
  }),
  card({
    id: "design-competition-review",
    title: "공공 사업의 설계공모 대상인지 확인",
    category: "조건부 검토",
    description:
      "공공 사업은 경우에 따라 설계공모가 필요한지 먼저 살펴봐야 할 수 있습니다.",
    quickChecks: ["설계공모 대상 여부", "예외 사유 있는지"],
    reason: "발주 방식이 바뀌면 전체 일정과 준비 방식이 달라집니다.",
    relatedLaws: ["공공건축 설계공모 운영지침"],
    checkPoints: [
      "설계공모 대상인지 확인합니다.",
      "공모가 아니라면 다른 발주 방식 기준도 함께 검토합니다.",
    ],
    searchKeywords: ["공공건축 설계공모", "설계공모 운영지침"],
    conditions: { publicPrivate: ["공공"] },
  }),
  card({
    id: "bf-certification",
    title: "누구나 이용하기 쉬운 건물 기준을 함께 확인",
    category: "조건부 검토",
    description:
      "공공 사업은 이용 접근성 기준을 더 일찍 검토하는 편이 좋습니다.",
    quickChecks: ["출입 동선", "장애인 이용 편의 기준"],
    reason: "공공 프로젝트에서 자주 함께 검토되는 항목입니다.",
    relatedLaws: ["장애물 없는 생활환경 인증에 관한 규칙"],
    checkPoints: [
      "인증 대상인지 권장 대상인지 확인합니다.",
      "주차, 출입구, 화장실, 이동 동선을 함께 검토합니다.",
    ],
    searchKeywords: ["BF 인증 공공건축", "장애물 없는 생활환경 인증"],
    conditions: { publicPrivate: ["공공"] },
  }),
  card({
    id: "heritage-review",
    title: "문화재 주변이라면 추가 제한이 있는지 확인",
    category: "조건부 검토",
    description:
      "문화재 근처는 높이, 외관, 공사 방법에 별도 기준이 생길 수 있습니다.",
    quickChecks: ["문화재 영향 범위", "추가 협의 필요 여부"],
    reason: "주변 여건 때문에 일반적인 기준보다 더 엄격한 검토가 필요할 수 있습니다.",
    relatedLaws: ["문화재보호법"],
    checkPoints: [
      "영향 범위 안에 들어가는지 확인합니다.",
      "현상변경 허가나 별도 협의가 필요한지 검토합니다.",
    ],
    searchKeywords: ["문화재보호법 현상변경", "문화재 주변 건축 제한"],
    conditions: { heritageRelated: ["예"] },
  }),
  card({
    id: "river-review",
    title: "하천 주변이라면 별도 사용 제한이 있는지 확인",
    category: "조건부 검토",
    description:
      "하천 주변은 점용, 배수, 구조물 설치와 관련해 추가 검토가 필요할 수 있습니다.",
    quickChecks: ["하천구역 해당 여부", "하천 점용 여부"],
    reason: "부지 여건 때문에 일반 건축 기준 외의 검토가 더해질 수 있습니다.",
    relatedLaws: ["하천법"],
    checkPoints: [
      "하천구역이나 인접 구역에 해당하는지 확인합니다.",
      "배수와 구조물 계획이 제한을 받는지 검토합니다.",
    ],
    searchKeywords: ["하천구역 건축 제한", "하천법 하천점용"],
    conditions: { riverRelated: ["예"] },
  }),
  card({
    id: "school-environment-review",
    title: "학교 주변이라면 업종 제한이 있는지 확인",
    category: "조건부 검토",
    description:
      "학교 주변은 건물 종류에 따라 추가 제한이나 협의가 필요할 수 있습니다.",
    quickChecks: ["학교 보호구역 해당 여부", "허용 업종인지"],
    reason: "건물 종류에 따라 가능한지 여부가 달라질 수 있습니다.",
    relatedLaws: ["교육환경 보호에 관한 법률"],
    checkPoints: [
      "학교 보호구역에 해당하는지 확인합니다.",
      "건물 종류에 따른 제한 여부를 검토합니다.",
    ],
    searchKeywords: ["교육환경보호구역 검토", "학교 주변 건축 제한"],
    conditions: { schoolEnvironmentRelated: ["예"] },
  }),
  card({
    id: "mountain-review",
    title: "산지라면 별도 전용 절차가 필요한지 확인",
    category: "조건부 검토",
    description:
      "산지 성격의 땅은 일반 대지와 달리 전용 허가나 경사 관련 검토가 필요할 수 있습니다.",
    quickChecks: ["산지 전용 대상 여부", "경사와 안전 문제"],
    reason: "땅의 성격 자체가 다르면 준비해야 할 절차도 크게 달라집니다.",
    relatedLaws: ["산지관리법"],
    checkPoints: [
      "산지전용 허가나 신고가 필요한지 확인합니다.",
      "경사와 재해 위험 요소도 함께 검토합니다.",
    ],
    searchKeywords: ["산지전용 허가", "산지관리법 건축"],
    conditions: { mountainRelated: ["예"] },
  }),
  card({
    id: "farmland-review",
    title: "농지라면 다른 용도로 바꿀 수 있는지 확인",
    category: "조건부 검토",
    description:
      "농지는 건축 전에 전용 가능 여부를 먼저 살펴봐야 할 수 있습니다.",
    quickChecks: ["농지 전용 가능 여부", "부담금 여부"],
    reason: "대지와 달리 사전에 확인할 절차가 더 많을 수 있습니다.",
    relatedLaws: ["농지법"],
    checkPoints: [
      "농지전용 허가나 협의 대상인지 확인합니다.",
      "부담금이나 농업진흥지역 여부도 함께 검토합니다.",
    ],
    searchKeywords: ["농지전용 검토", "농지법 건축"],
    conditions: { farmlandRelated: ["예"] },
  }),
];
