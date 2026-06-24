"use client";

import { useState } from "react";

type Props = {
  promptText: string;
};

export default function PromptCopySection({ promptText }: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <section className="surface-card p-5 md:p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
        <div className="space-y-4">
          <p className="section-kicker">AI Follow-up</p>
          <h2 className="font-editorial text-[28px] font-bold text-slate-900">
            결과를 바탕으로 다음 질문 만들기
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            현재 정리된 검토 항목을 바탕으로 AI에게 추가 질문을 요청할 때 사용할
            수 있는 프롬프트입니다. 공식 사이트 재확인이나 지자체 문의 준비에도
            활용할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleCopy} className="solid-button">
              프롬프트 복사
            </button>
            <button
              type="button"
              onClick={() => setShowPreview((current) => !current)}
              className="ghost-button"
            >
              {showPreview ? "미리보기 닫기" : "미리보기"}
            </button>
          </div>
          <p className="helper-text">
            {copyState === "copied" && "프롬프트를 클립보드에 복사했습니다."}
            {copyState === "failed" &&
              "브라우저에서 복사를 허용하지 않아 프롬프트 복사에 실패했습니다."}
            {copyState === "idle" &&
              "복사한 뒤 GPT 또는 Gemini에 붙여 넣어 후속 질문을 정리할 수 있습니다."}
          </p>
        </div>

        {showPreview ? (
          <div className="section-frame p-5">
            <p className="eyebrow-number">Prompt Preview</p>
            <pre className="mt-4 max-h-[360px] overflow-auto whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
              {promptText}
            </pre>
          </div>
        ) : (
          <div className="hairline-grid section-frame p-5">
            <p className="eyebrow-number">Recommended Use</p>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600">
              <p>1. 현재 결과를 복사한 뒤 AI에게 추가 검토 질문 작성을 요청합니다.</p>
              <p>2. 공식 사이트 확인용 질문과 지자체 문의용 질문을 분리해 받을 수 있습니다.</p>
              <p>3. 후속 협의 전에 빠진 쟁점을 정리하는 용도로 사용하면 좋습니다.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
