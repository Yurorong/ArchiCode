"use client";

import { useState } from "react";
import type { ChecklistCard } from "@/src/lib/checklistCards";

const categoryStyles: Record<
  ChecklistCard["category"],
  {
    label: string;
    badgeClass: string;
    borderClass: string;
  }
> = {
  "필수 검토": {
    label: "필수 검토",
    badgeClass: "bg-brand-50 text-brand-700 border-blue-100",
    borderClass: "border-l-[3px] border-l-brand-700",
  },
  "조건부 검토": {
    label: "놓치기 쉬운 항목",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    borderClass: "border-l-[3px] border-l-slate-500",
  },
  "추가 확인": {
    label: "추가 확인 항목",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    borderClass: "border-l-[3px] border-l-slate-400",
  },
};

export default function ChecklistDetailCard({
  item,
}: {
  item: ChecklistCard;
}) {
  const [open, setOpen] = useState(false);
  const categoryStyle = categoryStyles[item.category];

  return (
    <article className={`surface-card p-6 md:p-7 ${categoryStyle.borderClass}`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-5">
          <div className="space-y-3">
            <span
              className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${categoryStyle.badgeClass}`}
            >
              {categoryStyle.label}
            </span>
            <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900">
              {item.title}
            </h3>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">{item.description}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {item.quickChecks.map((check) => (
              <div key={check} className="section-frame px-4 py-3">
                <p className="text-sm leading-6 text-slate-700">{check}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="ghost-button shrink-0"
        >
          {open ? "자세히 닫기" : "자세히 보기"}
        </button>
      </div>

      {open ? (
        <div className="mt-6 grid gap-5 border-t muted-divider pt-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="section-frame p-5">
              <p className="eyebrow-number">Why</p>
              <h4 className="mt-2 text-base font-semibold text-slate-900">이 항목이 나온 이유</h4>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.reason}</p>
            </div>

            <div className="section-frame p-5">
              <p className="eyebrow-number">Laws</p>
              <h4 className="mt-2 text-base font-semibold text-slate-900">관련 법령명</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.relatedLaws.map((law) => (
                  <span
                    key={law}
                    className="inline-flex items-center border border-[rgba(26,32,37,0.12)] bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {law}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="section-frame p-5">
              <p className="eyebrow-number">Checkpoints</p>
              <h4 className="mt-2 text-base font-semibold text-slate-900">자세한 확인 사항</h4>
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-slate-600">
                {item.checkPoints.map((checkPoint) => (
                  <li
                    key={checkPoint}
                    className="border-t border-[rgba(26,32,37,0.08)] pt-2 first:border-t-0 first:pt-0"
                  >
                    {checkPoint}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-5">
              <div className="section-frame p-5">
                <p className="eyebrow-number">Search</p>
                <h4 className="mt-2 text-base font-semibold text-slate-900">공식 사이트 검색 키워드</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.searchKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center border border-[rgba(26,32,37,0.12)] bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-amber-300 bg-amber-50 px-5 py-4">
                <p className="eyebrow-number text-amber-700">Caution</p>
                <p className="mt-2 text-sm leading-7 text-amber-900">{item.warning}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
