"use client";

import { FormEvent, ReactNode, RefObject, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const constructionActions = [
  {
    value: "새로 짓기",
    description: "빈 땅이나 철거 후 새 건물을 짓는 경우",
  },
  {
    value: "기존 건물 넓히기",
    description: "층수나 면적을 늘리는 경우",
  },
  {
    value: "기존 건물 다시 짓기",
    description: "기존 건물을 허물고 다시 짓는 경우",
  },
  {
    value: "기존 건물 크게 고치기",
    description: "뼈대나 주요 부분까지 손보는 공사",
  },
  {
    value: "건물 쓰임 바꾸기",
    description: "주택을 카페로 바꾸는 것처럼 용도를 바꾸는 경우",
  },
  {
    value: "잘 모르겠음",
    description: "어떤 종류의 공사인지 아직 정리되지 않은 경우",
  },
] as const;

const yesNoUnknownOptions = ["예", "아니오", "잘 모르겠음"] as const;
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

type ParsedSummaryResult = {
  form: FormState;
  recognized: Array<{ label: string; value: string }>;
  missing: string[];
};

const initialForm: FormState = {
  location: "",
  municipality: "",
  buildingUse: "",
  zoningDistrict: "",
  useDistrict: "",
  useZone: "",
  districtUnitPlan: "잘 모르겠음",
  siteArea: "",
  totalFloorArea: "",
  aboveGroundFloors: "",
  basementFloors: "",
  buildingHeight: "",
  publicPrivate: "민간",
  constructionAction: "잘 모르겠음",
  heritageRelated: "잘 모르겠음",
  riverRelated: "잘 모르겠음",
  schoolEnvironmentRelated: "잘 모르겠음",
  mountainRelated: "잘 모르겠음",
  farmlandRelated: "잘 모르겠음",
};

const documentAnalysisPrompt = `첨부한 문서를 읽고, 건축 법규 검토를 시작할 때 필요한 정보를 사람이 읽기 쉽게 정리해줘.

작성 원칙:
- 문서에 적혀 있는 내용만 바탕으로 정리해줘.
- 확인되지 않는 정보는 "확인 필요"라고 적어줘.
- 법적 확정 판단은 하지 말아줘.
- 문서에서 법규 검토에 영향을 줄 수 있는 문장이나 표현이 있으면 마지막에 함께 정리해줘.

아래 형식으로 답변해줘.

[기본 정보]
사업명:
대지 위치:
지역 / 지자체:
건축물 용도:
대지면적:
연면적:
건축 행위:

[대지 정보]
용도지역:
용도지구:
용도구역:
지구단위계획구역 여부:

[건축물 정보]
지상층수:
지하층수:
건축물 높이:
공공 / 민간:

[특수 조건]
문화재 관련:
하천 관련:
학교환경 관련:
산지 관련:
농지 관련:

[법규 검토에 참고할 문장]

[확인 필요]
문서에서 확인되지 않은 정보:
`;

const fieldAliases = {
  location: ["대지 위치", "위치", "사업 위치", "대상지", "주소"],
  municipality: ["지역 / 지자체", "지역", "지자체", "관할 지자체", "발주 지자체"],
  buildingUse: ["건축물 용도", "건축 용도", "용도", "시설 용도", "건물 용도"],
  siteArea: ["대지면적", "대지 면적", "부지면적", "부지 면적", "사업부지면적"],
  totalFloorArea: ["연면적", "연 면적", "전체면적", "건축 연면적"],
  aboveGroundFloors: ["지상층수", "지상 층수", "지상", "층수"],
  basementFloors: ["지하층수", "지하 층수", "지하"],
  buildingHeight: ["건축물 높이", "높이", "최고높이"],
  constructionAction: ["건축 행위", "행위", "사업 유형", "공사 유형"],
  publicPrivate: ["공공 / 민간", "공공", "민간", "발주 구분", "사업 구분"],
  zoningDistrict: ["용도지역"],
  useDistrict: ["용도지구"],
  useZone: ["용도구역"],
  districtUnitPlan: ["지구단위계획구역 여부"],
  heritageRelated: ["문화재 관련", "문화재 근처인가요"],
  riverRelated: ["하천 관련", "하천 근처인가요"],
  schoolEnvironmentRelated: ["학교환경 관련", "학교 근처인가요"],
  mountainRelated: ["산지 관련", "산지인가요"],
  farmlandRelated: ["농지 관련", "농지인가요"],
} as const satisfies Record<keyof FormState, readonly string[]>;

const displayLabels: Record<keyof FormState, string> = {
  location: "대지 위치",
  municipality: "지역 / 지자체",
  buildingUse: "건축물 용도",
  zoningDistrict: "용도지역",
  useDistrict: "용도지구",
  useZone: "용도구역",
  districtUnitPlan: "지구단위계획구역 여부",
  siteArea: "대지면적",
  totalFloorArea: "연면적",
  aboveGroundFloors: "지상층수",
  basementFloors: "지하층수",
  buildingHeight: "건축물 높이",
  publicPrivate: "공공 / 민간",
  constructionAction: "건축 행위",
  heritageRelated: "문화재 관련",
  riverRelated: "하천 관련",
  schoolEnvironmentRelated: "학교환경 관련",
  mountainRelated: "산지 관련",
  farmlandRelated: "농지 관련",
};

const summaryTargetFields: Array<keyof FormState> = [
  "location",
  "municipality",
  "buildingUse",
  "siteArea",
  "totalFloorArea",
  "constructionAction",
  "publicPrivate",
  "buildingHeight",
];

const summaryTargetLabels = summaryTargetFields.map((field) => displayLabels[field]);

const minimumRequiredFields: Array<keyof FormState> = ["location", "buildingUse"];

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

function scrollToSection<T extends HTMLElement>(ref: RefObject<T | null>) {
  ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
}

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

function normalizeChoice<T extends readonly string[]>(
  value: string,
  options: T,
): T[number] | undefined {
  const trimmed = value.trim();

  if (trimmed === "모름") {
    return options.find((option) => option === "잘 모르겠음");
  }

  return options.find((option) => option === trimmed);
}

function normalizeYesNoUnknown(value: string): FormState["districtUnitPlan"] | undefined {
  const normalized = value.replace(/\s/g, "");

  if (["예", "있음", "해당", "해당있음", "o", "O"].includes(normalized)) {
    return "예";
  }

  if (["아니오", "없음", "해당없음", "x", "X"].includes(normalized)) {
    return "아니오";
  }

  if (
    ["모름", "미상", "불명", "잘모르겠음", "확인필요"].includes(normalized)
  ) {
    return "잘 모르겠음";
  }

  return normalizeChoice(value, yesNoUnknownOptions);
}

function normalizePublicPrivate(value: string): FormState["publicPrivate"] | undefined {
  if (value.includes("공공")) {
    return "공공";
  }

  if (value.includes("민간")) {
    return "민간";
  }

  return normalizeChoice(value, publicPrivateOptions);
}

function normalizeConstructionAction(
  value: string,
): FormState["constructionAction"] | undefined {
  const trimmed = value.replace(/\s/g, "");

  const matchMap: Record<string, FormState["constructionAction"]> = {
    신축: "새로 짓기",
    새로짓기: "새로 짓기",
    증축: "기존 건물 넓히기",
    기존건물넓히기: "기존 건물 넓히기",
    개축: "기존 건물 다시 짓기",
    재축: "기존 건물 다시 짓기",
    기존건물다시짓기: "기존 건물 다시 짓기",
    대수선: "기존 건물 크게 고치기",
    리모델링: "기존 건물 크게 고치기",
    기존건물크게고치기: "기존 건물 크게 고치기",
    용도변경: "건물 쓰임 바꾸기",
    건물쓰임바꾸기: "건물 쓰임 바꾸기",
    이전: "잘 모르겠음",
    기타: "잘 모르겠음",
    잘모르겠음: "잘 모르겠음",
  };

  return matchMap[trimmed];
}

function normalizeNumericArea(value: string) {
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : "";
}

function normalizeFloorValue(value: string) {
  const trimmed = value.replace(/\s/g, "");

  if (["없음", "해당없음", "없다", "무", "none", "None"].includes(trimmed)) {
    return "";
  }

  const match = trimmed.match(/\d+/);
  return match ? match[0] : "";
}

function normalizeHeightValue(value: string) {
  if (value.includes("확인 필요")) {
    return "";
  }

  return normalizeNumericArea(value);
}

function cleanLine(line: string) {
  return line
    .replace(/^[\-\*\u2022]\s*/, "")
    .replace(/\t/g, " ")
    .trim();
}

function splitLabelValue(line: string): { label: string; value: string } | null {
  const cleaned = cleanLine(line);
  const match = cleaned.match(/^(.+?)\s*(?::|：|-|｜|\|)\s*(.+)$/);

  if (!match) {
    return null;
  }

  return {
    label: match[1].trim(),
    value: match[2].trim(),
  };
}

function getFieldByLabel(label: string): keyof FormState | undefined {
  return (Object.keys(fieldAliases) as Array<keyof FormState>).find((field) =>
    (fieldAliases[field] as readonly string[]).includes(label),
  );
}

function parseFieldValue(field: keyof FormState, value: string): string | undefined {
  if (!value || value.includes("확인 필요")) {
    return undefined;
  }

  switch (field) {
    case "siteArea":
    case "totalFloorArea":
      return normalizeNumericArea(value);
    case "aboveGroundFloors":
    case "basementFloors":
      return normalizeFloorValue(value);
    case "buildingHeight":
      return normalizeHeightValue(value);
    case "districtUnitPlan":
    case "heritageRelated":
    case "riverRelated":
    case "schoolEnvironmentRelated":
    case "mountainRelated":
    case "farmlandRelated":
      return normalizeYesNoUnknown(value);
    case "publicPrivate":
      return normalizePublicPrivate(value);
    case "constructionAction":
      return normalizeConstructionAction(value);
    default:
      return value.trim();
  }
}

function parseAiSummary(text: string, currentForm: FormState): ParsedSummaryResult {
  const nextForm = { ...currentForm };
  const recognizedMap = new Map<string, string>();
  const missingSet = new Set<string>();
  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const parsed = splitLabelValue(rawLine);
    if (!parsed) {
      continue;
    }

    const field = getFieldByLabel(parsed.label);
    if (!field) {
      continue;
    }

    if (!parsed.value || parsed.value.includes("확인 필요")) {
      missingSet.add(displayLabels[field]);
      continue;
    }

    const normalizedValue = parseFieldValue(field, parsed.value);

    if (!normalizedValue) {
      missingSet.add(displayLabels[field]);
      continue;
    }

    nextForm[field] = normalizedValue as never;
    recognizedMap.set(displayLabels[field], normalizedValue);
  }

  return {
    form: nextForm,
    recognized: Array.from(recognizedMap.entries()).map(([label, value]) => ({
      label,
      value,
    })),
    missing: Array.from(missingSet),
  };
}

export default function CheckPageContent() {
  const router = useRouter();
  const documentSectionRef = useRef<HTMLElement>(null);
  const formSectionRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<FormState>(initialForm);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [showPromptGuide, setShowPromptGuide] = useState(false);
  const [pastedAiSummary, setPastedAiSummary] = useState("");
  const [applyState, setApplyState] = useState<
    "idle" | "applied" | "partial" | "empty" | "not-found"
  >("idle");
  const [recognizedItems, setRecognizedItems] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [openSections, setOpenSections] = useState({
    landPlan: false,
    buildingDetails: false,
    specialConditions: false,
  });

  const missingMinimumFields = useMemo(
    () =>
      minimumRequiredFields.filter((field) => {
        const value = form[field];
        return typeof value === "string" ? value.trim() === "" : false;
      }),
    [form],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (missingMinimumFields.length > 0) {
      setValidationMessage(
        "어디에 있는 땅인지와 어떤 건물인지 정도는 먼저 입력해 주세요. 나머지는 몰라도 괜찮습니다.",
      );
      scrollToSection(formSectionRef);
      return;
    }

    setValidationMessage("");

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

  const handleApplyAiSummary = () => {
    if (!pastedAiSummary.trim()) {
      setApplyState("empty");
      setRecognizedItems([]);
      setMissingItems([]);
      return;
    }

    const result = parseAiSummary(pastedAiSummary, form);

    if (result.recognized.length === 0) {
      setApplyState("not-found");
      setRecognizedItems([]);
      setMissingItems(result.missing);
      return;
    }

    setForm(result.form);
    setRecognizedItems(
      result.recognized.filter((item) => summaryTargetLabels.includes(item.label)),
    );
    setMissingItems(result.missing);
    setApplyState(result.missing.length > 0 ? "partial" : "applied");
    setValidationMessage("");
    scrollToSection(formSectionRef);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-panel md:p-10">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              건축 법규 검토 도우미
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              건축을 잘 몰라도 괜찮습니다. 아는 정보만 입력하면 초기 단계에서
              먼저 확인해야 할 법규 검토 항목을 정리해드립니다.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <section className="rounded-[24px] border border-brand-100 bg-brand-50 p-6">
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900">문서가 있어요</h2>
                <p className="text-sm leading-6 text-slate-600">
                  설계공모지침서, 과업이행서, 건축 관련 문서가 있다면
                  GPT/Gemini로 필요한 정보를 먼저 정리할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => scrollToSection(documentSectionRef)}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                문서에서 정보 가져오기
              </button>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900">직접 입력할게요</h2>
                <p className="text-sm leading-6 text-slate-600">
                  아는 정보를 직접 입력해서 검토 항목을 정리합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => scrollToSection(formSectionRef)}
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
              >
                직접 입력 시작
              </button>
            </section>
          </div>

          <section
            ref={documentSectionRef}
            className="mt-8 rounded-[24px] border border-brand-100 bg-brand-50 p-6"
          >
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                문서에서 정보 가져오기
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                설계공모지침서나 과업이행서가 있다면 GPT 또는 Gemini에 문서를
                첨부한 뒤, 아래 프롬프트를 사용해 필요한 정보를 먼저 정리할 수
                있습니다.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                프롬프트 복사
              </button>
              <button
                type="button"
                onClick={() => setShowPromptGuide((current) => !current)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
              >
                사용 방법 보기
              </button>
              <button
                type="button"
                onClick={() => setShowPromptPreview((current) => !current)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
              >
                프롬프트 미리보기
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm text-slate-500">
                {copyState === "copied" && "프롬프트를 클립보드에 복사했습니다."}
                {copyState === "failed" &&
                  "브라우저에서 복사를 허용하지 않아 프롬프트 복사에 실패했습니다."}
                {copyState === "idle" &&
                  "문서를 첨부한 뒤 이 프롬프트를 붙여 넣으면 필요한 정보를 먼저 정리할 수 있습니다."}
              </p>
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                AI가 정리한 내용은 법적 확정 판단이 아니며, 문서 원문과 공식
                기준을 반드시 다시 확인해야 합니다.
              </p>
            </div>

            {showPromptGuide ? (
              <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-900">사용 방법</h3>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <p>1. 아래 프롬프트를 복사하세요.</p>
                  <p>2. GPT 또는 Gemini에 설계공모지침서나 과업이행서를 첨부하세요.</p>
                  <p>3. 복사한 프롬프트를 붙여넣고 실행하세요.</p>
                  <p>4. AI가 정리한 내용을 다시 이곳에 붙여넣으세요.</p>
                  <p>5. 입력값 채우기를 누르면 가능한 항목이 자동으로 입력됩니다.</p>
                </div>
              </div>
            ) : null}

            {showPromptPreview ? (
              <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-5">
                <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
                  {documentAnalysisPrompt}
                </pre>
              </div>
            ) : null}

            <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-5">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  AI가 정리한 내용 붙여넣기
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  GPT/Gemini가 정리한 내용을 붙여넣으면 입력칸을 채우는 데
                  도움을 받을 수 있습니다.
                </p>
              </div>
              <textarea
                value={pastedAiSummary}
                onChange={(event) => {
                  setPastedAiSummary(event.target.value);
                  setApplyState("idle");
                  setRecognizedItems([]);
                  setMissingItems([]);
                }}
                placeholder={`[기본 정보]
사업명: 낙동문화 에코뮤지엄 개경포빛 복합문화센터 건립사업
대지 위치: 경상북도 고령군 개진면 오사리 541-12번지 일원, 개경포기념공원
지역 / 지자체: 경상북도 고령군
건축 용도: 문화 및 집회시설
대지면적: 6,105.0㎡
연면적: 1,405.91㎡
지상층수: 3층
지하층수: 없음
건축물 높이: 확인 필요
건축 행위: 신축
공공 / 민간: 공공`}
                className="input-field mt-4 min-h-40 resize-y"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleApplyAiSummary}
                  className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
                >
                  입력값 채우기
                </button>
                <p className="text-sm text-slate-500">
                  {applyState === "applied" &&
                    "입력칸에 값을 채웠습니다."}
                  {applyState === "partial" &&
                    "일부 항목을 입력했습니다. 비어 있는 항목은 직접 확인해주세요."}
                  {applyState === "empty" &&
                    "먼저 AI가 정리한 내용을 붙여넣어 주세요."}
                  {applyState === "not-found" &&
                    "입력값을 찾지 못했습니다. AI 정리 결과의 항목명을 확인해주세요."}
                </p>
              </div>

              {(recognizedItems.length > 0 || missingItems.length > 0) && (
                <div className="mt-5 grid gap-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  {recognizedItems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">인식된 항목</h4>
                      <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                        {recognizedItems.map((item) => (
                          <li key={`${item.label}-${item.value}`} className="rounded-xl bg-white px-3 py-2">
                            {item.label}: {item.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {missingItems.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">확인 필요</h4>
                      <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                        {missingItems.map((item) => (
                          <li key={item} className="rounded-xl bg-white px-3 py-2">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <form ref={formSectionRef} className="mt-8 grid gap-6" onSubmit={handleSubmit}>
            {validationMessage ? (
              <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
                {validationMessage}
              </div>
            ) : null}

            <section className="space-y-5 rounded-[24px] border border-slate-200 bg-slate-50/70 p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">기본 정보</h2>
                  <SectionBadge label="필수" />
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  아는 정보만 먼저 입력해도 괜찮습니다. 모르는 항목은 비워두고
                  나중에 다시 채워도 됩니다.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    어디에 있는 땅인가요?
                  </span>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }));
                      setValidationMessage("");
                    }}
                    placeholder="예: 서울특별시 종로구 청운동"
                    className="input-field"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    어느 지자체인가요?
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
                    어떤 건물인가요?
                  </span>
                  <input
                    type="text"
                    value={form.buildingUse}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        buildingUse: event.target.value,
                      }));
                      setValidationMessage("");
                    }}
                    placeholder="예: 카페, 사무실, 도서관, 전시장, 주택"
                    className="input-field"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    땅 면적을 알고 있나요?
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
                    placeholder="예: 1234.56㎡"
                    className="input-field"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    건물 전체 면적을 알고 있나요?
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
                    placeholder="예: 987.65㎡"
                    className="input-field"
                  />
                </label>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-slate-700">
                  무엇을 하려는 건가요?
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
              title="토지이용계획 정보를 알고 있나요?"
              description="모르면 비워두어도 됩니다. 토지이음에서 확인할 수 있는 정보입니다."
              badge="선택"
              isOpen={openSections.landPlan}
              onToggle={() =>
                setOpenSections((current) => ({
                  ...current,
                  landPlan: !current.landPlan,
                }))
              }
            >
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
                    placeholder="예: 제2종일반주거지역"
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
                  helperText="모르면 비워두셔도 됩니다. 토지이음에서 확인 가능합니다."
                />
              </div>
            </AccordionSection>

            <AccordionSection
              title="건물에 대해 더 알고 있나요?"
              description="층수나 높이, 공공 사업 여부를 알고 있으면 더 구체적인 검토 항목을 보여드릴 수 있습니다."
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
                    높이를 알고 있나요?
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
                    placeholder="예: 18.50m"
                    className="input-field"
                  />
                </label>

                <ChoiceGroup
                  legend="공공 사업인가요, 민간 사업인가요?"
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
              title="특별히 확인해야 할 주변 조건이 있나요?"
              description="문화재, 하천, 학교, 산지, 농지와 관련된 땅은 추가 검토가 필요할 수 있습니다. 모르면 잘 모르겠음을 선택하세요."
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
                  legend="문화재 근처인가요?"
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
                  legend="하천 근처인가요?"
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
                  legend="학교 근처인가요?"
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
                  legend="산지인가요?"
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
                  legend="농지인가요?"
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

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                검토 항목 정리하기
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
