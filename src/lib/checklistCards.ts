export type ReviewCategory = "필수 검토" | "조건부 검토" | "추가 확인";
export type YesNoUnknown = "예" | "아니오" | "잘 모르겠음";
export type PublicPrivate = "공공" | "민간";

export type BuildingUseGroup =
  | "문화 및 집회시설"
  | "근린생활시설"
  | "주택"
  | "업무시설"
  | "교육시설"
  | "숙박시설"
  | "기타";

export type ChecklistCardConditions = {
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
  basementRequired?: boolean;
  largeScaleBuilding?: boolean;
};

export type ChecklistCardTemplate = {
  id: string;
  title: string;
  category: ReviewCategory;
  description: string;
  relatedLaws: string[];
  checkPoints: string[];
  officialSources: string[];
  searchKeywords: string[];
  warning?: string;
  conditions: ChecklistCardConditions;
};

export type ChecklistCard = {
  id: string;
  title: string;
  category: ReviewCategory;
  description: string;
  appliedReason: string;
  relatedLaws: string[];
  checkPoints: string[];
  officialSources: string[];
  searchKeywords: string[];
  warning: string;
};

export const defaultWarning =
  "본 결과는 법적 확정 판단이 아니며, 공식 법령과 인허가권자 확인이 필요합니다.";

const template = (
  input: Omit<ChecklistCardTemplate, "warning"> & {
    warning?: string;
  },
): ChecklistCardTemplate => ({
  ...input,
  warning: input.warning ?? defaultWarning,
});

export const checklistTemplates: ChecklistCardTemplate[] = [
  template({
    id: "building-use-classification",
    title: "건축물 용도분류 확인",
    category: "필수 검토",
    description:
      "입력한 건축물 용도가 법령상 어떤 용도군에 해당하는지 먼저 확인해야 합니다.",
    relatedLaws: ["건축법 시행령", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "입력한 용도가 법령상 정확히 어떤 용도분류에 해당하는지 확인합니다.",
      "용도지역 안에서 허용되는 용도인지 함께 검토합니다.",
    ],
    officialSources: ["국가법령정보센터", "토지이음", "관할 지자체 건축과"],
    searchKeywords: ["건축물 용도분류", "용도지역 허용 용도"],
    conditions: { always: true },
  }),
  template({
    id: "site-road-relationship",
    title: "대지와 도로 관계 확인",
    category: "필수 검토",
    description:
      "대지가 도로와 어떻게 접하는지에 따라 건축 가능 여부와 배치 계획이 달라질 수 있습니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "법에서 정한 도로에 접하는지 확인합니다.",
      "진입 폭, 막다른도로 여부, 소방차 진입 가능성을 함께 검토합니다.",
    ],
    officialSources: ["세움터", "토지이음", "관할 지자체 건축과"],
    searchKeywords: ["건축법 대지와 도로", "접도 요건 확인"],
    conditions: { always: true },
  }),
  template({
    id: "building-coverage-ratio",
    title: "건폐율 검토",
    category: "필수 검토",
    description:
      "대지 위에 건물을 어느 정도까지 배치할 수 있는지 확인해야 기본 규모 판단이 가능합니다.",
    relatedLaws: ["국토의 계획 및 이용에 관한 법률", "지자체 건축조례"],
    checkPoints: [
      "대지의 법정 건폐율을 확인합니다.",
      "조례상 완화 또는 추가 제한이 있는지 함께 검토합니다.",
    ],
    officialSources: ["토지이음", "관할 지자체 건축조례", "관할 지자체 건축과"],
    searchKeywords: ["건폐율 확인", "건축조례 건폐율"],
    conditions: { always: true },
  }),
  template({
    id: "floor-area-ratio",
    title: "용적률 검토",
    category: "필수 검토",
    description:
      "층수와 연면적 계획이 가능한 범위인지 확인하려면 용적률 검토가 필요합니다.",
    relatedLaws: ["국토의 계획 및 이용에 관한 법률", "지자체 건축조례"],
    checkPoints: [
      "대지의 법정 용적률과 조례 기준을 확인합니다.",
      "산입 제외 면적과 완화 기준이 있는지도 함께 검토합니다.",
    ],
    officialSources: ["토지이음", "관할 지자체 건축조례", "관할 지자체 건축과"],
    searchKeywords: ["용적률 확인", "건축조례 용적률"],
    conditions: { always: true },
  }),
  template({
    id: "parking-review",
    title: "주차 검토",
    category: "필수 검토",
    description:
      "건축물 용도와 규모에 따라 필요한 주차대수가 달라지므로 초기 단계에서 함께 확인해야 합니다.",
    relatedLaws: ["주차장법", "지자체 주차장 조례"],
    checkPoints: [
      "건축물 용도와 면적 기준으로 법정 주차대수를 계산합니다.",
      "장애인 주차와 차량 진출입 동선도 함께 검토합니다.",
    ],
    officialSources: ["관할 지자체 주차장 조례", "국가법령정보센터", "관할 지자체 교통부서"],
    searchKeywords: ["법정주차대수", "주차장 조례 검토"],
    conditions: { always: true },
  }),
  template({
    id: "egress-fire-basic",
    title: "피난·방화 기본 검토",
    category: "필수 검토",
    description:
      "계단, 출구, 방화구획 등 기본 안전 기준은 평면 계획과 직접 연결되므로 초기에 확인해야 합니다.",
    relatedLaws: ["건축법", "건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "직통계단, 피난거리, 방화구획 적용 여부를 확인합니다.",
      "용도와 규모에 따라 필요한 소방설비가 달라지는지 검토합니다.",
    ],
    officialSources: ["국가법령정보센터", "관할 소방서", "관할 지자체 건축과"],
    searchKeywords: ["피난 기준", "방화구획 기준", "직통계단 검토"],
    conditions: { always: true },
  }),
  template({
    id: "new-build-permit",
    title: "건축허가 기본 검토",
    category: "필수 검토",
    description:
      "신축은 허가 흐름과 제출 서류, 사전 협의 여부를 먼저 파악해 두는 것이 좋습니다.",
    relatedLaws: ["건축법"],
    checkPoints: [
      "허가 대상인지 신고 대상인지 확인합니다.",
      "지자체별 사전 협의와 제출 서류 요구사항을 검토합니다.",
    ],
    officialSources: ["세움터", "관할 지자체 건축과"],
    searchKeywords: ["신축 허가 절차", "건축허가 제출 서류"],
    conditions: { constructionActions: ["새로 짓기"] },
  }),
  template({
    id: "new-build-open-space",
    title: "대지안의 공지 검토",
    category: "조건부 검토",
    description:
      "신축은 건물 주변에 비워두어야 하는 거리와 유지관리 공간 기준을 함께 확인해야 합니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "건축선과 경계선 이격 기준을 확인합니다.",
      "유지관리와 출입 동선이 가능한지 함께 검토합니다.",
    ],
    officialSources: ["국가법령정보센터", "관할 지자체 건축조례"],
    searchKeywords: ["대지안의 공지", "건축물 이격거리"],
    conditions: { constructionActions: ["새로 짓기"] },
  }),
  template({
    id: "new-build-height-limit",
    title: "높이제한 검토",
    category: "조건부 검토",
    description:
      "신축은 도로 사선, 인접 대지, 지구단위계획 등의 기준으로 높이제한이 달라질 수 있습니다.",
    relatedLaws: ["건축법", "건축법 시행령", "지구단위계획 시행지침"],
    checkPoints: [
      "높이 상한과 사선 제한 여부를 확인합니다.",
      "지구단위계획 또는 조례상 추가 높이기준이 있는지 검토합니다.",
    ],
    officialSources: ["토지이음", "관할 지자체 건축과", "지구단위계획 시행지침"],
    searchKeywords: ["건축법 높이제한", "사선제한 검토"],
    conditions: { constructionActions: ["새로 짓기"] },
  }),
  template({
    id: "new-build-sunlight",
    title: "일조권 검토",
    category: "조건부 검토",
    description:
      "신축은 주변 주거지와 방향에 따라 일조 관련 기준이 적용될 수 있습니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "일조 사선 제한 적용 여부를 확인합니다.",
      "주변 주거지 영향과 민원 가능성도 함께 검토합니다.",
    ],
    officialSources: ["국가법령정보센터", "관할 지자체 건축과"],
    searchKeywords: ["일조권 검토", "일조 사선 제한"],
    conditions: { constructionActions: ["새로 짓기"] },
  }),
  template({
    id: "expansion-legality",
    title: "기존 건축물 적법성 확인",
    category: "필수 검토",
    description:
      "증축 전에는 기존 건축물이 허가 내용과 실제 사용 현황이 일치하는지 확인해야 합니다.",
    relatedLaws: ["건축법"],
    checkPoints: [
      "건축물대장과 실제 현황이 일치하는지 확인합니다.",
      "위반건축물 여부와 기존 허가 범위를 검토합니다.",
    ],
    officialSources: ["세움터", "건축물대장", "관할 지자체 건축과"],
    searchKeywords: ["기존 건축물 적법성", "위반건축물 증축"],
    conditions: { constructionActions: ["기존 건물 넓히기"] },
  }),
  template({
    id: "expansion-area",
    title: "증축 가능 면적 검토",
    category: "필수 검토",
    description:
      "남아 있는 건폐율과 용적률 여유를 확인해야 증축 가능한 범위를 판단할 수 있습니다.",
    relatedLaws: ["건축법", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "현재 면적과 계획 면적을 비교해 증축 여유를 계산합니다.",
      "증축 후 주차와 안전 기준도 함께 재검토합니다.",
    ],
    officialSources: ["세움터", "토지이음", "관할 지자체 건축과"],
    searchKeywords: ["증축 가능 면적", "증축 건폐율 용적률"],
    conditions: { constructionActions: ["기존 건물 넓히기"] },
  }),
  template({
    id: "expansion-structure",
    title: "구조 안전 영향 검토",
    category: "필수 검토",
    description:
      "증축은 기존 구조에 하중이 더해질 수 있어 구조 안전 검토가 중요합니다.",
    relatedLaws: ["건축법", "건축구조기준"],
    checkPoints: [
      "기존 구조 형식과 추가 하중 영향을 검토합니다.",
      "보강 필요 여부와 구조 검토서 필요 여부를 확인합니다.",
    ],
    officialSources: ["구조기술사 검토", "관할 지자체 건축과"],
    searchKeywords: ["증축 구조 안전", "건축구조기준 증축"],
    conditions: { constructionActions: ["기존 건물 넓히기"] },
  }),
  template({
    id: "expansion-egress",
    title: "기존 피난계획 영향 검토",
    category: "조건부 검토",
    description:
      "증축 후 계단, 출구, 피난거리, 소방설비 기준이 달라질 수 있습니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "증축 후 피난거리와 계단 기준을 다시 확인합니다.",
      "소방설비 추가 설치가 필요한지 검토합니다.",
    ],
    officialSources: ["관할 소방서", "관할 지자체 건축과"],
    searchKeywords: ["증축 피난 검토", "증축 방화구획"],
    conditions: { constructionActions: ["기존 건물 넓히기"] },
  }),
  template({
    id: "change-of-use-eligibility",
    title: "용도변경 가능 여부 확인",
    category: "필수 검토",
    description:
      "용도변경은 새로 바꾸려는 용도가 법령과 지역 기준상 허용되는지 먼저 확인해야 합니다.",
    relatedLaws: ["건축법", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "변경하려는 용도가 해당 지역에서 허용되는지 확인합니다.",
      "지자체 조례나 지구단위계획 제한이 있는지도 검토합니다.",
    ],
    officialSources: ["토지이음", "세움터", "관할 지자체 건축과"],
    searchKeywords: ["용도변경 가능 여부", "용도지역 허용 용도"],
    conditions: { constructionActions: ["건물 쓰임 바꾸기"] },
  }),
  template({
    id: "change-of-use-parking",
    title: "주차대수 변화 검토",
    category: "필수 검토",
    description:
      "용도변경은 변경 전후 용도에 따라 필요한 주차대수가 달라질 수 있습니다.",
    relatedLaws: ["주차장법", "지자체 주차장 조례"],
    checkPoints: [
      "변경 전후 용도 기준으로 주차대수를 다시 계산합니다.",
      "기존 주차 공간으로 충족 가능한지 검토합니다.",
    ],
    officialSources: ["관할 지자체 주차장 조례", "관할 지자체 교통부서"],
    searchKeywords: ["용도변경 주차대수", "주차장 조례 용도변경"],
    conditions: { constructionActions: ["건물 쓰임 바꾸기"] },
  }),
  template({
    id: "change-of-use-egress",
    title: "피난·방화 기준 변화 검토",
    category: "필수 검토",
    description:
      "용도변경 후 계단, 출구, 방화구획, 소방설비 기준이 더 강화될 수 있습니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "변경 후 용도에 맞는 피난 기준을 다시 적용합니다.",
      "소방설비 보강이 필요한지 함께 확인합니다.",
    ],
    officialSources: ["관할 소방서", "관할 지자체 건축과"],
    searchKeywords: ["용도변경 피난 기준", "용도변경 소방설비"],
    conditions: { constructionActions: ["건물 쓰임 바꾸기"] },
  }),
  template({
    id: "change-of-use-accessibility",
    title: "장애인 편의시설 영향 검토",
    category: "조건부 검토",
    description:
      "용도변경 후 이용 대상이 달라지면 편의시설과 접근성 기준이 추가될 수 있습니다.",
    relatedLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
    checkPoints: [
      "출입구, 장애인 화장실, 장애인 주차 기준을 다시 검토합니다.",
      "BF 인증 또는 유사 기준 검토 필요 여부를 확인합니다.",
    ],
    officialSources: ["보건복지부 편의시설 기준", "관할 지자체 건축과"],
    searchKeywords: ["용도변경 장애인 편의시설", "BF 인증 검토"],
    conditions: { constructionActions: ["건물 쓰임 바꾸기"] },
  }),
  template({
    id: "major-renovation-structure-part",
    title: "주요구조부 변경 여부 확인",
    category: "필수 검토",
    description:
      "기존 건물을 크게 고치는 경우 주요구조부 변경에 해당하는지 먼저 구분해야 합니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "기둥, 보, 내력벽, 바닥, 지붕 변경 여부를 확인합니다.",
      "단순 보수인지 대수선 범위인지 구분합니다.",
    ],
    officialSources: ["세움터", "관할 지자체 건축과"],
    searchKeywords: ["주요구조부 변경 여부", "대수선 해당 여부"],
    conditions: { constructionActions: ["기존 건물 크게 고치기"] },
  }),
  template({
    id: "major-renovation-permit",
    title: "허가·신고 대상 여부 확인",
    category: "필수 검토",
    description:
      "대수선 또는 리모델링 성격의 공사는 범위에 따라 허가 또는 신고 절차가 달라질 수 있습니다.",
    relatedLaws: ["건축법"],
    checkPoints: [
      "공사 범위에 따라 허가 대상인지 신고 대상인지 확인합니다.",
      "지자체별 추가 협의 또는 제출 서류를 검토합니다.",
    ],
    officialSources: ["세움터", "관할 지자체 건축과"],
    searchKeywords: ["대수선 허가 신고", "리모델링 허가 신고"],
    conditions: { constructionActions: ["기존 건물 크게 고치기"] },
  }),
  template({
    id: "major-renovation-fire",
    title: "방화구획 영향 검토",
    category: "조건부 검토",
    description:
      "내부 벽체나 문을 바꾸는 공사는 방화구획과 방화문 기준에 영향을 줄 수 있습니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "벽체 철거와 평면 변경이 방화구획에 영향을 주는지 확인합니다.",
      "방화문과 마감 기준도 함께 검토합니다.",
    ],
    officialSources: ["관할 소방서", "관할 지자체 건축과"],
    searchKeywords: ["대수선 방화구획", "방화문 설치 기준"],
    conditions: { constructionActions: ["기존 건물 크게 고치기"] },
  }),
  template({
    id: "major-renovation-structural-safety",
    title: "구조 안전 검토",
    category: "조건부 검토",
    description:
      "구조 부재 변경이 포함되면 리모델링 또는 대수선 후 구조 안전 검토가 필요할 수 있습니다.",
    relatedLaws: ["건축법", "건축구조기준"],
    checkPoints: [
      "철거 범위와 보강 범위를 함께 검토합니다.",
      "구조 계산 또는 별도 검토서가 필요한지 확인합니다.",
    ],
    officialSources: ["구조기술사 검토", "관할 지자체 건축과"],
    searchKeywords: ["대수선 구조 안전", "리모델링 구조 안전"],
    conditions: { constructionActions: ["기존 건물 크게 고치기"] },
  }),
  template({
    id: "major-renovation-remodeling-range",
    title: "리모델링 가능 범위 확인",
    category: "추가 확인",
    description:
      "기존 건물을 크게 고치는 계획이 리모델링, 증축, 개축 중 어디에 가까운지 구분이 필요할 수 있습니다.",
    relatedLaws: ["건축법", "주택법"],
    checkPoints: [
      "공사 범위가 리모델링인지 증축 또는 개축인지 구분합니다.",
      "기존 구조 활용 범위와 추가 면적 발생 여부를 함께 확인합니다.",
    ],
    officialSources: ["세움터", "관할 지자체 건축과"],
    searchKeywords: ["리모델링 가능 범위", "증축 개축 구분"],
    conditions: { constructionActions: ["기존 건물 크게 고치기"] },
  }),
  template({
    id: "rebuild-demolition-flow",
    title: "기존 건축물 철거 및 재건축 흐름 확인",
    category: "필수 검토",
    description:
      "기존 건물을 다시 짓는 계획이라면 철거 절차와 재건축 허가 흐름을 함께 검토해야 합니다.",
    relatedLaws: ["건축법", "건설폐기물의 재활용촉진에 관한 법률"],
    checkPoints: [
      "기존 건축물대장과 철거 신고 절차를 확인합니다.",
      "재건축 허가 흐름과 제출 서류를 함께 검토합니다.",
    ],
    officialSources: ["세움터", "관할 지자체 건축과"],
    searchKeywords: ["철거 신고 절차", "재건축 허가 절차"],
    conditions: { constructionActions: ["기존 건물 다시 짓기"] },
  }),
  template({
    id: "rebuild-site-reset",
    title: "재건축 시 대지 조건 재검토",
    category: "조건부 검토",
    description:
      "기존 건물이 있었다고 해도 다시 짓는 경우에는 신축 기준으로 대지 조건을 다시 확인해야 합니다.",
    relatedLaws: ["건축법", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "접도, 건폐율, 용적률, 높이 기준을 재검토합니다.",
      "기존 건물 기준이 아니라 현재 법령 기준을 적용합니다.",
    ],
    officialSources: ["토지이음", "관할 지자체 건축과"],
    searchKeywords: ["재건축 대지 조건", "재건축 건폐율 용적률"],
    conditions: { constructionActions: ["기존 건물 다시 짓기"] },
  }),
  template({
    id: "unknown-construction-action",
    title: "건축 행위 구분 확인 필요",
    category: "추가 확인",
    description:
      "신축, 증축, 용도변경, 대수선, 리모델링 중 어떤 성격인지 먼저 구분해야 필요한 검토 항목을 더 정확히 좁힐 수 있습니다.",
    relatedLaws: ["건축법", "건축법 시행령"],
    checkPoints: [
      "공사 범위가 면적 증가인지, 용도변경인지, 주요구조부 변경인지 확인합니다.",
      "관할 지자체 건축과와 공사 유형을 먼저 상의합니다.",
    ],
    officialSources: ["관할 지자체 건축과", "세움터", "국가법령정보센터"],
    searchKeywords: ["건축 행위 구분", "신축 증축 대수선 용도변경 차이"],
    conditions: { constructionActions: ["잘 모르겠음"] },
  }),
  template({
    id: "culture-assembly-review",
    title: "문화 및 집회시설 피난·방화·소방 강화 검토",
    category: "필수 검토",
    description:
      "문화 및 집회시설은 이용 인원이 많아 피난, 방화, 소방 기준을 더 강하게 보는 편이 좋습니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "재실자 수 산정, 피난 동선, 출구 계획을 검토합니다.",
      "소방설비와 방화구획 강화 필요 여부를 확인합니다.",
    ],
    officialSources: ["관할 소방서", "관할 지자체 건축과"],
    searchKeywords: ["문화 및 집회시설 피난", "집회시설 소방 기준"],
    conditions: { buildingUseGroups: ["문화 및 집회시설"] },
  }),
  template({
    id: "culture-assembly-accessibility",
    title: "문화 및 집회시설 장애인 편의 검토",
    category: "조건부 검토",
    description:
      "다수 이용자가 방문하는 시설은 출입 동선과 편의시설 기준을 더 꼼꼼히 보는 편이 좋습니다.",
    relatedLaws: ["장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
    checkPoints: [
      "출입구, 장애인 화장실, 관람 또는 이용 동선을 검토합니다.",
      "장애인 주차와 안내 체계 기준을 함께 확인합니다.",
    ],
    officialSources: ["보건복지부 편의시설 기준", "관할 지자체 건축과"],
    searchKeywords: ["문화시설 장애인 편의시설", "집회시설 BF 검토"],
    conditions: { buildingUseGroups: ["문화 및 집회시설"] },
  }),
  template({
    id: "neighborhood-use-review",
    title: "근린생활시설 허용 용도 세부 검토",
    category: "조건부 검토",
    description:
      "근린생활시설은 세부 업종에 따라 허용 여부와 주차 기준이 달라질 수 있습니다.",
    relatedLaws: ["건축법 시행령", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "근린생활시설 몇 종에 해당하는지 확인합니다.",
      "세부 업종별 허용 여부와 주차 기준을 함께 검토합니다.",
    ],
    officialSources: ["토지이음", "국가법령정보센터", "관할 지자체 건축과"],
    searchKeywords: ["근린생활시설 허용 용도", "근린생활시설 몇 종"],
    conditions: { buildingUseGroups: ["근린생활시설"] },
  }),
  template({
    id: "housing-review",
    title: "주택 세대수·주차·일조 검토",
    category: "조건부 검토",
    description:
      "주택은 세대수와 주차, 일조, 피난 계획이 함께 얽혀 있어 초기 단계에서 같이 살펴보는 것이 좋습니다.",
    relatedLaws: ["주택법", "건축법", "주차장법"],
    checkPoints: [
      "예상 세대수에 따른 주차 기준을 확인합니다.",
      "일조와 피난 기준을 함께 검토합니다.",
    ],
    officialSources: ["관할 지자체 건축과", "국가법령정보센터"],
    searchKeywords: ["주택 세대수 주차 기준", "주택 일조 피난 검토"],
    conditions: { buildingUseGroups: ["주택"] },
  }),
  template({
    id: "office-review",
    title: "업무시설 주차·에너지·편의 검토",
    category: "조건부 검토",
    description:
      "업무시설은 주차와 피난 외에도 에너지 기준과 접근성 기준을 함께 검토하는 편이 좋습니다.",
    relatedLaws: ["건축물의 에너지절약설계기준", "주차장법", "건축법"],
    checkPoints: [
      "업무시설 면적 기준 주차대수를 확인합니다.",
      "에너지 절약계획서와 장애인 편의시설 검토 필요 여부를 확인합니다.",
    ],
    officialSources: ["국토교통부 고시", "관할 지자체 건축과"],
    searchKeywords: ["업무시설 에너지절약설계기준", "업무시설 주차 기준"],
    conditions: { buildingUseGroups: ["업무시설"] },
  }),
  template({
    id: "education-review",
    title: "교육시설 피난·장애인 편의 검토",
    category: "필수 검토",
    description:
      "교육시설은 학생 이용 특성상 피난 계획과 편의시설 기준을 특히 조심해서 검토해야 합니다.",
    relatedLaws: ["건축법", "장애인·노인·임산부 등의 편의증진 보장에 관한 법률"],
    checkPoints: [
      "학생 수와 이용 동선을 고려한 피난 계획을 검토합니다.",
      "장애인 편의시설 기준을 함께 확인합니다.",
    ],
    officialSources: ["교육청", "관할 지자체 건축과", "관할 소방서"],
    searchKeywords: ["교육시설 피난 기준", "교육시설 장애인 편의시설"],
    conditions: { buildingUseGroups: ["교육시설"] },
  }),
  template({
    id: "lodging-review",
    title: "숙박시설 피난·방화·소방 강화 검토",
    category: "필수 검토",
    description:
      "숙박시설은 다수 이용자와 야간 이용 특성 때문에 피난과 방화, 소방 기준을 더 엄격하게 검토해야 합니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "피난거리, 계단, 출구 계획을 검토합니다.",
      "방화구획과 소방설비 강화 필요 여부를 확인합니다.",
    ],
    officialSources: ["관할 소방서", "관할 지자체 건축과"],
    searchKeywords: ["숙박시설 피난 기준", "숙박시설 소방 기준"],
    conditions: { buildingUseGroups: ["숙박시설"] },
  }),
  template({
    id: "district-unit-plan-guideline",
    title: "지구단위계획 시행지침 검토",
    category: "조건부 검토",
    description:
      "지구단위계획구역은 일반 법령 외에 별도 시행지침이 있을 수 있어 추가 확인이 필요합니다.",
    relatedLaws: ["지구단위계획 시행지침", "국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "허용 용도, 높이, 배치, 공개공지 기준을 확인합니다.",
      "지자체 고시문과 세부 시행지침을 함께 검토합니다.",
    ],
    officialSources: ["토지이음", "관할 지자체 도시계획과", "지구단위계획 시행지침"],
    searchKeywords: ["지구단위계획 시행지침", "지구단위계획 건축 기준"],
    conditions: { districtUnitPlan: ["예"] },
  }),
  template({
    id: "district-unit-plan-unknown",
    title: "토지이음에서 지구단위계획구역 여부 확인 필요",
    category: "추가 확인",
    description:
      "지구단위계획구역 여부를 아직 모르면 토지이음에서 먼저 확인한 뒤 결과를 보완하는 것이 좋습니다.",
    relatedLaws: ["국토의 계획 및 이용에 관한 법률"],
    checkPoints: [
      "토지이음에서 지구단위계획구역 여부를 확인합니다.",
      "해당 시 지구단위계획 시행지침을 함께 확인합니다.",
    ],
    officialSources: ["토지이음", "관할 지자체 도시계획과"],
    searchKeywords: ["토지이음 지구단위계획구역 확인", "지구단위계획 시행지침"],
    conditions: { districtUnitPlan: ["잘 모르겠음"] },
  }),
  template({
    id: "heritage-review",
    title: "문화재보호 관련 검토",
    category: "조건부 검토",
    description:
      "문화재 주변이라면 높이, 외관, 공사 방식에 추가 기준과 협의가 필요할 수 있습니다.",
    relatedLaws: ["문화재보호법"],
    checkPoints: [
      "영향 범위 안에 들어가는지 확인합니다.",
      "현상변경 허가나 별도 협의가 필요한지 검토합니다.",
    ],
    officialSources: ["국가유산청", "관할 지자체 문화재부서"],
    searchKeywords: ["문화재보호법 현상변경", "문화재 주변 건축 제한"],
    conditions: { heritageRelated: ["예"] },
  }),
  template({
    id: "heritage-unknown",
    title: "문화재 관련 여부 확인 필요",
    category: "추가 확인",
    description:
      "문화재 영향 범위에 들어가는지 아직 모르면 국가유산 관련 지도나 지자체 확인이 필요합니다.",
    relatedLaws: ["문화재보호법"],
    checkPoints: [
      "국가유산 관련 지도나 관할 부서에서 영향 범위를 확인합니다.",
      "해당 시 문화재 협의 절차를 검토합니다.",
    ],
    officialSources: ["국가유산청", "관할 지자체 문화재부서"],
    searchKeywords: ["문화재 영향 범위 확인", "문화재 주변 건축 협의"],
    conditions: { heritageRelated: ["잘 모르겠음"] },
  }),
  template({
    id: "river-review",
    title: "하천구역 및 하천점용 검토",
    category: "조건부 검토",
    description:
      "하천 주변이라면 점용, 배수, 구조물 설치에 별도 기준이 적용될 수 있습니다.",
    relatedLaws: ["하천법"],
    checkPoints: [
      "하천구역 또는 인접 구역에 해당하는지 확인합니다.",
      "하천점용 허가 대상과 배수 계획을 검토합니다.",
    ],
    officialSources: ["국가법령정보센터", "관할 하천관리청"],
    searchKeywords: ["하천구역 건축 제한", "하천점용 허가"],
    conditions: { riverRelated: ["예"] },
  }),
  template({
    id: "river-unknown",
    title: "하천 관련 여부 확인 필요",
    category: "추가 확인",
    description:
      "하천 인접 여부가 불분명하면 토지이음과 지자체 하천관리부서에서 먼저 확인하는 것이 좋습니다.",
    relatedLaws: ["하천법"],
    checkPoints: [
      "토지이음 또는 지자체 하천도면에서 인접 여부를 확인합니다.",
      "하천점용 가능성도 함께 검토합니다.",
    ],
    officialSources: ["토지이음", "관할 하천관리청"],
    searchKeywords: ["하천 관련 여부 확인", "하천점용 검토"],
    conditions: { riverRelated: ["잘 모르겠음"] },
  }),
  template({
    id: "school-environment-review",
    title: "교육환경보호구역 검토",
    category: "조건부 검토",
    description:
      "학교 주변이라면 교육환경보호구역 여부와 건축물 용도 제한을 함께 확인해야 합니다.",
    relatedLaws: ["교육환경 보호에 관한 법률"],
    checkPoints: [
      "교육환경보호구역 해당 여부를 확인합니다.",
      "해당 용도가 허용되는지 또는 별도 심의가 필요한지 검토합니다.",
    ],
    officialSources: ["교육지원청", "교육환경정보시스템", "관할 지자체 건축과"],
    searchKeywords: ["교육환경보호구역 검토", "학교 주변 건축 제한"],
    conditions: { schoolEnvironmentRelated: ["예"] },
  }),
  template({
    id: "school-environment-unknown",
    title: "학교환경 관련 여부 확인 필요",
    category: "추가 확인",
    description:
      "학교 인접 여부가 불분명하면 교육환경보호구역 여부부터 확인한 뒤 결과를 보완하는 것이 좋습니다.",
    relatedLaws: ["교육환경 보호에 관한 법률"],
    checkPoints: [
      "교육환경보호구역 해당 여부를 확인합니다.",
      "해당 시 용도 제한과 협의 필요 여부를 검토합니다.",
    ],
    officialSources: ["교육지원청", "교육환경정보시스템"],
    searchKeywords: ["교육환경보호구역 확인", "학교 주변 건축 제한"],
    conditions: { schoolEnvironmentRelated: ["잘 모르겠음"] },
  }),
  template({
    id: "mountain-review",
    title: "산지관리 및 산지전용 검토",
    category: "조건부 검토",
    description:
      "산지 관련 여부가 있으면 일반 대지와 다른 전용 절차와 안전 검토가 필요할 수 있습니다.",
    relatedLaws: ["산지관리법"],
    checkPoints: [
      "산지전용 허가 또는 신고 대상인지 확인합니다.",
      "경사도와 재해위험 요소를 함께 검토합니다.",
    ],
    officialSources: ["산림청", "관할 지자체 산지관리부서"],
    searchKeywords: ["산지전용 허가", "산지관리법 건축"],
    conditions: { mountainRelated: ["예"] },
  }),
  template({
    id: "mountain-unknown",
    title: "산지 관련 여부 확인 필요",
    category: "추가 확인",
    description:
      "산지 여부가 분명하지 않으면 토지이음과 산지 관련 도면을 먼저 확인하는 것이 좋습니다.",
    relatedLaws: ["산지관리법"],
    checkPoints: [
      "산지 여부와 전용 필요성을 먼저 확인합니다.",
      "해당 시 산지전용 절차를 검토합니다.",
    ],
    officialSources: ["토지이음", "산림청", "관할 지자체 산지관리부서"],
    searchKeywords: ["산지 여부 확인", "산지전용 검토"],
    conditions: { mountainRelated: ["잘 모르겠음"] },
  }),
  template({
    id: "farmland-review",
    title: "농지전용 검토",
    category: "조건부 검토",
    description:
      "농지 관련 여부가 있으면 건축 전 농지전용 가능 여부와 별도 부담금 검토가 필요할 수 있습니다.",
    relatedLaws: ["농지법"],
    checkPoints: [
      "농지전용 허가 또는 협의 대상인지 확인합니다.",
      "농업진흥지역 여부와 부담금 가능성을 검토합니다.",
    ],
    officialSources: ["농림축산식품부", "관할 지자체 농지부서"],
    searchKeywords: ["농지전용 검토", "농지법 건축"],
    conditions: { farmlandRelated: ["예"] },
  }),
  template({
    id: "farmland-unknown",
    title: "농지 관련 여부 확인 필요",
    category: "추가 확인",
    description:
      "농지 여부가 분명하지 않으면 토지이음과 농지 관련 부서 확인이 선행되는 것이 좋습니다.",
    relatedLaws: ["농지법"],
    checkPoints: [
      "농지 여부와 농업진흥지역 해당 여부를 확인합니다.",
      "해당 시 농지전용 절차를 검토합니다.",
    ],
    officialSources: ["토지이음", "관할 지자체 농지부서"],
    searchKeywords: ["농지 여부 확인", "농지전용 허가"],
    conditions: { farmlandRelated: ["잘 모르겠음"] },
  }),
  template({
    id: "public-architecture-review",
    title: "공공건축 심의 검토",
    category: "조건부 검토",
    description:
      "공공 프로젝트는 일반 민간 사업과 별도로 공공건축 심의 대상인지 먼저 확인할 필요가 있습니다.",
    relatedLaws: ["건축서비스산업 진흥법"],
    checkPoints: [
      "공공건축 심의 대상인지 확인합니다.",
      "사업 규모와 발주 방식에 따른 추가 절차를 검토합니다.",
    ],
    officialSources: ["공공건축지원센터", "관할 발주기관", "관할 지자체 건축과"],
    searchKeywords: ["공공건축 심의", "건축서비스산업 진흥법 공공건축"],
    conditions: { publicPrivate: ["공공"] },
  }),
  template({
    id: "public-design-competition",
    title: "설계공모 검토",
    category: "조건부 검토",
    description:
      "공공 프로젝트는 설계공모 대상인지 여부가 전체 일정과 발주 방식에 영향을 줄 수 있습니다.",
    relatedLaws: ["공공건축 설계공모 운영지침"],
    checkPoints: [
      "설계공모 대상 여부와 예외 사유를 확인합니다.",
      "공모가 아니라면 다른 발주 방식 기준을 검토합니다.",
    ],
    officialSources: ["공공건축지원센터", "발주기관", "관할 지자체"],
    searchKeywords: ["공공건축 설계공모", "설계공모 운영지침"],
    conditions: { publicPrivate: ["공공"] },
  }),
  template({
    id: "public-bf-review",
    title: "BF 인증 검토",
    category: "추가 확인",
    description:
      "공공 프로젝트는 장애물 없는 생활환경 기준을 초기 단계부터 함께 검토하는 것이 좋습니다.",
    relatedLaws: ["장애물 없는 생활환경 인증에 관한 규칙"],
    checkPoints: [
      "BF 인증 대상인지 권장 대상인지 확인합니다.",
      "출입구, 화장실, 주차, 이동 동선을 함께 검토합니다.",
    ],
    officialSources: ["BF 인증기관", "관할 발주기관", "보건복지부 기준"],
    searchKeywords: ["BF 인증 공공건축", "장애물 없는 생활환경 인증"],
    conditions: { publicPrivate: ["공공"] },
  }),
  template({
    id: "basement-review",
    title: "지하층 피난·배연 검토",
    category: "조건부 검토",
    description:
      "지하층이 있으면 피난, 배연, 방화 계획을 별도로 더 확인하는 편이 좋습니다.",
    relatedLaws: ["건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "지하층 피난 동선과 계단 계획을 검토합니다.",
      "배연과 제연 설비 기준을 함께 확인합니다.",
    ],
    officialSources: ["관할 소방서", "관할 지자체 건축과"],
    searchKeywords: ["지하층 피난 기준", "지하층 배연 기준"],
    conditions: { basementRequired: true },
  }),
  template({
    id: "large-scale-review",
    title: "대형·고층 건축물 추가 안전 검토",
    category: "조건부 검토",
    description:
      "연면적, 층수, 높이가 큰 건축물은 피난과 소방, 구조 검토를 더 강화해서 보는 것이 좋습니다.",
    relatedLaws: ["건축법", "건축법 시행령", "소방시설 설치 및 관리에 관한 법률"],
    checkPoints: [
      "고층 또는 대형 건축물 기준에 해당하는지 확인합니다.",
      "피난, 소방, 구조 검토 범위가 추가되는지 함께 검토합니다.",
    ],
    officialSources: ["관할 소방서", "관할 지자체 건축과", "구조기술사 검토"],
    searchKeywords: ["고층 건축물 피난 기준", "대형 건축물 소방 검토"],
    conditions: { largeScaleBuilding: true },
  }),
];
