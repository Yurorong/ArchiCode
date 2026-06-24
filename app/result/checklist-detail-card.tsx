"use client";

import { useState } from "react";
import type { ChecklistIssue } from "@/src/lib/checklistCards";

const categoryStyles: Record<
  ChecklistIssue["priority"],
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
  "놓치기 쉬운 항목": {
    label: "놓치기 쉬운 항목",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    borderClass: "border-l-[3px] border-l-slate-500",
  },
  "추가 확인 필요": {
    label: "추가 확인 필요",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    borderClass: "border-l-[3px] border-l-slate-400",
  },
};

export default function ChecklistDetailCard({
  item,
}: {
  item: ChecklistIssue;
}) {
  const [open, setOpen] = useState(false);
  const categoryStyle = categoryStyles[item.priority];

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
            <p className="max-w-3xl text-sm leading-7 text-slate-600">{item.plainDescription}</p>
          </div>

          <div className="section-frame px-4 py-4">
            <p className="eyebrow-number">왜 표시되었는지</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{item.triggerReason}</p>
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
              <p className="eyebrow-number">법규 분야</p>
              <h4 className="mt-2 text-base font-semibold text-slate-900">관련 법규 분야</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.legalDomains.map((domain) => (
                  <span
                    key={domain}
                    className="inline-flex items-center border border-[rgba(26,32,37,0.12)] bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </div>

            <div className="section-frame p-5">
              <p className="eyebrow-number">법령 후보</p>
              <h4 className="mt-2 text-base font-semibold text-slate-900">관련 가능성이 있는 법령</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.candidateLaws.map((law) => (
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
              <p className="eyebrow-number">확인 내용</p>
              <h4 className="mt-2 text-base font-semibold text-slate-900">확인해야 할 내용</h4>
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
                <p className="eyebrow-number">추가 정보</p>
                <h4 className="mt-2 text-base font-semibold text-slate-900">
                  더 정확한 검토를 위해 필요한 정보
                </h4>
                <ul className="mt-3 grid gap-2 text-sm leading-7 text-slate-600">
                  {item.requiredInputs.map((requiredInput) => (
                    <li
                      key={requiredInput}
                      className="border-t border-[rgba(26,32,37,0.08)] pt-2 first:border-t-0 first:pt-0"
                    >
                      {requiredInput}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="section-frame p-5">
                <p className="eyebrow-number">검색 키워드</p>
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

              <div className="section-frame p-5">
                <p className="eyebrow-number">확인처</p>
                <h4 className="mt-2 text-base font-semibold text-slate-900">공식 확인처</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.officialSources.map((source) => (
                    <span
                      key={source}
                      className="inline-flex items-center border border-[rgba(26,32,37,0.12)] bg-white px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-amber-300 bg-amber-50 px-5 py-4">
                <p className="eyebrow-number text-amber-700">주의 문구</p>
                <p className="mt-2 text-sm leading-7 text-amber-900">{item.caution}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
