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
    <div className="section-frame px-4 py-4">
      <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</dt>
      <dd className="mt-2 text-base font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "neutral" | "olive";
}) {
  const toneClass =
    tone === "brand"
      ? "bg-brand-50/80"
      : tone === "olive"
        ? "bg-[#eff3ea]"
        : "bg-white/80";

  return (
    <div className={`surface-card p-5 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-900">{value}</p>
    </div>
  );
}

function CategorySection({
  title,
  description,
  count,
  items,
}: {
  title: string;
  description: string;
  count: number;
  items: ChecklistCard[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 border-b muted-divider pb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h2 className="section-title">{title}</h2>
          <p className="text-sm leading-7 text-slate-600">{description}</p>
        </div>
        <p className="text-sm font-medium text-slate-500">{count}개 항목</p>
      </div>
      <div className="grid gap-5">
        {items.map((item) => (
          <ChecklistDetailCard key={item.id} item={item} />
        ))}
      </div>
    </section>
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
      <main className="min-h-screen px-5 py-5 text-slate-900 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl">
          <section className="surface-card p-8 md:p-10">
            <div className="space-y-5">
              <p className="section-kicker">Input Required</p>
              <h1 className="font-editorial text-4xl font-semibold tracking-[-0.04em] text-slate-900 md:text-5xl">
                입력 정보가 더 필요합니다
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                어디에 있는 대지인지와 어떤 건물인지 정도를 입력한 뒤 다시 시도해
                주세요.
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

  const requiredItems = checklist.filter((item) => item.category === "필수 검토");
  const conditionalItems = checklist.filter((item) => item.category === "조건부 검토");
  const additionalItems = checklist.filter((item) => item.category === "추가 확인");

  return (
    <main className="min-h-screen px-5 py-5 text-slate-900 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8">
        <section className="surface-card overflow-hidden p-6 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_360px]">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="section-kicker">Review Output</p>
                <h1 className="font-editorial text-4xl font-semibold tracking-[-0.04em] text-slate-900 md:text-5xl">
                  프로젝트 검토 결과
                </h1>
                <p className="max-w-3xl text-base leading-8 text-slate-600">
                  아래 결과는 법적 확정 판단이 아니라, 초기 설계 단계에서 먼저
                  살펴보면 좋은 검토 순서를 정리한 것입니다.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <ProjectInfoRow label="대지 위치" value={projectInfo.location} />
                <ProjectInfoRow label="지역 / 지자체" value={projectInfo.municipality} />
                <ProjectInfoRow label="건축물 용도" value={projectInfo.buildingUse} />
                <ProjectInfoRow label="건축 행위" value={projectInfo.constructionAction} />
                <ProjectInfoRow label="대지면적" value={formatWithUnit(projectInfo.siteArea, "㎡")} />
                <ProjectInfoRow
                  label="연면적"
                  value={formatWithUnit(projectInfo.totalFloorArea, "㎡")}
                />
                <ProjectInfoRow
                  label="지상 / 지하"
                  value={`${formatWithUnit(projectInfo.aboveGroundFloors, "층")} / ${formatWithUnit(projectInfo.basementFloors, "층")}`}
                />
                <ProjectInfoRow
                  label="높이"
                  value={formatWithUnit(projectInfo.buildingHeight, "m")}
                />
                <ProjectInfoRow label="공공 / 민간" value={projectInfo.publicPrivate} />
              </div>
            </div>

            <aside className="hairline-grid section-frame flex flex-col justify-between gap-6 p-5">
              <div className="space-y-3">
                <p className="eyebrow-number">Summary</p>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                  검토 결과 요약
                </h2>
                <p className="text-sm leading-7 text-slate-600">
                  필수 검토와 놓치기 쉬운 조건을 먼저 나누어 보고, 이후 세부 카드에서
                  법령과 확인 포인트를 펼쳐 확인할 수 있습니다.
                </p>
              </div>
              <div className="grid gap-4">
                <SummaryStat label="필수 검토" value={summary["필수 검토"]} tone="brand" />
                <SummaryStat
                  label="놓치기 쉬운 항목"
                  value={summary["조건부 검토"]}
                  tone="neutral"
                />
                <SummaryStat
                  label="추가 확인 항목"
                  value={summary["추가 확인"]}
                  tone="olive"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/" className="ghost-button">
                  입력 화면으로 돌아가기
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <PromptCopySection compact promptText={promptText} />

        <CategorySection
          title="필수 검토"
          description="허가 가능성, 규모 계획, 안전 기준처럼 초기에 먼저 방향을 잡아야 하는 항목입니다."
          count={requiredItems.length}
          items={requiredItems}
        />

        <CategorySection
          title="놓치기 쉬운 항목"
          description="조건에 따라 적용되며, 초기에 놓치면 평면이나 절차를 다시 조정하게 만들 수 있는 항목입니다."
          count={conditionalItems.length}
          items={conditionalItems}
        />

        <CategorySection
          title="추가 확인 항목"
          description="법규 검토를 더 정밀하게 만들기 위해 함께 확인하면 좋은 보완 검토입니다."
          count={additionalItems.length}
          items={additionalItems}
        />
      </div>
    </main>
  );
}
