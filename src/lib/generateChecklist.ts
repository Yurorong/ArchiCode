import type { ChecklistIssue, ChecklistPriority, PublicPrivate, YesNoUnknown } from "./checklistCards";
import {
  generateLegalIssues,
  normalizeProjectInput,
  type ProjectInfo,
  unknownValue,
} from "./legalIssueEngine";

export type { ProjectInfo } from "./legalIssueEngine";
export { legalIssueEngineSamples, normalizeProjectInput, unknownValue } from "./legalIssueEngine";

export function parseProjectInfo(params: {
  projectName?: string;
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

  const normalizeText = (value?: string) => value?.trim() || unknownValue;
  const normalizePublicPrivate = (value?: string): PublicPrivate =>
    value === "공공" ? "공공" : "민간";

  return {
    projectName: normalizeText(params.projectName),
    location: normalizeText(params.location),
    municipality: normalizeText(params.municipality),
    buildingUse: normalizeText(params.buildingUse),
    zoningDistrict: normalizeText(params.zoningDistrict),
    useDistrict: normalizeText(params.useDistrict),
    useZone: normalizeText(params.useZone),
    districtUnitPlan: normalizeChoice(params.districtUnitPlan),
    siteArea: normalizeText(params.siteArea),
    totalFloorArea: normalizeText(params.totalFloorArea),
    aboveGroundFloors: normalizeText(params.aboveGroundFloors),
    basementFloors: normalizeText(params.basementFloors),
    buildingHeight: normalizeText(params.buildingHeight),
    publicPrivate: normalizePublicPrivate(params.publicPrivate),
    constructionAction: normalizeText(params.constructionAction || "잘 모르겠음"),
    heritageRelated: normalizeChoice(params.heritageRelated),
    riverRelated: normalizeChoice(params.riverRelated),
    schoolEnvironmentRelated: normalizeChoice(params.schoolEnvironmentRelated),
    mountainRelated: normalizeChoice(params.mountainRelated),
    farmlandRelated: normalizeChoice(params.farmlandRelated),
  };
}

export function generateChecklist(projectInfo: ProjectInfo): ChecklistIssue[] {
  return generateLegalIssues(projectInfo);
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
  const normalized = normalizeProjectInput(projectInfo);
  const fragments = [
    normalized.buildingUseGroup === "기타" ? projectInfo.buildingUse : normalized.buildingUseGroup,
    projectInfo.constructionAction,
    projectInfo.publicPrivate,
  ];

  if (normalized.districtUnitPlanStatus === "예") {
    fragments.push("지구단위계획구역");
  } else if (normalized.districtUnitPlanStatus === "잘 모르겠음") {
    fragments.push("지구단위계획 확인 필요");
  }

  if (normalized.matchedKeywords.park.length > 0) {
    fragments.push("공원 관련 표현 감지");
  }

  if (normalized.heritageStatus === "예") {
    fragments.push("문화재 관련");
  }

  if (normalized.riverStatus === "예") {
    fragments.push("하천 관련");
  }

  if (normalized.schoolStatus === "예") {
    fragments.push("학교환경 관련");
  }

  if (normalized.mountainStatus === "예") {
    fragments.push("산지 관련");
  }

  if (normalized.farmlandStatus === "예") {
    fragments.push("농지 관련");
  }

  return `이 프로젝트는 “${fragments.join(" / ")}” 조건으로 검토되었습니다.`;
}
