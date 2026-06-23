"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

const constructionActions = [
  { value: "신축", description: "새 건축물을 새로 짓는 경우" },
  { value: "증축", description: "기존 건축물의 면적이나 규모를 늘리는 경우" },
  { value: "개축", description: "기존 건축물을 일부 또는 전부 다시 짓는 경우" },
  { value: "재축", description: "멸실된 건축물을 종전 규모 범위에서 다시 짓는 경우" },
  { value: "이전", description: "건축물을 같은 부지 또는 다른 부지로 옮기는 경우" },
  { value: "대수선", description: "주요구조부 등을 큰 범위로 수선하거나 변경하는 경우" },
  { value: "용도변경", description: "건축물의 사용 목적을 다른 용도로 바꾸는 경우" },
  { value: "리모델링", description: "성능 개선이나 기능 향상을 위한 정비 공사" },
  { value: "기타 / 잘 모르겠음", description: "행위 유형이 불명확하거나 복합적인 경우" },
] as const;

const yesNoUnknownOptions = ["예", "아니오", "모름"] as const;
const publicPrivateOptions = ["공공", "민간"] as const;

type FormState = {
  location: string;
  municipality: string;
  buildingUse: string;
  zoningDistrict: string;
  useDistrict: string;
  useZone: string;
  districtUnitPlan: (typeof yesNoUnknownOptions)[number];
  siteArea: string;
  totalFloorArea: string;
  aboveGroundFloors: string;
  basementFloors: string;
  buildingHeight: string;
  publicPrivate: (typeof publicPrivateOptions)[number];
  constructionAction: (typeof constructionActions)[number]["value"];
  heritageRelated: (typeof yesNoUnknownOptions)[number];
  riverRelated: (typeof yesNoUnknownOptions)[number];
  schoolEnvironmentRelated: (typeof yesNoUnknownOptions)[number];
  mountainRelated: (typeof yesNoUnknownOptions)[number];
  farmlandRelated: (typeof yesNoUnknownOptions)[number];
};

const initialForm: FormState = {
  location: "",
  municipality: "",
  buildingUse: "",
  zoningDistrict: "",
  useDistrict: "",
  useZone: "",
  districtUnitPlan: "모름",
  siteArea: "",
  totalFloorArea: "",
  aboveGroundFloors: "",
  basementFloors: "",
  buildingHeight: "",
  publicPrivate: "민간",
  constructionAction: "신축",
  heritageRelated: "모름",
  riverRelated: "모름",
  schoolEnvironmentRelated: "모름",
  mountainRelated: "모름",
  farmlandRelated: "모름",
};

const documentAnalysisPrompt = `첨부한 설계공모지침서, 과업이행서, 설계지침서 PDF 또는 HWP 문서를 읽고 아래 작업을 수행해줘.

목적:
- 첨부 문서에서 프로젝트 기본 정보 추출
- 대지 정보 추출
- 건축물 정보 추출
- 특수 조건 추출
- 법규 검토에 영향을 줄 수 있는 문장 추출
- 확인되지 않는 정보는 "확인 필요"로 표시
- 법적 확정 판단은 하지 않음
- 결과를 JSON 형식으로 출력

출력 규칙:
- 추정하지 말고 문서에 근거가 있는 내용만 작성해줘.
- 값이 여러 군데 다르면 충돌 가능성을 메모하고 missingInformation에도 추가해줘.
- 법령 해석이나 적법 여부 판단은 하지 말고, 문서에 적힌 사실만 구조화해줘.
- specialConditions는 문자열 배열로 작성해줘.
- extractedChecklistHints는 법규 검토에 영향을 줄 수 있는 문장이나 키워드를 문자열 배열로 정리해줘.
- missingInformation은 문서에서 찾지 못한 항목명을 문자열 배열로 정리해줘.

아래 JSON 형식으로만 답변해줘:
{
  "projectName": "",
  "siteLocation": "",
  "localGovernment": "",
  "buildingUse": "",
  "siteArea": "",
  "totalFloorArea": "",
  "buildingAction": "",
  "zoningArea": "",
  "zoningDistrict": "",
  "zoningZone": "",
  "districtUnitPlan": "",
  "publicOrPrivate": "",
  "groundFloors": "",
  "basementFloors": "",
  "height": "",
  "specialConditions": [],
  "extractedChecklistHints": [],
  "missingInformation": []
}`;

function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  selectedValue,
  onChange,
  columns = "md:grid-cols-3",
  helperText,
}: {
  legend: string;
  name: string;
  options: readonly T[];
  selectedValue: T;
  onChange: (value: T) => void;
  columns?: string;
  helperText?: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-700">{legend}</legend>
      {helperText ? (
        <p className="text-xs leading-5 text-slate-500">{helperText}</p>
      ) : null}
      <div className={`grid gap-3 ${columns}`}>
        {options.map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 text-sm transition ${
              selectedValue === option
                ? "border-brand-500 bg-brand-50"
                : "border-slate-200 bg-slate-50 hover:border-brand-500 hover:bg-brand-50"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              className="h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-500"
              checked={selectedValue === option}
              onChange={() => onChange(option)}
            />
            <span className="font-medium text-slate-800">{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SectionBadge({ label }: { label: "필수" | "선택" }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        label === "필수"
          ? "bg-brand-100 text-brand-700"
          : "bg-slate-200 text-slate-700"
      }`}
    >
      {label}
    </span>
  );
}

function AccordionSection({
  title,
  description,
  badge,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  badge: "필수" | "선택";
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-slate-50/70">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <SectionBadge label={badge} />
          </div>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-brand-700">
          {isOpen ? "접기" : "펼치기"}
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-slate-200 px-6 py-6">{children}</div>
      ) : null}
    </section>
  );
}

export default function CheckPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [openSections, setOpenSections] = useState({
    siteDetails: false,
    buildingDetails: false,
    specialConditions: false,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams({
      location: form.location,
      municipality: form.municipality,
      buildingUse: form.buildingUse,
      zoningDistrict: form.zoningDistrict,
      useDistrict: form.useDistrict,
      useZone: form.useZone,
      districtUnitPlan: form.districtUnitPlan,
      siteArea: form.siteArea,
      totalFloorArea: form.totalFloorArea,
      aboveGroundFloors: form.aboveGroundFloors,
      basementFloors: form.basementFloors,
      buildingHeight: form.buildingHeight,
      publicPrivate: form.publicPrivate,
      constructionAction: form.constructionAction,
      heritageRelated: form.heritageRelated,
      riverRelated: form.riverRelated,
      schoolEnvironmentRelated: form.schoolEnvironmentRelated,
      mountainRelated: form.mountainRelated,
      farmlandRelated: form.farmlandRelated,
    });

    router.push(`/result?${params.toString()}`);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(documentAnalysisPrompt);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-panel md:p-10">
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold text-brand-700">1단계 입력 화면</p>
            <h1 className="text-3xl font-bold">건축 정보 입력</h1>
            <p className="text-base leading-7 text-slate-600">
              처음에는 꼭 필요한 정보만 먼저 입력하고, 추가 조건은 필요한 경우에만
              펼쳐서 입력할 수 있습니다.
            </p>
          </div>

          <form className="grid gap-6" onSubmit={handleSubmit}>
            <section className="space-y-5 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">기본 정보</h2>
                  <SectionBadge label="필수" />
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  프로젝트의 기본 정보만 먼저 입력하세요. 추가 조건은 필요할 때만
                  선택적으로 입력할 수 있습니다.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
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
                    지역 / 지자체
                  </span>
                  <input
                    type="text"
                    value={form.municipality}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        municipality: event.target.value,
                      }))
                    }
                    placeholder="예: 서울특별시 종로구"
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
                    step="0.01"
                    value={form.siteArea}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        siteArea: event.target.value,
                      }))
                    }
                    placeholder="예: 1234.56"
                    className="input-field"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">연면적</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.totalFloorArea}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        totalFloorArea: event.target.value,
                      }))
                    }
                    placeholder="예: 1234.56"
                    className="input-field"
                  />
                </label>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-slate-700">
                  건축 행위
                </legend>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {constructionActions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-4 transition ${
                        form.constructionAction === option.value
                          ? "border-brand-500 bg-brand-50"
                          : "border-slate-200 bg-white hover:border-brand-500 hover:bg-brand-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="constructionAction"
                          value={option.value}
                          className="h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-500"
                          checked={form.constructionAction === option.value}
                          onChange={() =>
                            setForm((current) => ({
                              ...current,
                              constructionAction: option.value,
                            }))
                          }
                        />
                        <span className="text-sm font-semibold text-slate-900">
                          {option.value}
                        </span>
                      </div>
                      <span className="pl-7 text-sm leading-6 text-slate-600">
                        {option.description}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            <AccordionSection
              title="상세 대지 정보"
              description="용도지역, 지구단위계획 여부처럼 토지 기준을 더 정확히 반영하고 싶을 때만 입력하세요."
              badge="선택"
              isOpen={openSections.siteDetails}
              onToggle={() =>
                setOpenSections((current) => ({
                  ...current,
                  siteDetails: !current.siteDetails,
                }))
              }
            >
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">용도지역</span>
                  <input
                    type="text"
                    value={form.zoningDistrict}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        zoningDistrict: event.target.value,
                      }))
                    }
                    placeholder="예: 제2종 일반주거지역"
                    className="input-field"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">용도지구</span>
                  <input
                    type="text"
                    value={form.useDistrict}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        useDistrict: event.target.value,
                      }))
                    }
                    placeholder="예: 방화지구"
                    className="input-field"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">용도구역</span>
                  <input
                    type="text"
                    value={form.useZone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        useZone: event.target.value,
                      }))
                    }
                    placeholder="예: 개발제한구역"
                    className="input-field"
                  />
                </label>

                <ChoiceGroup
                  legend="지구단위계획구역 여부"
                  name="districtUnitPlan"
                  options={yesNoUnknownOptions}
                  selectedValue={form.districtUnitPlan}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      districtUnitPlan: value,
                    }))
                  }
                  helperText="모르면 비워두셔도 됩니다. 토지이음에서 확인 가능합니다."
                />
              </div>
            </AccordionSection>

            <AccordionSection
              title="상세 건축물 정보"
              description="층수나 높이, 공공 여부를 알고 있다면 더 구체적인 체크리스트를 만드는 데 도움이 됩니다."
              badge="선택"
              isOpen={openSections.buildingDetails}
              onToggle={() =>
                setOpenSections((current) => ({
                  ...current,
                  buildingDetails: !current.buildingDetails,
                }))
              }
            >
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">지상층수</span>
                  <input
                    type="number"
                    min="0"
                    value={form.aboveGroundFloors}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        aboveGroundFloors: event.target.value,
                      }))
                    }
                    placeholder="예: 5"
                    className="input-field"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">지하층수</span>
                  <input
                    type="number"
                    min="0"
                    value={form.basementFloors}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        basementFloors: event.target.value,
                      }))
                    }
                    placeholder="예: 1"
                    className="input-field"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    건축물 높이
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.buildingHeight}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        buildingHeight: event.target.value,
                      }))
                    }
                    placeholder="예: 18.50"
                    className="input-field"
                  />
                </label>

                <ChoiceGroup
                  legend="공공 / 민간"
                  name="publicPrivate"
                  options={publicPrivateOptions}
                  selectedValue={form.publicPrivate}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      publicPrivate: value,
                    }))
                  }
                  columns="md:grid-cols-2"
                />
              </div>
            </AccordionSection>

            <AccordionSection
              title="특수 조건"
              description="문화재, 하천, 산지 등 특수한 입지 조건이 있는 경우에만 입력하세요. 해당 없으면 비워두셔도 됩니다."
              badge="선택"
              isOpen={openSections.specialConditions}
              onToggle={() =>
                setOpenSections((current) => ({
                  ...current,
                  specialConditions: !current.specialConditions,
                }))
              }
            >
              <div className="grid gap-6 md:grid-cols-2">
                <ChoiceGroup
                  legend="문화재 관련 여부"
                  name="heritageRelated"
                  options={yesNoUnknownOptions}
                  selectedValue={form.heritageRelated}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      heritageRelated: value,
                    }))
                  }
                />

                <ChoiceGroup
                  legend="하천 관련 여부"
                  name="riverRelated"
                  options={yesNoUnknownOptions}
                  selectedValue={form.riverRelated}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      riverRelated: value,
                    }))
                  }
                />

                <ChoiceGroup
                  legend="학교환경 관련 여부"
                  name="schoolEnvironmentRelated"
                  options={yesNoUnknownOptions}
                  selectedValue={form.schoolEnvironmentRelated}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      schoolEnvironmentRelated: value,
                    }))
                  }
                />

                <ChoiceGroup
                  legend="산지 관련 여부"
                  name="mountainRelated"
                  options={yesNoUnknownOptions}
                  selectedValue={form.mountainRelated}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      mountainRelated: value,
                    }))
                  }
                />

                <ChoiceGroup
                  legend="농지 관련 여부"
                  name="farmlandRelated"
                  options={yesNoUnknownOptions}
                  selectedValue={form.farmlandRelated}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      farmlandRelated: value,
                    }))
                  }
                />
              </div>
            </AccordionSection>

            <section className="rounded-[24px] border border-slate-200 bg-brand-50/60 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      문서 분석 프롬프트 생성기
                    </h2>
                    <SectionBadge label="선택" />
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    설계공모지침서나 과업이행서가 있다면 아래 프롬프트를 복사해
                    GPT 또는 Gemini에 붙여넣으세요. AI가 문서에서 체크리스트
                    입력에 필요한 정보를 정리해줍니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
                >
                  프롬프트 복사
                </button>
              </div>

              <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-5">
                <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
                  {documentAnalysisPrompt}
                </pre>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-500">
                  {copyState === "copied" &&
                    "프롬프트를 클립보드에 복사했습니다."}
                  {copyState === "failed" &&
                    "브라우저에서 클립보드 복사를 허용하지 않아 복사에 실패했습니다."}
                  {copyState === "idle" &&
                    "복사 버튼을 누르면 외부 AI에 바로 붙여 넣을 수 있습니다."}
                </p>
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  AI가 추출한 내용은 법적 확정 판단이 아니며, 지침서 원문과 공식
                  법령을 반드시 재확인해야 합니다.
                </p>
              </div>
            </section>

            <div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                조건분기형 체크리스트 생성
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
