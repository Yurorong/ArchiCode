import { NextResponse } from "next/server";

const LAW_SEARCH_URL = "https://www.law.go.kr/DRF/lawSearch.do";
const DISPLAY_LIMIT = 5;
const RAW_TEXT_PREVIEW_LIMIT = 500;

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

type DebugInfo = {
  upstreamUrlWithoutOC: string;
  upstreamStatus: number | null;
  upstreamContentType: string;
  rawTextPreview: string;
  parsedTopLevelKeys: string[];
  detectedResultPath: string;
  itemCountBeforeNormalize: number;
  itemCountAfterNormalize: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
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

function toArray<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null) {
    return [];
  }

  return [value];
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

function extractDirectCandidates(payloadRecord: Record<string, unknown> | null) {
  const lawSearchRecord = asRecord(payloadRecord?.LawSearch);
  const directPaths = [
    { path: "data.LawSearch.law", value: lawSearchRecord?.law },
    { path: "data.law", value: payloadRecord?.law },
    { path: "data.LawSearch", value: payloadRecord?.LawSearch },
  ];

  for (const candidate of directPaths) {
    const values = toArray(candidate.value)
      .map((item) => asRecord(item))
      .filter((item): item is Record<string, unknown> => item !== null);

    if (values.length > 0) {
      return {
        detectedResultPath: candidate.path,
        records: values,
      };
    }
  }

  return {
    detectedResultPath: "unmatched",
    records: [] as Record<string, unknown>[],
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
  const direct = extractDirectCandidates(payloadRecord);
  const fallbackRecords =
    direct.records.length > 0 ? direct.records : collectLawItems(payload);
  const detectedResultPath =
    direct.records.length > 0
      ? direct.detectedResultPath
      : fallbackRecords.length > 0
        ? "recursive-scan"
        : "unmatched";
  const normalizedItems = fallbackRecords
    .map((record) => normalizeLawItem(record))
    .filter((item): item is LawSearchItem => item !== null);
  const dedupedItems = Array.from(
    new Map(
      normalizedItems.map((item) => [
        `${item.lawName}::${item.lawId}::${item.mst}::${item.detailLink}`,
        item,
      ]),
    ).values(),
  );

  return {
    detectedResultPath,
    itemCountBeforeNormalize: fallbackRecords.length,
    itemCountAfterNormalize: dedupedItems.length,
    items: dedupedItems,
  };
}

function buildMaskedUpstreamUrl(keyword: string) {
  return (
    `${LAW_SEARCH_URL}?OC=***` +
    `&target=law&type=JSON&query=${encodeURIComponent(keyword)}&display=${DISPLAY_LIMIT}`
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
  const upstreamUrlWithoutOC = buildMaskedUpstreamUrl(keyword);
  const baseDebugInfo: DebugInfo = {
    upstreamUrlWithoutOC,
    upstreamStatus: null,
    upstreamContentType: "",
    rawTextPreview: "",
    parsedTopLevelKeys: [],
    detectedResultPath: "not-requested",
    itemCountBeforeNormalize: 0,
    itemCountAfterNormalize: 0,
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

  const oc = process.env.LAW_OPEN_API_OC;

  if (!oc) {
    return NextResponse.json(
      withDebug(
        {
          ok: false,
          keyword,
          items: [],
          error: "LAW_OPEN_API_OC 환경변수가 설정되지 않았습니다.",
          reason: "missing-env",
        },
        debug,
        baseDebugInfo,
      ),
      { status: 500 },
    );
  }

  const requestUrl =
    `${LAW_SEARCH_URL}?OC=${encodeURIComponent(oc)}` +
    `&target=law&type=JSON&query=${encodeURIComponent(keyword)}&display=${DISPLAY_LIMIT}`;

  try {
    const response = await fetch(requestUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    const rawText = await response.text();
    const upstreamStatus = response.status;
    const upstreamContentType = response.headers.get("content-type") ?? "";
    const rawTextPreview = rawText.slice(0, RAW_TEXT_PREVIEW_LIMIT);

    if (!response.ok) {
      return NextResponse.json(
        withDebug(
          {
            ok: false,
            keyword,
            items: [],
            error: "공식 법령 후보를 불러오지 못했습니다.",
            reason: "upstream-http-error",
          },
          debug,
          {
            ...baseDebugInfo,
            upstreamStatus,
            upstreamContentType,
            rawTextPreview,
          },
        ),
        { status: 502 },
      );
    }

    if (looksLikeHtml(rawText)) {
      return NextResponse.json(
        withDebug(
          {
            ok: false,
            keyword,
            items: [],
            error: "공식 법령 후보를 불러오지 못했습니다.",
            reason: "upstream-html-response",
          },
          debug,
          {
            ...baseDebugInfo,
            upstreamStatus,
            upstreamContentType,
            rawTextPreview,
          },
        ),
        { status: 502 },
      );
    }

    if (looksLikeXml(rawText)) {
      return NextResponse.json(
        withDebug(
          {
            ok: false,
            keyword,
            items: [],
            error: "공식 법령 후보를 불러오지 못했습니다.",
            reason: "upstream-xml-response",
          },
          debug,
          {
            ...baseDebugInfo,
            upstreamStatus,
            upstreamContentType,
            rawTextPreview,
          },
        ),
        { status: 502 },
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      console.error("[law-search-route] JSON 파싱 실패", error);

      return NextResponse.json(
        withDebug(
          {
            ok: false,
            keyword,
            items: [],
            error: "공식 법령 후보를 불러오지 못했습니다.",
            reason: "json-parse-failed",
          },
          debug,
          {
            ...baseDebugInfo,
            upstreamStatus,
            upstreamContentType,
            rawTextPreview,
          },
        ),
        { status: 502 },
      );
    }

    const parsedTopLevelKeys = Object.keys(asRecord(parsed) ?? {});
    const extracted = extractItems(parsed);
    const parsedRecord = asRecord(parsed);
    const upstreamErrorMessage =
      getString(parsedRecord ?? {}, ["result"]) !== "success"
        ? getString(parsedRecord ?? {}, ["msg", "message", "error"])
        : "";

    if (extracted.items.length === 0) {
      const reason =
        upstreamErrorMessage
          ? "upstream-api-error"
          : extracted.detectedResultPath === "unmatched"
            ? "response-structure-mismatch"
            : "no-search-results";

      return NextResponse.json(
        withDebug(
          {
            ok: true,
            keyword,
            items: [],
            reason,
            error: upstreamErrorMessage || undefined,
          },
          debug,
          {
            ...baseDebugInfo,
            upstreamStatus,
            upstreamContentType,
            rawTextPreview,
            parsedTopLevelKeys,
            detectedResultPath: extracted.detectedResultPath,
            itemCountBeforeNormalize: extracted.itemCountBeforeNormalize,
            itemCountAfterNormalize: extracted.itemCountAfterNormalize,
          },
        ),
      );
    }

    return NextResponse.json(
      withDebug(
        {
          ok: true,
          keyword,
          items: extracted.items,
        },
        debug,
        {
          ...baseDebugInfo,
          upstreamStatus,
          upstreamContentType,
          rawTextPreview,
          parsedTopLevelKeys,
          detectedResultPath: extracted.detectedResultPath,
          itemCountBeforeNormalize: extracted.itemCountBeforeNormalize,
          itemCountAfterNormalize: extracted.itemCountAfterNormalize,
        },
      ),
    );
  } catch (error) {
    console.error("[law-search-route] 공식 법령 후보 조회 실패", error);

    return NextResponse.json(
      withDebug(
        {
          ok: false,
          keyword,
          items: [],
          error: "공식 법령 후보를 불러오지 못했습니다.",
          reason: "request-failed",
        },
        debug,
        baseDebugInfo,
      ),
      { status: 502 },
    );
  }
}
