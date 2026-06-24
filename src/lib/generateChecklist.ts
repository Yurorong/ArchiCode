import {
  checklistIssueTemplates,
  type BuildingUseGroup,
  type ChecklistIssue,
  type ChecklistIssueTemplate,
  type ChecklistPriority,
  type PublicPrivate,
  type TriggerConditions,
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

function containsAnyKeyword(value: string, keywords: readonly string[] | undefined) {
  if (!keywords || keywords.length === 0) {
    return true;
  }

  return keywords.some((keyword) => value.includes(keyword));
}

export function classifyBuildingUse(buildingUse: string): BuildingUseGroup {
  const normalized = buildingUse.replace(/\s/g, "").toLowerCase();

  if (
    ["문화", "집회", "공연", "전시", "박물관", "미술관", "도서관", "문예"].some((keyword) =>
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

  if (
    ["주택", "공동주택", "다가구", "다세대", "오피스텔", "기숙사"].some((keyword) =>
      normalized.includes(keyword),
    )
  ) {
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

function getSearchContext(projectInfo: ProjectInfo) {
  return {
    location: projectInfo.location.replace(/\s/g, ""),
    municipality: projectInfo.municipality.replace(/\s/g, ""),
    zoningDistrict: projectInfo.zoningDistrict.replace(/\s/g, ""),
    useDistrict: projectInfo.useDistrict.replace(/\s/g, ""),
    useZone: projectInfo.useZone.replace(/\s/g, ""),
    buildingUse: projectInfo.buildingUse.replace(/\s/g, ""),
  };
}

function matchesKeywordConditions(
  conditions: TriggerConditions,
  projectInfo: ProjectInfo,
) {
  const context = getSearchContext(projectInfo);

  const locationMatch = containsAnyKeyword(context.location, conditions.locationKeywords);
  const municipalityMatch = containsAnyKeyword(
    context.municipality,
    conditions.municipalityKeywords,
  );
  const zoningMatch = containsAnyKeyword(context.zoningDistrict, conditions.zoningKeywords);
  const useDistrictMatch = containsAnyKeyword(
    context.useDistrict,
    conditions.useDistrictKeywords,
  );
  const useZoneMatch = containsAnyKeyword(context.useZone, conditions.useZoneKeywords);
  const buildingUseMatch = containsAnyKeyword(context.buildingUse, conditions.buildingUseKeywords);

  const hasLocationKeywords = !!conditions.locationKeywords?.length;
  const hasMunicipalityKeywords = !!conditions.municipalityKeywords?.length;
  const hasZoningKeywords = !!conditions.zoningKeywords?.length;
  const hasUseDistrictKeywords = !!conditions.useDistrictKeywords?.length;
  const hasUseZoneKeywords = !!conditions.useZoneKeywords?.length;
  const hasBuildingUseKeywords = !!conditions.buildingUseKeywords?.length;

  return (
    (!hasLocationKeywords || locationMatch) &&
    (!hasMunicipalityKeywords || municipalityMatch) &&
    (!hasZoningKeywords || zoningMatch) &&
    (!hasUseDistrictKeywords || useDistrictMatch) &&
    (!hasUseZoneKeywords || useZoneMatch) &&
    (!hasBuildingUseKeywords || buildingUseMatch)
  );
}

function matchesConditions(
  template: ChecklistIssueTemplate,
  projectInfo: ProjectInfo,
  buildingUseGroup: BuildingUseGroup,
): boolean {
  const { triggerConditions } = template;

  if (triggerConditions.always) {
    return true;
  }

  return (
    includesValue(triggerConditions.constructionActions, projectInfo.constructionAction) &&
    includesValue(triggerConditions.buildingUseGroups, buildingUseGroup) &&
    includesValue(triggerConditions.districtUnitPlan, projectInfo.districtUnitPlan) &&
    includesValue(triggerConditions.publicPrivate, projectInfo.publicPrivate) &&
    includesValue(triggerConditions.heritageRelated, projectInfo.heritageRelated) &&
    includesValue(triggerConditions.riverRelated, projectInfo.riverRelated) &&
    includesValue(
      triggerConditions.schoolEnvironmentRelated,
      projectInfo.schoolEnvironmentRelated,
    ) &&
    includesValue(triggerConditions.mountainRelated, projectInfo.mountainRelated) &&
    includesValue(triggerConditions.farmlandRelated, projectInfo.farmlandRelated) &&
    (!triggerConditions.requireBasement || isBasementProject(projectInfo)) &&
    (!triggerConditions.requireLargeScale || isLargeScaleProject(projectInfo)) &&
    matchesKeywordConditions(triggerConditions, projectInfo)
  );
}

function buildCommonReason(projectInfo: ProjectInfo) {
  const reasons = [
    `건축물 용도가 “${projectInfo.buildingUse}”으로 입력되었습니다.`,
    `건축 행위가 “${projectInfo.constructionAction}”으로 선택되었습니다.`,
  ];

  if (projectInfo.zoningDistrict !== unknownValue) {
    reasons.push(`용도지역은 “${projectInfo.zoningDistrict}”로 입력되었습니다.`);
  }

  return `기본적으로 확인해야 하는 법규 쟁점으로 분류되었습니다. ${reasons.join(" ")}`;
}

function buildTriggerReason(
  conditions: TriggerConditions,
  projectInfo: ProjectInfo,
  buildingUseGroup: BuildingUseGroup,
) {
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

  if (conditions.locationKeywords?.length) {
    reasons.push(`대지 위치 표현에서 관련 키워드가 확인되어 표시되었습니다.`);
  }

  if (conditions.municipalityKeywords?.length) {
    reasons.push(`지역 또는 지자체 표현에서 관련 키워드가 확인되어 표시되었습니다.`);
  }

  if (conditions.zoningKeywords?.length) {
    reasons.push(`용도지역 표현에서 관련 키워드가 확인되어 표시되었습니다.`);
  }

  if (conditions.useDistrictKeywords?.length) {
    reasons.push(`용도지구 표현에서 관련 키워드가 확인되어 표시되었습니다.`);
  }

  if (conditions.useZoneKeywords?.length) {
    reasons.push(`용도구역 표현에서 관련 키워드가 확인되어 표시되었습니다.`);
  }

  if (conditions.buildingUseKeywords?.length) {
    reasons.push(`건축물 용도 표현에서 관련 키워드가 확인되어 표시되었습니다.`);
  }

  if (conditions.requireBasement && projectInfo.basementFloors !== unknownValue) {
    reasons.push(`지하층수가 “${projectInfo.basementFloors}층”으로 입력되어 표시되었습니다.`);
  }

  if (conditions.requireLargeScale) {
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

    if (detail.length > 0) {
      reasons.push(`${detail.join(", ")} 조건이 추가 안전 검토 범위에 들어갈 수 있어 표시되었습니다.`);
    }
  }

  return reasons.join(" ");
}

function buildIssue(
  template: ChecklistIssueTemplate,
  projectInfo: ProjectInfo,
  buildingUseGroup: BuildingUseGroup,
): ChecklistIssue {
  return {
    id: template.id,
    issueType: template.issueType,
    title: template.title,
    plainDescription: template.plainDescription,
    triggerReason: template.triggerConditions.always
      ? buildCommonReason(projectInfo)
      : buildTriggerReason(template.triggerConditions, projectInfo, buildingUseGroup),
    triggerConditions: template.triggerConditions,
    legalDomains: template.legalDomains,
    candidateLaws: template.candidateLaws,
    searchKeywords: template.searchKeywords,
    checkPoints: template.checkPoints ?? template.requiredInputs,
    requiredInputs: template.requiredInputs,
    officialSources: template.officialSources,
    caution: template.caution ?? "공식 법령과 인허가권자 확인이 필요합니다.",
    priority: template.priority,
  };
}

export function generateChecklist(projectInfo: ProjectInfo): ChecklistIssue[] {
  const buildingUseGroup = classifyBuildingUse(projectInfo.buildingUse);

  return checklistIssueTemplates
    .filter((template) => matchesConditions(template, projectInfo, buildingUseGroup))
    .map((template) => buildIssue(template, projectInfo, buildingUseGroup));
}

export function summarizeChecklist(cards: ChecklistIssue[]): Record<ChecklistPriority, number> {
  return cards.reduce(
    (summary, card) => {
      summary[card.priority] += 1;
      return summary;
    },
    {
      "필수 검토": 0,
      "놓치기 쉬운 항목": 0,
      "추가 확인 필요": 0,
    } satisfies Record<ChecklistPriority, number>,
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
