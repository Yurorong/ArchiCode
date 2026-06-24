import { NextResponse } from "next/server";

const LAW_SEARCH_URL = "https://www.law.go.kr/DRF/lawSearch.do";
const DISPLAY_LIMIT = "5";
const RAW_TEXT_PREVIEW_LIMIT = 500;
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (compatible; ArchiCodeKR/1.0; +https://archi-code-kappa.vercel.app/)";
const DEFAULT_REFERER = "https://archi-code-kappa.vercel.app/";

const KOREAN_KEYS = {
  lawName: "\uBC95\uB839\uBA85\uD55C\uAE00",
  lawNameAlt: "\uBC95\uB839\uBA85",
  lawId: "\uBC95\uB839ID",
  mst: "\uBC95\uB839\uC77C\uB828\uBC88\uD638",
  promulgationDate: "\uACF5\uD3EC\uC77C\uC790",
  enforcementDate: "\uC2DC\uD589\uC77C\uC790",
  ministry: "\uC18C\uAD00\uBD80\uCC98\uBA85",
  lawType: "\uBC95\uB839\uAD6C\uBD84\uBA85",
  detailLink: "\uBC95\uB839\uC0C1\uC138\uB9C1\uD06C",
  result: "\uACB0\uACFC",
  message: "\uBA54\uC2DC\uC9C0",
} as const;

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

function getString(record: Record<string, unknown>, keys: readonly string[]) {
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
    KOREAN_KEYS.lawName,
    KOREAN_KEYS.lawNameAlt,
    KOREAN_KEYS.lawId,
    KOREAN_KEYS.mst,
    KOREAN_KEYS.promulgationDate,
    KOREAN_KEYS.enforcementDate,
    KOREAN_KEYS.ministry,
    KOREAN_KEYS.lawType,
    KOREAN_KEYS.detailLink,
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
  const lawName = getString(record, [KOREAN_KEYS.lawName, KOREAN_KEYS.lawNameAlt, "lawName"]);

  if (!lawName) {
    return null;
  }

  return {
    lawName,
    lawId: getString(record, [KOREAN_KEYS.lawId, "lawId"]),
    mst: getString(record, [KOREAN_KEYS.mst, "MST", "mst"]),
    promulgationDate: getString(record, [KOREAN_KEYS.promulgationDate, "promulgationDate"]),
    enforcementDate: getString(record, [KOREAN_KEYS.enforcementDate, "enforcementDate"]),
    ministry: getString(record, [KOREAN_KEYS.ministry, "ministry"]),
    lawType: getString(record, [KOREAN_KEYS.lawType, "lawType"]),
    detailLink: getString(record, [KOREAN_KEYS.detailLink, "detailLink"]),
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

function withDebug(body: Record<string, unknown>, debug: boolean, debugInfo: DebugInfo) {
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
  const referer = process.env.LAW_API_REFERER?.trim() || DEFAULT_REFERER;
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
          error: "\uAC80\uC0C9\uC5B4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
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
          error: "LAW_OPEN_API_OC \uD658\uACBD\uBCC0\uC218\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
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
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        Referer: referer,
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
            error: "\uACF5\uC2DD \uBC95\uB839 \uD6C4\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
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
            error: "\uACF5\uC2DD \uBC95\uB839 \uD6C4\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
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
            error: "\uACF5\uC2DD \uBC95\uB839 \uD6C4\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
          },
          debug,
          debugInfo,
        ),
        { status: 502 },
      );
    }

    const parsedRecord = asRecord(parsed);
    const upstreamResult = getString(parsedRecord ?? {}, ["result", KOREAN_KEYS.result]);
    const upstreamMessage = getString(parsedRecord ?? {}, ["msg", "message", "error", KOREAN_KEYS.message]);

    if (upstreamResult && upstreamResult !== "success" && extractItems(parsed).length === 0) {
      return NextResponse.json(
        withDebug(
          {
            ok: false,
            keyword,
            items: [],
            error: upstreamMessage || "\uACF5\uC2DD \uBC95\uB839 \uD6C4\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
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
          error: "\uACF5\uC2DD \uBC95\uB839 \uD6C4\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.",
        },
        debug,
        baseDebugInfo,
      ),
      { status: 502 },
    );
  }
}
