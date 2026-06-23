import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white shadow-panel">
          <div className="grid gap-10 px-8 py-14 md:grid-cols-[1.2fr_0.8fr] md:px-14 md:py-20">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-sm font-medium tracking-tight text-white/90">
                공공서비스형 건축 검토 지원
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                  건축 법규 검토 보조 앱
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-white/88">
                  대지 정보와 건축물 정보를 입력하면 관련 법규 체크리스트를
                  정리해주는 서비스입니다.
                </p>
              </div>
              <Link
                href="/check"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-brand-900 transition hover:bg-slate-100"
              >
                검토 시작하기
              </Link>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <div className="rounded-2xl bg-white/95 p-6 text-slate-900">
                <p className="text-sm font-semibold text-brand-700">
                  서비스 안내
                </p>
                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
                  <p>1. 대지 위치와 건축 개요를 입력합니다.</p>
                  <p>2. 검토에 필요한 기본 정보를 한 화면에서 정리합니다.</p>
                  <p>3. 다음 단계에서 법규 체크리스트 기능을 확장할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
