export const WelcomeCard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-amber-200 mb-15">
        <p className="text-lg font-medium text-gray-800 mb-4">
          익스텐션이 설치되었습니다!
        </p>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">W</span>
          </div>
          <span className="text-gray-600">←</span>
          <p className="text-gray-700">
            브라우저 우측 상단의<br />
            <strong>완독이 아이콘</strong>을 클릭하세요
          </p>
        </div>
        <p className="text-sm text-gray-500">
          활성화 후 스크롤하여 가이드를 시작할 수 있습니다
        </p>
      </div>
    </div>
  );
};
