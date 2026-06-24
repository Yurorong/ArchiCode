import { NextResponse } from "next/server";

const LAW_SEARCH_URL = "https://www.law.go.kr/DRF/lawSearch.do";
const DISPLAY_LIMIT = "5";
const RAW_TEXT_PREVIEW_LIMIT = 500;
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (compatible; ArchiCodeKR/1.0; +https://archi-code-kappa.vercel.app/)";

type LawSearchItem = {
  lawName: string;
  lawId: string;
  mst: string;
  promulgationDate: string;
  enforcementDate: string;
  ministry: string;
  lawType: string;
  detailLink: string;
};

type RequestCheck = {
  hasOC: boolean;
  hasTarget: boolean;
  target: string;
  hasType: boolean;
  type: string;
  hasQuery: boolean;
  query: string;
  display: string;
};

type DebugInfo = {
  hasOc: boolean;
  ocLength: number;
  requestCheck: RequestCheck;
  upstreamStatus: number | null;
  upstreamContentType: string;
  rawTextPreview: string;
  userAgentApplied: true;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function toArray<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null) {
    return [];
  }

  return [value];
}

function getString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function looksLikeHtml(rawText: string) {
  const normalized = rawText.trim().toLowerCase();
  return normalized.startsWith("<!doctype html") || normalized.startsWith("<html");
}

function looksLikeXml(rawText: string) {
  const normalized = rawText.trim().toLowerCase();
  return normalized.startsWith("<?xml") || normalized.startsWith("<lawsearch") || normalized.startsWith("<result");
}

function looksLikeLawItem(record: Record<string, unknown>) {
  return [
    "법령명한글",
    "법령ID",
    "법령일련번호",
    "공포일자",
    "시행일자",
    "소관부처명",
    "법령구분명",
    "법령상세링크",
    "lawName",
    "lawId",
    "mst",
    "promulgationDate",
    "enforcementDate",
    "ministry",
    "lawType",
    "detailLink",
  ].some((key) => key in record);
}

function normalizeLawItem(record: Record<string, unknown>): LawSearchItem | null {
  const lawName = getString(record, ["법령명한글", "법령명", "lawName"]);

  if (!lawName) {
    return null;
  }

  return {
    lawName,
    lawId: getString(record, ["법령ID", "lawId"]),
    mst: getString(record, ["법령일련번호", "MST", "mst"]),
    promulgationDate: getString(record, ["공포일자", "promulgationDate"]),
    enforcementDate: getString(record, ["시행일자", "enforcementDate"]),
    ministry: getString(record, ["소관부처명", "ministry"]),
    lawType: getString(record, ["법령구분명", "법령종류명", "lawType"]),
    detailLink: getString(record, ["법령상세링크", "detailLink"]),
  };
}

function collectLawItems(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectLawItems(item));
  }

  const record = asRecord(value);

  if (!record) {
    return [];
  }

  const nestedMatches = Object.values(record).flatMap((item) => collectLawItems(item));

  if (looksLikeLawItem(record)) {
    return [record, ...nestedMatches];
  }

  return nestedMatches;
}

function extractItems(payload: unknown) {
  const payloadRecord = asRecord(payload);
  const lawSearchRecord = asRecord(payloadRecord?.LawSearch);
  const directCandidates = [
    lawSearchRecord?.law,
    payloadRecord?.law,
    payloadRecord?.LawSearch,
  ];

  const directRecords = directCandidates.flatMap((candidate) =>
    toArray(candidate)
      .map((item) => asRecord(item))
      .filter((item): item is Record<string, unknown> => item !== null),
  );

  const sourceRecords = directRecords.length > 0 ? directRecords : collectLawItems(payload);
  const normalizedItems = sourceRecords
    .map((record) => normalizeLawItem(record))
    .filter((item): item is LawSearchItem => item !== null);

  return Array.from(
    new Map(
      normalizedItems.map((item) => [
        `${item.lawName}::${item.lawId}::${item.mst}::${item.detailLink}`,
        item,
      ]),
    ).values(),
  );
}

function withDebug(
  body: Record<string, unknown>,
  debug: boolean,
  debugInfo: DebugInfo,
) {
  if (!debug) {
    return body;
  }

  return {
    ...body,
    debug: debugInfo,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const debug = searchParams.get("debug") === "1";
  const oc = process.env.LAW_OPEN_API_OC?.trim();
  const userAgent = process.env.LAW_USER_AGENT?.trim() || DEFAULT_USER_AGENT;
  const requestCheck: RequestCheck = {
    hasOC: Boolean(oc),
    hasTarget: true,
    target: "law",
    hasType: true,
    type: "JSON",
    hasQuery: Boolean(keyword),
    query: keyword,
    display: DISPLAY_LIMIT,
  };
  const baseDebugInfo: DebugInfo = {
    hasOc: Boolean(oc),
    ocLength: oc?.length ?? 0,
    requestCheck,
    upstreamStatus: null,
    upstreamContentType: "",
    rawTextPreview: "",
    userAgentApplied: true,
  };

  if (!keyword) {
    return NextResponse.json(
      withDebug(
        {
          ok: false,
          error: "검색어가 없습니다.",
        },
        debug,
        baseDebugInfo,
      ),
      { status: 400 },
    );
  }

  if (!oc) {
    return NextResponse.json(
      withDebug(
        {
          ok: false,
          error: "LAW_OPEN_API_OC 환경변수가 설정되지 않았습니다.",
        },
        debug,
        baseDebugInfo,
      ),
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    OC: oc,
    target: "law",
    type: "JSON",
    query: keyword,
    display: DISPLAY_LIMIT,
  });
  const url = `${LAW_SEARCH_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        Accept: "application/json,text/plain,*/*",
      },
      cache: "no-store",
    });

    const rawText = await response.text();
    const debugInfo: DebugInfo = {
      ...baseDebugInfo,
      upstreamStatus: response.status,
      upstreamContentType: response.headers.get("content-type") ?? "",
      rawTextPreview: rawText.slice(0, RAW_TEXT_PREVIEW_LIMIT),
      userAgentApplied: true,
    };

    if (!response.ok) {
      return NextResponse.json(
        withDebug(
          {
            ok: false,
            keyword,
            items: [],
            error: "공식 법령 후보를 불러오지 못했습니다.",
          },
          debug,
          debugInfo,
        ),
        { status: 502 },
      );
    }

    if (looksLikeHtml(rawText) || looksLikeXml(rawText)) {
      return NextResponse.json(
        withDebug(
          {
            ok: false,
            keyword,
            items: [],
            error: "공식 법령 후보를 불러오지 못했습니다.",
          },
          debug,
          debugInfo,
        ),
        { status: 502 },
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        withDebug(
          {
            ok: false,
            keyword,
            items: [],
            error: "공식 법령 후보를 불러오지 못했습니다.",
          },
          debug,
          debugInfo,
        ),
        { status: 502 },
      );
    }

    const items = extractItems(parsed);

    return NextResponse.json(
      withDebug(
        {
          ok: true,
          keyword,
          items,
        },
        debug,
        debugInfo,
      ),
    );
  } catch {
    return NextResponse.json(
      withDebug(
        {
          ok: false,
          keyword,
          items: [],
          error: "공식 법령 후보를 불러오지 못했습니다.",
        },
        debug,
        baseDebugInfo,
      ),
      { status: 502 },
    );
  }
}
