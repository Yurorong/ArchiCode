import {
  defaultCaution,
  type ChecklistIssue,
  type ChecklistPriority,
  type IssueType,
  type PublicPrivate,
  type SourceType,
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

type KeywordTag = "park" | "river" | "school" | "heritage" | "mountain" | "farmland";

type NormalizedProjectInput = {
  raw: ProjectInfo;
  buildingUseGroup: BuildingUseGroup;
  constructionActionKey: ConstructionActionKey;
  districtUnitPlanStatus: YesNoUnknown;
  heritageStatus: YesNoUnknown;
  riverStatus: YesNoUnknown;
  schoolStatus: YesNoUnknown;
  mountainStatus: YesNoUnknown;
  farmlandStatus: YesNoUnknown;
  matchedKeywords: Record<KeywordTag, string[]>;
  zoningKeywords: string[];
  missingInputs: string[];
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
  officialSources?: string[];
  sourceType?: SourceType[];
  requiredInputs: string[];
  priority: ChecklistPriority;
};

export const unknownValue = "확인 필요";

const PARK_KEYWORDS = ["공원", "역사공원", "도시공원", "문화공원", "기념공원"] as const;
const RIVER_KEYWORDS = ["하천", "천변", "제방"] as const;
const SCHOOL_KEYWORDS = ["학교", "초등학교", "중학교", "고등학교", "대학교", "캠퍼스"] as const;
const HERITAGE_KEYWORDS = ["문화재", "국가유산", "역사유적", "사적"] as const;
const MOUNTAIN_KEYWORDS = ["산지", "임야", "산림", "구릉지"] as const;
const FARMLAND_KEYWORDS = ["농지", "답", "전", "경작지"] as const;
const GREEN_ZONE_KEYWORDS = ["녹지", "보존녹지", "자연녹지"] as const;

const ISSUE_SOURCE_MAP: Record<IssueType, { officialSources: string[]; sourceType: SourceType[] }> = {
  "입지 가능성 검토": {
    officialSources: ["세움터", "토지이음", "인허가권자 확인"],
    sourceType: ["permit", "landUse", "confirmationNeeded"],
  },
  "용도 허용 여부 검토": {
    officialSources: ["토지이음", "국가법령정보센터", "인허가권자 확인"],
    sourceType: ["landUse", "law", "confirmationNeeded"],
  },
  "용도지역 / 지구 / 구역 검토": {
    officialSources: ["토지이음", "국가법령정보센터"],
    sourceType: ["landUse", "law"],
  },
  "지구단위계획 검토": {
    officialSources: ["토지이음", "지자체 자치법규", "기타 공식 고시/지침 확인"],
    sourceType: ["landUse", "localOrdinance", "guideline"],
  },
  "건폐율 / 용적률 / 높이 검토": {
    officialSources: ["토지이음", "국가법령정보센터", "지자체 자치법규"],
    sourceType: ["landUse", "law", "localOrdinance"],
  },
  "대지와 도로 관계 검토": {
    officialSources: ["세움터", "토지이음", "인허가권자 확인"],
    sourceType: ["permit", "landUse", "confirmationNeeded"],
  },
  "주차 기준 검토": {
    officialSources: ["지자체 자치법규", "국가법령정보센터", "인허가권자 확인"],
    sourceType: ["localOrdinance", "law", "confirmationNeeded"],
  },
  "피난·방화 기준 검토": {
    officialSources: ["국가법령정보센터", "인허가권자 확인"],
    sourceType: ["law", "confirmationNeeded"],
  },
  "소방시설 검토": {
    officialSources: ["국가법령정보센터", "인허가권자 확인"],
    sourceType: ["law", "confirmationNeeded"],
  },
  "장애인·노인·임산부 편의시설 검토": {
    officialSources: ["국가법령정보센터", "기타 공식 고시/지침 확인"],
    sourceType: ["law", "guideline"],
  },
  "공공건축 관련 검토": {
    officialSources: ["기타 공식 고시/지침 확인", "인허가권자 확인"],
    sourceType: ["guideline", "confirmationNeeded"],
  },
  "에너지 / 친환경 관련 검토": {
    officialSources: ["국가법령정보센터", "기타 공식 고시/지침 확인"],
    sourceType: ["law", "guideline"],
  },
  "문화재 관련 검토": {
    officialSources: ["국가법령정보센터", "기타 공식 고시/지침 확인", "인허가권자 확인"],
    sourceType: ["law", "guideline", "confirmationNeeded"],
  },
  "하천 관련 검토": {
    officialSources: ["국가법령정보센터", "인허가권자 확인"],
    sourceType: ["law", "confirmationNeeded"],
  },
  "학교환경 관련 검토": {
    officialSources: ["국가법령정보센터", "기타 공식 고시/지침 확인"],
    sourceType: ["law", "guideline"],
  },
  "산지 / 농지 관련 검토": {
    officialSources: ["국가법령정보센터", "인허가권자 확인"],
    sourceType: ["law", "confirmationNeeded"],
  },
  "지자체 조례 확인 필요": {
    officialSources: ["지자체 자치법규", "인허가권자 확인"],
    sourceType: ["localOrdinance", "confirmationNeeded"],
  },
  "법규 충돌 또는 별도 법령 확인 필요": {
    officialSources: ["국가법령정보센터", "지자체 자치법규", "기타 공식 고시/지침 확인", "인허가권자 확인"],
    sourceType: ["law", "localOrdinance", "guideline", "confirmationNeeded"],
  },
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function normalizeChoice(value: string): YesNoUnknown {
  if (value === "예" || value === "아니오" || value === "잘 모르겠음") {
    return value;
  }

  if (value === "모름") {
    return "잘 모르겠음";
  }

  return "잘 모르겠음";
}

function parseNumber(value: string) {
  if (value === unknownValue) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function detectKeywords(texts: string[], keywords: readonly string[]) {
  return keywords.filter((keyword) => texts.some((text) => text.includes(normalizeText(keyword))));
}

function classifyBuildingUse(buildingUse: string): BuildingUseGroup {
  const normalized = normalizeText(buildingUse);

  if (
    [
      "문화및집회시설",
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
    ].some((keyword) => normalized.includes(normalizeText(keyword)))
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
      "판매시설",
      "소매점",
      "의원",
      "미용실",
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

function classifyConstructionAction(action: string): ConstructionActionKey {
  const normalized = normalizeText(action);

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

function buildKeywordReason(source: string, keywords: string[]) {
  return `${source}에 “${keywords.join("”, “")}” 관련 표현이 포함되어 표시되었습니다.`;
}

function buildIssue(draft: IssueDraft): ChecklistIssue {
  const mapped = ISSUE_SOURCE_MAP[draft.issueType];

  return {
    id: draft.id,
    issueType: draft.issueType,
    category: getCategory(draft.issueType),
    title: draft.title,
    description: draft.description,
    plainDescription: draft.description,
    triggerReason: draft.triggerReason,
    checkPoints: unique(draft.checkPoints),
    candidateLaws: unique(draft.candidateLaws),
    searchKeywords: unique(draft.searchKeywords),
    officialSources: unique(draft.officialSources ?? mapped.officialSources),
    sourceType: unique(draft.sourceType ?? mapped.sourceType),
    requiredInputs: unique(draft.requiredInputs),
    caution: defaultCaution,
    priority: draft.priority,
  };
}

function getCategory(issueType: IssueType): ChecklistIssue["category"] {
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

function pushIssue(target: Map<string, ChecklistIssue>, draft: IssueDraft) {
  target.set(draft.id, buildIssue(draft));
}

function createCommonIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw } = normalized;

  pushIssue(target, {
    id: "use-classification",
    issueType: "용도 허용 여부 검토",
    title: "건축물 용도분류 확인",
    description: "입력한 건축물 용도가 어떤 용도분류에 해당하는지 먼저 맞춰 두는 것이 좋습니다.",
    triggerReason: `건축물 용도에 “${raw.buildingUse}”이 입력되어 표시되었습니다.`,
    checkPoints: [
      "입력한 용도가 건축법상 분류와 일치하는지 확인합니다.",
      "유사한 세부 용도와 혼동될 수 있는 표현이 있는지 확인합니다.",
    ],
    candidateLaws: ["건축법 시행령", "국토의 계획 및 이용에 관한 법률"],
    searchKeywords: [`${raw.buildingUse} 건축법 용도분류`, `${raw.buildingUse} 허용용도 검토`],
    requiredInputs: ["건축물 용도", "주요 이용 방식", "운영 형태"],
    priority: "필수 검토",
  });

  pushIssue(target, {
    id: "site-road",
    issueType: "대지와 도로 관계 검토",
    title: "대지와 도로 관계 확인",
    description: "대지가 어떤 도로와 접하는지에 따라 건축 가능성과 배치 계획이 달라질 수 있습니다.",
    triggerReason: `대지 위치가 “${raw.location}”으로 입력되어 표시되었습니다.`,
    checkPoints: [
      "접도 요건 충족 여부를 확인합니다.",
      "차량 진입과 소방 동선 확보 가능성을 검토합니다.",
    ],
    candidateLaws: ["건축법", "건축법 시행령"],
    searchKeywords: ["건축법 접도요건", "대지와 도로 관계 확인", `${raw.location} 현황도로 확인`],
    requiredInputs: ["대지 위치", "현황도로 정보", "지적도 또는 현황도"],
    priority: "필수 검토",
  });

  pushIssue(target, {
    id: "scale-review",
    issueType: "건폐율 / 용적률 / 높이 검토",
    title: "건폐율·용적률·높이 검토",
    description: "규모와 높이 계획이 허용 범위 안에 들어가는지 먼저 검토하는 편이 좋습니다.",
    triggerReason: `대지면적 ${raw.siteArea}, 연면적 ${raw.totalFloorArea}, 층수 ${raw.aboveGroundFloors}층 조건으로 표시되었습니다.`,
    checkPoints: [
      "건폐율과 용적률 상한을 확인합니다.",
      "높이 제한과 일조 관련 제한 가능성을 함께 검토합니다.",
    ],
    candidateLaws: ["국토의 계획 및 이용에 관한 법률", "건축법", "지자체 건축조례"],
    searchKeywords: [`${raw.zoningDistrict} 건폐율 용적률`, `${raw.buildingUse} 높이 제한 검토`],
    requiredInputs: ["대지면적", "연면적", "층수", "건축물 높이", "용도지역"],
    priority: "필수 검토",
  });

  pushIssue(target, {
    id: "parking-review",
    issueType: "주차 기준 검토",
    title: "주차 설치기준 검토",
    description: "건축물 용도와 규모에 따라 주차대수 산정 기준이 달라질 수 있습니다.",
    triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
    checkPoints: [
      "용도별 주차대수 산정 기준을 확인합니다.",
      "지자체 조례에 따른 강화 기준 여부를 확인합니다.",
    ],
    candidateLaws: ["주차장법", "지자체 주차장 조례"],
    searchKeywords: [
      `지자체 주차장 조례 ${raw.buildingUse}`,
      `${raw.buildingUse} 주차 설치기준`,
      `${raw.municipality} 법정주차대수`,
    ],
    requiredInputs: ["건축물 용도", "연면적", "예상 이용 인원 또는 세대수"],
    priority: "필수 검토",
  });

  pushIssue(target, {
    id: "egress-fire-basic",
    issueType: "피난·방화 기준 검토",
    title: "피난·방화 기본 검토",
    description: "출구, 계단, 방화구획처럼 평면 계획과 직접 연결되는 기본 기준을 먼저 확인해야 합니다.",
    triggerReason: "건축물 용도와 층수 조건이 함께 입력되어 표시되었습니다.",
    checkPoints: [
      "직통계단과 피난층 계획을 검토합니다.",
      "방화구획과 주요 출구 구성이 가능한지 확인합니다.",
    ],
    candidateLaws: ["건축법", "건축법 시행령", "화재의 예방 및 안전관리에 관한 법률"],
    searchKeywords: [
      `${raw.buildingUse} 피난 기준`,
      `${raw.buildingUse} 방화구획 기준`,
      `${raw.constructionAction} 피난 방화 검토`,
    ],
    requiredInputs: ["건축물 용도", "층수", "지하층 여부", "예상 이용 인원"],
    priority: "필수 검토",
  });
}

function createBuildingUseIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw, buildingUseGroup } = normalized;

  if (buildingUseGroup === "문화/전시/집회 계열") {
    pushIssue(target, {
      id: "cultural-accessibility",
      issueType: "장애인·노인·임산부 편의시설 검토",
      title: "장애인·노인·임산부 편의시설 대상 여부 검토",
      description: "문화·전시·집회 계열 시설은 편의시설 설치 대상 여부를 먼저 확인하는 편이 좋습니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "편의시설 설치 대상 시설인지 확인합니다.",
        "출입구, 이동 동선, 위생시설 계획 기준을 검토합니다.",
      ],
      candidateLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
      searchKeywords: [
        "문화 및 집회시설 장애인등편의법 대상시설",
        "임산부 등을 위한 휴게시설 설치 기준",
        `${raw.buildingUse} 편의시설 설치기준`,
      ],
      requiredInputs: ["건축물 용도", "주요 이용 인원", "출입 동선 계획"],
      priority: "놓치기 쉬운 항목",
    });

    pushIssue(target, {
      id: "cultural-fire-facilities",
      issueType: "소방시설 검토",
      title: "소방시설 검토",
      description: "문화·집회 성격의 시설은 이용 인원과 규모에 따라 필요한 소방설비 기준이 달라질 수 있습니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "필요한 소방설비 종류를 확인합니다.",
        "예상 이용 인원과 층수에 따른 강화 기준 여부를 검토합니다.",
      ],
      candidateLaws: ["화재의 예방 및 안전관리에 관한 법률"],
      searchKeywords: [
        "문화 및 집회시설 소방시설 기준",
        "전시장 소방설비 기준",
        `${raw.buildingUse} 예상 이용 인원 소방 검토`,
      ],
      requiredInputs: ["건축물 용도", "층수", "예상 이용 인원"],
      priority: "놓치기 쉬운 항목",
    });
  }

  if (buildingUseGroup === "근린생활시설") {
    pushIssue(target, {
      id: "neighborhood-use-review",
      issueType: "용도 허용 여부 검토",
      title: "용도지역 내 허용용도 검토",
      description: "근린생활시설은 세부 업종에 따라 허용 여부가 달라질 수 있습니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "세부 업종이 해당 용도지역에서 허용되는지 확인합니다.",
        "지구·구역에 따른 추가 제한이 있는지 확인합니다.",
      ],
      candidateLaws: ["국토의 계획 및 이용에 관한 법률", "건축법 시행령"],
      searchKeywords: [
        `${raw.zoningDistrict} 제1종 근린생활시설 허용`,
        `${raw.buildingUse} 허용용도 검토`,
      ],
      requiredInputs: ["세부 업종", "용도지역", "용도지구 또는 용도구역"],
      priority: "필수 검토",
    });
  }

  if (buildingUseGroup === "업무시설") {
    pushIssue(target, {
      id: "office-energy-review",
      issueType: "에너지 / 친환경 관련 검토",
      title: "업무시설 에너지 기준 검토",
      description: "업무시설은 에너지 절약 설계와 친환경 관련 기준 검토가 함께 필요한 경우가 많습니다.",
      triggerReason: `건축물 용도에 “${raw.buildingUse}”이 포함되어 표시되었습니다.`,
      checkPoints: [
        "에너지 절약 설계 기준 적용 여부를 확인합니다.",
        "친환경 관련 추가 검토 대상인지 확인합니다.",
      ],
      candidateLaws: ["건축물의 에너지절약설계기준", "녹색건축물 조성 지원법"],
      searchKeywords: ["업무시설 에너지절약설계기준", "업무시설 친환경 검토"],
      requiredInputs: ["건축물 용도", "연면적", "설비 계획 개요"],
      priority: "추가 확인 필요",
    });
  }

  if (buildingUseGroup === "숙박시설") {
    pushIssue(target, {
      id: "lodging-review",
      issueType: "피난·방화 기준 검토",
      title: "숙박시설 피난·방화 검토",
      description: "숙박시설은 피난·방화, 소방, 주차 기준을 함께 꼼꼼하게 살펴보는 편이 좋습니다.",
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

function createActionIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw } = normalized;

  if (normalized.constructionActionKey === "new") {
    pushIssue(target, {
      id: "new-construction-review",
      issueType: "입지 가능성 검토",
      title: "신축 기본 검토",
      description: "신축은 건축허가 기본 검토와 함께 대지 안의 공지, 높이, 일조 기준을 함께 살펴보는 편이 좋습니다.",
      triggerReason: `건축 행위가 “${raw.constructionAction}”으로 선택되어 표시되었습니다.`,
      checkPoints: [
        "건축허가 기본 대상 여부를 확인합니다.",
        "대지 안의 공지, 높이 제한, 일조 관련 기준을 검토합니다.",
      ],
      candidateLaws: ["건축법", "건축법 시행령", "지자체 건축조례"],
      searchKeywords: ["신축 건축허가 기본 검토", "대지안의 공지 기준", "신축 일조권 검토"],
      requiredInputs: ["건축 행위", "배치 계획", "건축물 높이", "인접 대지 현황"],
      priority: "필수 검토",
    });
  }

  if (normalized.constructionActionKey === "extension") {
    pushIssue(target, {
      id: "extension-review",
      issueType: "입지 가능성 검토",
      title: "증축 가능 범위 검토",
      description: "증축은 기존 건축물 적법성과 추가 가능한 면적, 기존 피난계획 영향을 함께 확인해야 합니다.",
      triggerReason: `건축 행위가 “${raw.constructionAction}”으로 선택되어 표시되었습니다.`,
      checkPoints: [
        "기존 건축물 적법성을 확인합니다.",
        "증축 가능한 면적과 범위를 검토합니다.",
        "기존 피난계획 영향 여부를 확인합니다.",
      ],
      candidateLaws: ["건축법", "건축법 시행령", "건축구조기준"],
      searchKeywords: [
        "증축 기존 건축물 적법성 확인",
        "증축 가능 면적 검토",
        "증축 기존 피난계획 영향",
      ],
      requiredInputs: ["기존 건축물 대장", "현황 연면적", "증축 계획 면적", "기존 피난계획"],
      priority: "필수 검토",
    });
  }

  if (normalized.constructionActionKey === "change-of-use") {
    pushIssue(target, {
      id: "change-of-use-review",
      issueType: "용도 허용 여부 검토",
      title: "용도변경 가능 여부 검토",
      description: "용도변경은 허용 여부뿐 아니라 주차, 피난·방화 기준 변화를 함께 확인해야 합니다.",
      triggerReason: `건축 행위가 “${raw.constructionAction}”으로 선택되어 표시되었습니다.`,
      checkPoints: [
        "변경 전후 용도 간 허용 가능 여부를 확인합니다.",
        "주차대수와 피난·방화 기준 변화 여부를 검토합니다.",
      ],
      candidateLaws: ["건축법", "주차장법", "건축법 시행령"],
      searchKeywords: [
        "용도변경 가능 여부 검토",
        "용도변경 주차대수 증가 검토",
        "용도변경 피난 방화 기준 변화",
      ],
      requiredInputs: ["변경 전 용도", "변경 후 용도", "연면적", "주차 현황"],
      priority: "필수 검토",
    });

    pushIssue(target, {
      id: "change-of-use-accessibility",
      issueType: "장애인·노인·임산부 편의시설 검토",
      title: "용도변경에 따른 편의시설 영향 검토",
      description: "용도변경 후 다중 이용 성격이 커지면 편의시설 기준이 달라질 수 있습니다.",
      triggerReason: `건축 행위가 “${raw.constructionAction}”으로 선택되어 표시되었습니다.`,
      checkPoints: [
        "변경 후 용도가 편의시설 설치 대상인지 확인합니다.",
        "출입과 위생시설 관련 기준 변화를 검토합니다.",
      ],
      candidateLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
      searchKeywords: [
        "용도변경 장애인 편의시설 영향 검토",
        "용도변경 편의시설 기준",
        "장애인등편의법 대상시설 업무시설",
      ],
      requiredInputs: ["변경 후 용도", "출입 동선", "위생시설 계획"],
      priority: "놓치기 쉬운 항목",
    });
  }

  if (normalized.constructionActionKey === "major-renovation") {
    pushIssue(target, {
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
      searchKeywords: [
        "대수선 허가 대상 검토",
        "리모델링 구조 안전 검토",
        "방화구획 영향 검토",
      ],
      requiredInputs: ["공사 범위", "철거 범위", "구조 변경 여부", "방화구획 계획"],
      priority: "필수 검토",
    });
  }

  if (normalized.constructionActionKey === "unknown") {
    pushIssue(target, {
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
      searchKeywords: ["건축 행위 구분 확인", "신축 증축 대수선 용도변경 차이"],
      requiredInputs: ["공사 범위", "면적 증가 여부", "용도 변경 여부", "구조 변경 여부"],
      priority: "추가 확인 필요",
    });
  }
}

function createDistrictIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  if (normalized.districtUnitPlanStatus === "아니오") {
    return;
  }

  pushIssue(target, {
    id: "district-unit-plan-review",
    issueType: "지구단위계획 검토",
    title: "지구단위계획 시행지침 확인",
    description: "지구단위계획구역은 일반 법규 외에 별도 시행지침과 배치 기준을 함께 확인하는 편이 좋습니다.",
    triggerReason:
      normalized.districtUnitPlanStatus === "예"
        ? "지구단위계획구역 여부가 “예”로 선택되어 표시되었습니다."
        : "지구단위계획구역 여부가 확인 필요로 입력되어 표시되었습니다.",
    checkPoints: [
      "시행지침에 건축물 용도와 배치 관련 기준이 있는지 확인합니다.",
      "공개공지, 외부공간, 높이 기준 강화 여부를 검토합니다.",
    ],
    candidateLaws: ["국토의 계획 및 이용에 관한 법률", "지구단위계획 시행지침"],
    searchKeywords: ["지구단위계획 시행지침 건축물 용도", "지구단위계획 배치 기준 검토"],
    requiredInputs: ["지구단위계획구역 여부", "대지 위치", "용도지역"],
    priority: normalized.districtUnitPlanStatus === "예" ? "놓치기 쉬운 항목" : "추가 확인 필요",
  });
}

function createPublicIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  if (normalized.raw.publicPrivate !== "공공") {
    return;
  }

  pushIssue(target, {
    id: "public-architecture-review",
    issueType: "공공건축 관련 검토",
    title: "공공건축 심의·설계공모 검토",
    description: "공공 프로젝트는 공공건축 심의, 설계공모, 발주 방식 관련 절차를 함께 점검하는 편이 좋습니다.",
    triggerReason: "공공 프로젝트로 입력되어 표시되었습니다.",
    checkPoints: [
      "공공건축 심의 대상인지 확인합니다.",
      "설계공모 또는 별도 발주 절차가 필요한지 검토합니다.",
    ],
    candidateLaws: ["건축서비스산업 진흥법", "공공건축 설계공모 운영지침"],
    searchKeywords: ["공공건축 심의 검토", "설계공모 대상 확인", "발주처 지침 공공건축"],
    requiredInputs: ["공공/민간 구분", "발주기관", "사업 규모"],
    priority: "놓치기 쉬운 항목",
  });

  pushIssue(target, {
    id: "public-bf-review",
    issueType: "장애인·노인·임산부 편의시설 검토",
    title: "BF 인증 또는 장애물 없는 생활환경 검토",
    description: "공공 프로젝트는 BF 인증이나 유사한 접근성 기준 검토가 함께 필요한 경우가 많습니다.",
    triggerReason: "공공 프로젝트로 입력되어 표시되었습니다.",
    checkPoints: [
      "BF 인증 검토 대상인지 확인합니다.",
      "접근성 계획을 초기 단계에서 반영할 수 있는지 검토합니다.",
    ],
    candidateLaws: ["장애물 없는 생활환경 인증에 관한 규칙", "장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
    searchKeywords: ["BF 인증 공공건축", "장애물 없는 생활환경 검토", "공공건축 편의시설 기준"],
    requiredInputs: ["공공/민간 구분", "출입 동선", "이동약자 편의 계획"],
    priority: "놓치기 쉬운 항목",
  });
}

function createZoningIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { raw, missingInputs } = normalized;

  if (
    raw.zoningDistrict !== unknownValue ||
    raw.useDistrict !== unknownValue ||
    raw.useZone !== unknownValue
  ) {
    pushIssue(target, {
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
      searchKeywords: [
        `${raw.zoningDistrict} ${raw.buildingUse} 허용`,
        "토지이음 용도지역 지구 구역 확인",
        `${raw.municipality} 도시계획 조례`,
      ],
      requiredInputs: ["용도지역", "용도지구", "용도구역"],
      priority: "필수 검토",
    });
  }

  if (
    missingInputs.includes("용도지역") ||
    missingInputs.includes("용도지구") ||
    missingInputs.includes("용도구역")
  ) {
    pushIssue(target, {
      id: "missing-zoning-confirmation",
      issueType: "용도지역 / 지구 / 구역 검토",
      title: "용도지역 정보 확인 필요",
      description: "용도지역·지구·구역 정보가 비어 있으면 허용 용도와 규모 검토가 정확해지기 어렵습니다.",
      triggerReason: "용도지역 정보가 비어 있어 확인 필요 항목으로 표시되었습니다.",
      checkPoints: [
        "토지이음에서 용도지역·지구·구역 정보를 먼저 확인합니다.",
        "확인한 정보로 결과를 다시 검토합니다.",
      ],
      candidateLaws: ["국토의 계획 및 이용에 관한 법률"],
      searchKeywords: ["토지이음 용도지역 확인", "용도지구 용도구역 확인"],
      requiredInputs: ["대지 위치", "용도지역", "용도지구", "용도구역"],
      priority: "추가 확인 필요",
    });
  }

  pushIssue(target, {
    id: "local-ordinance-review",
    issueType: "지자체 조례 확인 필요",
    title: "지자체 조례 확인 필요",
    description: "같은 법령이라도 지자체 조례에 따라 세부 기준이 달라질 수 있습니다.",
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

function createSpecialConditionIssues(target: Map<string, ChecklistIssue>, normalized: NormalizedProjectInput) {
  const { matchedKeywords, raw } = normalized;

  if (matchedKeywords.park.length > 0) {
    pushIssue(target, {
      id: "park-facility-review",
      issueType: "법규 충돌 또는 별도 법령 확인 필요",
      title: "도시공원 또는 공원시설 검토",
      description: "공원 관련 표현이 포함된 대지는 도시공원법상 공원시설 해당 여부와 별도 계획 기준을 함께 확인하는 편이 좋습니다.",
      triggerReason: buildKeywordReason("대지 위치 또는 사업명", matchedKeywords.park),
      checkPoints: [
        "계획 시설이 공원시설에 해당하는지 확인합니다.",
        "공원조성계획과 지자체 공원조례 적용 여부를 검토합니다.",
      ],
      candidateLaws: ["도시공원 및 녹지 등에 관한 법률", "지자체 공원조례"],
      searchKeywords: [
        "도시공원 공원시설 교양시설 전시장",
        "공원조성계획 확인",
        `${raw.municipality} 공원조례`,
      ],
      officialSources: ["국가법령정보센터", "지자체 자치법규", "기타 공식 고시/지침 확인"],
      sourceType: ["law", "localOrdinance", "guideline"],
      requiredInputs: ["사업명", "대지 위치", "시설 용도", "공원조성계획 여부"],
      priority: "놓치기 쉬운 항목",
    });
  }

  if (normalized.zoningKeywords.length > 0 && normalized.buildingUseGroup === "문화/전시/집회 계열") {
    pushIssue(target, {
      id: "green-zone-culture-review",
      issueType: "법규 충돌 또는 별도 법령 확인 필요",
      title: "용도지역 제한과 별도 법령 관계 검토",
      description: "녹지 계열 용도지역에서 문화·전시 계열 시설을 계획하면 허용 용도와 별도 법령 적용 가능성을 함께 검토하는 편이 좋습니다.",
      triggerReason: `용도지역에 “${normalized.zoningKeywords.join("”, “")}”이 포함되고 건축물 용도에 “${raw.buildingUse}”이 입력되어 표시되었습니다.`,
      checkPoints: [
        "해당 용도지역에서 계획 용도가 허용되는지 확인합니다.",
        "공원·보전 관련 별도 법령 적용 가능성을 검토합니다.",
      ],
      candidateLaws: ["국토의 계획 및 이용에 관한 법률", "도시공원 및 녹지 등에 관한 법률"],
      searchKeywords: [
        `보존녹지지역 ${raw.buildingUse} 허용`,
        "보존녹지지역 문화 및 집회시설 허용",
        "자연녹지지역 전시장 허용 여부",
      ],
      requiredInputs: ["용도지역", "건축물 용도", "대지 위치"],
      priority: "놓치기 쉬운 항목",
    });
  }

  const specialConfigs = [
    {
      status: normalized.heritageStatus,
      keywords: matchedKeywords.heritage,
      issueType: "문화재 관련 검토" as const,
      title: "문화재 관련 검토",
      unknownTitle: "문화재 관련 여부 확인 필요",
      description: "문화재 영향 범위에 해당하면 별도 협의 또는 제한 검토가 필요할 수 있습니다.",
      law: "문화유산의 보존 및 활용에 관한 법률",
      searchKeywords: ["문화재 영향 범위 확인", "문화재보호 관련 검토"],
      requiredInputs: ["대지 위치", "문화재 관련 여부", "건축물 높이"],
    },
    {
      status: normalized.riverStatus,
      keywords: matchedKeywords.river,
      issueType: "하천 관련 검토" as const,
      title: "하천구역 및 하천점용 검토",
      unknownTitle: "하천 관련 여부 확인 필요",
      description: "하천 인접 여부가 있으면 하천구역, 점용 허가, 배수 계획을 함께 검토하는 편이 좋습니다.",
      law: "하천법",
      searchKeywords: ["하천구역 건축 제한", "하천점용 검토"],
      requiredInputs: ["대지 위치", "하천 관련 여부", "배수 계획"],
    },
    {
      status: normalized.schoolStatus,
      keywords: matchedKeywords.school,
      issueType: "학교환경 관련 검토" as const,
      title: "교육환경보호구역 검토",
      unknownTitle: "학교환경 관련 여부 확인 필요",
      description: "학교 주변 대지는 교육환경보호구역 해당 여부에 따라 별도 제한이 있을 수 있습니다.",
      law: "교육환경 보호에 관한 법률",
      searchKeywords: ["교육환경보호구역 검토", "학교 주변 건축 제한"],
      requiredInputs: ["대지 위치", "학교환경 관련 여부", "건축물 용도"],
    },
    {
      status: normalized.mountainStatus,
      keywords: matchedKeywords.mountain,
      issueType: "산지 / 농지 관련 검토" as const,
      title: "산지관리 및 산지전용 검토",
      unknownTitle: "산지 관련 여부 확인 필요",
      description: "산지 관련 대지는 산지전용과 재해 영향 가능성을 함께 검토하는 편이 좋습니다.",
      law: "산지관리법",
      searchKeywords: ["산지전용 검토", "산지관리법 건축"],
      requiredInputs: ["대지 위치", "산지 관련 여부", "경사도 정보"],
    },
    {
      status: normalized.farmlandStatus,
      keywords: matchedKeywords.farmland,
      issueType: "산지 / 농지 관련 검토" as const,
      title: "농지전용 검토",
      unknownTitle: "농지 관련 여부 확인 필요",
      description: "농지 관련 대지는 농지전용 허가나 협의 절차를 먼저 확인하는 편이 좋습니다.",
      law: "농지법",
      searchKeywords: ["농지전용 검토", "농지법 건축"],
      requiredInputs: ["대지 위치", "농지 관련 여부"],
    },
  ] as const;

  specialConfigs.forEach((config) => {
    const positive = config.status === "예" || config.keywords.length > 0;
    const unknown = config.status === "잘 모르겠음" && config.keywords.length === 0;

    if (positive) {
      pushIssue(target, {
        id: `${config.issueType}-positive`,
        issueType: config.issueType,
        title: config.title,
        description: config.description,
        triggerReason:
          config.keywords.length > 0
            ? buildKeywordReason("대지 위치 또는 사업명", config.keywords)
            : `${config.title.replace(" 검토", "")} 여부가 “예”로 선택되어 표시되었습니다.`,
        checkPoints: [
          `${config.title.replace(" 검토", "")} 대상 여부를 확인합니다.`,
          "공식 제한 기준이나 협의 필요 여부를 검토합니다.",
        ],
        candidateLaws: [config.law],
        searchKeywords: [...config.searchKeywords],
        requiredInputs: [...config.requiredInputs],
        priority: "놓치기 쉬운 항목",
      });
    }

    if (unknown) {
      pushIssue(target, {
        id: `${config.issueType}-unknown`,
        issueType: config.issueType,
        title: config.unknownTitle,
        description: `${config.title.replace(" 검토", "")} 여부가 불명확하면 먼저 해당 여부를 확인하는 편이 좋습니다.`,
        triggerReason: `${config.title.replace(" 검토", "")} 여부가 확인 필요로 입력되어 표시되었습니다.`,
        checkPoints: [`${config.title.replace(" 검토", "")} 여부를 먼저 확인합니다.`],
        candidateLaws: [config.law],
        searchKeywords: [...config.searchKeywords],
        requiredInputs: [...config.requiredInputs],
        priority: "추가 확인 필요",
      });
    }
  });
}

export function normalizeProjectInput(input: ProjectInfo): NormalizedProjectInput {
  const searchableTexts = [
    normalizeText(input.projectName),
    normalizeText(input.location),
    normalizeText(input.municipality),
  ];
  const zoningTexts = [
    normalizeText(input.zoningDistrict),
    normalizeText(input.useDistrict),
    normalizeText(input.useZone),
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
    districtUnitPlanStatus: normalizeChoice(input.districtUnitPlan),
    heritageStatus: normalizeChoice(input.heritageRelated),
    riverStatus: normalizeChoice(input.riverRelated),
    schoolStatus: normalizeChoice(input.schoolEnvironmentRelated),
    mountainStatus: normalizeChoice(input.mountainRelated),
    farmlandStatus: normalizeChoice(input.farmlandRelated),
    matchedKeywords: {
      park: detectKeywords(searchableTexts, PARK_KEYWORDS),
      river: detectKeywords(searchableTexts, RIVER_KEYWORDS),
      school: detectKeywords(searchableTexts, SCHOOL_KEYWORDS),
      heritage: detectKeywords(searchableTexts, HERITAGE_KEYWORDS),
      mountain: detectKeywords(searchableTexts, MOUNTAIN_KEYWORDS),
      farmland: detectKeywords(searchableTexts, FARMLAND_KEYWORDS),
    },
    zoningKeywords: detectKeywords(zoningTexts, GREEN_ZONE_KEYWORDS),
    missingInputs,
  };
}

export function generateLegalIssues(projectInfo: ProjectInfo): ChecklistIssue[] {
  const normalized = normalizeProjectInput(projectInfo);
  const issues = new Map<string, ChecklistIssue>();

  createCommonIssues(issues, normalized);
  createBuildingUseIssues(issues, normalized);
  createActionIssues(issues, normalized);
  createDistrictIssues(issues, normalized);
  createPublicIssues(issues, normalized);
  createZoningIssues(issues, normalized);
  createSpecialConditionIssues(issues, normalized);

  const floors = parseNumber(projectInfo.aboveGroundFloors);
  const totalFloorArea = parseNumber(projectInfo.totalFloorArea);

  if ((floors !== null && floors >= 11) || (totalFloorArea !== null && totalFloorArea >= 5000)) {
    pushIssue(issues, {
      id: "large-project-fire-review",
      issueType: "소방시설 검토",
      title: "대규모 건축물 소방시설 검토",
      description: "층수나 연면적이 큰 프로젝트는 소방설비와 피난 기준을 더 꼼꼼히 확인하는 편이 좋습니다.",
      triggerReason: "층수 또는 연면적이 큰 조건으로 입력되어 표시되었습니다.",
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
      "도시공원 또는 공원시설 검토",
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
      location: unknownValue,
      municipality: unknownValue,
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
      location: unknownValue,
      municipality: unknownValue,
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
