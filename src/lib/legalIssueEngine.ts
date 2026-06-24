import {
  defaultCaution,
  type ChecklistIssue,
  type ChecklistPriority,
  type IssueType,
  type PublicPrivate,
  type YesNoUnknown,
} from "./checklistCards";

export type ProjectInfo = {
  projectName: string;
  location: string;
  municipality: string;
  buildingUse: string;
  zoningDistrict: string;
  useDistrict: string;
  useZone: string;
  districtUnitPlan: YesNoUnknown;
  siteArea: string;
  totalFloorArea: string;
  aboveGroundFloors: string;
  basementFloors: string;
  buildingHeight: string;
  publicPrivate: PublicPrivate;
  constructionAction: string;
  heritageRelated: YesNoUnknown;
  riverRelated: YesNoUnknown;
  schoolEnvironmentRelated: YesNoUnknown;
  mountainRelated: YesNoUnknown;
  farmlandRelated: YesNoUnknown;
};

type BuildingUseGroup =
  | "문화/전시/집회 계열"
  | "근린생활시설"
  | "주택"
  | "업무시설"
  | "교육시설"
  | "숙박시설"
  | "기타";

type ConstructionActionKey =
  | "new"
  | "extension"
  | "rebuild"
  | "major-renovation"
  | "change-of-use"
  | "unknown";

type PublicPrivateKey = "public" | "private";

type KeywordTag = "park" | "river" | "school" | "heritage" | "mountain" | "farmland";

type NormalizedProjectInput = {
  raw: ProjectInfo;
  buildingUseGroup: BuildingUseGroup;
  constructionActionKey: ConstructionActionKey;
  publicPrivateKey: PublicPrivateKey;
  districtUnitPlanStatus: YesNoUnknown;
  heritageStatus: YesNoUnknown;
  riverStatus: YesNoUnknown;
  schoolStatus: YesNoUnknown;
  mountainStatus: YesNoUnknown;
  farmlandStatus: YesNoUnknown;
  matchedKeywords: Record<KeywordTag, string[]>;
  zoningKeywords: string[];
  missingInputs: string[];
  normalizedTexts: {
    projectName: string;
    location: string;
    municipality: string;
    buildingUse: string;
    zoningDistrict: string;
    useDistrict: string;
    useZone: string;
  };
};

type IssueDraft = {
  id: string;
  issueType: IssueType;
  title: string;
  description: string;
  triggerReason: string;
  checkPoints: string[];
  candidateLaws: string[];
  searchKeywords: string[];
  requiredInputs: string[];
  priority: ChecklistPriority;
};

export const unknownValue = "확인 필요";

const parkKeywords = ["공원", "역사공원", "도시공원", "문화공원", "기념공원"] as const;
const riverKeywords = ["하천", "천변", "제방"] as const;
const schoolKeywords = ["학교", "초등학교", "중학교", "고등학교", "대학교", "캠퍼스"] as const;
const heritageKeywords = ["문화재", "국가유산", "역사유적", "사적"] as const;
const mountainKeywords = ["산지", "임야", "산림", "구릉지"] as const;
const farmlandKeywords = ["농지", "답", "전", "경작지"] as const;
const greenZoneKeywords = ["녹지", "보존녹지", "자연녹지"] as const;

function normalizeText(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function normalizeChoice(value: string): YesNoUnknown {
  const trimmed = value.trim();

  if (trimmed === "예") {
    return "예";
  }

  if (trimmed === "아니오") {
    return "아니오";
  }

  if (trimmed === "모름" || trimmed === "잘모르겠음" || trimmed === "잘 모르겠음") {
    return "잘 모르겠음";
  }

  return "잘 모르겠음";
}

function normalizeProjectName(value: string) {
  return value.trim() || unknownValue;
}

function parseNumber(value: string) {
  if (value === unknownValue) {
    return null;
  }

  const numeric = Number(value.replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function classifyBuildingUse(buildingUse: string): BuildingUseGroup {
  const normalized = normalizeText(buildingUse);

  if (
    [
      "문화및집회시설",
      "전시장",
      "전시관",
      "박물관",
      "미술관",
      "도서관",
      "복합문화센터",
      "문화센터",
      "공연장",
      "집회장",
    ].some((keyword) => normalized.includes(keyword))
  ) {
    return "문화/전시/집회 계열";
  }

  if (
    [
      "근린생활",
      "제1종근린생활시설",
      "제2종근린생활시설",
      "카페",
      "음식점",
      "판매",
      "소매",
      "미용",
      "의원",
    ].some((keyword) => normalized.includes(normalizeText(keyword)))
  ) {
    return "근린생활시설";
  }

  if (["주택", "공동주택", "다가구", "다세대", "아파트", "오피스텔"].some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return "주택";
  }

  if (["업무시설", "업무", "오피스", "사무소"].some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return "업무시설";
  }

  if (["교육시설", "학교", "유치원", "어린이집", "학원"].some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return "교육시설";
  }

  if (["숙박시설", "호텔", "모텔", "생활숙박", "리조트"].some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return "숙박시설";
  }

  return "기타";
}

function classifyConstructionAction(value: string): ConstructionActionKey {
  const normalized = normalizeText(value);

  if (["신축", "새로짓기"].some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return "new";
  }

  if (["증축", "넓히기"].some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return "extension";
  }

  if (["개축", "다시짓기"].some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return "rebuild";
  }

  if (["대수선", "리모델링", "크게고치기"].some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return "major-renovation";
  }

  if (["용도변경", "쓰임바꾸기"].some((keyword) => normalized.includes(normalizeText(keyword)))) {
    return "change-of-use";
  }

  return "unknown";
}

function detectMatchedKeywords(texts: string[], keywords: readonly string[]) {
  return keywords.filter((keyword) => texts.some((text) => text.includes(normalizeText(keyword))));
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function buildIssue(draft: IssueDraft): ChecklistIssue {
  return {
    ...draft,
    category: getCategoryFromIssueType(draft.issueType),
    description: draft.description,
    plainDescription: draft.description,
    checkPoints: unique(draft.checkPoints),
    candidateLaws: unique(draft.candidateLaws),
    searchKeywords: unique(draft.searchKeywords),
    requiredInputs: unique(draft.requiredInputs),
    caution: defaultCaution,
  };
}

function getCategoryFromIssueType(issueType: IssueType): ChecklistIssue["category"] {
  switch (issueType) {
    case "입지 가능성 검토":
    case "대지와 도로 관계 검토":
      return "입지";
    case "용도 허용 여부 검토":
    case "용도지역 / 지구 / 구역 검토":
    case "지구단위계획 검토":
    case "법규 충돌 또는 별도 법령 확인 필요":
      return "용도";
    case "건폐율 / 용적률 / 높이 검토":
      return "면적";
    case "피난·방화 기준 검토":
    case "소방시설 검토":
    case "에너지 / 친환경 관련 검토":
      return "피난·방화";
    case "주차 기준 검토":
      return "주차";
    case "장애인·노인·임산부 편의시설 검토":
      return "편의시설";
    case "공공건축 관련 검토":
      return "공공건축";
    case "지자체 조례 확인 필요":
      return "조례";
    default:
      return "특수조건";
  }
}

function addIssue(target: Map<string, ChecklistIssue>, draft: IssueDraft) {
  target.set(draft.id, buildIssue(draft));
}

function buildKeywordReason(source: string, keywords: string[]) {
  return `${source}에 “${keywords.join("”, “")}” 관련 표현이 포함되어 표시되었습니다.`;
}

function createBaseIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw } = normalized;

  addIssue(target, {
    id: "use-classification",
    issueType: "용도 허용 여부 검토",
    title: "건축물 용도분류 확인",
    description: "입력한 건축물 용도가 건축법상 어떤 분류에 해당하는지 먼저 맞춰 두는 것이 좋습니다.",
    triggerReason: `건축물 용도에 “${raw.buildingUse}”이 입력되어 표시되었습니다.`,
    checkPoints: [
      "입력한 용도가 건축법상 분류와 일치하는지 확인합니다.",
      "유사 용도와 혼동될 수 있는 표현이 있는지 확인합니다.",
    ],
    candidateLaws: ["건축법 시행령", "국토의 계획 및 이용에 관한 법률"],
    searchKeywords: ["건축물 용도분류", `${raw.buildingUse} 건축법 용도분류`],
    requiredInputs: ["건축물 용도", "주요 이용 방식", "운영 형태"],
    priority: "필수 검토",
  });

  addIssue(target, {
    id: "site-road",
    issueType: "대지와 도로 관계 검토",
    title: "대지와 도로 관계 확인",
    description: "대지가 어떤 도로와 접하는지에 따라 건축 가능성과 배치 계획이 크게 달라질 수 있습니다.",
    triggerReason: `대지 위치가 “${raw.location}”으로 입력되어 표시되었습니다.`,
    checkPoints: [
      "접도 요건을 충족하는지 확인합니다.",
      "진입 동선과 소방차 진입 가능 여부를 함께 확인합니다.",
    ],
    candidateLaws: ["건축법", "건축법 시행령"],
    searchKeywords: ["대지와 도로 관계 확인", "건축법 접도요건"],
    requiredInputs: ["대지 위치", "현황도로 정보", "지적도 또는 현황도"],
    priority: "필수 검토",
  });

  addIssue(target, {
    id: "scale-review",
    issueType: "건폐율 / 용적률 / 높이 검토",
    title: "건폐율·용적률·높이 검토",
    description: "대지면적과 연면적, 층수, 높이를 기준으로 허용 가능한 규모 범위를 먼저 검토해야 합니다.",
    triggerReason: `대지면적 ${raw.siteArea}, 연면적 ${raw.totalFloorArea}, 층수 ${raw.aboveGroundFloors}층 조건으로 표시되었습니다.`,
    checkPoints: [
      "건폐율과 용적률 상한을 확인합니다.",
      "높이 제한, 사선 제한, 일조 관련 제한 가능성을 함께 검토합니다.",
    ],
    candidateLaws: ["국토의 계획 및 이용에 관한 법률", "건축법", "지자체 건축조례"],
    searchKeywords: ["건폐율 검토", "용적률 검토", "건축물 높이 제한"],
    requiredInputs: ["대지면적", "연면적", "층수", "건축물 높이", "용도지역"],
    priority: "필수 검토",
  });

  addIssue(target, {
    id: "parking-review",
    issueType: "주차 기준 검토",
    title: "주차 설치기준 검토",
    description: "건축물 용도와 규모에 따라 법정 주차대수와 지자체 조례 기준이 달라질 수 있습니다.",
    triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
    checkPoints: [
      "용도별 법정 주차대수를 확인합니다.",
      "지자체 조례에 따른 강화 기준 여부를 확인합니다.",
    ],
    candidateLaws: ["주차장법", "지자체 주차장 조례"],
    searchKeywords: [`${raw.buildingUse} 주차 설치기준`, "법정주차대수", `${raw.municipality} 주차장 조례`],
    requiredInputs: ["건축물 용도", "연면적", "세대수 또는 이용 인원"],
    priority: "필수 검토",
  });

  addIssue(target, {
    id: "egress-fire-basic",
    issueType: "피난·방화 기준 검토",
    title: "피난·방화 기본 검토",
    description: "출구, 계단, 방화구획처럼 평면 계획에 직접 연결되는 기본 기준을 먼저 확인해야 합니다.",
    triggerReason: `건축물 용도와 층수 조건이 함께 입력되어 표시되었습니다.`,
    checkPoints: [
      "직통계단과 피난층 계획을 확인합니다.",
      "방화구획과 주요 출구 구성 가능성을 검토합니다.",
    ],
    candidateLaws: ["건축법", "건축법 시행령", "화재의 예방 및 안전관리에 관한 법률"],
    searchKeywords: [`${raw.buildingUse} 피난 기준`, "방화구획 기준", "직통계단 기준"],
    requiredInputs: ["건축물 용도", "층수", "지하층 여부", "예상 이용 인원"],
    priority: "필수 검토",
  });
}

function createActionIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw } = normalized;

  switch (normalized.constructionActionKey) {
    case "new":
      addIssue(target, {
        id: "new-construction-review",
        issueType: "입지 가능성 검토",
        title: "신축 기본 검토",
        description: "신축 프로젝트는 건축허가 기본 검토와 함께 대지 안의 공지, 높이, 일조 관련 기준을 함께 살펴보는 것이 좋습니다.",
        triggerReason: `건축 행위가 “${raw.constructionAction}”으로 선택되어 표시되었습니다.`,
        checkPoints: [
          "건축허가 기본 대상 여부를 확인합니다.",
          "대지 안의 공지, 높이 제한, 일조 관련 기준을 검토합니다.",
        ],
        candidateLaws: ["건축법", "건축법 시행령", "지자체 건축조례"],
        searchKeywords: ["신축 건축허가 검토", "대지 안의 공지", "일조권 검토"],
        requiredInputs: ["건축 행위", "배치 계획", "건축물 높이", "인접 대지 현황"],
        priority: "필수 검토",
      });
      break;
    case "extension":
      addIssue(target, {
        id: "extension-review",
        issueType: "입지 가능성 검토",
        title: "증축 가능 범위 검토",
        description: "증축은 기존 건축물 적법성과 추가 가능한 면적, 기존 피난계획 영향까지 함께 확인해야 합니다.",
        triggerReason: `건축 행위가 “${raw.constructionAction}”으로 선택되어 표시되었습니다.`,
        checkPoints: [
          "기존 건축물 적법성을 확인합니다.",
          "증축 가능한 면적과 범위를 검토합니다.",
          "기존 피난·소방 계획에 영향이 있는지 확인합니다.",
        ],
        candidateLaws: ["건축법", "건축법 시행령", "건축구조기준"],
        searchKeywords: ["증축 가능 면적", "기존 건축물 적법성", "증축 피난계획"],
        requiredInputs: ["기존 건축물 대장", "현황 연면적", "증축 계획 면적", "기존 피난계획"],
        priority: "필수 검토",
      });
      break;
    case "change-of-use":
      addIssue(target, {
        id: "change-of-use-review",
        issueType: "용도 허용 여부 검토",
        title: "용도변경 가능 여부 검토",
        description: "용도변경은 변경 가능 여부뿐 아니라 주차, 피난·방화, 편의시설 기준 변화까지 같이 확인해야 합니다.",
        triggerReason: `건축 행위가 “${raw.constructionAction}”으로 선택되어 표시되었습니다.`,
        checkPoints: [
          "변경 전후 용도 간 허용 가능 여부를 확인합니다.",
          "주차대수와 피난·방화 기준이 어떻게 달라지는지 검토합니다.",
        ],
        candidateLaws: ["건축법", "주차장법", "장애인등편의법"],
        searchKeywords: ["용도변경 가능 여부", "용도변경 주차대수", "용도변경 피난 기준"],
        requiredInputs: ["변경 전 용도", "변경 후 용도", "연면적", "주차 현황"],
        priority: "필수 검토",
      });

      addIssue(target, {
        id: "change-of-use-accessibility",
        issueType: "장애인·노인·임산부 편의시설 검토",
        title: "용도변경에 따른 편의시설 영향 검토",
        description: "용도변경 후 다중 이용 성격이 커지면 편의시설 기준이 달라질 수 있습니다.",
        triggerReason: `건축 행위가 “${raw.constructionAction}”으로 선택되어 표시되었습니다.`,
        checkPoints: [
          "변경 후 용도가 편의시설 설치 대상인지 확인합니다.",
          "출입, 승강, 위생시설 기준 변화를 검토합니다.",
        ],
        candidateLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
        searchKeywords: ["용도변경 편의시설 기준", "장애인등편의법 대상시설"],
        requiredInputs: ["변경 후 용도", "출입 동선", "위생시설 계획"],
        priority: "놓치기 쉬운 항목",
      });
      break;
    case "major-renovation":
      addIssue(target, {
        id: "major-renovation-review",
        issueType: "법규 충돌 또는 별도 법령 확인 필요",
        title: "대수선·리모델링 범위 검토",
        description: "주요구조부 변경 여부와 허가·신고 대상 여부, 방화구획 및 구조 안전 영향까지 함께 확인해야 합니다.",
        triggerReason: `건축 행위가 “${raw.constructionAction}”으로 선택되어 표시되었습니다.`,
        checkPoints: [
          "주요구조부 변경 여부를 확인합니다.",
          "허가 또는 신고 대상인지 검토합니다.",
          "방화구획과 구조 안전 영향 여부를 점검합니다.",
        ],
        candidateLaws: ["건축법", "건축법 시행령", "건축구조기준"],
        searchKeywords: ["대수선 허가 대상", "리모델링 구조 안전", "방화구획 영향 검토"],
        requiredInputs: ["공사 범위", "철거 범위", "구조 변경 여부", "방화구획 계획"],
        priority: "필수 검토",
      });
      break;
    case "rebuild":
      addIssue(target, {
        id: "rebuild-review",
        issueType: "입지 가능성 검토",
        title: "개축 기본 검토",
        description: "개축은 기존 건축물 현황과 재건축 범위, 허가 기준을 함께 정리해 두는 것이 좋습니다.",
        triggerReason: `건축 행위가 “${raw.constructionAction}”으로 선택되어 표시되었습니다.`,
        checkPoints: [
          "기존 건축물 현황과 멸실 범위를 확인합니다.",
          "개축으로 볼 수 있는 범위와 허가 기준을 검토합니다.",
        ],
        candidateLaws: ["건축법", "건축법 시행령"],
        searchKeywords: ["개축 허가 기준", "기존 건축물 멸실 범위", "개축 검토"],
        requiredInputs: ["기존 건축물 현황", "철거 범위", "재시공 범위"],
        priority: "필수 검토",
      });
      break;
    default:
      addIssue(target, {
        id: "unknown-action-review",
        issueType: "법규 충돌 또는 별도 법령 확인 필요",
        title: "건축 행위 구분 확인 필요",
        description: "신축, 증축, 용도변경, 대수선 중 어떤 성격인지 먼저 정리해야 검토 범위를 정확히 잡을 수 있습니다.",
        triggerReason: `건축 행위가 “${raw.constructionAction}”으로 입력되어 확인 필요 항목으로 표시되었습니다.`,
        checkPoints: [
          "공사 범위가 면적 증가인지, 용도 변경인지, 구조 변경인지 구분합니다.",
          "허가 또는 신고 대상 분류를 먼저 확인합니다.",
        ],
        candidateLaws: ["건축법", "건축법 시행령"],
        searchKeywords: ["건축 행위 구분", "신축 증축 대수선 용도변경 차이"],
        requiredInputs: ["공사 범위", "면적 증가 여부", "용도 변경 여부", "구조 변경 여부"],
        priority: "추가 확인 필요",
      });
  }
}

function createBuildingUseIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw, buildingUseGroup } = normalized;

  if (buildingUseGroup === "문화/전시/집회 계열") {
    addIssue(target, {
      id: "cultural-accessibility",
      issueType: "장애인·노인·임산부 편의시설 검토",
      title: "장애인·노인·임산부 편의시설 대상 여부 검토",
      description: "문화·전시·집회 계열 시설은 다수가 이용하는 경우가 많아 편의시설 설치 대상 여부를 먼저 확인하는 것이 좋습니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "편의시설 설치 대상 시설인지 확인합니다.",
        "출입구, 이동 동선, 위생시설 계획 기준을 검토합니다.",
      ],
      candidateLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
      searchKeywords: ["문화 및 집회시설 편의시설 설치기준", "장애인등편의법 대상시설", "임산부 등을 위한 휴게시설"],
      requiredInputs: ["건축물 용도", "주요 이용 인원", "출입 동선 계획"],
      priority: "놓치기 쉬운 항목",
    });

    addIssue(target, {
      id: "cultural-fire-facilities",
      issueType: "소방시설 검토",
      title: "소방시설 검토",
      description: "문화·집회 성격의 시설은 용도와 이용 인원에 따라 필요한 소방설비 기준이 달라질 수 있습니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "자동화재탐지설비 등 필요한 소방설비 종류를 확인합니다.",
        "예상 이용 인원과 층수에 따른 강화 기준 여부를 검토합니다.",
      ],
      candidateLaws: ["화재의 예방 및 안전관리에 관한 법률"],
      searchKeywords: ["문화 및 집회시설 소방시설", "전시장 소방설비 기준"],
      requiredInputs: ["건축물 용도", "층수", "예상 이용 인원"],
      priority: "놓치기 쉬운 항목",
    });
  }

  if (buildingUseGroup === "근린생활시설") {
    addIssue(target, {
      id: "neighborhood-use-review",
      issueType: "용도 허용 여부 검토",
      title: "용도지역 내 허용용도 검토",
      description: "근린생활시설은 세부 업종에 따라 용도지역 내 허용 여부가 달라질 수 있습니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "세부 업종이 해당 용도지역에서 허용되는지 확인합니다.",
        "인접 용도와의 충돌 가능성을 검토합니다.",
      ],
      candidateLaws: ["국토의 계획 및 이용에 관한 법률", "건축법 시행령"],
      searchKeywords: ["근린생활시설 허용용도", `${raw.zoningDistrict} 근린생활시설 허용 여부`],
      requiredInputs: ["세부 업종", "용도지역", "인접 대지 현황"],
      priority: "필수 검토",
    });
  }

  if (buildingUseGroup === "주택") {
    addIssue(target, {
      id: "housing-review",
      issueType: "건폐율 / 용적률 / 높이 검토",
      title: "주택 세대수·일조·주차 검토",
      description: "주택은 세대수와 주차, 일조, 피난계획을 함께 맞춰야 초기 계획이 안정적으로 잡힙니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "세대수 산정과 주차대수를 함께 확인합니다.",
        "일조 및 사생활 침해 관련 제한 가능성을 검토합니다.",
      ],
      candidateLaws: ["건축법", "주차장법", "지자체 건축조례"],
      searchKeywords: ["주택 일조권 검토", "공동주택 주차대수", "주택 세대수 산정"],
      requiredInputs: ["세대수", "연면적", "주차 계획", "인접 건축물 현황"],
      priority: "놓치기 쉬운 항목",
    });
  }

  if (buildingUseGroup === "업무시설") {
    addIssue(target, {
      id: "office-energy-review",
      issueType: "에너지 / 친환경 관련 검토",
      title: "업무시설 에너지 기준 검토",
      description: "업무시설은 에너지 절약 설계와 친환경 관련 검토가 함께 필요한 경우가 많습니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "에너지 절약 설계 기준 적용 여부를 확인합니다.",
        "친환경 관련 추가 검토 대상인지 확인합니다.",
      ],
      candidateLaws: ["건축물의 에너지절약설계기준", "녹색건축물 조성 지원법"],
      searchKeywords: ["업무시설 에너지절약설계기준", "업무시설 친환경 검토"],
      requiredInputs: ["건축물 용도", "연면적", "기계·전기 계획 개요"],
      priority: "추가 확인 필요",
    });
  }

  if (buildingUseGroup === "교육시설") {
    addIssue(target, {
      id: "education-review",
      issueType: "학교환경 관련 검토",
      title: "교육시설 관련 기준 검토",
      description: "교육시설은 교육환경, 피난, 편의시설 기준을 함께 보는 편이 안전합니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "교육환경 관련 별도 기준이 있는지 확인합니다.",
        "피난 및 편의시설 계획을 함께 검토합니다.",
      ],
      candidateLaws: ["교육환경 보호에 관한 법률", "건축법", "장애인등편의법"],
      searchKeywords: ["교육시설 피난 기준", "교육시설 편의시설 기준", "교육환경 검토"],
      requiredInputs: ["건축물 용도", "주요 이용 대상", "출입 동선"],
      priority: "놓치기 쉬운 항목",
    });
  }

  if (buildingUseGroup === "숙박시설") {
    addIssue(target, {
      id: "lodging-fire-review",
      issueType: "피난·방화 기준 검토",
      title: "숙박시설 피난·방화 검토",
      description: "숙박시설은 피난, 방화, 소방, 주차 기준을 더 꼼꼼하게 살펴보는 편이 좋습니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "객실 배치와 피난 동선을 함께 확인합니다.",
        "방화구획과 소방설비 기준을 검토합니다.",
      ],
      candidateLaws: ["건축법", "화재의 예방 및 안전관리에 관한 법률", "주차장법"],
      searchKeywords: ["숙박시설 피난 기준", "숙박시설 방화구획", "숙박시설 주차 기준"],
      requiredInputs: ["객실 수", "층수", "예상 이용 인원"],
      priority: "필수 검토",
    });
  }
}

function createPublicIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw } = normalized;

  if (normalized.publicPrivateKey !== "public") {
    return;
  }

  addIssue(target, {
    id: "public-architecture-review",
    issueType: "공공건축 관련 검토",
    title: "공공건축 심의·설계공모 검토",
    description: "공공 프로젝트라면 공공건축 심의, 설계공모, 발주 방식 관련 절차를 함께 점검하는 것이 좋습니다.",
    triggerReason: "공공 프로젝트로 입력되어 표시되었습니다.",
    checkPoints: [
      "공공건축 심의 대상인지 확인합니다.",
      "설계공모 또는 별도 발주 절차가 필요한지 검토합니다.",
    ],
    candidateLaws: ["건축서비스산업 진흥법", "공공건축 설계공모 운영지침"],
    searchKeywords: ["공공건축 심의", "설계공모 대상", "공공건축 발주 절차"],
    requiredInputs: ["공공/민간 구분", "발주기관", "사업 규모"],
    priority: "놓치기 쉬운 항목",
  });

  addIssue(target, {
    id: "public-bf-review",
    issueType: "장애인·노인·임산부 편의시설 검토",
    title: "BF 인증 또는 장애물 없는 생활환경 검토",
    description: "공공 프로젝트는 BF 인증이나 유사한 접근성 기준 검토가 함께 필요한 경우가 많습니다.",
    triggerReason: "공공 프로젝트로 입력되어 표시되었습니다.",
    checkPoints: [
      "BF 인증 검토 대상인지 확인합니다.",
      "접근성 계획을 초기 단계에서 반영할 수 있는지 검토합니다.",
    ],
    candidateLaws: ["장애물 없는 생활환경 인증에 관한 규칙", "장애인등편의법"],
    searchKeywords: ["BF 인증 공공건축", "장애물 없는 생활환경 검토"],
    requiredInputs: ["공공/민간 구분", "출입 동선", "이동약자 편의 계획"],
    priority: "놓치기 쉬운 항목",
  });
}

function createDistrictIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw } = normalized;

  if (normalized.districtUnitPlanStatus === "아니오") {
    return;
  }

  addIssue(target, {
    id: "district-unit-plan-review",
    issueType: "지구단위계획 검토",
    title: "지구단위계획 시행지침 확인",
    description: "지구단위계획구역은 일반 법규 외에 별도 시행지침과 배치 기준을 함께 확인하는 편이 좋습니다.",
    triggerReason:
      normalized.districtUnitPlanStatus === "예"
        ? "지구단위계획구역 여부가 “예”로 선택되어 표시되었습니다."
        : "지구단위계획구역 여부가 확인 필요로 입력되어 표시되었습니다.",
    checkPoints: [
      "시행지침에 건축물 용도와 배치 관련 별도 기준이 있는지 확인합니다.",
      "공개공지, 외부공간, 높이 기준 강화 여부를 검토합니다.",
    ],
    candidateLaws: ["국토의 계획 및 이용에 관한 법률", "지구단위계획 시행지침"],
    searchKeywords: ["지구단위계획 시행지침", "지구단위계획 건축물 용도"],
    requiredInputs: ["지구단위계획구역 여부", "대지 위치", "용도지역"],
    priority:
      normalized.districtUnitPlanStatus === "예" ? "놓치기 쉬운 항목" : "추가 확인 필요",
  });
}

function createSpecialConditionIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw, matchedKeywords } = normalized;

  if (matchedKeywords.park.length > 0) {
    addIssue(target, {
      id: "park-facility-review",
      issueType: "법규 충돌 또는 별도 법령 확인 필요",
      title: "도시공원 내 공원시설 해당 여부 검토",
      description: "공원 관련 표현이 포함된 대지는 도시공원법상 공원시설 해당 여부와 별도 계획 기준을 함께 확인하는 편이 좋습니다.",
      triggerReason: buildKeywordReason("대지 위치 또는 사업명", matchedKeywords.park),
      checkPoints: [
        "계획 중인 시설이 공원시설로 볼 수 있는지 확인합니다.",
        "공원조성계획이나 공원 관련 조례 기준을 검토합니다.",
      ],
      candidateLaws: ["도시공원 및 녹지 등에 관한 법률", "지자체 공원조례"],
      searchKeywords: ["도시공원 공원시설 전시장", "공원조성계획 확인", "지자체 공원조례"],
      requiredInputs: ["사업명", "대지 위치", "시설 용도", "공원조성계획 여부"],
      priority: "놓치기 쉬운 항목",
    });
  }

  if (
    normalized.zoningKeywords.length > 0 &&
    normalized.buildingUseGroup === "문화/전시/집회 계열"
  ) {
    addIssue(target, {
      id: "green-zone-culture-review",
      issueType: "법규 충돌 또는 별도 법령 확인 필요",
      title: "용도지역 제한과 별도 법령 관계 검토",
      description: "녹지 계열 용도지역에서 문화·전시 계열 시설을 계획하면 허용용도와 별도 법령 적용 가능성을 함께 확인하는 편이 좋습니다.",
      triggerReason: `용도지역에 “${normalized.zoningKeywords.join("”, “")}”이 포함되고 건축물 용도가 “${raw.buildingUse}”으로 입력되어 표시되었습니다.`,
      checkPoints: [
        "해당 용도지역에서 계획 용도가 허용되는지 확인합니다.",
        "별도 공원·보전 관련 법령 적용 가능성을 검토합니다.",
      ],
      candidateLaws: ["국토의 계획 및 이용에 관한 법률", "도시공원 및 녹지 등에 관한 법률"],
      searchKeywords: ["보존녹지지역 문화 및 집회시설", "자연녹지지역 전시장 허용 여부"],
      requiredInputs: ["용도지역", "건축물 용도", "대지 위치"],
      priority: "놓치기 쉬운 항목",
    });
  }

  const relationConfigs = [
    {
      id: "heritage-review",
      unknownId: "heritage-confirmation",
      status: normalized.heritageStatus,
      keywordMatches: matchedKeywords.heritage,
      issueType: "문화재 관련 검토" as const,
      title: "문화재보호 관련 검토",
      unknownTitle: "문화재 관련 여부 확인 필요",
      description: "문화재 영향 범위에 해당하면 높이, 규모, 공사 방식 등에 추가 검토가 필요할 수 있습니다.",
      unknownDescription: "문화재 관련 여부가 불명확하면 영향 범위 해당 여부부터 먼저 확인하는 편이 좋습니다.",
      yesReason: "문화재 관련 여부가 “예”로 선택되어 표시되었습니다.",
      unknownReason: "문화재 관련 여부가 확인 필요로 입력되어 표시되었습니다.",
      keywordReasonSource: "대지 위치 또는 사업명",
      checkPoints: ["문화재 영향 범위 여부를 확인합니다.", "별도 협의 또는 제한 가능성을 검토합니다."],
      laws: ["문화유산의 보존 및 활용에 관한 법률"],
      keywords: ["문화재보호 관련 검토", "문화재 영향 범위 확인"],
      requiredInputs: ["대지 위치", "문화재 관련 여부", "건축물 높이"],
    },
    {
      id: "river-review",
      unknownId: "river-confirmation",
      status: normalized.riverStatus,
      keywordMatches: matchedKeywords.river,
      issueType: "하천 관련 검토" as const,
      title: "하천구역 및 하천점용 검토",
      unknownTitle: "하천 관련 여부 확인 필요",
      description: "하천 인접 여부가 있으면 하천구역, 점용 허가, 배수 계획을 함께 검토하는 편이 좋습니다.",
      unknownDescription: "하천 관련 여부가 불명확하면 인접 여부부터 확인해 두는 것이 좋습니다.",
      yesReason: "하천 관련 여부가 “예”로 선택되어 표시되었습니다.",
      unknownReason: "하천 관련 여부가 확인 필요로 입력되어 표시되었습니다.",
      keywordReasonSource: "대지 위치 또는 사업명",
      checkPoints: ["하천구역 또는 점용 허가 대상 여부를 확인합니다.", "배수 및 우수 처리 계획을 검토합니다."],
      laws: ["하천법"],
      keywords: ["하천구역 건축 제한", "하천점용 검토"],
      requiredInputs: ["대지 위치", "하천 관련 여부", "배수 계획"],
    },
    {
      id: "school-review",
      unknownId: "school-confirmation",
      status: normalized.schoolStatus,
      keywordMatches: matchedKeywords.school,
      issueType: "학교환경 관련 검토" as const,
      title: "교육환경보호구역 검토",
      unknownTitle: "학교환경 관련 여부 확인 필요",
      description: "학교 주변 대지는 교육환경보호구역 해당 여부에 따라 별도 제한이 있을 수 있습니다.",
      unknownDescription: "학교환경 관련 여부가 불명확하면 보호구역 해당 여부부터 확인하는 편이 좋습니다.",
      yesReason: "학교환경 관련 여부가 “예”로 선택되어 표시되었습니다.",
      unknownReason: "학교환경 관련 여부가 확인 필요로 입력되어 표시되었습니다.",
      keywordReasonSource: "대지 위치 또는 사업명",
      checkPoints: ["교육환경보호구역 해당 여부를 확인합니다.", "용도 제한과 협의 필요 여부를 검토합니다."],
      laws: ["교육환경 보호에 관한 법률"],
      keywords: ["교육환경보호구역 검토", "학교 주변 건축 제한"],
      requiredInputs: ["대지 위치", "학교환경 관련 여부", "건축물 용도"],
    },
    {
      id: "mountain-review",
      unknownId: "mountain-confirmation",
      status: normalized.mountainStatus,
      keywordMatches: matchedKeywords.mountain,
      issueType: "산지 / 농지 관련 검토" as const,
      title: "산지관리 및 산지전용 검토",
      unknownTitle: "산지 관련 여부 확인 필요",
      description: "산지 관련 대지는 산지전용, 경사도, 재해 영향까지 함께 검토하는 편이 좋습니다.",
      unknownDescription: "산지 관련 여부가 불명확하면 산지전용 대상 여부부터 확인하는 것이 좋습니다.",
      yesReason: "산지 관련 여부가 “예”로 선택되어 표시되었습니다.",
      unknownReason: "산지 관련 여부가 확인 필요로 입력되어 표시되었습니다.",
      keywordReasonSource: "대지 위치 또는 사업명",
      checkPoints: ["산지전용 대상 여부를 확인합니다.", "경사도와 재해 영향 가능성을 검토합니다."],
      laws: ["산지관리법"],
      keywords: ["산지전용 검토", "산지관리법 건축"],
      requiredInputs: ["대지 위치", "산지 관련 여부", "경사도 정보"],
    },
    {
      id: "farmland-review",
      unknownId: "farmland-confirmation",
      status: normalized.farmlandStatus,
      keywordMatches: matchedKeywords.farmland,
      issueType: "산지 / 농지 관련 검토" as const,
      title: "농지전용 검토",
      unknownTitle: "농지 관련 여부 확인 필요",
      description: "농지 관련 대지는 농지전용 허가나 협의 절차를 먼저 확인하는 편이 좋습니다.",
      unknownDescription: "농지 관련 여부가 불명확하면 농지 해당 여부부터 먼저 확인하는 것이 좋습니다.",
      yesReason: "농지 관련 여부가 “예”로 선택되어 표시되었습니다.",
      unknownReason: "농지 관련 여부가 확인 필요로 입력되어 표시되었습니다.",
      keywordReasonSource: "대지 위치 또는 사업명",
      checkPoints: ["농지전용 대상 여부를 확인합니다.", "전용 절차와 협의 필요 여부를 검토합니다."],
      laws: ["농지법"],
      keywords: ["농지전용 검토", "농지법 건축"],
      requiredInputs: ["대지 위치", "농지 관련 여부"],
    },
  ] as const;

  relationConfigs.forEach((config) => {
    const hasKeyword = config.keywordMatches.length > 0;
    const positive = config.status === "예" || hasKeyword;
    const unknown = config.status === "잘 모르겠음" && !hasKeyword;

    if (positive) {
      addIssue(target, {
        id: config.id,
        issueType: config.issueType,
        title: config.title,
        description: config.description,
        triggerReason: hasKeyword
          ? buildKeywordReason(config.keywordReasonSource, config.keywordMatches)
          : config.yesReason,
        checkPoints: [...config.checkPoints],
        candidateLaws: [...config.laws],
        searchKeywords: [...config.keywords],
        requiredInputs: [...config.requiredInputs],
        priority: "놓치기 쉬운 항목",
      });
    } else if (unknown) {
      addIssue(target, {
        id: config.unknownId,
        issueType: config.issueType,
        title: config.unknownTitle,
        description: config.unknownDescription,
        triggerReason: config.unknownReason,
        checkPoints: [`${config.title} 여부를 먼저 확인합니다.`],
        candidateLaws: [...config.laws],
        searchKeywords: [...config.keywords],
        requiredInputs: [...config.requiredInputs],
        priority: "추가 확인 필요",
      });
    }
  });
}

function createZoningAndOrdinanceIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw, missingInputs } = normalized;

  if (
    raw.zoningDistrict !== unknownValue ||
    raw.useDistrict !== unknownValue ||
    raw.useZone !== unknownValue
  ) {
    addIssue(target, {
      id: "zoning-review",
      issueType: "용도지역 / 지구 / 구역 검토",
      title: "용도지역·지구·구역 검토",
      description: "용도지역과 지구·구역 정보에 따라 허용 용도와 규모 기준이 달라질 수 있습니다.",
      triggerReason: `용도지역 정보가 “${raw.zoningDistrict} / ${raw.useDistrict} / ${raw.useZone}”로 입력되어 표시되었습니다.`,
      checkPoints: [
        "용도지역 내 허용 용도와 규모 기준을 확인합니다.",
        "별도 지구·구역 제한이 있는지 검토합니다.",
      ],
      candidateLaws: ["국토의 계획 및 이용에 관한 법률", "지자체 도시계획조례"],
      searchKeywords: ["용도지역 검토", "지구 구역 확인", `${raw.municipality} 도시계획 조례`],
      requiredInputs: ["용도지역", "용도지구", "용도구역"],
      priority: "필수 검토",
    });
  }

  if (
    missingInputs.includes("용도지역") ||
    missingInputs.includes("용도지구") ||
    missingInputs.includes("용도구역")
  ) {
    addIssue(target, {
      id: "missing-zoning-confirmation",
      issueType: "용도지역 / 지구 / 구역 검토",
      title: "용도지역 정보 확인 필요",
      description: "용도지역·지구·구역 정보가 비어 있으면 허용 용도와 규모 검토가 정확해지기 어렵습니다.",
      triggerReason: "용도지역 정보가 비어 있어 확인 필요 항목으로 표시되었습니다.",
      checkPoints: [
        "토지이음 등에서 용도지역·지구·구역 정보를 먼저 확인합니다.",
        "확인한 정보로 결과를 다시 검토합니다.",
      ],
      candidateLaws: ["국토의 계획 및 이용에 관한 법률"],
      searchKeywords: ["토지이음 용도지역 확인", "용도지구 용도구역 확인"],
      requiredInputs: ["대지 위치", "용도지역", "용도지구", "용도구역"],
      priority: "추가 확인 필요",
    });
  }

  addIssue(target, {
    id: "local-ordinance-review",
    issueType: "지자체 조례 확인 필요",
    title: "지자체 조례 확인 필요",
    description: "같은 법령이라도 지자체 조례에 따라 주차, 높이, 배치 기준이 달라질 수 있습니다.",
    triggerReason: `지역 / 지자체가 “${raw.municipality}”으로 입력되어 표시되었습니다.`,
    checkPoints: [
      "건축조례와 주차장 조례를 함께 확인합니다.",
      "도시계획 조례에 강화 기준이 있는지 검토합니다.",
    ],
    candidateLaws: ["지자체 건축조례", "지자체 주차장 조례", "지자체 도시계획조례"],
    searchKeywords: [`${raw.municipality} 건축조례`, `${raw.municipality} 주차장 조례`],
    requiredInputs: ["지역 / 지자체", "건축물 용도", "연면적"],
    priority: "추가 확인 필요",
  });
}

export function normalizeProjectInput(input: ProjectInfo): NormalizedProjectInput {
  const normalizedTexts = {
    projectName: normalizeText(input.projectName),
    location: normalizeText(input.location),
    municipality: normalizeText(input.municipality),
    buildingUse: normalizeText(input.buildingUse),
    zoningDistrict: normalizeText(input.zoningDistrict),
    useDistrict: normalizeText(input.useDistrict),
    useZone: normalizeText(input.useZone),
  };

  const searchableTexts = [
    normalizedTexts.projectName,
    normalizedTexts.location,
    normalizedTexts.municipality,
  ];

  const missingInputs: string[] = [];

  if (input.zoningDistrict === unknownValue) {
    missingInputs.push("용도지역");
  }

  if (input.useDistrict === unknownValue) {
    missingInputs.push("용도지구");
  }

  if (input.useZone === unknownValue) {
    missingInputs.push("용도구역");
  }

  return {
    raw: input,
    buildingUseGroup: classifyBuildingUse(input.buildingUse),
    constructionActionKey: classifyConstructionAction(input.constructionAction),
    publicPrivateKey: input.publicPrivate === "공공" ? "public" : "private",
    districtUnitPlanStatus: normalizeChoice(input.districtUnitPlan),
    heritageStatus: normalizeChoice(input.heritageRelated),
    riverStatus: normalizeChoice(input.riverRelated),
    schoolStatus: normalizeChoice(input.schoolEnvironmentRelated),
    mountainStatus: normalizeChoice(input.mountainRelated),
    farmlandStatus: normalizeChoice(input.farmlandRelated),
    matchedKeywords: {
      park: detectMatchedKeywords(searchableTexts, parkKeywords),
      river: detectMatchedKeywords(searchableTexts, riverKeywords),
      school: detectMatchedKeywords(searchableTexts, schoolKeywords),
      heritage: detectMatchedKeywords(searchableTexts, heritageKeywords),
      mountain: detectMatchedKeywords(searchableTexts, mountainKeywords),
      farmland: detectMatchedKeywords(searchableTexts, farmlandKeywords),
    },
    zoningKeywords: detectMatchedKeywords(
      [normalizedTexts.zoningDistrict, normalizedTexts.useDistrict, normalizedTexts.useZone],
      greenZoneKeywords,
    ),
    missingInputs,
    normalizedTexts,
  };
}

export function generateLegalIssues(projectInfo: ProjectInfo): ChecklistIssue[] {
  const normalized = normalizeProjectInput(projectInfo);
  const issues = new Map<string, ChecklistIssue>();

  createBaseIssues(issues, normalized);
  createActionIssues(issues, normalized);
  createBuildingUseIssues(issues, normalized);
  createPublicIssues(issues, normalized);
  createDistrictIssues(issues, normalized);
  createSpecialConditionIssues(issues, normalized);
  createZoningAndOrdinanceIssues(issues, normalized);

  const aboveGroundFloors = parseNumber(projectInfo.aboveGroundFloors);
  const totalFloorArea = parseNumber(projectInfo.totalFloorArea);

  if ((aboveGroundFloors !== null && aboveGroundFloors >= 11) || (totalFloorArea !== null && totalFloorArea >= 5000)) {
    addIssue(issues, {
      id: "large-project-fire-review",
      issueType: "소방시설 검토",
      title: "대규모 건축물 소방시설 검토",
      description: "층수나 연면적이 큰 프로젝트는 소방설비와 피난 기준이 더 중요해질 수 있습니다.",
      triggerReason: `층수 또는 연면적이 큰 조건으로 입력되어 표시되었습니다.`,
      checkPoints: [
        "대규모 기준에 따라 추가 소방설비가 필요한지 확인합니다.",
        "피난 계획과 소방활동 공간을 함께 검토합니다.",
      ],
      candidateLaws: ["화재의 예방 및 안전관리에 관한 법률", "건축법 시행령"],
      searchKeywords: ["대규모 건축물 소방시설", "고층 건축물 피난 검토"],
      requiredInputs: ["층수", "연면적", "건축물 높이"],
      priority: "놓치기 쉬운 항목",
    });
  }

  return Array.from(issues.values());
}

export const legalIssueEngineSamples = [
  {
    name: "샘플 A",
    input: {
      projectName: "○○역사공원 복합문화센터",
      location: "○○군 ○○면 ○○리 일원, ○○역사공원",
      municipality: "○○군",
      buildingUse: "문화 및 집회시설",
      zoningDistrict: "보존녹지지역",
      useDistrict: unknownValue,
      useZone: unknownValue,
      districtUnitPlan: "잘 모르겠음" as YesNoUnknown,
      siteArea: unknownValue,
      totalFloorArea: "1405.91",
      aboveGroundFloors: unknownValue,
      basementFloors: unknownValue,
      buildingHeight: unknownValue,
      publicPrivate: "공공" as PublicPrivate,
      constructionAction: "신축",
      heritageRelated: "잘 모르겠음" as YesNoUnknown,
      riverRelated: "잘 모르겠음" as YesNoUnknown,
      schoolEnvironmentRelated: "잘 모르겠음" as YesNoUnknown,
      mountainRelated: "잘 모르겠음" as YesNoUnknown,
      farmlandRelated: "잘 모르겠음" as YesNoUnknown,
    },
    expectedTitles: [
      "도시공원 내 공원시설 해당 여부 검토",
      "용도지역 제한과 별도 법령 관계 검토",
      "장애인·노인·임산부 편의시설 대상 여부 검토",
      "피난·방화 기본 검토",
      "공공건축 심의·설계공모 검토",
    ],
  },
  {
    name: "샘플 B",
    input: {
      projectName: unknownValue,
      location: "확인 필요",
      municipality: "확인 필요",
      buildingUse: "제1종 근린생활시설",
      zoningDistrict: unknownValue,
      useDistrict: unknownValue,
      useZone: unknownValue,
      districtUnitPlan: "잘 모르겠음" as YesNoUnknown,
      siteArea: unknownValue,
      totalFloorArea: unknownValue,
      aboveGroundFloors: unknownValue,
      basementFloors: unknownValue,
      buildingHeight: unknownValue,
      publicPrivate: "민간" as PublicPrivate,
      constructionAction: "신축",
      heritageRelated: "잘 모르겠음" as YesNoUnknown,
      riverRelated: "잘 모르겠음" as YesNoUnknown,
      schoolEnvironmentRelated: "잘 모르겠음" as YesNoUnknown,
      mountainRelated: "잘 모르겠음" as YesNoUnknown,
      farmlandRelated: "잘 모르겠음" as YesNoUnknown,
    },
    expectedTitles: [
      "용도지역 내 허용용도 검토",
      "대지와 도로 관계 확인",
      "주차 설치기준 검토",
      "피난·방화 기본 검토",
    ],
  },
  {
    name: "샘플 C",
    input: {
      projectName: unknownValue,
      location: "확인 필요",
      municipality: "확인 필요",
      buildingUse: "업무시설",
      zoningDistrict: unknownValue,
      useDistrict: unknownValue,
      useZone: unknownValue,
      districtUnitPlan: "잘 모르겠음" as YesNoUnknown,
      siteArea: unknownValue,
      totalFloorArea: unknownValue,
      aboveGroundFloors: unknownValue,
      basementFloors: unknownValue,
      buildingHeight: unknownValue,
      publicPrivate: "민간" as PublicPrivate,
      constructionAction: "용도변경",
      heritageRelated: "잘 모르겠음" as YesNoUnknown,
      riverRelated: "잘 모르겠음" as YesNoUnknown,
      schoolEnvironmentRelated: "잘 모르겠음" as YesNoUnknown,
      mountainRelated: "잘 모르겠음" as YesNoUnknown,
      farmlandRelated: "잘 모르겠음" as YesNoUnknown,
    },
    expectedTitles: [
      "용도변경 가능 여부 검토",
      "주차 설치기준 검토",
      "피난·방화 기본 검토",
      "용도변경에 따른 편의시설 영향 검토",
    ],
  },
] as const;
