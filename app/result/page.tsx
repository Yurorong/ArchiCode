import Link from "next/link";
import ResultPageContent from "./result-page-content";
import {
  buildProjectReviewSummary,
  generateChecklist,
  parseProjectInfo,
  summarizeChecklist,
  type ProjectInfo,
} from "@/src/lib/generateChecklist";
import type { ChecklistIssue } from "@/src/lib/checklistCards";

function formatWithUnit(value: string, unit: string) {
  return value === "확인 필요" ? value : `${value}${unit}`;
}

function buildPromptText(projectInfo: ProjectInfo, checklist: ChecklistIssue[]) {
  return [
    "아래 프로젝트 정보와 현재 정리된 검토 항목을 바탕으로, 초기 단계에서 추가로 확인하면 좋은 질문을 만들어줘.",
    "법적 확정 판단은 하지 말고, 실무자가 다음 단계에서 확인할 질문 형태로 정리해줘.",
    "질문은 '추가 확인 질문', '공식 사이트에서 다시 볼 질문', '지자체에 문의할 질문'으로 나눠서 적어줘.",
    "",
    "[프로젝트 정보]",
    `- 대지 위치: ${projectInfo.location}`,
    `- 지역 / 지자체: ${projectInfo.municipality}`,
    `- 어떤 건물인가요: ${projectInfo.buildingUse}`,
    `- 토지이용계획 정보: ${projectInfo.zoningDistrict}, ${projectInfo.useDistrict}, ${projectInfo.useZone}`,
    `- 지구단위계획구역 여부: ${projectInfo.districtUnitPlan}`,
    `- 땅 면적: ${formatWithUnit(projectInfo.siteArea, "㎡")}`,
    `- 건물 전체 면적: ${formatWithUnit(projectInfo.totalFloorArea, "㎡")}`,
    `- 지상층수: ${formatWithUnit(projectInfo.aboveGroundFloors, "층")}`,
    `- 지하층수: ${formatWithUnit(projectInfo.basementFloors, "층")}`,
    `- 높이: ${formatWithUnit(projectInfo.buildingHeight, "m")}`,
    `- 공공 / 민간: ${projectInfo.publicPrivate}`,
    `- 하려는 일: ${projectInfo.constructionAction}`,
    `- 문화재 관련: ${projectInfo.heritageRelated}`,
    `- 하천 관련: ${projectInfo.riverRelated}`,
    `- 학교환경 관련: ${projectInfo.schoolEnvironmentRelated}`,
    `- 산지 관련: ${projectInfo.mountainRelated}`,
    `- 농지 관련: ${projectInfo.farmlandRelated}`,
    "",
    "[현재 정리된 검토 항목]",
    ...checklist.map((item, index) => `${index + 1}. ${item.title}`),
  ].join("\n");
}

type ResultPageProps = {
  searchParams?: Promise<{
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
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = (await searchParams) ?? {};
  const projectInfo = parseProjectInfo(params);

  if (
    projectInfo.location === "확인 필요" &&
    projectInfo.buildingUse === "확인 필요"
  ) {
    return (
      <main className="min-h-screen px-5 py-5 text-slate-900 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">
          <section className="surface-card p-8 md:p-10">
            <div className="space-y-5">
              <p className="section-kicker">Input Required</p>
              <h1 className="font-editorial text-4xl font-bold text-slate-900 md:text-5xl">
                입력 정보가 더 필요합니다
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                어디에 있는 대지인지와 어떤 건물인지 정도를 입력한 뒤 다시 시도해 주세요.
              </p>
              <Link href="/" className="solid-button">
                입력 화면으로 돌아가기
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const checklist = generateChecklist(projectInfo);
  const summary = summarizeChecklist(checklist);
  const promptText = buildPromptText(projectInfo, checklist);
  const reviewSummaryText = buildProjectReviewSummary(projectInfo);

  return (
    <ResultPageContent
      checklist={checklist}
      projectInfo={projectInfo}
      promptText={promptText}
      reviewSummaryText={reviewSummaryText}
      summary={summary}
    />
  );
}
