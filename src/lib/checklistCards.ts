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

export type ChecklistIssue = {
  id: string;
  issueType: IssueType;
  category: ResultCategory;
  title: string;
  description: string;
  plainDescription: string;
  triggerReason: string;
  checkPoints: string[];
  candidateLaws: string[];
  searchKeywords: string[];
  requiredInputs: string[];
  caution: string;
  priority: ChecklistPriority;
};

export const defaultCaution =
  "정확한 법적 판단은 공식 법령과 인허가권자 확인이 필요합니다.";

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
