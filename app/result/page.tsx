import Link from "next/link";
import PromptCopyCard from "./prompt-copy-card";
import {
  buildChecklist,
  getCautionText,
  parseProjectInfo,
  type ChecklistItem,
} from "./mock-checklist";

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

function ChecklistDetailCard({ item }: { item: ChecklistItem }) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-panel">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {item.category}
        </span>
        <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
      </div>

      <dl className="mt-5 grid gap-4 text-sm leading-7 text-slate-700">
        <div>
          <dt className="font-semibold text-slate-900">적용 사유</dt>
          <dd>{item.reason}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">관련 법령명</dt>
          <dd>{item.laws.join(", ")}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">확인해야 할 내용</dt>
          <dd>
            <ul className="grid gap-2">
              {item.checks.map((check) => (
                <li key={check} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {check}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">
            공식 사이트에서 검색할 키워드
          </dt>
          <dd>
            <div className="flex flex-wrap gap-2">
              {item.searchKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </dd>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          <dt className="font-semibold">주의 문구</dt>
          <dd>{getCautionText()}</dd>
        </div>
      </dl>
    </article>
  );
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
  const checklist = buildChecklist(projectInfo);

  const promptText = [
    "아래 프로젝트 정보와 체크리스트 항목을 바탕으로 건축설계 초기 단계에서 추가로 확인해야 할 질문을 만들어줘.",
    "법적 확정 판단이나 결론은 하지 말고, 설계자와 인허가 담당자가 다시 검토해야 할 질문 중심으로 정리해줘.",
    "질문은 '추가 검토 질문', '공식 사이트 재확인 질문', '지자체 확인 질문'으로 나누어 작성해줘.",
    "",
    "[프로젝트 정보]",
    `- 대지 위치: ${projectInfo.location}`,
    `- 지역 / 지자체: ${projectInfo.municipality}`,
    `- 건축물 용도: ${projectInfo.buildingUse}`,
    `- 용도지역: ${projectInfo.zoningDistrict}`,
    `- 용도지구: ${projectInfo.useDistrict}`,
    `- 용도구역: ${projectInfo.useZone}`,
    `- 지구단위계획구역 여부: ${projectInfo.districtUnitPlan}`,
    `- 대지면적: ${projectInfo.siteArea}${projectInfo.siteArea === "미입력" ? "" : "㎡"}`,
    `- 연면적: ${projectInfo.totalFloorArea}${projectInfo.totalFloorArea === "미입력" ? "" : "㎡"}`,
    `- 지상층수: ${projectInfo.aboveGroundFloors}${projectInfo.aboveGroundFloors === "미입력" ? "" : "층"}`,
    `- 지하층수: ${projectInfo.basementFloors}${projectInfo.basementFloors === "미입력" ? "" : "층"}`,
    `- 건축물 높이: ${projectInfo.buildingHeight}${projectInfo.buildingHeight === "미입력" ? "" : "m"}`,
    `- 공공 / 민간: ${projectInfo.publicPrivate}`,
    `- 건축 행위: ${projectInfo.constructionAction}`,
    `- 문화재 관련 여부: ${projectInfo.heritageRelated}`,
    `- 하천 관련 여부: ${projectInfo.riverRelated}`,
    `- 학교환경 관련 여부: ${projectInfo.schoolEnvironmentRelated}`,
    `- 산지 관련 여부: ${projectInfo.mountainRelated}`,
    `- 농지 관련 여부: ${projectInfo.farmlandRelated}`,
    "",
    "[생성된 체크리스트 항목]",
    ...checklist.map((item, index) => `${index + 1}. ${item.title}`),
  ].join("\n");

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-slate-100 shadow-panel">
          <div className="grid gap-8 px-8 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-10">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-brand-700">2단계 결과 화면</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                조건분기형 건축 체크리스트
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                입력한 프로젝트 조건을 바탕으로 mock 분기 규칙을 적용해
                체크리스트를 생성했습니다. 실제 판단 전에는 공식 법령과 지자체
                기준을 다시 확인해 주세요.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/check"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                >
                  입력 화면으로 돌아가기
                </Link>
                <div className="inline-flex items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand-700">
                  생성된 체크리스트 {checklist.length}건
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6">
              <h2 className="text-lg font-bold text-slate-900">프로젝트 요약</h2>
              <dl className="mt-5 grid gap-4 text-sm">
                <ProjectInfoRow label="대지 위치" value={projectInfo.location} />
                <ProjectInfoRow
                  label="지역 / 지자체"
                  value={projectInfo.municipality}
                />
                <ProjectInfoRow
                  label="건축물 용도"
                  value={projectInfo.buildingUse}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <ProjectInfoRow
                    label="용도지역"
                    value={projectInfo.zoningDistrict}
                  />
                  <ProjectInfoRow
                    label="지구단위계획구역 여부"
                    value={projectInfo.districtUnitPlan}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <ProjectInfoRow
                    label="대지면적"
                    value={`${projectInfo.siteArea}${projectInfo.siteArea === "미입력" ? "" : "㎡"}`}
                  />
                  <ProjectInfoRow
                    label="연면적"
                    value={`${projectInfo.totalFloorArea}${projectInfo.totalFloorArea === "미입력" ? "" : "㎡"}`}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <ProjectInfoRow
                    label="지상층수"
                    value={`${projectInfo.aboveGroundFloors}${projectInfo.aboveGroundFloors === "미입력" ? "" : "층"}`}
                  />
                  <ProjectInfoRow
                    label="지하층수"
                    value={`${projectInfo.basementFloors}${projectInfo.basementFloors === "미입력" ? "" : "층"}`}
                  />
                  <ProjectInfoRow
                    label="건축물 높이"
                    value={`${projectInfo.buildingHeight}${projectInfo.buildingHeight === "미입력" ? "" : "m"}`}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <ProjectInfoRow
                    label="공공 / 민간"
                    value={projectInfo.publicPrivate}
                  />
                  <ProjectInfoRow
                    label="건축 행위"
                    value={projectInfo.constructionAction}
                  />
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-panel">
          <div className="mb-5 space-y-2">
            <h2 className="text-xl font-bold text-slate-900">특수 조건 요약</h2>
            <p className="text-sm leading-6 text-slate-600">
              추가 협의 가능성이 있는 조건을 한눈에 확인할 수 있도록 정리했습니다.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
              <p className="font-semibold text-slate-500">문화재</p>
              <p className="mt-1 font-semibold text-slate-900">
                {projectInfo.heritageRelated}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
              <p className="font-semibold text-slate-500">하천</p>
              <p className="mt-1 font-semibold text-slate-900">
                {projectInfo.riverRelated}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
              <p className="font-semibold text-slate-500">학교환경</p>
              <p className="mt-1 font-semibold text-slate-900">
                {projectInfo.schoolEnvironmentRelated}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
              <p className="font-semibold text-slate-500">산지</p>
              <p className="mt-1 font-semibold text-slate-900">
                {projectInfo.mountainRelated}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
              <p className="font-semibold text-slate-500">농지</p>
              <p className="mt-1 font-semibold text-slate-900">
                {projectInfo.farmlandRelated}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">생성된 체크리스트</h2>
            <p className="text-sm leading-6 text-slate-600">
              각 항목은 적용 사유와 확인 포인트, 검색 키워드까지 함께 제공합니다.
            </p>
          </div>
          <div className="grid gap-6">
            {checklist.map((item) => (
              <ChecklistDetailCard key={`${item.category}-${item.title}`} item={item} />
            ))}
          </div>
        </section>

        <PromptCopyCard promptText={promptText} />
      </div>
    </main>
  );
}
