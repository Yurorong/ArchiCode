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
      "추가 확인": 0,
    } satisfies Record<ReviewCategory, number>,
  );
}
