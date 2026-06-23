export type ReviewCategory = "필수 검토" | "조건부 검토" | "놓치기 쉬운 항목";
export type YesNoUnknown = "예" | "아니오" | "모름";
export type PublicPrivate = "공공" | "민간";

export type ProjectInfo = {
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

export type ChecklistItem = {
  title: string;
  category: ReviewCategory;
  reason: string;
  laws: string[];
  checks: string[];
  searchKeywords: string[];
};

const cautionText =
  "본 결과는 법적 확정 판단이 아니며, 공식 법령 및 인허가권자 확인이 필요합니다.";

function createItem(item: Omit<ChecklistItem, "searchKeywords"> & { searchKeywords: string[] }) {
  return item;
}

export function getCautionText() {
  return cautionText;
}

export function buildChecklist(projectInfo: ProjectInfo): ChecklistItem[] {
  const items: ChecklistItem[] = [
    createItem({
      title: "지자체 건축조례 및 주차장 조례 확인",
      category: "조건부 검토",
      reason:
        projectInfo.municipality === "미입력"
          ? "지자체가 입력되지 않았지만, 대부분의 프로젝트에서 조례 확인이 필요합니다."
          : `${projectInfo.municipality} 기준 조례가 법정 기준을 보완할 수 있습니다.`,
      laws: ["지자체 건축조례", "지자체 주차장 조례"],
      checks: [
        "허가와 신고 기준, 완화 조항, 부설주차장 설치 기준을 확인합니다.",
        "지역별 부대조건이나 별도 심의 기준이 있는지 검토합니다.",
      ],
      searchKeywords: [
        `${projectInfo.municipality === "미입력" ? "지자체" : projectInfo.municipality} 건축조례`,
        `${projectInfo.municipality === "미입력" ? "지자체" : projectInfo.municipality} 주차장 조례`,
      ],
    }),
  ];

  const actionMap: Record<string, ChecklistItem[]> = {
    신축: [
      createItem({
        title: "대지와 도로 관계 검토",
        category: "필수 검토",
        reason: "신축은 접도 조건과 도로 폭 검토가 인허가 가능성에 직접 영향을 줍니다.",
        laws: ["건축법", "건축법 시행령"],
        checks: [
          "건축 가능한 대지인지와 접하는 도로의 종류 및 폭을 확인합니다.",
          "진입 조건이 충족되는지, 막다른도로나 사도 이슈가 있는지 검토합니다.",
        ],
        searchKeywords: ["건축법 대지와 도로", "건축법 접도요건"],
      }),
      createItem({
        title: "건폐율 및 용적률 검토",
        category: "필수 검토",
        reason:
          projectInfo.zoningDistrict === "미입력"
            ? "신축은 용도지역에 따른 건폐율·용적률 확인이 필요합니다."
            : `${projectInfo.zoningDistrict} 여부에 따라 건폐율과 용적률 상한이 달라집니다.`,
        laws: ["국토의 계획 및 이용에 관한 법률", "건축법"],
        checks: [
          "용도지역 기준에 맞는 건폐율과 용적률 상한을 확인합니다.",
          "조례 완화 또는 중복 제한이 있는지 함께 검토합니다.",
        ],
        searchKeywords: ["용도지역 건폐율 용적률", "국토계획법 용적률"],
      }),
      createItem({
        title: "높이제한 검토",
        category: "조건부 검토",
        reason:
          projectInfo.buildingHeight === "미입력"
            ? "신축은 사선제한, 고도지구, 일조 관련 높이 기준 검토가 필요합니다."
            : `입력된 높이 ${projectInfo.buildingHeight}m 기준으로 높이 제한과 사선 규제를 검토해야 합니다.`,
        laws: ["건축법", "건축법 시행령", "지구단위계획 시행지침"],
        checks: [
          "일조사선, 도로사선, 고도지구 등 높이 관련 제한을 확인합니다.",
          "지구단위계획이나 경관 기준이 추가로 있는지 봅니다.",
        ],
        searchKeywords: ["건축법 높이제한", "일조사선 높이제한"],
      }),
      createItem({
        title: "피난·방화 기준 검토",
        category: "필수 검토",
        reason: "신축은 초기 평면 단계에서 피난과 방화 기준을 함께 검토해야 수정 비용이 줄어듭니다.",
        laws: ["건축법", "건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
        checks: [
          "직통계단, 피난거리, 방화구획, 출구 기준을 검토합니다.",
          "용도와 규모에 따라 소방시설과 피난안전 성능이 달라지는지 확인합니다.",
        ],
        searchKeywords: ["건축법 직통계단", "소방시설 설치 및 관리에 관한 법률 피난"],
      }),
      createItem({
        title: "주차 검토",
        category: "필수 검토",
        reason: "신축은 법정주차대수 확보가 사업성 및 배치 계획에 큰 영향을 줍니다.",
        laws: ["주차장법", "지자체 주차장 조례"],
        checks: [
          "용도와 연면적에 따른 법정주차대수를 산정합니다.",
          "장애인 주차, 진출입 동선, 기계식 주차 허용 여부를 확인합니다.",
        ],
        searchKeywords: ["주차장 조례 법정주차대수", "장애인 주차 설치기준"],
      }),
    ],
    증축: [
      createItem({
        title: "기존 건축물 적법성 검토",
        category: "필수 검토",
        reason: "증축은 기존 건축물의 적법 여부가 선행 검토되지 않으면 후속 절차가 막힐 수 있습니다.",
        laws: ["건축법", "건축물대장 관련 기준"],
        checks: [
          "기존 건축물대장과 현황이 일치하는지 확인합니다.",
          "위반건축물 여부와 기존 허가 범위를 검토합니다.",
        ],
        searchKeywords: ["기존 건축물 적법성 검토", "위반건축물 증축"],
      }),
      createItem({
        title: "증축 가능 면적 검토",
        category: "필수 검토",
        reason: "남아 있는 건폐율과 용적률 여유가 증축 가능 범위를 좌우합니다.",
        laws: ["건축법", "국토의 계획 및 이용에 관한 법률"],
        checks: [
          "기존 연면적과 증축 예정 면적을 합산해 허용 범위를 확인합니다.",
          "주차 및 공개공지 등 부수 기준도 함께 늘어나는지 검토합니다.",
        ],
        searchKeywords: ["증축 가능 면적", "기존 건폐율 용적률 증축"],
      }),
      createItem({
        title: "구조 안전 검토",
        category: "필수 검토",
        reason: "증축은 기존 구조체의 추가 하중 수용 가능 여부를 검토해야 합니다.",
        laws: ["건축법", "건축구조기준"],
        checks: [
          "기존 구조 형식과 증축 계획이 구조 안전성에 미치는 영향을 확인합니다.",
          "필요 시 구조보강 또는 정밀안전진단 필요성을 검토합니다.",
        ],
        searchKeywords: ["증축 구조안전", "건축구조기준 증축"],
      }),
      createItem({
        title: "피난·방화 영향 검토",
        category: "놓치기 쉬운 항목",
        reason: "증축으로 인해 출구 수, 방화구획, 피난거리가 달라질 수 있습니다.",
        laws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
        checks: [
          "증축 후 전체 건축물 기준으로 피난과 방화 요건이 충족되는지 확인합니다.",
          "기존 설비의 증설 또는 변경이 필요한지 봅니다.",
        ],
        searchKeywords: ["증축 피난거리", "증축 방화구획"],
      }),
    ],
    용도변경: [
      createItem({
        title: "용도변경 가능 여부 검토",
        category: "필수 검토",
        reason: "용도지역과 기존 건축물 조건에 따라 허용되는 용도변경 범위가 달라집니다.",
        laws: ["건축법", "국토의 계획 및 이용에 관한 법률"],
        checks: [
          "변경 전후 용도군과 허용 여부를 확인합니다.",
          "용도지역과 지구단위계획에서 제한하는 용도인지 검토합니다.",
        ],
        searchKeywords: ["건축법 용도변경", "용도지역 건축물 용도 제한"],
      }),
      createItem({
        title: "주차대수 변화 검토",
        category: "조건부 검토",
        reason: "용도변경은 법정주차대수 산정 방식이 달라질 수 있습니다.",
        laws: ["주차장법", "지자체 주차장 조례"],
        checks: [
          "변경 후 용도 기준으로 추가 주차 확보가 필요한지 확인합니다.",
          "기존 주차시설의 인정 범위와 완화 조항을 검토합니다.",
        ],
        searchKeywords: ["용도변경 법정주차대수", "주차장 조례 용도변경"],
      }),
      createItem({
        title: "피난·방화 기준 변화 검토",
        category: "필수 검토",
        reason: "용도가 바뀌면 직통계단, 방화구획, 소방설비 기준도 바뀔 수 있습니다.",
        laws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
        checks: [
          "변경 후 용도군 기준으로 피난시설과 방화기준을 다시 적용합니다.",
          "소방시설 추가 설치 여부를 검토합니다.",
        ],
        searchKeywords: ["용도변경 피난기준", "용도변경 소방시설"],
      }),
      createItem({
        title: "장애인 편의시설 영향 검토",
        category: "놓치기 쉬운 항목",
        reason: "용도변경 후 이용자 특성이 달라지면 편의시설 요구 수준이 변할 수 있습니다.",
        laws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
        checks: [
          "장애인 화장실, 출입구, 승강기 등 편의시설 추가 필요성을 확인합니다.",
          "기존 시설이 변경 후 용도 기준을 충족하는지 검토합니다.",
        ],
        searchKeywords: ["용도변경 장애인 편의시설", "BF 인증 용도변경"],
      }),
    ],
    대수선: [
      createItem({
        title: "주요구조부 변경 여부 검토",
        category: "필수 검토",
        reason: "대수선은 주요구조부 해당 여부 판단이 핵심입니다.",
        laws: ["건축법", "건축법 시행령"],
        checks: [
          "기둥, 보, 내력벽, 바닥, 지붕틀 등 주요구조부에 해당하는지 확인합니다.",
          "단순 수선과 대수선의 구분 기준을 검토합니다.",
        ],
        searchKeywords: ["건축법 시행령 대수선", "주요구조부 변경 여부"],
      }),
      createItem({
        title: "허가/신고 대상 여부 검토",
        category: "필수 검토",
        reason: "대수선은 공사 범위에 따라 허가 또는 신고 절차가 달라집니다.",
        laws: ["건축법"],
        checks: [
          "공사 범위와 대상 건축물 규모에 따라 허가인지 신고인지 확인합니다.",
          "부대 절차나 관련 심의가 추가되는지 검토합니다.",
        ],
        searchKeywords: ["대수선 허가 신고", "건축법 대수선 허가"],
      }),
      createItem({
        title: "구조 안전 검토",
        category: "조건부 검토",
        reason: "주요구조부를 손대는 경우 구조 안전성 검토가 필요할 수 있습니다.",
        laws: ["건축법", "건축구조기준"],
        checks: [
          "구조 부재 철거, 보강, 개구부 신설이 안전성에 미치는 영향을 확인합니다.",
          "필요 시 구조계산 또는 검토서를 준비합니다.",
        ],
        searchKeywords: ["대수선 구조안전", "구조계산 대수선"],
      }),
      createItem({
        title: "방화구획 영향 검토",
        category: "놓치기 쉬운 항목",
        reason: "내부 변경으로 방화구획 성능이 저하되기 쉽습니다.",
        laws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
        checks: [
          "벽체 철거와 천장 변경이 방화구획 유지에 영향을 주는지 확인합니다.",
          "관통부 처리와 방화문 설치 기준을 검토합니다.",
        ],
        searchKeywords: ["대수선 방화구획", "방화문 설치 기준"],
      }),
    ],
  };

  items.push(
    ...(actionMap[projectInfo.constructionAction] ?? [
      createItem({
        title: "건축 행위 유형별 인허가 범위 확인",
        category: "필수 검토",
        reason: "선택한 행위 유형이 명확하지 않아 기본적인 허가 범위부터 확인이 필요합니다.",
        laws: ["건축법", "건축법 시행령"],
        checks: [
          "실제 공사 범위가 신축, 증축, 대수선, 용도변경 중 어디에 가까운지 정리합니다.",
          "행위 유형별 허가 또는 신고 절차 차이를 확인합니다.",
        ],
        searchKeywords: ["건축법 건축행위 종류", "허가 신고 건축행위 구분"],
      }),
    ]),
  );

  if (projectInfo.districtUnitPlan === "예") {
    items.push(
      createItem({
        title: "지구단위계획 시행지침 검토",
        category: "조건부 검토",
        reason: "지구단위계획구역으로 입력되어 별도 건축 기준이 적용될 수 있습니다.",
        laws: ["지구단위계획 시행지침", "국토의 계획 및 이용에 관한 법률"],
        checks: [
          "허용 용도, 건축선, 높이, 외관, 공개공지 등 별도 기준을 확인합니다.",
          "지자체 고시문과 세부 시행지침을 함께 검토합니다.",
        ],
        searchKeywords: ["지구단위계획 시행지침 건축물 용도 제한", "지구단위계획 건축선"],
      }),
    );
  }

  if (projectInfo.heritageRelated === "예") {
    items.push(
      createItem({
        title: "문화재보호 관련 검토",
        category: "조건부 검토",
        reason: "문화재 관련 여부가 예로 입력되어 별도 협의 가능성이 있습니다.",
        laws: ["문화재보호법"],
        checks: [
          "현상변경 허가나 주변 영향 검토가 필요한 구역인지 확인합니다.",
          "높이, 외관, 공사 방법에 추가 제한이 있는지 검토합니다.",
        ],
        searchKeywords: ["문화재보호법 현상변경", "문화재 주변 건축 제한"],
      }),
    );
  }

  if (projectInfo.riverRelated === "예") {
    items.push(
      createItem({
        title: "하천구역 및 하천점용 관련 검토",
        category: "조건부 검토",
        reason: "하천 관련 여부가 예로 입력되어 하천구역 중첩 여부 확인이 필요합니다.",
        laws: ["하천법"],
        checks: [
          "하천구역, 하천예정지, 점용허가 대상 여부를 확인합니다.",
          "배수, 우수 처리, 점용 구조물 계획에 제한이 있는지 검토합니다.",
        ],
        searchKeywords: ["하천법 하천점용", "하천구역 건축 제한"],
      }),
    );
  }

  if (projectInfo.schoolEnvironmentRelated === "예") {
    items.push(
      createItem({
        title: "교육환경보호구역 관련 검토",
        category: "조건부 검토",
        reason: "학교환경 관련 여부가 예로 입력되어 교육환경보호구역 여부 확인이 필요합니다.",
        laws: ["교육환경 보호에 관한 법률"],
        checks: [
          "보호구역 내 제한 업종이나 시설 기준에 저촉되는지 확인합니다.",
          "학교 인접 공사에 따른 추가 협의가 필요한지 검토합니다.",
        ],
        searchKeywords: ["교육환경보호구역 건축", "학교환경위생 정화구역"],
      }),
    );
  }

  if (projectInfo.mountainRelated === "예") {
    items.push(
      createItem({
        title: "산지관리 관련 검토",
        category: "조건부 검토",
        reason: "산지 관련 여부가 예로 입력되어 산지전용 또는 형질변경 검토가 필요합니다.",
        laws: ["산지관리법"],
        checks: [
          "산지전용허가 또는 신고 대상인지 확인합니다.",
          "경사도, 입목, 재해 위험과 관련된 제한을 검토합니다.",
        ],
        searchKeywords: ["산지관리법 산지전용", "산지전용허가 건축"],
      }),
    );
  }

  if (projectInfo.farmlandRelated === "예") {
    items.push(
      createItem({
        title: "농지전용 관련 검토",
        category: "조건부 검토",
        reason: "농지 관련 여부가 예로 입력되어 농지전용 가능 여부 확인이 필요합니다.",
        laws: ["농지법"],
        checks: [
          "농지전용허가 또는 협의 대상인지 확인합니다.",
          "농업진흥지역 여부와 전용 부담금 이슈를 검토합니다.",
        ],
        searchKeywords: ["농지법 농지전용", "농업진흥지역 건축"],
      }),
    );
  }

  if (projectInfo.publicPrivate === "공공") {
    items.push(
      createItem({
        title: "공공건축 심의 및 설계공모 검토",
        category: "조건부 검토",
        reason: "공공 프로젝트로 입력되어 공공건축 절차 검토가 필요합니다.",
        laws: ["건축서비스산업 진흥법", "공공건축 설계공모 운영지침"],
        checks: [
          "공공건축 심의 대상 여부와 설계공모 필요성을 확인합니다.",
          "발주 방식과 사업 규모에 따른 행정 절차를 검토합니다.",
        ],
        searchKeywords: ["공공건축 심의", "공공건축 설계공모"],
      }),
      createItem({
        title: "BF 인증 검토",
        category: "조건부 검토",
        reason: "공공 프로젝트는 BF 인증 요구 여부를 초기에 검토하는 편이 안전합니다.",
        laws: ["장애물 없는 생활환경 인증에 관한 규칙"],
        checks: [
          "BF 인증 의무 또는 권장 대상인지 확인합니다.",
          "주출입구, 동선, 화장실, 주차 계획이 인증 기준과 맞는지 검토합니다.",
        ],
        searchKeywords: ["BF 인증 공공건축", "장애물 없는 생활환경 인증"],
      }),
    );
  }

  const aboveGroundFloorCount = Number(projectInfo.aboveGroundFloors || "0");
  const basementFloorCount = Number(projectInfo.basementFloors || "0");

  if (aboveGroundFloorCount >= 5 || basementFloorCount >= 1) {
    items.push(
      createItem({
        title: "직통계단 및 피난거리 상세 검토",
        category: "놓치기 쉬운 항목",
        reason:
          basementFloorCount >= 1
            ? "지하층이 있어 피난계획을 더 보수적으로 검토할 필요가 있습니다."
            : "층수가 높아질수록 직통계단과 피난거리 기준 검토가 중요해집니다.",
        laws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
        checks: [
          "직통계단 수와 위치, 피난층 연결성을 검토합니다.",
          "용도별 허용 피난거리와 복도 구성 기준을 확인합니다.",
        ],
        searchKeywords: ["건축법 시행령 직통계단", "피난거리 기준"],
      }),
    );
  }

  return items;
}

export function parseProjectInfo(params: {
  location?: string;
  municipality?: string;
  buildingUse?: string;
  zoningDistrict?: string;
  useDistrict?: string;
  useZone?: string;
  districtUnitPlan?: string;
  siteArea?: string;
  totalFloorArea?: string;
  aboveGroundFloors?: string;
  basementFloors?: string;
  buildingHeight?: string;
  publicPrivate?: string;
  constructionAction?: string;
  heritageRelated?: string;
  riverRelated?: string;
  schoolEnvironmentRelated?: string;
  mountainRelated?: string;
  farmlandRelated?: string;
}): ProjectInfo {
  const normalizeChoice = (value?: string): YesNoUnknown =>
    value === "예" || value === "아니오" || value === "모름" ? value : "모름";

  return {
    location: params.location || "미입력",
    municipality: params.municipality || "미입력",
    buildingUse: params.buildingUse || "미입력",
    zoningDistrict: params.zoningDistrict || "미입력",
    useDistrict: params.useDistrict || "미입력",
    useZone: params.useZone || "미입력",
    districtUnitPlan: normalizeChoice(params.districtUnitPlan),
    siteArea: params.siteArea || "미입력",
    totalFloorArea: params.totalFloorArea || "미입력",
    aboveGroundFloors: params.aboveGroundFloors || "미입력",
    basementFloors: params.basementFloors || "미입력",
    buildingHeight: params.buildingHeight || "미입력",
    publicPrivate: params.publicPrivate === "공공" ? "공공" : "민간",
    constructionAction: params.constructionAction || "기타 / 잘 모르겠음",
    heritageRelated: normalizeChoice(params.heritageRelated),
    riverRelated: normalizeChoice(params.riverRelated),
    schoolEnvironmentRelated: normalizeChoice(params.schoolEnvironmentRelated),
    mountainRelated: normalizeChoice(params.mountainRelated),
    farmlandRelated: normalizeChoice(params.farmlandRelated),
  };
}
