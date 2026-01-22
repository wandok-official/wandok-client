const LEARNED_FEATURES = [
  { label: '포커스 모드 - 집중해서 읽기' },
  { label: '문단 분리 - 긴 글 나누기' },
  { label: '진행률 바 - 읽기 현황 확인' },
];

const RECOMMENDED_SITES = [
  { name: '브런치', url: 'https://brunch.co.kr' },
  { name: '미디엄', url: 'https://medium.com' },
  { name: '벨로그', url: 'https://velog.io' },
];

export const CompletedSection = () => {
  return (
    <section
      className=
        "min-h-screen py-20 px-4 bg-gradient-to-b from-gray-50 to-amber-50 flex items-center"
    >
      <div className="max-w-2xl mx-auto text-center mt-25">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          축하합니다!
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          완독 할 준비가 끝났네요!
        </p>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-15 mt-35">
          <h3 className="font-semibold text-gray-800 mb-4">앞으로 함께 할 기능</h3>
          <div className="flex flex-col gap-3 text-left">
            {LEARNED_FEATURES.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full bg-green-500 text-white
                    flex items-center justify-center text-sm"
                >
                  ✓
                </span>
                <span className="text-gray-700">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 mb-8 mt-40">
          <h3 className="font-semibold text-gray-800 mb-3">📚 추천 사이트</h3>
          <p className="text-gray-600 text-sm mb-4">
            완독이와 함께 읽어보세요
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {RECOMMENDED_SITES.map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white rounded-lg border border-gray-200
                  text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {site.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
