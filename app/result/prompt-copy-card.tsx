"use client";

import { useState } from "react";

export default function PromptCopyCard({ promptText }: { promptText: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            AI에게 물어볼 프롬프트
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            프로젝트 정보와 실제로 표시된 체크리스트 항목명을 포함한 복사용
            프롬프트입니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
        >
          프롬프트 복사
        </button>
      </div>

      <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
          {promptText}
        </pre>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {copyState === "copied" && "프롬프트를 클립보드에 복사했습니다."}
        {copyState === "failed" &&
          "브라우저에서 클립보드 복사를 허용하지 않아 복사에 실패했습니다."}
        {copyState === "idle" &&
          "복사 버튼을 누르면 AI에게 바로 붙여 넣을 수 있습니다."}
      </p>
    </section>
  );
}
