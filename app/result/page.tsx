import Link from "next/link";
import ChecklistDetailCard from "./checklist-detail-card";
import PromptCopySection from "./prompt-copy-section";
import {
  generateChecklist,
  parseProjectInfo,
  summarizeChecklist,
  type ProjectInfo,
} from "@/src/lib/generateChecklist";
import type { ChecklistCard } from "@/src/lib/checklistCards";

function ProjectInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-900">{value}</dd>
    </div>
  );
}

function formatWithUnit(value: string, unit: string) {
  return value === "확인 필요" ? value : `${value}${unit}`;
}

function buildPromptText(projectInfo: ProjectInfo, checklist: ChecklistCard[]) {
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
      <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
        <div className="mx-auto max-w-3xl">
          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-panel md:p-10">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-brand-700">입력 안내</p>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                입력 정보가 더 필요합니다
              </h1>
              <p className="text-base leading-7 text-slate-600">
                어디에 있는 땅인지와 어떤 건물인지 정도를 입력한 뒤 다시
                시도해 주세요.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
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

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-panel md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-brand-700">검토 결과</p>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                먼저 확인해야 할 항목
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                아래 항목은 법적 확정 판단이 아니라, 초기 검토 단계에서 먼저
                확인해 보면 좋은 내용입니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                >
                  입력 화면으로 돌아가기
                </Link>
              </div>
            </div>

            <div className="grid min-w-[280px] gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-500">필수 검토</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {summary["필수 검토"]}개
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-500">조건부 검토</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {summary["조건부 검토"]}개
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm font-semibold text-slate-500">추가 확인</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {summary["추가 확인"]}개
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-bold text-slate-900">입력한 정보</h2>
            <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-3">
              <ProjectInfoRow label="땅 위치" value={projectInfo.location} />
              <ProjectInfoRow
                label="지자체"
                value={projectInfo.municipality}
              />
              <ProjectInfoRow
                label="건물 종류"
                value={projectInfo.buildingUse}
              />
              <ProjectInfoRow
                label="하려는 일"
                value={projectInfo.constructionAction}
              />
              <ProjectInfoRow
                label="땅 면적"
                value={formatWithUnit(projectInfo.siteArea, "㎡")}
              />
              <ProjectInfoRow
                label="건물 전체 면적"
                value={formatWithUnit(projectInfo.totalFloorArea, "㎡")}
              />
            </dl>
          </div>
        </section>

        <PromptCopySection compact promptText={promptText} />

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              검토 항목 안내
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              먼저 쉬운 설명과 확인할 것부터 보고, 필요할 때만 관련 법령 보기를
              눌러 자세한 내용을 확인해 보세요.
            </p>
          </div>
          <div className="grid gap-6">
            {checklist.map((item) => (
              <ChecklistDetailCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
