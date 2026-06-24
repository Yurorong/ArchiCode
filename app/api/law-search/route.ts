import { NextResponse } from "next/server";

const LAW_SEARCH_URL = "https://www.law.go.kr/DRF/lawSearch.do";
const DISPLAY_LIMIT = 5;

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
  ].some((key) => key in record);
}

function collectLawItems(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectLawItems(item));
  }

  const record = asRecord(value);

  if (!record) {
    return [];
  }

  const nested = Object.values(record).flatMap((item) => collectLawItems(item));

  if (looksLikeLawItem(record)) {
    return [record, ...nested];
  }

  return nested;
}

function normalizeLawItem(record: Record<string, unknown>): LawSearchItem | null {
  const lawName = getString(record, ["법령명한글"]);

  if (!lawName) {
    return null;
  }

  return {
    lawName,
    lawId: getString(record, ["법령ID"]),
    mst: getString(record, ["법령일련번호", "MST", "mst"]),
    promulgationDate: getString(record, ["공포일자"]),
    enforcementDate: getString(record, ["시행일자"]),
    ministry: getString(record, ["소관부처명"]),
    lawType: getString(record, ["법령구분명"]),
    detailLink: getString(record, ["법령상세링크"]),
  };
}

function extractItems(payload: unknown) {
  const payloadRecord = asRecord(payload);
  const lawSearchRecord = asRecord(payloadRecord?.LawSearch);
  const directCandidates = [
    lawSearchRecord?.law,
    lawSearchRecord?.laws,
    payloadRecord?.law,
    payloadRecord?.laws,
  ];

  const directItems = directCandidates.flatMap((candidate) =>
    toArray(candidate).map((item) => asRecord(item)).filter((item): item is Record<string, unknown> => item !== null),
  );

  const collectedItems = directItems.length > 0 ? directItems : collectLawItems(payload);
  const normalizedItems = collectedItems
    .map((item) => normalizeLawItem(item))
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword")?.trim() ?? "";

  if (!keyword) {
    return NextResponse.json(
      {
        ok: false,
        error: "검색어가 없습니다.",
      },
      { status: 400 },
    );
  }

  const oc = process.env.LAW_OPEN_API_OC;

  if (!oc) {
    return NextResponse.json(
      {
        ok: false,
        error: "LAW_OPEN_API_OC 환경변수가 설정되지 않았습니다.",
      },
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
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Law search request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as unknown;
    const items = extractItems(payload);

    return NextResponse.json({
      ok: true,
      keyword,
      items,
    });
  } catch (error) {
    console.error("[law-search-route] 공식 법령 후보 조회 실패", error);

    return NextResponse.json(
      {
        ok: false,
        keyword,
        items: [],
        error: "공식 법령 후보를 불러오지 못했습니다.",
      },
      { status: 502 },
    );
  }
}
