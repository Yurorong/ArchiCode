import {
  checklistTemplates,
  type BuildingUseGroup,
  type ChecklistCard,
  type ChecklistCardConditions,
  type ChecklistCardTemplate,
  type PublicPrivate,
  type ReviewCategory,
  type YesNoUnknown,
} from "./checklistCards";

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

const unknownValue = "확인 필요";

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
  const normalizeChoice = (value?: string): YesNoUnknown => {
    if (value === "예" || value === "아니오" || value === "잘 모르겠음") {
      return value;
    }

    if (value === "모름") {
      return "잘 모르겠음";
    }

    return "잘 모르겠음";
  };

  return {
    location: params.location || unknownValue,
    municipality: params.municipality || unknownValue,
    buildingUse: params.buildingUse || unknownValue,
    zoningDistrict: params.zoningDistrict || unknownValue,
    useDistrict: params.useDistrict || unknownValue,
    useZone: params.useZone || unknownValue,
    districtUnitPlan: normalizeChoice(params.districtUnitPlan),
    siteArea: params.siteArea || unknownValue,
    totalFloorArea: params.totalFloorArea || unknownValue,
    aboveGroundFloors: params.aboveGroundFloors || unknownValue,
    basementFloors: params.basementFloors || unknownValue,
    buildingHeight: params.buildingHeight || unknownValue,
    publicPrivate: params.publicPrivate === "공공" ? "공공" : "민간",
    constructionAction: params.constructionAction || "잘 모르겠음",
    heritageRelated: normalizeChoice(params.heritageRelated),
    riverRelated: normalizeChoice(params.riverRelated),
    schoolEnvironmentRelated: normalizeChoice(params.schoolEnvironmentRelated),
    mountainRelated: normalizeChoice(params.mountainRelated),
    farmlandRelated: normalizeChoice(params.farmlandRelated),
  };
}

function includesValue<T extends string>(allowed: readonly T[] | undefined, value: T): boolean {
  return !allowed || allowed.includes(value);
}

function parseNumber(value: string) {
  if (value === unknownValue) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function classifyBuildingUse(buildingUse: string): BuildingUseGroup {
  const normalized = buildingUse.replace(/\s/g, "").toLowerCase();

  if (
    ["문화", "집회", "공연", "전시", "박물관", "미술관", "문예"].some((keyword) =>
      normalized.includes(keyword),
    )
  ) {
    return "문화 및 집회시설";
  }

  if (
    ["근린생활", "카페", "음식점", "소매", "판매", "의원", "미용", "학원"].some((keyword) =>
      normalized.includes(keyword),
    )
  ) {
    return "근린생활시설";
  }

  if (["주택", "공동주택", "다가구", "다세대", "오피스텔"].some((keyword) => normalized.includes(keyword))) {
    return "주택";
  }

  if (["업무", "사무", "오피스"].some((keyword) => normalized.includes(keyword))) {
    return "업무시설";
  }

  if (["학교", "교육", "유치원", "어린이집", "연구소"].some((keyword) => normalized.includes(keyword))) {
    return "교육시설";
  }

  if (["숙박", "호텔", "모텔", "생활숙박", "리조트"].some((keyword) => normalized.includes(keyword))) {
    return "숙박시설";
  }

  return "기타";
}

function isBasementProject(projectInfo: ProjectInfo) {
  const basementFloors = parseNumber(projectInfo.basementFloors);
  return basementFloors !== null && basementFloors > 0;
}

function isLargeScaleProject(projectInfo: ProjectInfo) {
  const totalFloorArea = parseNumber(projectInfo.totalFloorArea);
  const aboveGroundFloors = parseNumber(projectInfo.aboveGroundFloors);
  const buildingHeight = parseNumber(projectInfo.buildingHeight);

  return (
    (totalFloorArea !== null && totalFloorArea >= 5000) ||
    (aboveGroundFloors !== null && aboveGroundFloors >= 11) ||
    (buildingHeight !== null && buildingHeight >= 30)
  );
}

function matchesConditions(
  template: ChecklistCardTemplate,
  projectInfo: ProjectInfo,
  buildingUseGroup: BuildingUseGroup,
): boolean {
  const { conditions } = template;

  if (conditions.always) {
    return true;
  }

  return (
    includesValue(conditions.constructionActions, projectInfo.constructionAction) &&
    includesValue(conditions.buildingUseGroups, buildingUseGroup) &&
    includesValue(conditions.districtUnitPlan, projectInfo.districtUnitPlan) &&
    includesValue(conditions.publicPrivate, projectInfo.publicPrivate) &&
    includesValue(conditions.heritageRelated, projectInfo.heritageRelated) &&
    includesValue(conditions.riverRelated, projectInfo.riverRelated) &&
    includesValue(conditions.schoolEnvironmentRelated, projectInfo.schoolEnvironmentRelated) &&
    includesValue(conditions.mountainRelated, projectInfo.mountainRelated) &&
    includesValue(conditions.farmlandRelated, projectInfo.farmlandRelated) &&
    (!conditions.basementRequired || isBasementProject(projectInfo)) &&
    (!conditions.largeScaleBuilding || isLargeScaleProject(projectInfo))
  );
}

function buildAlwaysReason(projectInfo: ProjectInfo) {
  const fragments = [
    `건축물 용도가 “${projectInfo.buildingUse}”으로 입력되었습니다.`,
    `건축 행위가 “${projectInfo.constructionAction}”으로 선택되었습니다.`,
  ];

  if (projectInfo.totalFloorArea !== unknownValue) {
    fragments.push(`연면적은 “${projectInfo.totalFloorArea}㎡”로 입력되었습니다.`);
  }

  if (projectInfo.aboveGroundFloors !== unknownValue) {
    fragments.push(`지상층수는 “${projectInfo.aboveGroundFloors}층”으로 입력되었습니다.`);
  }

  return `기본 공통 검토 항목으로 표시되었습니다. ${fragments.join(" ")}`;
}

function buildReasonFromConditions(
  conditions: ChecklistCardConditions,
  projectInfo: ProjectInfo,
  buildingUseGroup: BuildingUseGroup,
): string {
  const reasons: string[] = [];

  if (conditions.constructionActions?.includes(projectInfo.constructionAction)) {
    reasons.push(`건축 행위가 “${projectInfo.constructionAction}”으로 선택되어 표시되었습니다.`);
  }

  if (conditions.buildingUseGroups?.includes(buildingUseGroup)) {
    reasons.push(`건축물 용도가 “${buildingUseGroup}” 성격으로 판단되어 표시되었습니다.`);
  }

  if (conditions.districtUnitPlan?.includes(projectInfo.districtUnitPlan)) {
    reasons.push(`지구단위계획구역 여부가 “${projectInfo.districtUnitPlan}”로 선택되어 표시되었습니다.`);
  }

  if (conditions.publicPrivate?.includes(projectInfo.publicPrivate)) {
    reasons.push(`공공/민간 구분이 “${projectInfo.publicPrivate}”으로 선택되어 표시되었습니다.`);
  }

  if (conditions.heritageRelated?.includes(projectInfo.heritageRelated)) {
    reasons.push(`문화재 관련 여부가 “${projectInfo.heritageRelated}”로 선택되어 표시되었습니다.`);
  }

  if (conditions.riverRelated?.includes(projectInfo.riverRelated)) {
    reasons.push(`하천 관련 여부가 “${projectInfo.riverRelated}”로 선택되어 표시되었습니다.`);
  }

  if (conditions.schoolEnvironmentRelated?.includes(projectInfo.schoolEnvironmentRelated)) {
    reasons.push(
      `학교환경 관련 여부가 “${projectInfo.schoolEnvironmentRelated}”로 선택되어 표시되었습니다.`,
    );
  }

  if (conditions.mountainRelated?.includes(projectInfo.mountainRelated)) {
    reasons.push(`산지 관련 여부가 “${projectInfo.mountainRelated}”로 선택되어 표시되었습니다.`);
  }

  if (conditions.farmlandRelated?.includes(projectInfo.farmlandRelated)) {
    reasons.push(`농지 관련 여부가 “${projectInfo.farmlandRelated}”로 선택되어 표시되었습니다.`);
  }

  if (conditions.basementRequired && projectInfo.basementFloors !== unknownValue) {
    reasons.push(`지하층수가 “${projectInfo.basementFloors}층”으로 입력되어 표시되었습니다.`);
  }

  if (conditions.largeScaleBuilding) {
    const detail: string[] = [];

    if (projectInfo.totalFloorArea !== unknownValue) {
      detail.push(`연면적 ${projectInfo.totalFloorArea}㎡`);
    }

    if (projectInfo.aboveGroundFloors !== unknownValue) {
      detail.push(`지상 ${projectInfo.aboveGroundFloors}층`);
    }

    if (projectInfo.buildingHeight !== unknownValue) {
      detail.push(`높이 ${projectInfo.buildingHeight}m`);
    }

    reasons.push(
      `${detail.join(", ")} 조건이 대형·고층 건축물 검토 범위에 해당할 가능성이 있어 표시되었습니다.`,
    );
  }

  return reasons.join(" ");
}

function buildAppliedReason(
  template: ChecklistCardTemplate,
  projectInfo: ProjectInfo,
  buildingUseGroup: BuildingUseGroup,
) {
  if (template.conditions.always) {
    return buildAlwaysReason(projectInfo);
  }

  return buildReasonFromConditions(template.conditions, projectInfo, buildingUseGroup);
}

export function generateChecklist(projectInfo: ProjectInfo): ChecklistCard[] {
  const buildingUseGroup = classifyBuildingUse(projectInfo.buildingUse);

  return checklistTemplates
    .filter((template) => matchesConditions(template, projectInfo, buildingUseGroup))
    .map((template) => ({
      id: template.id,
      title: template.title,
      category: template.category,
      description: template.description,
      appliedReason: buildAppliedReason(template, projectInfo, buildingUseGroup),
      relatedLaws: template.relatedLaws,
      checkPoints: template.checkPoints,
      officialSources: template.officialSources,
      searchKeywords: template.searchKeywords,
      warning: template.warning ?? "공식 법령과 인허가권자 확인이 필요합니다.",
    }));
}

export function summarizeChecklist(cards: ChecklistCard[]): Record<ReviewCategory, number> {
  return cards.reduce(
    (summary, card) => {
      summary[card.category] += 1;
      return summary;
    },
    {
      "필수 검토": 0,
      "조건부 검토": 0,
      "추가 확인": 0,
    } satisfies Record<ReviewCategory, number>,
  );
}

export function buildProjectReviewSummary(projectInfo: ProjectInfo) {
  const buildingUseGroup = classifyBuildingUse(projectInfo.buildingUse);
  const fragments = [
    buildingUseGroup === "기타" ? projectInfo.buildingUse : buildingUseGroup,
    projectInfo.constructionAction,
    projectInfo.publicPrivate,
  ];

  if (projectInfo.districtUnitPlan === "예") {
    fragments.push("지구단위계획구역 예");
  } else if (projectInfo.districtUnitPlan === "잘 모르겠음") {
    fragments.push("지구단위계획구역 확인 필요");
  }

  if (projectInfo.heritageRelated === "예") {
    fragments.push("문화재 관련 예");
  }

  if (projectInfo.riverRelated === "예") {
    fragments.push("하천 관련 예");
  }

  if (projectInfo.schoolEnvironmentRelated === "예") {
    fragments.push("학교환경 관련 예");
  }

  if (projectInfo.mountainRelated === "예") {
    fragments.push("산지 관련 예");
  }

  if (projectInfo.farmlandRelated === "예") {
    fragments.push("농지 관련 예");
  }

  return `이 프로젝트는 “${fragments.join(" / ")}” 조건으로 검토되었습니다.`;
}
