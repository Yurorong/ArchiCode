"use client";

import { FormEvent, useState } from "react";
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

function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  selectedValue,
  onChange,
  columns = "md:grid-cols-3",
}: {
  legend: string;
  name: string;
  options: readonly T[];
  selectedValue: T;
  onChange: (value: T) => void;
  columns?: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-700">{legend}</legend>
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

export default function CheckPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);

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

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-panel md:p-10">
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold text-brand-700">1단계 입력 화면</p>
            <h1 className="text-3xl font-bold">건축 정보 입력</h1>
            <p className="text-base leading-7 text-slate-600">
              입력 조건에 따라 결과가 달라지는 mock 체크리스트를 만들기 위한
              프로젝트 정보를 입력해 주세요.
            </p>
          </div>

          <form className="grid gap-8" onSubmit={handleSubmit}>
            <section className="space-y-5 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">기본 정보</h2>
                <p className="mt-1 text-sm text-slate-600">
                  프로젝트의 위치와 규모, 주된 건축 행위를 입력합니다.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    대지 위치
                  </span>
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
                  <span className="text-sm font-semibold text-slate-700">
                    대지면적
                  </span>
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
                  <span className="text-sm font-semibold text-slate-700">
                    연면적
                  </span>
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
            </section>

            <section className="space-y-5 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">대지 정보</h2>
                <p className="mt-1 text-sm text-slate-600">
                  토지이용계획과 지자체 기준 확인에 필요한 항목입니다.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    용도지역
                  </span>
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
                  <span className="text-sm font-semibold text-slate-700">
                    용도지구
                  </span>
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
                  <span className="text-sm font-semibold text-slate-700">
                    용도구역
                  </span>
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
                />
              </div>
            </section>

            <section className="space-y-5 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">건축물 정보</h2>
                <p className="mt-1 text-sm text-slate-600">
                  층수와 높이, 발주 성격에 따라 검토 항목이 달라질 수 있습니다.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    지상층수
                  </span>
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
                  <span className="text-sm font-semibold text-slate-700">
                    지하층수
                  </span>
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
            </section>

            <section className="space-y-5 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">건축 행위</h2>
                <p className="mt-1 text-sm text-slate-600">
                  행위 유형에 따라 결과 카드가 달라집니다.
                </p>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-slate-700">
                  건축 행위 선택
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

            <section className="space-y-5 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">특수 조건</h2>
                <p className="mt-1 text-sm text-slate-600">
                  개별 인허가나 추가 협의 가능성이 있는 조건입니다.
                </p>
              </div>

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
