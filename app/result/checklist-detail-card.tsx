"use client";

import { useState } from "react";
import { getResultCategory, type ChecklistIssue } from "@/src/lib/checklistCards";

const priorityStyles: Record<
  ChecklistIssue["priority"],
  {
    label: string;
    badgeClass: string;
    accentClass: string;
  }
> = {
  "필수 검토": {
    label: "필수 검토",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    accentClass: "border-l-blue-600",
  },
  "놓치기 쉬운 항목": {
    label: "놓치기 쉬운 항목",
    badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
    accentClass: "border-l-slate-500",
  },
  "추가 확인 필요": {
    label: "추가 확인 필요",
    badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
    accentClass: "border-l-slate-400",
  },
};

function CompactList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <ul className="grid gap-1.5 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item} className="rounded-[12px] bg-slate-50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getRelatedLawCandidateItems(item: ChecklistIssue) {
  if (item.relatedLawCandidates && item.relatedLawCandidates.length > 0) {
    return item.relatedLawCandidates.map((candidate) => candidate.lawName);
  }

  if (item.relatedLawSearchFailed) {
    return ["공식 법령 후보를 불러오지 못했습니다. 직접 확인이 필요합니다."];
  }

  return ["검색 결과 기준 후보가 없습니다. 공식 법령 확인 필요"];
}

export default function ChecklistDetailCard({
  item,
}: {
  item: ChecklistIssue;
}) {
  const [open, setOpen] = useState(false);
  const priorityStyle = priorityStyles[item.priority];
  const category = getResultCategory(item.issueType);

  return (
    <article
      className={`rounded-[18px] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)] md:p-5 ${priorityStyle.accentClass} border-l-[3px]`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${priorityStyle.badgeClass}`}
            >
              {priorityStyle.label}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {category}
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-950">
              {item.title}
            </h3>
            <p className="text-sm leading-6 text-slate-600">{item.plainDescription}</p>
          </div>

          <div className="rounded-[14px] border border-slate-200 bg-slate-50/80 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              왜 표시되었나요?
            </p>
            <p className="mt-1.5 text-sm leading-6 text-slate-700">{item.triggerReason}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="ghost-button shrink-0 px-3 py-2 text-sm"
        >
          {open ? "자세히 닫기" : "자세히 보기"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4">
          <CompactList title="확인할 내용" items={item.checkPoints} />
          <CompactList title="관련 법령 후보" items={getRelatedLawCandidateItems(item)} />
          <CompactList title="검색 키워드" items={item.searchKeywords} />
          <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
              주의 문구
            </p>
            <p className="mt-1.5 text-sm leading-6 text-amber-900">{item.caution}</p>
          </div>
        </div>
      ) : null}
    </article>
  );
}
