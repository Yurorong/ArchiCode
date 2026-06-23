"use client";

import { useState } from "react";

type Props = {
  compact?: boolean;
  promptText: string;
};

export default function PromptCopySection({ compact = false, promptText }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  if (compact) {
    return (
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              AI에게 추가로 물어볼 질문 준비하기
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              현재 결과를 바탕으로 더 확인할 질문이 필요하면 프롬프트를 복사해
              활용하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
            >
              프롬프트 복사
            </button>
            <button
              type="button"
              onClick={() => setShowPreview((current) => !current)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
            >
              {showPreview ? "미리보기 닫기" : "미리보기"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-500">
          {copyState === "copied" && "프롬프트를 클립보드에 복사했습니다."}
          {copyState === "failed" &&
            "브라우저에서 클립보드 복사를 허용하지 않아 복사에 실패했습니다."}
          {copyState === "idle" &&
            "복사한 뒤 GPT나 Gemini에 붙여 넣으면 추가 질문을 정리하는 데 도움이 됩니다."}
        </p>

        {showPreview ? (
          <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
              {promptText}
            </pre>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">
            AI에게 추가로 물어볼 프롬프트
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            현재 결과를 바탕으로 더 확인할 질문을 정리하고 싶을 때 활용할 수
            있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            프롬프트 복사
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((current) => !current)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
          >
            {showPreview ? "미리보기 닫기" : "미리보기"}
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {copyState === "copied" && "프롬프트를 클립보드에 복사했습니다."}
        {copyState === "failed" &&
          "브라우저에서 클립보드 복사를 허용하지 않아 복사에 실패했습니다."}
        {copyState === "idle" &&
          "복사 버튼을 누르면 외부 AI에 바로 붙여 넣을 수 있습니다."}
      </p>

      {showPreview ? (
        <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
            {promptText}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
