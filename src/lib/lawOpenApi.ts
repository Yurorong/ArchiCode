import type { ChecklistIssue, LawSearchCandidate } from "./checklistCards";

const LAW_SEARCH_PRIMARY_URL = "https://www.law.go.kr/DRF/lawSearch.do";
const LAW_SEARCH_FALLBACK_URL = "http://www.law.go.kr/DRF/lawSearch.do";
const LAW_SEARCH_DISPLAY_LIMIT = 5;
const MAX_KEYWORDS_PER_ISSUE = 2;
const MAX_TOTAL_KEYWORDS = 12;
const MAX_CANDIDATES_PER_ISSUE = 5;

type KeywordSearchResult = {
  items: LawSearchCandidate[];
  failed: boolean;
};

function getFirstString(record: Record<string, unknown>, keys: string[]) {
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

function looksLikeLawRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return [
    "법령명한글",
    "법령명",
    "법령명_한글",
    "lawName",
    "법령ID",
    "lawId",
    "MST",
    "mst",
  ].some((key) => key in record);
}

function collectLawRecords(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => collectLawRecords(item));
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const nestedMatches = Object.values(record).flatMap((value) => collectLawRecords(value));

  if (looksLikeLawRecord(record)) {
    return [record, ...nestedMatches];
  }

  return nestedMatches;
}

function normalizeLawRecord(record: Record<string, unknown>): LawSearchCandidate | null {
  const lawName = getFirstString(record, ["법령명한글", "법령명", "법령명_한글", "lawName"]);

  if (!lawName) {
    return null;
  }

  return {
    lawName,
    lawId: getFirstString(record, ["법령ID", "법령일련번호", "법령id", "lawId"]),
    mst: getFirstString(record, ["MST", "mst"]),
    promulgationDate: getFirstString(record, ["공포일자", "공포일", "promulgationDate"]),
    enforcementDate: getFirstString(record, ["시행일자", "시행일", "enforcementDate"]),
    ministry: getFirstString(record, ["소관부처명", "소관부처", "부처명", "ministry"]),
    lawType: getFirstString(record, ["법종구분명", "법종명", "lawType"]),
  };
}

async function fetchLawSearchJson(keyword: string, oc: string, baseUrl: string) {
  const params = new URLSearchParams({
    OC: oc,
    target: "law",
    type: "JSON",
    display: String(LAW_SEARCH_DISPLAY_LIMIT),
    query: keyword,
  });

  const response = await fetch(`${baseUrl}?${params.toString()}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Law search request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as Record<string, unknown>;

  if (typeof payload.result === "string" && payload.result !== "success") {
    const message =
      typeof payload.msg === "string" && payload.msg
        ? payload.msg
        : "Law search request returned an error result.";
    throw new Error(message);
  }

  return payload;
}

export async function searchLawOpenApi(keyword: string): Promise<LawSearchCandidate[]> {
  const trimmedKeyword = keyword.trim();
  const oc = process.env.LAW_OPEN_API_OC?.trim();

  if (!trimmedKeyword) {
    return [];
  }

  if (!oc) {
    throw new Error("LAW_OPEN_API_OC is not configured.");
  }

  let payload: unknown;

  try {
    payload = await fetchLawSearchJson(trimmedKeyword, oc, LAW_SEARCH_PRIMARY_URL);
  } catch (primaryError) {
    try {
      payload = await fetchLawSearchJson(trimmedKeyword, oc, LAW_SEARCH_FALLBACK_URL);
    } catch {
      throw primaryError;
    }
  }

  const normalized = collectLawRecords(payload)
    .map((record) => normalizeLawRecord(record))
    .filter((item): item is LawSearchCandidate => item !== null);

  const deduped = Array.from(
    new Map(
      normalized.map((item) => [
        `${item.lawId}::${item.mst}::${item.lawName}`,
        item,
      ]),
    ).values(),
  );

  return deduped.slice(0, LAW_SEARCH_DISPLAY_LIMIT);
}

function selectIssueKeywords(issue: ChecklistIssue) {
  return Array.from(
    new Set(issue.searchKeywords.map((keyword) => keyword.trim()).filter(Boolean)),
  ).slice(0, MAX_KEYWORDS_PER_ISSUE);
}

export async function enrichChecklistWithLawCandidates(checklist: ChecklistIssue[]) {
  const keywordsByIssue = new Map(checklist.map((issue) => [issue.id, selectIssueKeywords(issue)]));
  const uniqueKeywords = Array.from(new Set(Array.from(keywordsByIssue.values()).flat())).slice(
    0,
    MAX_TOTAL_KEYWORDS,
  );

  if (uniqueKeywords.length === 0) {
    return checklist.map((issue) => ({
      ...issue,
      relatedLawCandidates: [],
      relatedLawSearchFailed: false,
    }));
  }

  const keywordResults = new Map<string, KeywordSearchResult>(
    await Promise.all(
      uniqueKeywords.map(async (keyword) => {
        try {
          const items = await searchLawOpenApi(keyword);
          return [keyword, { items, failed: false } satisfies KeywordSearchResult] as const;
        } catch (error) {
          console.error("[law-search] Failed to load law candidates.", { keyword, error });
          return [keyword, { items: [] as LawSearchCandidate[], failed: true } satisfies KeywordSearchResult] as const;
        }
      }),
    ),
  );

  return checklist.map((issue) => {
    const selectedKeywords = (keywordsByIssue.get(issue.id) ?? []).filter((keyword) =>
      keywordResults.has(keyword),
    );
    const seen = new Set<string>();
    const relatedLawCandidates: LawSearchCandidate[] = [];

    for (const keyword of selectedKeywords) {
      const result = keywordResults.get(keyword);

      if (!result) {
        continue;
      }

      for (const item of result.items) {
        const key = `${item.lawId}::${item.mst}::${item.lawName}`;

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        relatedLawCandidates.push(item);

        if (relatedLawCandidates.length >= MAX_CANDIDATES_PER_ISSUE) {
          break;
        }
      }

      if (relatedLawCandidates.length >= MAX_CANDIDATES_PER_ISSUE) {
        break;
      }
    }

    return {
      ...issue,
      relatedLawCandidates,
      relatedLawSearchFailed:
        relatedLawCandidates.length === 0 &&
        selectedKeywords.some((keyword) => keywordResults.get(keyword)?.failed),
    };
  });
}
