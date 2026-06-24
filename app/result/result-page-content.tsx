"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ChecklistDetailCard from "./checklist-detail-card";
import PromptCopySection from "./prompt-copy-section";
import {
  getResultCategory,
  type ChecklistIssue,
  type ResultCategory,
} from "@/src/lib/checklistCards";
import type { ProjectInfo } from "@/src/lib/generateChecklist";

type SummaryCounts = {
  "필수 검토": number;
  "놓치기 쉬운 항목": number;
  "추가 확인 필요": number;
};

type Props = {
  checklist: ChecklistIssue[];
  projectInfo: ProjectInfo;
  promptText: string;
  reviewSummaryText: string;
  summary: SummaryCounts;
};

type FilterValue = "전체" | ResultCategory;

const filterOptions: FilterValue[] = [
  "전체",
  "입지",
  "용도",
  "면적",
  "피난·방화",
  "주차",
  "편의시설",
  "공공건축",
  "조례",
  "특수조건",
];

const sectionLinks = [
  { id: "result-summary", label: "전체 요약" },
  { id: "required-checks", label: "필수 검토" },
  { id: "risk-checks", label: "놓치기 쉬운 항목" },
  { id: "additional-checks", label: "추가 확인 필요" },
  { id: "official-keywords", label: "공식 확인 키워드" },
  { id: "input-summary", label: "입력값 요약" },
] as const;

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
  tone: "brand" | "neutral" | "olive" | "total";
}) {
  const toneClass =
    tone === "brand"
      ? "bg-brand-50/80 border-blue-100"
      : tone === "olive"
        ? "bg-slate-50 border-slate-200"
        : tone === "total"
          ? "bg-white border-slate-200"
          : "bg-white/90 border-slate-200";

  return (
    <div className={`surface-card p-5 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-900">{value}</p>
    </div>
  );
}

function CategorySection({
  id,
  title,
  description,
  count,
  items,
}: {
  id: string;
  title: string;
  description: string;
  count: number;
  items: ChecklistIssue[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section id={id} className="scroll-mt-24 grid gap-5">
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

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildFullResultText(reviewSummaryText: string, checklist: ChecklistIssue[]) {
  return [
    "[검토 결과 요약]",
    reviewSummaryText,
    "",
    ...checklist.map((item, index) =>
      [
        `${index + 1}. ${item.title}`,
        `- 우선순위: ${item.priority}`,
        `- 카테고리: ${getResultCategory(item.issueType)}`,
        `- 쉬운 설명: ${item.plainDescription}`,
        `- 왜 표시되었는지: ${item.triggerReason}`,
        `- 확인해야 할 내용: ${item.checkPoints.join(", ")}`,
        `- 관련 가능 법령: ${item.candidateLaws.join(", ")}`,
        `- 공식 확인처: ${item.officialSources.join(", ")}`,
        `- 검색 키워드: ${item.searchKeywords.join(", ")}`,
        `- 더 정확한 검토를 위해 필요한 정보: ${item.requiredInputs.join(", ")}`,
        `- 주의 문구: ${item.caution}`,
      ].join("\n"),
    ),
  ].join("\n\n");
}

export default function ResultPageContent({
  checklist,
  projectInfo,
  promptText,
  reviewSummaryText,
  summary,
}: Props) {
  const [filter, setFilter] = useState<FilterValue>("전체");
  const [copyState, setCopyState] = useState<"idle" | "all" | "keywords" | "prompt" | "failed">(
    "idle",
  );

  const filteredChecklist = useMemo(() => {
    if (filter === "전체") {
      return checklist;
    }

    return checklist.filter((item) => getResultCategory(item.issueType) === filter);
  }, [checklist, filter]);

  const requiredItems = filteredChecklist.filter((item) => item.priority === "필수 검토");
  const riskItems = filteredChecklist.filter((item) => item.priority === "놓치기 쉬운 항목");
  const additionalItems = filteredChecklist.filter((item) => item.priority === "추가 확인 필요");

  const uniqueKeywords = useMemo(
    () =>
      Array.from(
        new Set(
          filteredChecklist.flatMap((item) =>
            item.searchKeywords.map((keyword) => keyword.trim()).filter(Boolean),
          ),
        ),
      ),
    [filteredChecklist],
  );

  const totalCount = checklist.length;

  const handleCopy = async (mode: "all" | "keywords" | "prompt", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(mode);
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <main className="min-h-screen px-5 py-5 text-slate-900 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8">
        <section id="result-summary" className="surface-card overflow-hidden p-6 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_360px]">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="section-kicker">Review Output</p>
                <h1 className="font-editorial text-4xl font-bold text-slate-900 md:text-5xl">
                  프로젝트 검토 결과
                </h1>
                <p className="max-w-3xl text-base leading-8 text-slate-600">
                  아래 결과는 법적 확정 판단이 아니라, 초기 설계 단계에서 먼저 살펴보면 좋은 검토 순서를 정리한 것입니다.
                </p>
                <div className="section-frame px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">{reviewSummaryText}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleCopy("all", buildFullResultText(reviewSummaryText, filteredChecklist))}
                  className="solid-button"
                >
                  결과 전체 복사
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy("keywords", uniqueKeywords.join("\n"))}
                  className="ghost-button"
                >
                  검색 키워드 전체 복사
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy("prompt", promptText)}
                  className="ghost-button"
                >
                  AI 요약용 프롬프트 복사
                </button>
              </div>

              <p className="helper-text">
                {copyState === "all" && "현재 보이는 결과 항목을 모두 복사했습니다."}
                {copyState === "keywords" && "현재 보이는 검색 키워드를 모두 복사했습니다."}
                {copyState === "prompt" && "AI 요약용 프롬프트를 복사했습니다."}
                {copyState === "failed" && "브라우저에서 복사를 허용하지 않아 복사에 실패했습니다."}
                {copyState === "idle" && "결과 전체, 검색 키워드, AI 요약용 프롬프트를 각각 복사할 수 있습니다."}
              </p>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryStat label="전체 검토 항목" value={totalCount} tone="total" />
                <SummaryStat label="필수 검토" value={summary["필수 검토"]} tone="brand" />
                <SummaryStat
                  label="놓치기 쉬운 항목"
                  value={summary["놓치기 쉬운 항목"]}
                  tone="neutral"
                />
                <SummaryStat
                  label="추가 확인 필요"
                  value={summary["추가 확인 필요"]}
                  tone="olive"
                />
              </div>

              <div className="section-frame px-4 py-4">
                <p className="text-sm font-medium text-slate-700">
                  검토 결과 요약
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  필수 검토 {summary["필수 검토"]}개 / 놓치기 쉬운 항목 {summary["놓치기 쉬운 항목"]}개 / 추가 확인 {summary["추가 확인 필요"]}개
                </p>
                {filter !== "전체" ? (
                  <p className="mt-2 text-xs font-medium text-blue-700">
                    현재 카테고리 필터: {filter}
                  </p>
                ) : null}
              </div>
            </div>

            <aside id="input-summary" className="hairline-grid section-frame flex flex-col justify-between gap-6 p-5">
              <div className="space-y-3">
                <p className="eyebrow-number">입력값 요약</p>
                <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
                  입력값 기반 요약
                </h2>
                <p className="text-sm leading-7 text-slate-600">
                  현재 검토 결과는 아래 입력값을 바탕으로 정리되었습니다.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <ProjectInfoRow label="대지 위치" value={projectInfo.location} />
                <ProjectInfoRow label="지역 / 지자체" value={projectInfo.municipality} />
                <ProjectInfoRow label="건축물 용도" value={projectInfo.buildingUse} />
                <ProjectInfoRow label="건축 행위" value={projectInfo.constructionAction} />
                <ProjectInfoRow label="대지면적" value={formatWithUnit(projectInfo.siteArea, "㎡")} />
                <ProjectInfoRow label="연면적" value={formatWithUnit(projectInfo.totalFloorArea, "㎡")} />
                <ProjectInfoRow
                  label="지상 / 지하"
                  value={`${formatWithUnit(projectInfo.aboveGroundFloors, "층")} / ${formatWithUnit(projectInfo.basementFloors, "층")}`}
                />
                <ProjectInfoRow label="높이" value={formatWithUnit(projectInfo.buildingHeight, "m")} />
                <ProjectInfoRow label="공공 / 민간" value={projectInfo.publicPrivate} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/" className="ghost-button">
                  입력 화면으로 돌아가기
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="surface-card p-5 md:p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="section-kicker">Filter</p>
              <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-slate-900">
                카테고리별 보기
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filterOptions.map((option) => {
                const active = filter === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="xl:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              ["전체 요약", "result-summary"],
              ["필수", "required-checks"],
              ["놓치기 쉬운 항목", "risk-checks"],
              ["추가 확인", "additional-checks"],
              ["검색 키워드", "official-keywords"],
            ].map(([label, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToId(id)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-blue-700"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_180px]">
          <div className="space-y-8">
            <CategorySection
              id="required-checks"
              title="필수 검토"
              description="허가 가능성, 규모 계획, 안전 기준처럼 초기에 먼저 방향을 잡아야 하는 항목입니다."
              count={requiredItems.length}
              items={requiredItems}
            />

            <CategorySection
              id="risk-checks"
              title="놓치기 쉬운 항목"
              description="조건에 따라 적용되며, 초기에 놓치면 평면이나 절차를 다시 조정하게 만들 수 있는 항목입니다."
              count={riskItems.length}
              items={riskItems}
            />

            <CategorySection
              id="additional-checks"
              title="추가 확인 필요"
              description="법규 검토를 더 정밀하게 만들기 위해 함께 확인하면 좋은 보완 검토입니다."
              count={additionalItems.length}
              items={additionalItems}
            />

            <section id="official-keywords" className="scroll-mt-24 surface-card p-5 md:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="section-kicker">Keywords</p>
                  <h2 className="section-title">공식 확인 키워드</h2>
                  <p className="text-sm leading-7 text-slate-600">
                    현재 보이는 결과 카드에서 공식 사이트 확인용 키워드만 모아두었습니다.
                  </p>
                </div>

                <div className="grid gap-3">
                  {uniqueKeywords.map((keyword) => (
                    <div
                      key={keyword}
                      className="section-frame flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <p className="text-sm leading-7 text-slate-700">{keyword}</p>
                      <button
                        type="button"
                        onClick={() => handleCopy("keywords", keyword)}
                        className="ghost-button shrink-0 px-4 py-2"
                      >
                        복사
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <PromptCopySection promptText={promptText} />
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-6">
              <div className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-panel">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  바로가기
                </p>
                <div className="grid gap-1.5">
                  {sectionLinks.map((link) => (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => scrollToId(link.id)}
                      className="rounded-[12px] border border-transparent px-3 py-2 text-left text-[13px] font-medium text-slate-600 transition hover:border-slate-200 hover:bg-slate-50 hover:text-blue-700"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
