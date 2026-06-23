"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const actionOptions = ["신축", "증축", "용도변경"] as const;

type FormState = {
  location: string;
  buildingUse: string;
  siteArea: string;
  totalFloorArea: string;
  floors: string;
  constructionAction: (typeof actionOptions)[number];
};

const initialForm: FormState = {
  location: "",
  buildingUse: "",
  siteArea: "",
  totalFloorArea: "",
  floors: "",
  constructionAction: "신축",
};

export default function CheckPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams({
      location: form.location,
      buildingUse: form.buildingUse,
      siteArea: form.siteArea,
      totalFloorArea: form.totalFloorArea,
      floors: form.floors,
      constructionAction: form.constructionAction,
    });

    router.push(`/result?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-panel md:p-10">
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold text-brand-700">1단계 입력 화면</p>
            <h1 className="text-3xl font-bold">건축 정보 입력</h1>
            <p className="text-base leading-7 text-slate-600">
              프로젝트 기본 정보를 입력하면 다음 단계에서 mock 데이터 기반의
              건축 법규 체크리스트를 확인할 수 있습니다.
            </p>
          </div>

          <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">대지 위치</span>
              <input
                type="text"
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                placeholder="예: 서울특별시 종로구 청운동"
                className="input-field"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                건축물 용도
              </span>
              <input
                type="text"
                value={form.buildingUse}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    buildingUse: event.target.value,
                  }))
                }
                placeholder="예: 제2종 근린생활시설"
                className="input-field"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">대지면적</span>
              <input
                type="number"
                min="0"
                value={form.siteArea}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    siteArea: event.target.value,
                  }))
                }
                placeholder="예: 350"
                className="input-field"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">연면적</span>
              <input
                type="number"
                min="0"
                value={form.totalFloorArea}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    totalFloorArea: event.target.value,
                  }))
                }
                placeholder="예: 1200"
                className="input-field"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">층수</span>
              <input
                type="number"
                min="0"
                value={form.floors}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    floors: event.target.value,
                  }))
                }
                placeholder="예: 5"
                className="input-field"
              />
            </label>

            <fieldset className="space-y-3 md:col-span-2">
              <legend className="text-sm font-semibold text-slate-700">
                건축 행위
              </legend>
              <div className="grid gap-3 md:grid-cols-3">
                {actionOptions.map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 transition ${
                      form.constructionAction === option
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 bg-slate-50 hover:border-brand-500 hover:bg-brand-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="constructionAction"
                      value={option}
                      className="h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-500"
                      checked={form.constructionAction === option}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          constructionAction: option,
                        }))
                      }
                    />
                    <span className="text-sm font-medium text-slate-800">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                법규 체크리스트 생성
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
