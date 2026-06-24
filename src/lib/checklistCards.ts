export type ChecklistPriority = "필수 검토" | "놓치기 쉬운 항목" | "추가 확인 필요";
export type YesNoUnknown = "예" | "아니오" | "잘 모르겠음";
export type PublicPrivate = "공공" | "민간";

export type IssueType =
  | "입지 가능성 검토"
  | "용도 허용 여부 검토"
  | "용도지역 / 지구 / 구역 검토"
  | "지구단위계획 검토"
  | "건폐율 / 용적률 / 높이 검토"
  | "대지와 도로 관계 검토"
  | "주차 기준 검토"
  | "피난·방화 기준 검토"
  | "소방시설 검토"
  | "장애인·노인·임산부 편의시설 검토"
  | "공공건축 관련 검토"
  | "에너지 / 친환경 관련 검토"
  | "문화재 관련 검토"
  | "하천 관련 검토"
  | "학교환경 관련 검토"
  | "산지 / 농지 관련 검토"
  | "지자체 조례 확인 필요"
  | "법규 충돌 또는 별도 법령 확인 필요";

export type BuildingUseGroup =
  | "문화 및 집회시설"
  | "근린생활시설"
  | "주택"
  | "업무시설"
  | "교육시설"
  | "숙박시설"
  | "기타";

export type TriggerConditions = {
  always?: boolean;
  constructionActions?: string[];
  buildingUseGroups?: BuildingUseGroup[];
  districtUnitPlan?: YesNoUnknown[];
  publicPrivate?: PublicPrivate[];
  heritageRelated?: YesNoUnknown[];
  riverRelated?: YesNoUnknown[];
  schoolEnvironmentRelated?: YesNoUnknown[];
  mountainRelated?: YesNoUnknown[];
  farmlandRelated?: YesNoUnknown[];
  locationKeywords?: string[];
  municipalityKeywords?: string[];
  zoningKeywords?: string[];
  useDistrictKeywords?: string[];
  useZoneKeywords?: string[];
  buildingUseKeywords?: string[];
  requireBasement?: boolean;
  requireLargeScale?: boolean;
};

export type ChecklistIssueTemplate = {
  id: string;
  issueType: IssueType;
  title: string;
  plainDescription: string;
  triggerConditions: TriggerConditions;
  legalDomains: string[];
  candidateLaws: string[];
  searchKeywords: string[];
  checkPoints?: string[];
  requiredInputs: string[];
  officialSources: string[];
  caution?: string;
  priority: ChecklistPriority;
};

export type ChecklistIssue = {
  id: string;
  issueType: IssueType;
  title: string;
  plainDescription: string;
  triggerReason: string;
  triggerConditions: TriggerConditions;
  legalDomains: string[];
  candidateLaws: string[];
  searchKeywords: string[];
  checkPoints: string[];
  requiredInputs: string[];
  officialSources: string[];
  caution: string;
  priority: ChecklistPriority;
};

export type ResultCategory =
  | "입지"
  | "용도"
  | "면적"
  | "피난·방화"
  | "주차"
  | "편의시설"
  | "공공건축"
  | "조례"
  | "특수조건";

export const defaultCaution =
  "본 결과는 법적 확정 판단이 아니며, 공식 법령과 인허가권자 확인이 필요합니다.";

const issue = (
  input: Omit<ChecklistIssueTemplate, "caution"> & {
    caution?: string;
  },
): ChecklistIssueTemplate => ({
  ...input,
  caution: input.caution ?? defaultCaution,
});

export const checklistIssueTemplates: ChecklistIssueTemplate[] = [
  issue({
    id: "site-feasibility",
    issueType: "입지 가능성 검토",
    title: "입지 가능성 검토",
    plainDescription:
      "이 대지가 계획 중인 건축물에 적합한 위치인지 기본 조건부터 확인할 필요가 있습니다.",
    triggerConditions: { always: true },
    legalDomains: ["건축", "도시계획"],
    candidateLaws: ["건축법", "국토의 계획 및 이용에 관한 법률"],
    searchKeywords: ["건축 가능 여부 확인", "토지이용계획 건축 검토"],
    requiredInputs: ["대지 위치", "지자체", "건축물 용도"],
    officialSources: ["토지이음", "세움터", "관할 지자체 건축과"],
    priority: "필수 검토",
  }),
  issue({
    id: "use-permission",
    issueType: "용도 허용 여부 검토",
    title: "용도 허용 여부 검토",
    plainDescription:
      "입력한 건축물 용도가 해당 대지와 지역 조건에서 허용되는지 먼저 확인해야 합니다.",
    triggerConditions: { always: true },
    legalDomains: ["건축", "도시계획"],
    candidateLaws: ["건축법 시행령", "국토의 계획 및 이용에 관한 법률"],
    searchKeywords: ["건축물 용도분류", "용도지역 허용 용도"],
    requiredInputs: ["건축물 용도", "용도지역", "용도지구", "용도구역"],
    officialSources: ["국가법령정보센터", "토지이음", "관할 지자체 건축과"],
    priority: "필수 검토",
  }),
  issue({
    id: "zoning-review",
    issueType: "용도지역 / 지구 / 구역 검토",
    title: "용도지역 / 지구 / 구역 검토",
    plainDescription:
      "용도지역, 용도지구, 용도구역에 따라 허용 용도와 규모 조건이 달라질 수 있습니다.",
    triggerConditions: { always: true },
    legalDomains: ["도시계획", "건축"],
    candidateLaws: ["국토의 계획 및 이용에 관한 법률", "지자체 도시계획 조례"],
    searchKeywords: ["용도지역 검토", "용도지구 용도구역 확인"],
    requiredInputs: ["용도지역", "용도지구", "용도구역"],
    officialSources: ["토지이음", "관할 지자체 도시계획과"],
    priority: "필수 검토",
  }),
  issue({
    id: "district-unit-plan",
    issueType: "지구단위계획 검토",
    title: "지구단위계획 검토",
    plainDescription:
      "지구단위계획구역이라면 일반 법령 외에 별도 시행지침과 배치 기준을 함께 확인해야 합니다.",
    triggerConditions: { districtUnitPlan: ["예"] },
    legalDomains: ["도시계획", "건축"],
    candidateLaws: ["지구단위계획 시행지침", "국토의 계획 및 이용에 관한 법률"],
    searchKeywords: ["지구단위계획 시행지침", "지구단위계획 건축 기준"],
    requiredInputs: ["지구단위계획구역 여부", "용도지역", "대지 위치"],
    officialSources: ["토지이음", "관할 지자체 도시계획과"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "district-unit-plan-unknown",
    issueType: "지구단위계획 검토",
    title: "지구단위계획구역 여부 확인 필요",
    plainDescription:
      "지구단위계획구역 여부를 아직 모르면 토지이음에서 먼저 확인한 뒤 검토를 보완하는 것이 좋습니다.",
    triggerConditions: { districtUnitPlan: ["잘 모르겠음"] },
    legalDomains: ["도시계획"],
    candidateLaws: ["국토의 계획 및 이용에 관한 법률"],
    searchKeywords: ["토지이음 지구단위계획구역 확인", "지구단위계획 여부 확인"],
    requiredInputs: ["대지 위치", "지구단위계획구역 여부"],
    officialSources: ["토지이음", "관할 지자체 도시계획과"],
    priority: "추가 확인 필요",
  }),
  issue({
    id: "scale-review",
    issueType: "건폐율 / 용적률 / 높이 검토",
    title: "건폐율 / 용적률 / 높이 검토",
    plainDescription:
      "건물 규모와 높이가 허용 범위 안에 들어가는지 확인해야 초기 계획이 현실적인지 판단할 수 있습니다.",
    triggerConditions: { always: true },
    legalDomains: ["도시계획", "건축"],
    candidateLaws: ["국토의 계획 및 이용에 관한 법률", "건축법", "지자체 건축조례"],
    searchKeywords: ["건폐율 용적률 확인", "건축물 높이 제한 검토"],
    requiredInputs: ["대지면적", "연면적", "지상층수", "건축물 높이", "용도지역"],
    officialSources: ["토지이음", "관할 지자체 건축조례", "관할 지자체 건축과"],
    priority: "필수 검토",
  }),
  issue({
    id: "site-road",
    issueType: "대지와 도로 관계 검토",
    title: "대지와 도로 관계 검토",
    plainDescription:
      "대지가 도로와 어떤 관계인지에 따라 건축 가능 여부와 배치 계획이 크게 달라질 수 있습니다.",
    triggerConditions: { always: true },
    legalDomains: ["건축"],
    candidateLaws: ["건축법", "건축법 시행령"],
    searchKeywords: ["대지와 도로 관계", "접도 요건 확인"],
    requiredInputs: ["대지 위치", "현황도로 정보", "지적도"],
    officialSources: ["세움터", "토지이음", "관할 지자체 건축과"],
    priority: "필수 검토",
  }),
  issue({
    id: "parking",
    issueType: "주차 기준 검토",
    title: "주차 기준 검토",
    plainDescription:
      "건축물 용도와 규모에 따라 필요한 주차대수가 달라지므로 초기 단계에서 함께 계산해야 합니다.",
    triggerConditions: { always: true },
    legalDomains: ["주차", "건축"],
    candidateLaws: ["주차장법", "지자체 주차장 조례"],
    searchKeywords: ["법정 주차대수", "주차장 조례 검토"],
    requiredInputs: ["건축물 용도", "연면적", "세대수 또는 이용 인원"],
    officialSources: ["관할 지자체 주차장 조례", "관할 지자체 교통부서"],
    priority: "필수 검토",
  }),
  issue({
    id: "egress-fire",
    issueType: "피난·방화 기준 검토",
    title: "피난·방화 기준 검토",
    plainDescription:
      "계단, 출구, 방화구획 같은 기본 안전 기준은 평면 계획과 직접 연결되므로 먼저 확인해야 합니다.",
    triggerConditions: { always: true },
    legalDomains: ["건축", "소방"],
    candidateLaws: ["건축법", "건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    searchKeywords: ["피난 기준", "방화구획 기준", "직통계단 검토"],
    requiredInputs: ["건축물 용도", "연면적", "층수", "지하층수"],
    officialSources: ["국가법령정보센터", "관할 소방서", "관할 지자체 건축과"],
    priority: "필수 검토",
  }),
  issue({
    id: "fire-facilities",
    issueType: "소방시설 검토",
    title: "소방시설 검토",
    plainDescription:
      "건축물 용도와 규모에 따라 필요한 소방설비가 달라질 수 있어 별도 검토가 필요합니다.",
    triggerConditions: {
      buildingUseGroups: ["문화 및 집회시설", "숙박시설", "교육시설"],
      requireLargeScale: false,
    },
    legalDomains: ["소방"],
    candidateLaws: ["소방시설 설치 및 관리에 관한 법률"],
    searchKeywords: ["소방시설 기준", "소방설비 적용 대상"],
    requiredInputs: ["건축물 용도", "연면적", "층수", "이용 인원"],
    officialSources: ["관할 소방서", "국가법령정보센터"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "fire-facilities-large",
    issueType: "소방시설 검토",
    title: "대형 건축물 소방시설 검토",
    plainDescription:
      "연면적이나 층수가 큰 건축물은 소방설비와 피난 기준을 더 강화해서 검토해야 할 수 있습니다.",
    triggerConditions: { requireLargeScale: true },
    legalDomains: ["소방", "건축"],
    candidateLaws: ["소방시설 설치 및 관리에 관한 법률", "건축법 시행령"],
    searchKeywords: ["대형 건축물 소방 검토", "고층 건축물 소방시설 기준"],
    requiredInputs: ["연면적", "지상층수", "건축물 높이", "건축물 용도"],
    officialSources: ["관할 소방서", "관할 지자체 건축과"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "accessibility-public-use",
    issueType: "장애인·노인·임산부 편의시설 검토",
    title: "장애인·노인·임산부 편의시설 검토",
    plainDescription:
      "공공성이나 다중 이용 성격이 있는 시설은 편의시설과 접근성 기준을 더 꼼꼼히 확인해야 합니다.",
    triggerConditions: {
      publicPrivate: ["공공"],
      buildingUseGroups: ["문화 및 집회시설", "교육시설", "업무시설"],
    },
    legalDomains: ["편의시설", "건축"],
    candidateLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률", "BF 인증 관련 기준"],
    searchKeywords: ["장애인 편의시설 기준", "BF 인증 검토"],
    requiredInputs: ["건축물 용도", "공공/민간 구분", "출입 동선", "층별 계획"],
    officialSources: ["보건복지부 기준", "BF 인증기관", "관할 지자체 건축과"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "accessibility-cultural",
    issueType: "장애인·노인·임산부 편의시설 검토",
    title: "다중 이용시설 편의시설 검토",
    plainDescription:
      "문화, 집회, 전시, 도서관, 공공시설처럼 다수가 이용하는 시설은 편의시설 계획을 더 일찍 확인하는 편이 좋습니다.",
    triggerConditions: {
      buildingUseKeywords: ["문화", "집회", "전시", "도서관", "공공시설"],
    },
    legalDomains: ["편의시설", "건축"],
    candidateLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
    searchKeywords: ["다중이용시설 편의시설 기준", "문화시설 장애인 편의시설"],
    requiredInputs: ["건축물 용도", "출입구 계획", "장애인 화장실 계획"],
    officialSources: ["보건복지부 기준", "관할 지자체 건축과"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "public-architecture",
    issueType: "공공건축 관련 검토",
    title: "공공건축 심의 및 발주 절차 검토",
    plainDescription:
      "공공 프로젝트라면 공공건축 심의, 설계공모, BF 인증 같은 별도 절차가 함께 검토될 수 있습니다.",
    triggerConditions: { publicPrivate: ["공공"] },
    legalDomains: ["공공건축", "건축서비스"],
    candidateLaws: [
      "건축서비스산업 진흥법",
      "공공건축 설계공모 운영지침",
      "장애물 없는 생활환경 인증에 관한 규칙",
    ],
    searchKeywords: ["공공건축 심의", "설계공모 대상", "BF 인증 공공건축"],
    requiredInputs: ["공공/민간 구분", "발주 방식", "사업 규모"],
    officialSources: ["공공건축지원센터", "발주기관", "관할 지자체 건축과"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "energy-office-public",
    issueType: "에너지 / 친환경 관련 검토",
    title: "에너지 / 친환경 관련 검토",
    plainDescription:
      "업무시설이나 공공 프로젝트는 에너지 절약 설계와 친환경 기준 검토가 함께 필요할 수 있습니다.",
    triggerConditions: {
      publicPrivate: ["공공"],
      buildingUseGroups: ["업무시설"],
    },
    legalDomains: ["에너지", "친환경", "건축"],
    candidateLaws: ["건축물의 에너지절약설계기준", "녹색건축물 조성 지원법"],
    searchKeywords: ["에너지절약설계기준", "녹색건축물 검토"],
    requiredInputs: ["건축물 용도", "연면적", "공공/민간 구분"],
    officialSources: ["국토교통부 고시", "녹색건축포털", "관할 지자체 건축과"],
    priority: "추가 확인 필요",
  }),
  issue({
    id: "heritage",
    issueType: "문화재 관련 검토",
    title: "문화재 관련 검토",
    plainDescription:
      "문화재 주변이라면 높이, 외관, 공사 방식에 추가 제한이나 협의가 필요할 수 있습니다.",
    triggerConditions: { heritageRelated: ["예"] },
    legalDomains: ["문화재", "건축"],
    candidateLaws: ["문화재보호법"],
    searchKeywords: ["문화재 주변 건축 제한", "현상변경 허가"],
    requiredInputs: ["문화재 관련 여부", "대지 위치", "건축물 높이"],
    officialSources: ["국가유산청", "관할 지자체 문화재부서"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "heritage-unknown",
    issueType: "문화재 관련 검토",
    title: "문화재 관련 여부 확인 필요",
    plainDescription:
      "문화재 영향 범위 안에 들어가는지 아직 모르면 먼저 관련 여부를 확인하는 것이 좋습니다.",
    triggerConditions: { heritageRelated: ["잘 모르겠음"] },
    legalDomains: ["문화재"],
    candidateLaws: ["문화재보호법"],
    searchKeywords: ["문화재 영향 범위 확인", "문화재 주변 건축 협의"],
    requiredInputs: ["대지 위치", "문화재 관련 여부"],
    officialSources: ["국가유산청", "관할 지자체 문화재부서"],
    priority: "추가 확인 필요",
  }),
  issue({
    id: "river",
    issueType: "하천 관련 검토",
    title: "하천 관련 검토",
    plainDescription:
      "하천 인접 여부가 있으면 하천구역, 하천점용, 배수 계획을 함께 확인해야 할 수 있습니다.",
    triggerConditions: { riverRelated: ["예"] },
    legalDomains: ["하천", "토지이용"],
    candidateLaws: ["하천법"],
    searchKeywords: ["하천구역 건축 제한", "하천점용 허가"],
    requiredInputs: ["하천 관련 여부", "대지 위치", "배수 계획"],
    officialSources: ["관할 하천관리청", "국가법령정보센터"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "river-unknown",
    issueType: "하천 관련 검토",
    title: "하천 관련 여부 확인 필요",
    plainDescription:
      "하천 인접 여부가 불분명하면 토지이음이나 관할 하천관리 부서에서 먼저 확인하는 것이 좋습니다.",
    triggerConditions: { riverRelated: ["잘 모르겠음"] },
    legalDomains: ["하천"],
    candidateLaws: ["하천법"],
    searchKeywords: ["하천 관련 여부 확인", "하천점용 검토"],
    requiredInputs: ["대지 위치", "하천 관련 여부"],
    officialSources: ["토지이음", "관할 하천관리청"],
    priority: "추가 확인 필요",
  }),
  issue({
    id: "school-environment",
    issueType: "학교환경 관련 검토",
    title: "학교환경 관련 검토",
    plainDescription:
      "학교 주변이라면 교육환경보호구역 여부와 건축물 용도 제한을 함께 검토해야 할 수 있습니다.",
    triggerConditions: { schoolEnvironmentRelated: ["예"] },
    legalDomains: ["교육환경", "건축"],
    candidateLaws: ["교육환경 보호에 관한 법률"],
    searchKeywords: ["교육환경보호구역 검토", "학교 주변 건축 제한"],
    requiredInputs: ["학교환경 관련 여부", "대지 위치", "건축물 용도"],
    officialSources: ["교육지원청", "교육환경정보시스템", "관할 지자체 건축과"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "school-environment-unknown",
    issueType: "학교환경 관련 검토",
    title: "학교환경 관련 여부 확인 필요",
    plainDescription:
      "학교 인접 여부가 불분명하면 교육환경보호구역 해당 여부부터 먼저 확인하는 것이 좋습니다.",
    triggerConditions: { schoolEnvironmentRelated: ["잘 모르겠음"] },
    legalDomains: ["교육환경"],
    candidateLaws: ["교육환경 보호에 관한 법률"],
    searchKeywords: ["교육환경보호구역 확인", "학교 주변 건축 제한"],
    requiredInputs: ["대지 위치", "학교환경 관련 여부"],
    officialSources: ["교육지원청", "교육환경정보시스템"],
    priority: "추가 확인 필요",
  }),
  issue({
    id: "mountain-farmland",
    issueType: "산지 / 농지 관련 검토",
    title: "산지 / 농지 관련 검토",
    plainDescription:
      "산지 또는 농지 관련 여부가 있으면 일반 대지와 다른 전용 절차와 별도 협의가 필요할 수 있습니다.",
    triggerConditions: {
      mountainRelated: ["예"],
      farmlandRelated: ["예"],
    },
    legalDomains: ["산지", "농지", "토지이용"],
    candidateLaws: ["산지관리법", "농지법"],
    searchKeywords: ["산지전용 허가", "농지전용 검토"],
    requiredInputs: ["산지 관련 여부", "농지 관련 여부", "대지 위치"],
    officialSources: ["산림청", "농림축산식품부", "관할 지자체 관련 부서"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "mountain-review",
    issueType: "산지 / 농지 관련 검토",
    title: "산지 관련 검토",
    plainDescription:
      "산지 관련 여부가 있으면 산지전용과 경사도, 재해 위험 요소를 함께 살펴봐야 합니다.",
    triggerConditions: { mountainRelated: ["예"] },
    legalDomains: ["산지", "토지이용"],
    candidateLaws: ["산지관리법"],
    searchKeywords: ["산지전용 허가", "산지관리법 건축"],
    requiredInputs: ["산지 관련 여부", "대지 위치", "경사도 정보"],
    officialSources: ["산림청", "관할 지자체 산지관리부서"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "farmland-review",
    issueType: "산지 / 농지 관련 검토",
    title: "농지 관련 검토",
    plainDescription:
      "농지 관련 여부가 있으면 농지전용 가능 여부와 부담금, 협의 절차를 함께 확인할 필요가 있습니다.",
    triggerConditions: { farmlandRelated: ["예"] },
    legalDomains: ["농지", "토지이용"],
    candidateLaws: ["농지법"],
    searchKeywords: ["농지전용 검토", "농지법 건축"],
    requiredInputs: ["농지 관련 여부", "대지 위치"],
    officialSources: ["농림축산식품부", "관할 지자체 농지부서"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "mountain-or-farmland-unknown",
    issueType: "산지 / 농지 관련 검토",
    title: "산지 / 농지 관련 여부 확인 필요",
    plainDescription:
      "산지 또는 농지 관련 여부를 아직 모르면 토지이음과 관련 부서 확인이 먼저 필요합니다.",
    triggerConditions: {
      mountainRelated: ["잘 모르겠음"],
      farmlandRelated: ["잘 모르겠음"],
    },
    legalDomains: ["산지", "농지"],
    candidateLaws: ["산지관리법", "농지법"],
    searchKeywords: ["산지 여부 확인", "농지 여부 확인"],
    requiredInputs: ["대지 위치", "산지 관련 여부", "농지 관련 여부"],
    officialSources: ["토지이음", "관할 지자체 관련 부서"],
    priority: "추가 확인 필요",
  }),
  issue({
    id: "local-ordinance",
    issueType: "지자체 조례 확인 필요",
    title: "지자체 조례 확인 필요",
    plainDescription:
      "같은 법령이라도 지자체 조례에 따라 세부 기준이 달라질 수 있어 관할 조례 확인이 필요합니다.",
    triggerConditions: { always: true },
    legalDomains: ["지자체 조례", "건축", "주차"],
    candidateLaws: ["지자체 건축조례", "지자체 주차장 조례", "지자체 도시계획 조례"],
    searchKeywords: ["관할 지자체 건축조례", "관할 지자체 주차장 조례"],
    requiredInputs: ["지자체", "건축물 용도", "연면적"],
    officialSources: ["관할 지자체 홈페이지", "관할 지자체 건축과"],
    priority: "추가 확인 필요",
  }),
  issue({
    id: "change-of-use",
    issueType: "용도 허용 여부 검토",
    title: "용도변경 가능 여부 및 기준 변화 검토",
    plainDescription:
      "용도변경은 허용 여부뿐 아니라 주차, 피난·방화, 편의시설 기준 변화까지 함께 확인해야 합니다.",
    triggerConditions: { constructionActions: ["건물 쓰임 바꾸기"] },
    legalDomains: ["건축", "주차", "편의시설", "소방"],
    candidateLaws: ["건축법", "주차장법", "장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
    searchKeywords: ["용도변경 가능 여부", "용도변경 주차대수", "용도변경 피난 기준"],
    requiredInputs: ["변경 전후 용도", "연면적", "주차 현황", "층별 계획"],
    officialSources: ["세움터", "관할 지자체 건축과", "관할 지자체 교통부서"],
    priority: "필수 검토",
  }),
  issue({
    id: "expansion-range",
    issueType: "입지 가능성 검토",
    title: "증축 가능 범위 및 기존 건축물 적법성 검토",
    plainDescription:
      "증축은 기존 건축물의 적법성과 남아 있는 규모 여유, 기존 피난계획 영향까지 함께 검토해야 합니다.",
    triggerConditions: { constructionActions: ["기존 건물 넓히기"] },
    legalDomains: ["건축", "구조", "소방"],
    candidateLaws: ["건축법", "국토의 계획 및 이용에 관한 법률", "건축구조기준"],
    searchKeywords: ["기존 건축물 적법성", "증축 가능 면적", "증축 피난 검토"],
    requiredInputs: ["기존 건축물대장", "현재 연면적", "증축 계획 면적", "피난 동선"],
    officialSources: ["세움터", "관할 지자체 건축과", "관할 소방서"],
    priority: "필수 검토",
  }),
  issue({
    id: "major-renovation",
    issueType: "법규 충돌 또는 별도 법령 확인 필요",
    title: "대수선 / 리모델링 범위 및 구조·방화 영향 검토",
    plainDescription:
      "주요구조부를 건드리는 공사는 허가 대상, 구조 안전, 방화구획 영향을 함께 검토해야 합니다.",
    triggerConditions: { constructionActions: ["기존 건물 크게 고치기"] },
    legalDomains: ["건축", "구조", "소방"],
    candidateLaws: ["건축법", "건축법 시행령", "건축구조기준"],
    searchKeywords: ["대수선 해당 여부", "리모델링 구조 안전", "방화구획 영향 검토"],
    requiredInputs: ["공사 범위", "철거 범위", "주요구조부 변경 여부"],
    officialSources: ["세움터", "관할 지자체 건축과", "관할 소방서"],
    priority: "필수 검토",
  }),
  issue({
    id: "unknown-construction-action",
    issueType: "법규 충돌 또는 별도 법령 확인 필요",
    title: "건축 행위 구분 확인 필요",
    plainDescription:
      "신축, 증축, 용도변경, 대수선, 리모델링 중 어떤 성격인지 먼저 구분해야 검토 범위를 더 정확히 좁힐 수 있습니다.",
    triggerConditions: { constructionActions: ["잘 모르겠음"] },
    legalDomains: ["건축"],
    candidateLaws: ["건축법", "건축법 시행령"],
    searchKeywords: ["건축 행위 구분", "신축 증축 대수선 용도변경 차이"],
    requiredInputs: ["공사 범위", "면적 증가 여부", "용도 변경 여부", "구조 변경 여부"],
    officialSources: ["관할 지자체 건축과", "세움터", "국가법령정보센터"],
    priority: "추가 확인 필요",
  }),
  issue({
    id: "park-law-review",
    issueType: "법규 충돌 또는 별도 법령 확인 필요",
    title: "공원 관련 별도 법령 검토",
    plainDescription:
      "대지 위치 표현에 공원 관련 키워드가 포함되어 있어 도시공원, 공원시설, 별도 법령 적용 가능성을 함께 확인할 필요가 있습니다.",
    triggerConditions: {
      locationKeywords: ["공원", "역사공원", "도시공원", "문화공원", "기념공원"],
      municipalityKeywords: ["공원"],
    },
    legalDomains: ["공원", "도시계획", "건축"],
    candidateLaws: ["도시공원 및 녹지 등에 관한 법률", "국토의 계획 및 이용에 관한 법률"],
    searchKeywords: ["도시공원 건축 가능 여부", "공원시설 설치 기준"],
    requiredInputs: ["대지 위치", "사업 대상지 성격", "건축물 용도"],
    officialSources: ["토지이음", "관할 지자체 공원녹지과", "국가법령정보센터"],
    priority: "놓치기 쉬운 항목",
  }),
  issue({
    id: "green-zone-culture-conflict",
    issueType: "법규 충돌 또는 별도 법령 확인 필요",
    title: "녹지지역 내 문화·전시시설 가능 여부 검토",
    plainDescription:
      "녹지계열 용도지역과 문화·집회·전시 성격의 용도가 함께 나타나면 용도 허용 여부와 별도 법령 적용 가능성을 함께 검토해야 합니다.",
    triggerConditions: {
      zoningKeywords: ["녹지", "보존녹지", "자연녹지"],
      buildingUseKeywords: ["문화", "집회", "전시", "전시관", "전시장"],
    },
    legalDomains: ["도시계획", "공원", "건축"],
    candidateLaws: ["국토의 계획 및 이용에 관한 법률", "도시공원 및 녹지 등에 관한 법률"],
    searchKeywords: ["자연녹지 문화시설 허용 여부", "전시장 녹지지역 건축 검토"],
    requiredInputs: ["용도지역", "건축물 용도", "대지 위치"],
    officialSources: ["토지이음", "관할 지자체 도시계획과", "관할 지자체 공원녹지과"],
    priority: "놓치기 쉬운 항목",
  }),
];

export function getResultCategory(issueType: IssueType): ResultCategory {
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
    case "문화재 관련 검토":
    case "하천 관련 검토":
    case "학교환경 관련 검토":
    case "산지 / 농지 관련 검토":
      return "특수조건";
    default:
      return "특수조건";
  }
}
