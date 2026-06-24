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

const heroImage =
  "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80";

function SectionBadge({ label }: { label: "필수" | "선택" }) {
  return <span className={label === "필수" ? "required-badge" : "optional-badge"}>{label}</span>;
}

function StepLabel({ step, title }: { step: string; title: string }) {
  return (
    <div className="space-y-3">
      <p className="eyebrow-number">{step}</p>
      <h2 className="section-title">{title}</h2>
    </div>
  );
}

function Field({
  label,
  description,
  badge,
  children,
  className = "",
}: {
  label: string;
  description?: string;
  badge?: "필수" | "선택";
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-2.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="label-text">{label}</span>
        {badge ? <SectionBadge label={badge} /> : null}
      </div>
      {description ? <p className="helper-text">{description}</p> : null}
      {children}
    </label>
  );
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
      <legend className="label-text">{legend}</legend>
      {helperText ? <p className="helper-text">{helperText}</p> : null}
      <div className={`grid gap-3 ${columns}`}>
        {options.map((option) => {
          const active = selectedValue === option;
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 border px-4 py-4 transition ${
                active
                  ? "border-brand-700 bg-brand-50/80"
                  : "border-[rgba(26,32,37,0.12)] bg-[rgba(255,255,255,0.72)] hover:border-brand-500"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option}
                className="h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-500"
                checked={active}
                onChange={() => onChange(option)}
              />
              <span className="text-sm font-medium text-slate-800">{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function ConstructionActionGrid({
  selectedValue,
  onChange,
}: {
  selectedValue: FormState["constructionAction"];
  onChange: (value: FormState["constructionAction"]) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="label-text">어떤 유형의 검토인가요</legend>
      <p className="helper-text">
        공사 형태에 따라 필요한 검토 항목이 달라집니다. 아직 정리 전이라면
        &quot;잘 모르겠음&quot;을 선택해도 됩니다.
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {constructionActions.map((option) => {
          const active = selectedValue === option.value;
          return (
            <label
              key={option.value}
              className={`group flex cursor-pointer flex-col justify-between gap-4 border p-5 transition ${
                active
                  ? "border-brand-700 bg-brand-50/80"
                  : "border-[rgba(26,32,37,0.12)] bg-white/70 hover:border-brand-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="constructionAction"
                  value={option.value}
                  className="mt-1 h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-500"
                  checked={active}
                  onChange={() => onChange(option.value)}
                />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">{option.value}</p>
                  <p className="text-sm leading-6 text-slate-600">{option.description}</p>
                </div>
              </div>
              <div className="h-px w-full bg-[rgba(26,32,37,0.08)] transition group-hover:bg-[rgba(36,56,77,0.2)]" />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function AccordionSection({
  step,
  title,
  description,
  badge,
  isOpen,
  onToggle,
  children,
}: {
  step: string;
  title: string;
  description: string;
  badge: "필수" | "선택";
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="section-frame">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-6 px-6 py-6 text-left md:px-8"
        aria-expanded={isOpen}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow-number">{step}</p>
            <SectionBadge label={badge} />
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">{title}</h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
        </div>
        <span className="shrink-0 border border-[rgba(26,32,37,0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          {isOpen ? "닫기" : "열기"}
        </span>
      </button>
      {isOpen ? <div className="border-t muted-divider px-6 py-8 md:px-8">{children}</div> : null}
    </section>
  );
}

function StartMethodCard({
  step,
  title,
  description,
  actionLabel,
  secondary,
  onClick,
}: {
  step: string;
  title: string;
  description: string;
  actionLabel: string;
  secondary: string;
  onClick: () => void;
}) {
  return (
    <article className="surface-card hairline-grid p-6 md:p-7">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="eyebrow-number">{step}</p>
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">{title}</h3>
          <p className="text-sm leading-7 text-slate-600">{description}</p>
        </div>
        <div className="architectural-note">{secondary}</div>
        <button type="button" onClick={onClick} className="ghost-button">
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

function DetailPreviewCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <article className="surface-card p-5">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <ul className="grid gap-2 text-sm leading-6 text-slate-600">
          {items.map((item) => (
            <li key={item} className="border-t border-[rgba(26,32,37,0.08)] pt-2 first:border-t-0 first:pt-0">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function ExternalAiPanel() {
  return (
    <aside className="group section-frame hairline-grid h-fit p-5 transition duration-200 hover:-translate-y-1 hover:shadow-panel xl:sticky xl:top-6">
      <div className="space-y-4">
        <p className="eyebrow-number">External AI</p>
        <h3 className="font-editorial text-3xl font-semibold tracking-[-0.03em] text-slate-900">
          외부 AI로 문서 정리하기
        </h3>
        <p className="text-sm leading-7 text-slate-600">
          이 사이트는 AI를 직접 실행하지 않습니다. ChatGPT 또는 Gemini에서
          문서를 첨부해 정보를 정리한 뒤, 그 결과를 이곳에 붙여넣어 입력값을
          채웁니다.
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        <a
          href="https://chatgpt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between border border-[rgba(36,56,77,0.18)] bg-[rgba(36,56,77,0.06)] px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-brand-700 hover:bg-[rgba(36,56,77,0.1)]"
        >
          <span>ChatGPT 열기</span>
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Open</span>
        </a>
        <a
          href="https://gemini.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between border border-[rgba(26,32,37,0.14)] bg-white/85 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-700 hover:bg-white"
        >
          <span>Gemini 열기</span>
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Open</span>
        </a>
      </div>

      <div className="mt-6 border-t muted-divider pt-5">
        <p className="label-text">사용 흐름</p>
        <ol className="mt-3 grid gap-2 text-sm leading-7 text-slate-600">
          <li>1. 프롬프트 복사</li>
          <li>2. 외부 AI 열기</li>
          <li>3. 문서 첨부</li>
          <li>4. 결과 복사</li>
          <li>5. 이곳에 붙여넣기</li>
        </ol>
      </div>
    </aside>
  );
}

function scrollToSection<T extends HTMLElement>(ref: RefObject<T | null>) {
  ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  if (["모름", "미상", "불명", "잘모르겠음", "확인필요"].includes(normalized)) {
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
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
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
    landPlan: true,
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

  const recognizedPreview = recognizedItems.slice(0, 4);

  const currentProjectSummary = [
    { label: "대지 위치", value: form.location || "아직 입력 전" },
    { label: "건축물 용도", value: form.buildingUse || "아직 입력 전" },
    { label: "건축 행위", value: form.constructionAction },
    { label: "공공 / 민간", value: form.publicPrivate },
  ];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (missingMinimumFields.length > 0) {
      setValidationMessage(
        "어디에 있는 대지인지와 어떤 건물인지부터 입력해 주세요. 나머지 정보는 나중에 채워도 검토를 시작할 수 있습니다.",
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
    <main className="min-h-screen px-5 py-5 text-slate-900 md:px-8 md:py-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8">
        <section className="relative overflow-hidden border border-[rgba(255,255,255,0.14)] bg-slate-900 text-white shadow-panel">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,32,0.92),rgba(20,29,39,0.72),rgba(22,34,50,0.86))]"
            aria-hidden="true"
          />
          <div className="relative grid min-h-[620px] gap-10 px-6 py-8 md:px-10 md:py-10 xl:grid-cols-[minmax(0,1.45fr)_360px]">
            <div className="flex flex-col justify-between gap-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-300">
                    Architectural Compliance Assistant
                  </p>
                  <h1 className="font-editorial max-w-4xl text-5xl font-semibold leading-[1.1] tracking-[-0.04em] md:text-6xl">
                    건축 법규 검토 도우미
                  </h1>
                  <p className="max-w-3xl text-base leading-8 text-slate-200 md:text-lg">
                    대지 정보, 건축물 용도, 설계지침서 내용을 바탕으로 초기 설계
                    단계에서 확인해야 할 법규 검토 항목을 빠르게 정리합니다.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => scrollToSection(formSectionRef)}
                    className="solid-button min-w-[180px]"
                  >
                    직접 입력 시작하기
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection(documentSectionRef)}
                    className="ghost-button min-w-[180px] border-white/20 bg-white/10 text-white hover:border-white/50 hover:text-white"
                  >
                    지침서에서 정보 가져오기
                  </button>
                </div>
              </div>

              <div className="grid gap-px border border-white/12 bg-white/12 md:grid-cols-3">
                {[
                  ["검토 기준", "대지 정보 + 용도 + 특수 조건"],
                  ["출력 방식", "초기 설계용 검토 체크리스트"],
                  ["작업 흐름", "입력 정리 후 결과 카드로 안내"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-900/40 px-5 py-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-100">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="section-frame flex flex-col justify-between gap-6 bg-white/10 p-6 text-white">
              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Preview</p>
                <h2 className="font-editorial text-3xl font-semibold tracking-[-0.03em]">
                  현재 프로젝트 요약
                </h2>
                <p className="text-sm leading-7 text-slate-200">
                  입력 중인 정보는 아래처럼 정리되어 결과 화면 상단 요약 카드로
                  이어집니다.
                </p>
              </div>
              <dl className="grid gap-px border border-white/10 bg-white/10">
                {currentProjectSummary.map((item) => (
                  <div key={item.label} className="bg-slate-900/45 px-4 py-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </dt>
                    <dd className="mt-2 text-base font-medium text-white">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <StartMethodCard
            step="01 직접 입력"
            title="프로젝트 기본값을 바로 입력"
            description="위치, 용도, 공사 유형처럼 초기 판단에 핵심이 되는 항목부터 차분하게 채우는 방식입니다."
            secondary="법규 검토 흐름을 직접 통제하고 싶을 때 적합합니다."
            actionLabel="기본 정보 입력으로 이동"
            onClick={() => scrollToSection(formSectionRef)}
          />
          <StartMethodCard
            step="02 문서에서 정보 가져오기"
            title="지침서나 공모 문서를 먼저 정리"
            description="외부 AI에 문서를 첨부하고 이 사이트에서 복사한 프롬프트를 넣어 필요한 정보를 정리한 뒤, 아래 입력칸에 붙여넣는 방식입니다."
            secondary="설계지침서, 사업 설명자료, 발주 문서가 먼저 있는 경우에 적합합니다."
            actionLabel="문서 기반 입력으로 이동"
            onClick={() => scrollToSection(documentSectionRef)}
          />
        </section>

        <section ref={documentSectionRef} className="surface-card p-6 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
            <ExternalAiPanel />

            <div className="space-y-6">
              <StepLabel step="02" title="지침서에서 정보 가져오기" />
              <p className="text-sm leading-7 text-slate-600">
                설계공모지침서나 과업이행서가 있다면, ChatGPT 또는 Gemini에 문서를
                직접 첨부한 뒤 이 사이트에서 복사한 프롬프트를 붙여넣어 필요한
                정보를 정리할 수 있습니다. 정리된 결과를 다시 이곳에 붙여넣으면
                입력값을 채우는 데 도움을 받을 수 있습니다.
              </p>

              <div className="section-frame p-5">
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={handleCopyPrompt} className="solid-button">
                    프롬프트 복사
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPromptGuide((current) => !current)}
                    className="ghost-button"
                  >
                    {showPromptGuide ? "사용 방법 닫기" : "사용 방법 보기"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPromptPreview((current) => !current)}
                    className="ghost-button"
                  >
                    {showPromptPreview ? "프롬프트 닫기" : "프롬프트 미리보기"}
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="section-frame p-4">
                    <p className="eyebrow-number">Copy</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">프롬프트 복사</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      상단의 버튼으로 외부 AI에 붙여넣을 문장을 복사합니다.
                    </p>
                  </div>
                  <div className="section-frame p-4">
                    <p className="eyebrow-number">Guide</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">사용 방법 보기</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      왼쪽의 바로가기와 아래 입력칸을 어떤 순서로 쓰는지 확인합니다.
                    </p>
                  </div>
                  <div className="section-frame p-4">
                    <p className="eyebrow-number">Preview</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">프롬프트 미리보기</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      실제로 복사되는 프롬프트 내용을 접기/펼치기로 확인합니다.
                    </p>
                  </div>
                </div>

                <p className="mt-4 helper-text">
                  {copyState === "copied" && "프롬프트를 클립보드에 복사했습니다."}
                  {copyState === "failed" &&
                    "브라우저에서 복사를 허용하지 않아 프롬프트 복사에 실패했습니다."}
                  {copyState === "idle" &&
                    "복사한 문장은 왼쪽의 ChatGPT 또는 Gemini 바로가기에서 바로 붙여넣어 사용할 수 있습니다."}
                </p>

                {showPromptGuide ? (
                  <div className="mt-5 section-frame p-5">
                    <p className="label-text">사용 방법</p>
                    <ol className="mt-3 grid gap-2 text-sm leading-7 text-slate-600">
                      <li>1. 상단의 [프롬프트 복사] 버튼을 누릅니다.</li>
                      <li>2. 왼쪽의 [ChatGPT 열기] 또는 [Gemini 열기] 버튼으로 외부 AI를 엽니다.</li>
                      <li>3. 설계공모지침서, 과업이행서, 설계지침서 파일을 외부 AI에 첨부합니다.</li>
                      <li>4. 복사한 프롬프트를 붙여넣고 실행합니다.</li>
                      <li>5. AI가 정리해준 결과를 복사합니다.</li>
                      <li>6. 아래의 [AI가 정리한 내용 붙여넣기] 칸에 붙여넣습니다.</li>
                      <li>7. [입력값 채우기] 버튼을 눌러 입력폼에 반영합니다.</li>
                      <li>8. 채워진 내용을 확인한 뒤 [법규 검토 항목 찾기]를 누릅니다.</li>
                    </ol>
                  </div>
                ) : null}

                {showPromptPreview ? (
                  <div className="mt-5 section-frame p-5">
                    <p className="label-text">프롬프트 미리보기</p>
                    <pre className="mt-4 max-h-[360px] overflow-auto whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                      {documentAnalysisPrompt}
                    </pre>
                  </div>
                ) : null}
              </div>

              <div className="section-frame p-5">
                <Field
                  label="AI가 정리한 내용 붙여넣기"
                  description="ChatGPT 또는 Gemini가 정리해준 결과를 그대로 붙여넣으세요. 붙여넣은 내용에서 읽을 수 있는 항목만 입력폼에 자동으로 반영됩니다. 잘못 들어간 값은 직접 수정할 수 있습니다."
                >
                  <textarea
                    value={pastedAiSummary}
                    onChange={(event) => setPastedAiSummary(event.target.value)}
                    placeholder={`[기본 정보]
사업명: ○○문화복합센터 건립사업
대지 위치: ○○시 ○○구 ○○동 000-00번지 일원
지역 / 지자체: ○○시 ○○구
건축물 용도: 문화 및 집회시설
대지면적: 1234.56㎡
연면적: 987.65㎡
건축 행위: 신축`}
                    className="input-field input-area mt-2"
                  />
                </Field>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={handleApplyAiSummary} className="solid-button">
                    입력값 채우기
                  </button>
                  <p className="helper-text">
                    {applyState === "applied" && "아래 입력폼에 값을 채웠습니다."}
                    {applyState === "partial" &&
                      "일부 항목만 반영되었습니다. 비어 있는 값은 아래 입력폼에서 직접 확인해 주세요."}
                    {applyState === "empty" &&
                      "먼저 외부 AI가 정리한 내용을 위 입력칸에 붙여넣어 주세요."}
                    {applyState === "not-found" &&
                      "항목명을 찾지 못했습니다. 미리보기의 형식과 라벨명을 다시 확인해 주세요."}
                    {applyState === "idle" &&
                      "붙여넣은 내용에서 읽을 수 있는 항목만 아래 입력폼에 반영됩니다."}
                  </p>
                </div>

                {(recognizedItems.length > 0 || missingItems.length > 0) && (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="section-frame p-4">
                      <p className="eyebrow-number">Recognized</p>
                      <h3 className="mt-2 text-base font-semibold text-slate-900">읽은 항목</h3>
                      {recognizedPreview.length > 0 ? (
                        <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                          {recognizedPreview.map((item) => (
                            <li
                              key={`${item.label}-${item.value}`}
                              className="border-t border-[rgba(26,32,37,0.08)] pt-2 first:border-t-0 first:pt-0"
                            >
                              {item.label}: {item.value}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">읽은 항목이 없습니다.</p>
                      )}
                    </div>

                    <div className="section-frame p-4">
                      <p className="eyebrow-number">Need Check</p>
                      <h3 className="mt-2 text-base font-semibold text-slate-900">추가 확인 필요</h3>
                      {missingItems.length > 0 ? (
                        <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                          {missingItems.map((item) => (
                            <li
                              key={item}
                              className="border-t border-[rgba(26,32,37,0.08)] pt-2 first:border-t-0 first:pt-0"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-slate-500">확인 필요한 항목이 없습니다.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <form ref={formSectionRef} className="grid gap-6" onSubmit={handleSubmit}>
          {validationMessage ? (
            <div className="border border-amber-300 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900">
              {validationMessage}
            </div>
          ) : null}

          <section className="surface-card p-6 md:p-8">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <StepLabel step="03" title="기본 정보 입력" />
                <p className="max-w-3xl text-sm leading-7 text-slate-600">
                  위치와 용도만 먼저 알아도 검토를 시작할 수 있습니다. 이후 면적,
                  층수, 높이, 공사 유형을 더할수록 결과 정밀도가 높아집니다.
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field
                    label="대지 위치"
                    description="주소, 대상지명, 블록명 등 확인 가능한 수준으로 입력해 주세요."
                    badge="필수"
                    className="md:col-span-2"
                  >
                    <input
                      type="text"
                      value={form.location}
                      onChange={(event) => {
                        setForm((current) => ({ ...current, location: event.target.value }));
                        setValidationMessage("");
                      }}
                      placeholder="예: 서울특별시 종로구 청운동"
                      className="input-field"
                    />
                  </Field>

                  <Field
                    label="지역 / 지자체"
                    description="관할 지자체를 알고 있다면 함께 입력해 주세요."
                  >
                    <input
                      type="text"
                      value={form.municipality}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, municipality: event.target.value }))
                      }
                      placeholder="예: 서울특별시 종로구"
                      className="input-field"
                    />
                  </Field>

                  <Field
                    label="건축물 용도"
                    description="카페, 업무시설, 전시시설, 공동주택처럼 계획 중인 주요 쓰임을 적어 주세요."
                    badge="필수"
                  >
                    <input
                      type="text"
                      value={form.buildingUse}
                      onChange={(event) => {
                        setForm((current) => ({ ...current, buildingUse: event.target.value }));
                        setValidationMessage("");
                      }}
                      placeholder="예: 근린생활시설"
                      className="input-field"
                    />
                  </Field>

                  <Field
                    label="대지면적"
                    description="정확하지 않아도 대략적인 수치가 있으면 검토에 도움이 됩니다."
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.siteArea}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, siteArea: event.target.value }))
                      }
                      placeholder="예: 1234.56"
                      className="input-field"
                    />
                  </Field>

                  <Field
                    label="연면적"
                    description="예상 규모 또는 참고 가능한 전체 면적을 입력해 주세요."
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.totalFloorArea}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, totalFloorArea: event.target.value }))
                      }
                      placeholder="예: 987.65"
                      className="input-field"
                    />
                  </Field>
                </div>

                <ConstructionActionGrid
                  selectedValue={form.constructionAction}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      constructionAction: value,
                    }))
                  }
                />
              </div>

              <aside className="section-frame h-fit p-5">
                <p className="eyebrow-number">Project Status</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-900">
                  현재 입력 상태
                </h3>
                <div className="mt-5 grid gap-4">
                  <div className="border-b border-[rgba(26,32,37,0.08)] pb-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">필수 입력</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                      {minimumRequiredFields.length - missingMinimumFields.length}/
                      {minimumRequiredFields.length}
                    </p>
                  </div>
                  <div className="border-b border-[rgba(26,32,37,0.08)] pb-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">자동 인식</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                      {recognizedItems.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">추가 확인</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                      {missingItems.length}
                    </p>
                  </div>
                </div>
                <p className="architectural-note mt-6">
                  필수 항목만 채운 뒤에도 결과 화면으로 넘어가 검토 우선순위를 먼저 볼 수 있습니다.
                </p>
              </aside>
            </div>
          </section>

          <AccordionSection
            step="04"
            title="상세 조건 입력"
            description="용도지역, 층수, 공공 여부, 특수 조건을 더 입력하면 검토 결과를 더 세밀하게 정리할 수 있습니다."
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
              <Field
                label="용도지역"
                description="토지이용계획확인서나 발주 문서에 적힌 값을 그대로 입력해 주세요."
              >
                <input
                  type="text"
                  value={form.zoningDistrict}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, zoningDistrict: event.target.value }))
                  }
                  placeholder="예: 제2종일반주거지역"
                  className="input-field"
                />
              </Field>

              <Field label="용도지구" description="해당 없으면 비워 두셔도 됩니다.">
                <input
                  type="text"
                  value={form.useDistrict}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, useDistrict: event.target.value }))
                  }
                  placeholder="예: 방화지구"
                  className="input-field"
                />
              </Field>

              <Field label="용도구역" description="개발제한구역 등 별도 지정 여부를 입력합니다.">
                <input
                  type="text"
                  value={form.useZone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, useZone: event.target.value }))
                  }
                  placeholder="예: 개발제한구역"
                  className="input-field"
                />
              </Field>

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
                helperText="해당 여부를 모르더라도 검토는 가능합니다."
              />
            </div>
          </AccordionSection>

          <AccordionSection
            step="04A"
            title="건축물 상세 조건"
            description="층수, 높이, 공공 여부 같은 정보는 일부 검토 항목의 적용 여부를 더 선명하게 만들어 줍니다."
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
              <Field label="지상층수" description="예상 층수만 알아도 좋습니다.">
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
              </Field>

              <Field label="지하층수" description="없다면 비워 두거나 0을 입력해 주세요.">
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
              </Field>

              <Field label="건축물 높이" description="미터 기준으로 입력하면 됩니다.">
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
                  placeholder="예: 18.5"
                  className="input-field"
                />
              </Field>

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
                helperText="발주 성격에 따라 추가 절차나 기준이 달라질 수 있습니다."
              />
            </div>
          </AccordionSection>

          <AccordionSection
            step="04B"
            title="특수 조건 입력"
            description="문화재, 하천, 학교환경, 산지, 농지 인접 여부는 놓치기 쉬운 별도 검토를 만들어낼 수 있습니다."
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
                legend="문화재 관련"
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
                legend="하천 관련"
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
                legend="학교환경 관련"
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
                legend="산지 관련"
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
                legend="농지 관련"
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

          <section className="surface-card p-6 md:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-end">
              <div className="space-y-5">
                <StepLabel step="05" title="검토 실행" />
                <p className="text-sm leading-7 text-slate-600">
                  입력한 정보를 바탕으로 결과 화면에서 프로젝트 요약, 검토 결과
                  요약, 세부 카드형 검토 항목을 순서대로 확인할 수 있습니다.
                </p>
                <div className="architectural-note">
                  결과 화면에서는 필수 검토, 놓치기 쉬운 항목, 추가 확인 항목을
                  구분해서 보여주며 긴 내용은 접기/펼치기로 확인합니다.
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <DetailPreviewCard
                  title="프로젝트 요약"
                  items={["위치, 용도, 행위 유형", "면적과 기본 규모", "공공/민간 구분"]}
                />
                <DetailPreviewCard
                  title="검토 결과 요약"
                  items={["필수 검토 수량", "놓치기 쉬운 항목 수량", "추가 확인 수량"]}
                />
                <DetailPreviewCard
                  title="세부 결과 카드"
                  items={["짧은 설명", "자세히 보기", "관련 법령 및 확인 포인트"]}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t muted-divider pt-6">
              <p className="text-sm leading-6 text-slate-600">
                필수 입력만 채워도 검토를 시작할 수 있습니다. 더 많은 값을 입력할수록
                결과가 구체적으로 정리됩니다.
              </p>
              <button type="submit" className="solid-button min-w-[180px]">
                법규 검토 항목 찾기
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
