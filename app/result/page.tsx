import Link from "next/link";
import PromptCopyCard from "./prompt-copy-card";

const requiredItems = [
  "건축법",
  "건축법 시행령",
  "국토의 계획 및 이용에 관한 법률",
  "주차장법",
  "소방시설 설치 및 관리에 관한 법률",
  "장애인·노인·임산부 등의 편의증진 보장에 관한 법률",
];

const conditionalItems = [
  "지구단위계획 시행지침",
  "지자체 건축조례",
  "지자체 주차장 조례",
  "경관심의",
  "BF 인증",
  "에너지절약계획서",
];

const overlookedItems = [
  "대지와 도로 관계",
  "대지안의 공지",
  "직통계단",
  "피난거리",
  "방화구획",
  "장애인 주차",
  "장애인 화장실",
  "소방차 진입 동선",
];

const officialSites = [
  { label: "국가법령정보센터", href: "https://www.law.go.kr" },
  { label: "토지이음", href: "https://www.eum.go.kr" },
  { label: "세움터", href: "https://www.eais.go.kr" },
  { label: "건축HUB", href: "https://hub.go.kr" },
];

function ResultCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-panel">
      <div className="mb-5 space-y-2">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <ul className="grid gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

type ResultPageProps = {
  searchParams?: Promise<{
    location?: string;
    buildingUse?: string;
    siteArea?: string;
    totalFloorArea?: string;
    floors?: string;
    constructionAction?: string;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = (await searchParams) ?? {};

  const projectInfo = {
    location: params.location || "미입력",
    buildingUse: params.buildingUse || "미입력",
    siteArea: params.siteArea || "미입력",
    totalFloorArea: params.totalFloorArea || "미입력",
    floors: params.floors || "미입력",
    constructionAction: params.constructionAction || "미입력",
  };

  const promptText = [
    "아래 프로젝트 조건을 기준으로 건축설계 초기 단계에서 검토해야 할 법규 항목을 체크리스트 형식으로 정리해줘.",
    "법적 확정 판단은 하지 말고, 확인이 필요한 항목과 공식 사이트에서 재확인해야 할 항목을 구분해줘.",
    "",
    "[프로젝트 정보]",
    `- 대지 위치: ${projectInfo.location}`,
    `- 건축물 용도: ${projectInfo.buildingUse}`,
    `- 대지면적: ${projectInfo.siteArea}${projectInfo.siteArea === "미입력" ? "" : "㎡"}`,
    `- 연면적: ${projectInfo.totalFloorArea}${projectInfo.totalFloorArea === "미입력" ? "" : "㎡"}`,
    `- 층수: ${projectInfo.floors}${projectInfo.floors === "미입력" ? "" : "층"}`,
    `- 건축 행위: ${projectInfo.constructionAction}`,
  ].join("\n");

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-slate-100 shadow-panel">
          <div className="grid gap-8 px-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-10">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-brand-700">2단계 결과 화면</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                건축 법규 체크리스트
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                입력한 프로젝트 정보를 바탕으로 초기 검토에 필요한 mock
                체크리스트를 정리했습니다. 실제 판단 전에는 공식 사이트와 지자체
                기준을 다시 확인해 주세요.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/check"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                >
                  입력 화면으로 돌아가기
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6">
              <h2 className="text-lg font-bold text-slate-900">프로젝트 요약</h2>
              <dl className="mt-5 grid gap-4 text-sm">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="font-semibold text-slate-500">대지 위치</dt>
                  <dd className="mt-1 text-slate-900">{projectInfo.location}</dd>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <dt className="font-semibold text-slate-500">건축물 용도</dt>
                  <dd className="mt-1 text-slate-900">{projectInfo.buildingUse}</dd>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <dt className="font-semibold text-slate-500">대지면적</dt>
                    <dd className="mt-1 text-slate-900">
                      {projectInfo.siteArea}
                      {projectInfo.siteArea === "미입력" ? "" : "㎡"}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <dt className="font-semibold text-slate-500">연면적</dt>
                    <dd className="mt-1 text-slate-900">
                      {projectInfo.totalFloorArea}
                      {projectInfo.totalFloorArea === "미입력" ? "" : "㎡"}
                    </dd>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <dt className="font-semibold text-slate-500">층수</dt>
                    <dd className="mt-1 text-slate-900">
                      {projectInfo.floors}
                      {projectInfo.floors === "미입력" ? "" : "층"}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <dt className="font-semibold text-slate-500">건축 행위</dt>
                    <dd className="mt-1 text-slate-900">
                      {projectInfo.constructionAction}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <ResultCard
            title="필수 검토 항목"
            description="대부분의 프로젝트에서 우선적으로 확인해야 하는 기본 법령입니다."
            items={requiredItems}
          />
          <ResultCard
            title="조건부 검토 항목"
            description="입지, 규모, 지역 기준에 따라 추가 검토가 필요할 수 있는 항목입니다."
            items={conditionalItems}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <ResultCard
            title="놓치기 쉬운 항목"
            description="초기 설계에서 자주 누락되지만 인허가와 실무에 큰 영향을 주는 체크포인트입니다."
            items={overlookedItems}
          />

          <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-panel">
            <div className="mb-5 space-y-2">
              <h2 className="text-xl font-bold text-slate-900">공식 확인 사이트</h2>
              <p className="text-sm leading-6 text-slate-600">
                법령 원문, 토지이용계획, 인허가 정보는 아래 공식 사이트에서 다시
                확인해 주세요.
              </p>
            </div>
            <div className="grid gap-3">
              {officialSites.map((site) => (
                <a
                  key={site.label}
                  href={site.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-brand-500 hover:bg-brand-50"
                >
                  <span>{site.label}</span>
                  <span className="text-brand-700">바로가기</span>
                </a>
              ))}
            </div>
          </section>
        </div>

        <PromptCopyCard promptText={promptText} />
      </div>
    </main>
  );
}
