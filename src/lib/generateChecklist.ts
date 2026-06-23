import {
  checklistCards,
  type ChecklistCard,
  type ChecklistCardConditions,
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

function includesValue<T extends string>(
  allowed: readonly T[] | undefined,
  value: T,
): boolean {
  return !allowed || allowed.includes(value);
}

function matchesConditions(
  conditions: ChecklistCardConditions,
  projectInfo: ProjectInfo,
): boolean {
  if (conditions.always) {
    return true;
  }

  return (
    includesValue(conditions.constructionActions, projectInfo.constructionAction) &&
    includesValue(conditions.districtUnitPlan, projectInfo.districtUnitPlan) &&
    includesValue(conditions.publicPrivate, projectInfo.publicPrivate) &&
    includesValue(conditions.heritageRelated, projectInfo.heritageRelated) &&
    includesValue(conditions.riverRelated, projectInfo.riverRelated) &&
    includesValue(
      conditions.schoolEnvironmentRelated,
      projectInfo.schoolEnvironmentRelated,
    ) &&
    includesValue(conditions.mountainRelated, projectInfo.mountainRelated) &&
    includesValue(conditions.farmlandRelated, projectInfo.farmlandRelated)
  );
}

export function generateChecklist(projectInfo: ProjectInfo): ChecklistCard[] {
  return checklistCards.filter((card) => matchesConditions(card.conditions, projectInfo));
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
      "놓치기 쉬운 항목": 0,
    } satisfies Record<ReviewCategory, number>,
  );
}
