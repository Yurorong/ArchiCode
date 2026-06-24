import { NextResponse } from "next/server";
import { searchLawOpenApi } from "@/src/lib/lawOpenApi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword")?.trim() ?? "";
  const oc = process.env.LAW_OPEN_API_OC?.trim();

  if (!keyword) {
    return NextResponse.json({ message: "검색어가 필요합니다." }, { status: 400 });
  }

  if (!oc) {
    return NextResponse.json(
      { message: "법령 검색 설정이 준비되지 않았습니다." },
      { status: 500 },
    );
  }

  try {
    const items = await searchLawOpenApi(keyword);

    return NextResponse.json({
      keyword,
      items: items.map((item) => ({
        lawName: item.lawName || "",
        lawId: item.lawId || "",
        mst: item.mst || "",
        promulgationDate: item.promulgationDate || "",
        enforcementDate: item.enforcementDate || "",
        ministry: item.ministry || "",
        lawType: item.lawType || "",
      })),
    });
  } catch (error) {
    console.error("[law-search-route] Failed to load law candidates.", { keyword, error });

    return NextResponse.json(
      {
        keyword,
        items: [],
        message: "공식 법령 후보를 불러오지 못했습니다. 직접 확인이 필요합니다.",
      },
      { status: 502 },
    );
  }
}
