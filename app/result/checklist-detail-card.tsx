"use client";

import { useState } from "react";
import type { ChecklistCard } from "@/src/lib/checklistCards";

export default function ChecklistDetailCard({
  item,
}: {
  item: ChecklistCard;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {item.category}
            </span>
            <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
          </div>
          <p className="text-sm leading-7 text-slate-600">{item.description}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
        >
          {open ? "접기" : "자세히 보기"}
        </button>
      </div>

      {open ? (
        <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-5 text-sm leading-7 text-slate-700">
          <div>
            <dt className="font-semibold text-slate-900">적용 사유</dt>
            <dd>{item.reason}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">관련 법령</dt>
            <dd>{item.relatedLaws.join(", ")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">확인해야 할 내용</dt>
            <dd>
              <ul className="grid gap-2">
                {item.checkPoints.map((checkPoint) => (
                  <li
                    key={checkPoint}
                    className="rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    {checkPoint}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-900">검색 키워드</dt>
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
            <dt className="font-semibold">주의</dt>
            <dd>{item.warning}</dd>
          </div>
        </dl>
      ) : null}
    </article>
  );
}
