const actionOptions = ["신축", "증축", "용도변경"];

export default function CheckPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-panel md:p-10">
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold text-brand-700">1단계 입력 화면</p>
            <h1 className="text-3xl font-bold">건축 정보 입력</h1>
            <p className="text-base leading-7 text-slate-600">
              아직 AI 검토 기능은 연결하지 않았으며, 입력 화면만 먼저 구성한
              상태입니다.
            </p>
          </div>

          <form className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">대지 위치</span>
              <input
                type="text"
                placeholder="예: 서울특별시 종로구 ..."
                className="input-field"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                건축물 용도
              </span>
              <input
                type="text"
                placeholder="예: 제2종 근린생활시설"
                className="input-field"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">대지면적</span>
              <input
                type="number"
                placeholder="㎡"
                className="input-field"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">연면적</span>
              <input
                type="number"
                placeholder="㎡"
                className="input-field"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">층수</span>
              <input
                type="number"
                placeholder="예: 5"
                className="input-field"
              />
            </label>

            <fieldset className="space-y-3 md:col-span-2">
              <legend className="text-sm font-semibold text-slate-700">
                건축 행위
              </legend>
              <div className="grid gap-3 md:grid-cols-3">
                {actionOptions.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-brand-500 hover:bg-brand-50"
                  >
                    <input
                      type="radio"
                      name="constructionAction"
                      value={option}
                      className="h-4 w-4 border-slate-300 text-brand-700 focus:ring-brand-500"
                      defaultChecked={option === "신축"}
                    />
                    <span className="text-sm font-medium text-slate-800">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="md:col-span-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                다음 단계 준비 중
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
