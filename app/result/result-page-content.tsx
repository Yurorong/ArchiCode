"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ChecklistDetailCard from "./checklist-detail-card";
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
  { id: "required-checks", label: "필수 검토" },
  { id: "risk-checks", label: "놓치기 쉬운 항목" },
  { id: "additional-checks", label: "추가 확인" },
  { id: "official-keywords", label: "검색 키워드" },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatValue(value: string, suffix?: string) {
  if (!suffix || value === "확인 필요") {
    return value;
  }

  return `${value}${suffix}`;
}

function buildConditionSummary(projectInfo: ProjectInfo) {
  return [
    projectInfo.buildingUse,
    projectInfo.constructionAction,
    projectInfo.publicPrivate,
    projectInfo.districtUnitPlan === "예"
      ? "지구단위계획구역"
      : projectInfo.districtUnitPlan === "잘 모르겠음"
        ? "지구단위계획 확인 필요"
        : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function buildFullResultText(reviewSummaryText: string, checklist: ChecklistIssue[]) {
  return [
    "[검토 결과]",
    reviewSummaryText,
    "",
    ...checklist.map((item, index) =>
      [
        `${index + 1}. ${item.title}`,
        `- 우선순위: ${item.priority}`,
        `- 카테고리: ${getResultCategory(item.issueType)}`,
        `- 왜 표시되었는지: ${item.triggerReason}`,
        `- 쉬운 설명: ${item.plainDescription}`,
        `- 확인할 내용: ${item.checkPoints.join(", ")}`,
        `- 관련 가능 법령: ${item.candidateLaws.join(", ")}`,
        `- 검색 키워드: ${item.searchKeywords.join(", ")}`,
        `- 주의 문구: ${item.caution}`,
      ].join("\n"),
    ),
  ].join("\n\n");
}

function CategorySection({
  id,
  title,
  count,
  items,
}: {
  id: string;
  title: string;
  count: number;
  items: ChecklistIssue[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">{title}</h2>
        <span className="text-xs font-medium text-slate-500">{count}개</span>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <ChecklistDetailCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
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

  const conditionSummary = buildConditionSummary(projectInfo);

  const handleCopy = async (mode: "all" | "keywords" | "prompt", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(mode);
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <main className="min-h-screen px-4 py-5 text-slate-900 md:px-6 md:py-7">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-5">
        <section id="result-summary" className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Review Result
                </p>
                <h1 className="text-[30px] font-bold tracking-[-0.04em] text-slate-950 md:text-[36px]">
                  검토 결과
                </h1>
                <p className="text-sm leading-6 text-slate-600">{reviewSummaryText}</p>
              </div>

              <Link href="/" className="ghost-button shrink-0">
                입력 화면으로 돌아가기
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                필수 {summary["필수 검토"]}개
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700">
                놓치기 쉬운 항목 {summary["놓치기 쉬운 항목"]}개
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700">
                추가 확인 {summary["추가 확인 필요"]}개
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCopy("all", buildFullResultText(reviewSummaryText, filteredChecklist))}
                className="solid-button px-4 py-2.5 text-sm"
              >
                결과 전체 복사
              </button>
              <button
                type="button"
                onClick={() => handleCopy("keywords", uniqueKeywords.join("\n"))}
                className="ghost-button px-4 py-2.5 text-sm"
              >
                검색 키워드 전체 복사
              </button>
              <button
                type="button"
                onClick={() => handleCopy("prompt", promptText)}
                className="ghost-button px-4 py-2.5 text-sm"
              >
                AI 요약용 프롬프트 복사
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {copyState === "all" && "현재 보이는 결과 항목을 모두 복사했습니다."}
              {copyState === "keywords" && "현재 보이는 검색 키워드를 모두 복사했습니다."}
              {copyState === "prompt" && "AI 요약용 프롬프트를 복사했습니다."}
              {copyState === "failed" && "브라우저에서 복사를 허용하지 않아 복사에 실패했습니다."}
              {copyState === "idle" &&
                "결과 전체, 검색 키워드, AI 요약용 프롬프트를 각각 복사할 수 있습니다."}
            </p>

            <details className="rounded-[16px] border border-slate-200 bg-slate-50/80 px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800">
                검토 조건 보기
              </summary>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  {conditionSummary}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  대지 위치 {projectInfo.location}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  지역/지자체 {projectInfo.municipality}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  대지면적 {formatValue(projectInfo.siteArea, "㎡")}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  연면적 {formatValue(projectInfo.totalFloorArea, "㎡")}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  층수 {formatValue(projectInfo.aboveGroundFloors, "층")} / 지하{" "}
                  {formatValue(projectInfo.basementFloors, "층")}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  높이 {formatValue(projectInfo.buildingHeight, "m")}
                </span>
              </div>
            </details>
          </div>
        </section>

        <div className="xl:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sectionLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToId(link.id)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-blue-700"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const active = filter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_176px]">
          <div className="space-y-6">
            <CategorySection
              id="required-checks"
              title="필수 검토"
              count={requiredItems.length}
              items={requiredItems}
            />

            <CategorySection
              id="risk-checks"
              title="놓치기 쉬운 항목"
              count={riskItems.length}
              items={riskItems}
            />

            <CategorySection
              id="additional-checks"
              title="추가 확인 필요"
              count={additionalItems.length}
              items={additionalItems}
            />

            <section
              id="official-keywords"
              className="scroll-mt-24 rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-5"
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                    검색 키워드 모음
                  </h2>
                  <p className="text-sm text-slate-600">
                    현재 보이는 결과 카드에서 공식 확인에 활용할 키워드를 모았습니다.
                  </p>
                </div>

                <div className="grid gap-2">
                  {uniqueKeywords.map((keyword) => (
                    <div
                      key={keyword}
                      className="flex flex-col gap-2 rounded-[16px] border border-slate-200 bg-slate-50/70 px-3 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <p className="text-sm text-slate-700">{keyword}</p>
                      <button
                        type="button"
                        onClick={() => handleCopy("keywords", keyword)}
                        className="ghost-button shrink-0 px-3 py-2 text-sm"
                      >
                        복사
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-6">
              <nav className="space-y-1 border-l border-slate-200 pl-4">
                {sectionLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => scrollToId(link.id)}
                    className="block w-full py-1 text-left text-sm text-slate-500 transition hover:text-blue-700"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
