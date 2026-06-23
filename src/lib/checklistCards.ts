export type ReviewCategory = "필수 검토" | "조건부 검토" | "놓치기 쉬운 항목";
export type YesNoUnknown = "예" | "아니오" | "모름";
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
  reason: string;
  relatedLaws: string[];
  checkPoints: string[];
  searchKeywords: string[];
  warning: string;
  conditions: ChecklistCardConditions;
};

export const defaultWarning =
  "본 결과는 법적 확정 판단이 아니며, 공식 법령 및 인허가권자 확인이 필요합니다.";

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
    title: "대지와 도로 관계",
    category: "필수 검토",
    description: "건축 가능한 대지인지와 접도 조건을 먼저 확인하는 기본 검토 항목입니다.",
    reason: "대지의 접도 요건은 대부분의 인허가 검토에서 가장 먼저 확인되는 핵심 조건입니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "건축 가능한 대지인지와 접하는 도로의 종류 및 폭을 확인합니다.",
      "막다른도로, 사도, 진입 가능 여부 등 실질적 접근성을 함께 검토합니다.",
    ],
    searchKeywords: ["건축법 대지와 도로", "건축법 접도요건"],
    conditions: { always: true },
  }),
  card({
    id: "building-use-classification",
    title: "건축물 용도분류",
    category: "필수 검토",
    description: "입력한 건축물 용도가 법령상 어느 용도군에 해당하는지 정리합니다.",
    reason: "용도분류에 따라 허용 여부, 피난 기준, 주차 기준, 편의시설 기준이 함께 달라집니다.",
    relatedLaws: ["건축법 시행령"],
    checkPoints: [
      "입력한 용도가 법령상 어떤 용도군과 세부 용도에 해당하는지 확인합니다.",
      "유사 용도로 보이더라도 실제 법적 분류가 다른지 검토합니다.",
    ],
    searchKeywords: ["건축법 시행령 용도별 건축물", "건축물 용도분류"],
    conditions: { always: true },
  }),
  card({
    id: "building-coverage-ratio",
    title: "건폐율",
    category: "필수 검토",
    description: "대지면적 대비 건축면적 비율이 지역 기준을 넘지 않는지 검토합니다.",
    reason: "건폐율은 배치 계획과 건축 가능 규모를 좌우하는 기본 지표입니다.",
    relatedLaws: ["국토의 계획 및 이용에 관한 법률", "지자체 건축조례"],
    checkPoints: [
      "용도지역 기준 건폐율 상한을 확인합니다.",
      "조례 완화 또는 중복 제한 여부를 함께 검토합니다.",
    ],
    searchKeywords: ["용도지역 건폐율", "지자체 건축조례 건폐율"],
    conditions: { always: true },
  }),
  card({
    id: "floor-area-ratio",
    title: "용적률",
    category: "필수 검토",
    description: "연면적 계획이 지역별 용적률 상한 안에 들어오는지 검토합니다.",
    reason: "용적률은 사업성, 규모, 층수 검토와 직접 연결되는 대표 지표입니다.",
    relatedLaws: ["국토의 계획 및 이용에 관한 법률", "지자체 건축조례"],
    checkPoints: [
      "용도지역 기준 용적률 상한을 확인합니다.",
      "산정 제외 면적과 조례 특례가 있는지 검토합니다.",
    ],
    searchKeywords: ["용도지역 용적률", "지자체 건축조례 용적률"],
    conditions: { always: true },
  }),
  card({
    id: "parking-review",
    title: "주차 검토",
    category: "필수 검토",
    description: "용도와 규모에 따른 법정주차대수와 설치 방식을 검토합니다.",
    reason: "주차 기준은 배치 계획과 사업 가능성에 큰 영향을 주는 필수 검토 항목입니다.",
    relatedLaws: ["주차장법", "지자체 주차장 조례"],
    checkPoints: [
      "법정주차대수 산정 기준을 확인합니다.",
      "장애인 주차, 기계식 주차, 진출입 동선 기준을 함께 검토합니다.",
    ],
    searchKeywords: ["주차장 조례 법정주차대수", "장애인 주차 설치기준"],
    conditions: { always: true },
  }),
  card({
    id: "egress-fire-basic",
    title: "피난·방화 기본 검토",
    category: "필수 검토",
    description: "직통계단, 피난거리, 방화구획 등 기본 안전 기준을 먼저 점검합니다.",
    reason: "피난과 방화 기준은 건축물 용도와 규모에 따라 초기에 함께 검토해야 수정 비용이 줄어듭니다.",
    relatedLaws: ["건축법", "건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "직통계단, 피난거리, 출구 수, 방화구획 기준을 확인합니다.",
      "용도와 규모에 따라 소방시설 기준이 달라지는지 검토합니다.",
    ],
    searchKeywords: ["건축법 직통계단", "소방시설 설치 및 관리에 관한 법률 피난"],
    conditions: { always: true },
  }),
  card({
    id: "building-permit-basic",
    title: "건축허가 기본 검토",
    category: "필수 검토",
    description: "신축 시 적용되는 기본 허가 흐름과 인허가 준비 범위를 정리합니다.",
    reason: "신축은 건축허가 또는 관련 절차를 기본 전제로 검토가 시작됩니다.",
    relatedLaws: ["건축법"],
    checkPoints: [
      "허가 대상인지와 기본 제출도서 범위를 확인합니다.",
      "지자체 추가 협의나 심의가 필요한지 검토합니다.",
    ],
    searchKeywords: ["건축법 건축허가", "신축 허가 절차"],
    conditions: { constructionActions: ["신축"] },
  }),
  card({
    id: "open-space-inside-site",
    title: "대지안의 공지",
    category: "놓치기 쉬운 항목",
    description: "건축선 후퇴, 공지 확보, 유지관리 공간을 포함해 배치 여유를 확인합니다.",
    reason: "신축 초기 배치에서 공지를 놓치면 면적과 평면 계획이 크게 바뀔 수 있습니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "대지안의 공지 기준과 완화 가능 여부를 확인합니다.",
      "출입 동선과 유지관리 공간까지 함께 검토합니다.",
    ],
    searchKeywords: ["건축법 대지안의 공지", "대지안 공지 기준"],
    conditions: { constructionActions: ["신축"] },
  }),
  card({
    id: "height-limit",
    title: "높이제한",
    category: "조건부 검토",
    description: "높이, 사선제한, 고도지구 등 수직 규제를 함께 확인합니다.",
    reason: "신축은 높이 계획이 사선제한과 지구 기준에 영향을 받을 수 있습니다.",
    relatedLaws: ["건축법", "건축법 시행령", "지구단위계획 시행지침"],
    checkPoints: [
      "도로사선, 일조사선, 고도지구 제한을 확인합니다.",
      "지자체 또는 지구단위계획의 추가 높이 기준이 있는지 검토합니다.",
    ],
    searchKeywords: ["건축법 높이제한", "고도지구 건축 높이"],
    conditions: { constructionActions: ["신축"] },
  }),
  card({
    id: "sunlight-right",
    title: "일조권 검토",
    category: "조건부 검토",
    description: "주변 대지와 주거지역 기준에 따른 일조사선 적용 여부를 검토합니다.",
    reason: "신축은 주변 영향과 사선 제한 검토가 인허가와 민원에 모두 영향을 줄 수 있습니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "일조사선 적용 대상인지 확인합니다.",
      "인접 대지와 건축물에 대한 영향 가능성을 검토합니다.",
    ],
    searchKeywords: ["건축법 일조권", "일조사선 제한"],
    conditions: { constructionActions: ["신축"] },
  }),
  card({
    id: "existing-building-legality",
    title: "기존 건축물 적법성",
    category: "필수 검토",
    description: "증축 전에 기존 건축물의 적법 상태와 대장 일치 여부를 확인합니다.",
    reason: "기존 건축물이 적법하지 않으면 증축 검토 자체가 제한될 수 있습니다.",
    relatedLaws: ["건축법", "건축물대장 관련 기준"],
    checkPoints: [
      "건축물대장과 현황의 일치 여부를 확인합니다.",
      "위반건축물 여부와 기존 허가 범위를 검토합니다.",
    ],
    searchKeywords: ["기존 건축물 적법성 검토", "위반건축물 증축"],
    conditions: { constructionActions: ["증축"] },
  }),
  card({
    id: "expansion-area",
    title: "증축 가능 면적",
    category: "필수 검토",
    description: "기존 연면적과 남은 용적률·건폐율 여유를 기준으로 증축 가능 범위를 봅니다.",
    reason: "증축은 남아 있는 법정 여유 범위 안에서만 가능 여부를 판단할 수 있습니다.",
    relatedLaws: ["건축법", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "기존 연면적과 계획 면적을 합산해 허용 범위를 확인합니다.",
      "주차와 피난 등 부대 기준도 함께 늘어나는지 검토합니다.",
    ],
    searchKeywords: ["증축 가능 면적", "기존 건폐율 용적률 증축"],
    conditions: { constructionActions: ["증축"] },
  }),
  card({
    id: "structural-impact-expansion",
    title: "구조 안전 영향",
    category: "필수 검토",
    description: "증축으로 인해 기존 구조체가 받는 추가 하중과 보강 필요성을 검토합니다.",
    reason: "증축은 기존 구조체의 수용 가능 여부를 먼저 확인해야 안전하게 진행할 수 있습니다.",
    relatedLaws: ["건축법", "건축구조기준"],
    checkPoints: [
      "기존 구조 형식과 증축 부위의 하중 영향을 확인합니다.",
      "필요 시 구조보강 또는 정밀 검토 필요성을 검토합니다.",
    ],
    searchKeywords: ["증축 구조안전", "건축구조기준 증축"],
    conditions: { constructionActions: ["증축"] },
  }),
  card({
    id: "existing-egress-impact",
    title: "기존 피난계획 영향",
    category: "놓치기 쉬운 항목",
    description: "증축 후 전체 건축물 기준으로 피난과 방화 계획이 바뀌는지 확인합니다.",
    reason: "증축은 기존 출구 수, 피난거리, 방화구획 체계에 영향을 줄 수 있습니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "증축 후 전체 건축물 기준으로 피난거리와 출구 기준을 다시 봅니다.",
      "기존 소방설비 증설 또는 변경 필요성을 검토합니다.",
    ],
    searchKeywords: ["증축 피난거리", "증축 방화구획"],
    conditions: { constructionActions: ["증축"] },
  }),
  card({
    id: "change-of-use-eligibility",
    title: "용도변경 가능 여부",
    category: "필수 검토",
    description: "변경 전후 용도군과 용도지역 기준에 따라 용도변경 허용 여부를 확인합니다.",
    reason: "용도변경은 허용되는 용도 범위 안에서만 진행할 수 있습니다.",
    relatedLaws: ["건축법", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "변경 전후 용도군을 비교합니다.",
      "용도지역 또는 지구단위계획의 제한 용도인지 확인합니다.",
    ],
    searchKeywords: ["건축법 용도변경", "용도지역 건축물 용도 제한"],
    conditions: { constructionActions: ["용도변경"] },
  }),
  card({
    id: "parking-change",
    title: "주차대수 변화",
    category: "조건부 검토",
    description: "용도변경 후 법정주차대수 산정 방식이 달라지는지 검토합니다.",
    reason: "변경 후 용도 기준으로 추가 주차 확보가 필요해질 수 있습니다.",
    relatedLaws: ["주차장법", "지자체 주차장 조례"],
    checkPoints: [
      "변경 후 용도 기준 법정주차대수를 다시 산정합니다.",
      "기존 주차시설 인정 범위와 완화 가능 여부를 검토합니다.",
    ],
    searchKeywords: ["용도변경 법정주차대수", "주차장 조례 용도변경"],
    conditions: { constructionActions: ["용도변경"] },
  }),
  card({
    id: "egress-fire-change",
    title: "피난·방화 기준 변화",
    category: "필수 검토",
    description: "용도변경 후 적용되는 피난과 방화 기준이 기존과 달라지는지 확인합니다.",
    reason: "용도군이 바뀌면 직통계단, 방화구획, 소방설비 기준도 함께 달라질 수 있습니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "변경 후 용도군 기준으로 피난시설 기준을 다시 적용합니다.",
      "소방설비 추가 설치 필요 여부를 확인합니다.",
    ],
    searchKeywords: ["용도변경 피난기준", "용도변경 소방시설"],
    conditions: { constructionActions: ["용도변경"] },
  }),
  card({
    id: "accessibility-change",
    title: "장애인 편의시설 영향",
    category: "놓치기 쉬운 항목",
    description: "용도변경으로 인해 편의시설 설치 수준이 달라지는지 확인합니다.",
    reason: "이용자 특성이 바뀌면 출입구, 화장실, 동선 기준도 함께 검토해야 합니다.",
    relatedLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
    checkPoints: [
      "변경 후 용도 기준으로 편의시설 추가 필요 여부를 확인합니다.",
      "장애인 화장실, 출입구, 승강기 동선을 검토합니다.",
    ],
    searchKeywords: ["용도변경 장애인 편의시설", "BF 인증 용도변경"],
    conditions: { constructionActions: ["용도변경"] },
  }),
  card({
    id: "major-structure-change",
    title: "주요구조부 변경 여부",
    category: "필수 검토",
    description: "대수선이 주요구조부에 해당하는지 먼저 판단합니다.",
    reason: "주요구조부 해당 여부는 대수선 판단과 허가 범위를 좌우합니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "기둥, 보, 내력벽, 바닥, 지붕틀 등 해당 여부를 확인합니다.",
      "단순 수선과 대수선의 구분 기준을 검토합니다.",
    ],
    searchKeywords: ["건축법 시행령 대수선", "주요구조부 변경 여부"],
    conditions: { constructionActions: ["대수선"] },
  }),
  card({
    id: "major-renovation-permit",
    title: "대수선 허가/신고 대상 여부",
    category: "필수 검토",
    description: "공사 범위에 따라 허가 대상인지 신고 대상인지 구분합니다.",
    reason: "대수선은 범위와 대상 건축물에 따라 절차가 달라질 수 있습니다.",
    relatedLaws: ["건축법"],
    checkPoints: [
      "공사 범위와 규모에 따라 허가인지 신고인지 확인합니다.",
      "부대 협의나 별도 심의가 필요한지 검토합니다.",
    ],
    searchKeywords: ["대수선 허가 신고", "건축법 대수선 허가"],
    conditions: { constructionActions: ["대수선"] },
  }),
  card({
    id: "fire-compartment-impact",
    title: "방화구획 영향",
    category: "놓치기 쉬운 항목",
    description: "내부 철거와 변경으로 인해 방화구획 성능이 약해지는지 확인합니다.",
    reason: "대수선은 방화구획, 방화문, 관통부 처리 이슈를 자주 동반합니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "벽체 철거와 천장 변경이 방화구획 유지에 영향을 주는지 확인합니다.",
      "관통부 처리와 방화문 기준을 검토합니다.",
    ],
    searchKeywords: ["대수선 방화구획", "방화문 설치 기준"],
    conditions: { constructionActions: ["대수선"] },
  }),
  card({
    id: "structural-safety-major-renovation",
    title: "구조 안전 검토",
    category: "조건부 검토",
    description: "구조 부재를 변경하거나 해체하는 경우 구조 안전성을 따로 확인합니다.",
    reason: "대수선은 구조 변경 범위에 따라 구조 검토가 필요할 수 있습니다.",
    relatedLaws: ["건축법", "건축구조기준"],
    checkPoints: [
      "구조 부재 철거, 개구부 신설, 보강 계획을 검토합니다.",
      "필요 시 구조계산 또는 검토서 준비 여부를 확인합니다.",
    ],
    searchKeywords: ["대수선 구조안전", "구조계산 대수선"],
    conditions: { constructionActions: ["대수선"] },
  }),
  card({
    id: "remodeling-scope",
    title: "리모델링 가능 범위",
    category: "필수 검토",
    description: "리모델링 계획이 허용되는 범위인지와 별도 행위 분류가 필요한지 확인합니다.",
    reason: "리모델링은 실제 공사 범위에 따라 증축, 대수선, 개축과 중첩될 수 있습니다.",
    relatedLaws: ["건축법", "주택법"],
    checkPoints: [
      "리모델링의 법적 범위와 적용 대상을 확인합니다.",
      "실제 공사 내용이 다른 건축행위에 해당하는지 검토합니다.",
    ],
    searchKeywords: ["리모델링 가능 범위", "건축법 리모델링"],
    conditions: { constructionActions: ["리모델링"] },
  }),
  card({
    id: "remodeling-structure",
    title: "기존 건축물 구조 안전",
    category: "필수 검토",
    description: "리모델링 전후 구조체 상태와 보강 필요성을 검토합니다.",
    reason: "리모델링은 기존 구조체를 활용하는 만큼 구조 안전 검토가 중요합니다.",
    relatedLaws: ["건축법", "건축구조기준"],
    checkPoints: [
      "기존 구조 형식과 노후 상태를 확인합니다.",
      "증설, 철거, 수직증축 가능성까지 함께 검토합니다.",
    ],
    searchKeywords: ["리모델링 구조안전", "기존 건축물 구조 검토"],
    conditions: { constructionActions: ["리모델링"] },
  }),
  card({
    id: "remodeling-action-classification",
    title: "증축/개축 해당 여부",
    category: "조건부 검토",
    description: "리모델링이라 부르더라도 실제로는 증축이나 개축에 해당하는지 검토합니다.",
    reason: "명칭과 달리 법적 행위 분류가 달라질 수 있어 절차 판단이 필요합니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "면적 증가 여부와 구조 변경 범위를 기준으로 행위 분류를 확인합니다.",
      "허가 또는 신고 절차가 달라지는지 검토합니다.",
    ],
    searchKeywords: ["리모델링 증축 해당 여부", "건축행위 구분 리모델링"],
    conditions: { constructionActions: ["리모델링"] },
  }),
  card({
    id: "remodeling-egress-fire",
    title: "피난·방화 기준 재검토",
    category: "놓치기 쉬운 항목",
    description: "리모델링 후 평면과 동선이 바뀌면 피난·방화 기준을 다시 봐야 합니다.",
    reason: "내부 구성 변경은 피난거리와 방화구획 기준에 직접 영향을 줄 수 있습니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "리모델링 후 피난거리와 출구 체계가 유지되는지 확인합니다.",
      "방화구획, 소방설비 추가 조정이 필요한지 검토합니다.",
    ],
    searchKeywords: ["리모델링 피난기준", "리모델링 방화구획"],
    conditions: { constructionActions: ["리모델링"] },
  }),
  card({
    id: "district-unit-plan-guideline",
    title: "지구단위계획 시행지침 검토",
    category: "조건부 검토",
    description: "지구단위계획구역이면 일반 법령 외에 별도 시행지침을 함께 확인해야 합니다.",
    reason: "허용 용도, 외관, 건축선, 높이, 공개공지 기준이 별도로 정해질 수 있습니다.",
    relatedLaws: ["지구단위계획 시행지침", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "허용 용도, 건축선, 높이, 외관 기준을 확인합니다.",
      "지자체 고시문과 세부 시행지침을 함께 검토합니다.",
    ],
    searchKeywords: ["지구단위계획 시행지침 건축물 용도 제한", "지구단위계획 건축선"],
    conditions: { districtUnitPlan: ["예"] },
  }),
  card({
    id: "public-architecture-review",
    title: "공공건축 심의",
    category: "조건부 검토",
    description: "공공 프로젝트의 경우 공공건축 절차상 심의 대상 여부를 확인합니다.",
    reason: "공공 발주 건축은 별도 심의 절차를 요구하는 경우가 있습니다.",
    relatedLaws: ["건축서비스산업 진흥법"],
    checkPoints: [
      "공공건축 심의 대상인지 확인합니다.",
      "사업 규모와 발주 방식에 따른 행정 절차를 검토합니다.",
    ],
    searchKeywords: ["공공건축 심의", "건축서비스산업 진흥법 공공건축"],
    conditions: { publicPrivate: ["공공"] },
  }),
  card({
    id: "design-competition-review",
    title: "설계공모 관련 검토",
    category: "조건부 검토",
    description: "공공 프로젝트의 설계공모 적용 여부와 예외 조건을 검토합니다.",
    reason: "공공 사업은 발주 방식에 따라 설계공모가 요구될 수 있습니다.",
    relatedLaws: ["공공건축 설계공모 운영지침"],
    checkPoints: [
      "설계공모 대상 여부를 확인합니다.",
      "공모가 아니라면 다른 발주 방식의 근거를 검토합니다.",
    ],
    searchKeywords: ["공공건축 설계공모", "설계공모 운영지침"],
    conditions: { publicPrivate: ["공공"] },
  }),
  card({
    id: "bf-certification",
    title: "BF 인증 검토",
    category: "조건부 검토",
    description: "공공 프로젝트에서 BF 인증 요구 가능성을 미리 확인합니다.",
    reason: "공공건축은 장애물 없는 생활환경 인증 검토가 초기부터 필요한 경우가 많습니다.",
    relatedLaws: ["장애물 없는 생활환경 인증에 관한 규칙"],
    checkPoints: [
      "BF 인증 의무 또는 권장 대상인지 확인합니다.",
      "출입구, 주차, 화장실, 동선 계획이 인증 기준과 맞는지 검토합니다.",
    ],
    searchKeywords: ["BF 인증 공공건축", "장애물 없는 생활환경 인증"],
    conditions: { publicPrivate: ["공공"] },
  }),
  card({
    id: "heritage-review",
    title: "문화재보호 관련 검토",
    category: "조건부 검토",
    description: "문화재 인접 또는 관련 지역 여부에 따라 별도 보호 기준을 검토합니다.",
    reason: "문화재 영향권 내 건축은 높이, 외관, 공사 방식에 추가 제한이 있을 수 있습니다.",
    relatedLaws: ["문화재보호법"],
    checkPoints: [
      "현상변경 허가나 별도 협의 대상인지 확인합니다.",
      "주변 경관과 공사 방법 제한이 있는지 검토합니다.",
    ],
    searchKeywords: ["문화재보호법 현상변경", "문화재 주변 건축 제한"],
    conditions: { heritageRelated: ["예"] },
  }),
  card({
    id: "river-review",
    title: "하천구역 및 하천점용 검토",
    category: "조건부 검토",
    description: "하천구역이나 점용허가 대상 여부를 확인하는 별도 검토입니다.",
    reason: "하천 관련 부지는 일반 건축 기준 외에 점용과 구역 중첩 검토가 필요할 수 있습니다.",
    relatedLaws: ["하천법"],
    checkPoints: [
      "하천구역, 하천예정지, 점용허가 대상 여부를 확인합니다.",
      "배수, 우수 처리, 구조물 계획 제한을 검토합니다.",
    ],
    searchKeywords: ["하천법 하천점용", "하천구역 건축 제한"],
    conditions: { riverRelated: ["예"] },
  }),
  card({
    id: "school-environment-review",
    title: "교육환경보호구역 검토",
    category: "조건부 검토",
    description: "학교 주변 보호구역 여부와 제한 업종 또는 시설 기준을 확인합니다.",
    reason: "학교환경 관련 부지는 별도 보호구역 기준과 협의 절차가 적용될 수 있습니다.",
    relatedLaws: ["교육환경 보호에 관한 법률"],
    checkPoints: [
      "교육환경보호구역 해당 여부를 확인합니다.",
      "용도 제한이나 별도 협의가 필요한지 검토합니다.",
    ],
    searchKeywords: ["교육환경보호구역 건축", "학교환경위생 정화구역"],
    conditions: { schoolEnvironmentRelated: ["예"] },
  }),
  card({
    id: "mountain-review",
    title: "산지관리 및 산지전용 검토",
    category: "조건부 검토",
    description: "산지 관련 부지는 산지전용과 형질변경 여부를 별도로 검토합니다.",
    reason: "산지 부지는 경사도와 산지전용 허가 여부가 건축 가능성에 직접 영향을 줍니다.",
    relatedLaws: ["산지관리법"],
    checkPoints: [
      "산지전용허가 또는 신고 대상인지 확인합니다.",
      "경사도, 재해 위험, 입목 제한을 검토합니다.",
    ],
    searchKeywords: ["산지관리법 산지전용", "산지전용허가 건축"],
    conditions: { mountainRelated: ["예"] },
  }),
  card({
    id: "farmland-review",
    title: "농지전용 검토",
    category: "조건부 검토",
    description: "농지 관련 부지는 농지전용 허가와 부담금 가능성을 확인합니다.",
    reason: "농지는 일반 대지와 달리 전용 허가 여부와 농업진흥지역 중첩 검토가 필요합니다.",
    relatedLaws: ["농지법"],
    checkPoints: [
      "농지전용허가 또는 협의 대상인지 확인합니다.",
      "농업진흥지역 여부와 전용 부담금 가능성을 검토합니다.",
    ],
    searchKeywords: ["농지법 농지전용", "농업진흥지역 건축"],
    conditions: { farmlandRelated: ["예"] },
  }),
];
