/**
 * 개인정보 처리방침 페이지
 * Chrome Web Store 심사를 위한 필수 문서
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 sm:p-12">
        {/* 헤더 */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">완독이 (Wandok)</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">개인정보 처리방침</h2>
          <p className="text-sm text-gray-500">최종 업데이트: 2026년 1월 23일</p>
        </header>

        {/* 요약 */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
          <p className="text-gray-800 leading-relaxed">
            <strong className="text-blue-900">완독이(Wandok)</strong>는 사용자의 개인정보를 수집, 저장, 
            전송하지 않습니다. 모든 기능은 사용자의 브라우저 내에서 로컬로 처리됩니다.
          </p>
        </div>

        {/* 1. 수집하는 데이터 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            1. 수집하는 데이터
          </h2>
          <p className="text-lg font-semibold text-gray-900 mb-3">없음</p>
          <p className="text-gray-700 mb-4">완독이는 다음과 같은 데이터를 수집하지 않습니다:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>개인 식별 정보 (이름, 이메일, 전화번호 등)</li>
            <li>로그인 정보 또는 계정 정보</li>
            <li>웹 브라우징 기록</li>
            <li>사용자가 읽은 웹페이지 콘텐츠</li>
            <li>사용 통계 또는 분석 데이터</li>
          </ul>
        </section>

        {/* 2. 웹페이지 접근 권한 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            2. 웹페이지 접근 권한
          </h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1. 권한 사용 목적</h3>
          <p className="text-gray-700 mb-3">완독이는 다음 권한을 사용합니다:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>
              <strong className="text-gray-900">activeTab</strong>: 현재 활성화된 탭에서 포커스 모드를 
              켜고 끌 수 있도록 합니다.
            </li>
            <li>
              <strong className="text-gray-900">scripting</strong>: 웹페이지에 포커스 모드 UI와 문단 
              분리 기능을 제공하기 위해 필요합니다.
            </li>
            <li>
              <strong className="text-gray-900">&lt;all_urls&gt;</strong>: 사용자가 읽고 싶은 모든 
              웹페이지에서 확장 프로그램이 작동하도록 합니다.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2. 데이터 처리 방식</h3>
          <p className="text-gray-700 mb-3">완독이는 웹페이지의 텍스트 콘텐츠를 읽어 다음 기능을 제공합니다:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
            <li>
              <strong className="text-gray-900">포커스 모드</strong>: 현재 읽고 있는 문장을 강조하고, 
              나머지 문단을 흐리게 처리
            </li>
            <li>
              <strong className="text-gray-900">문단 분리</strong>: 사용자가 클릭한 위치에서 문단을 
              분리하여 가독성 향상
            </li>
          </ul>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <p className="text-gray-800">
              <strong className="text-blue-900">중요:</strong> 모든 처리는 사용자의 브라우저 내에서 
              로컬로 이루어지며, 어떠한 데이터도 외부 서버로 전송되지 않습니다.
            </p>
          </div>
        </section>

        {/* 3. 데이터 저장 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            3. 데이터 저장
          </h2>
          <p className="text-gray-700">
            완독이는 사용자의 브라우저에 데이터를 저장하지 않습니다. 확장 프로그램을 끄면 모든 효과가 
            즉시 제거됩니다.
          </p>
        </section>

        {/* 4. 제3자 제공 여부 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            4. 제3자 제공 여부
          </h2>
          <p className="text-lg font-semibold text-gray-900 mb-3">제공하지 않음</p>
          <p className="text-gray-700">
            완독이는 어떠한 데이터도 제3자에게 제공, 판매, 공유하지 않습니다.
          </p>
        </section>

        {/* 5. 외부 서비스 연결 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            5. 외부 서비스 연결
          </h2>
          <p className="text-gray-700 mb-3">완독이는 다음과 같은 외부 서비스를 사용하지 않습니다:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>분석 도구 (Google Analytics 등)</li>
            <li>광고 플랫폼</li>
            <li>클라우드 저장소</li>
            <li>외부 API</li>
          </ul>
        </section>

        {/* 6. 쿠키 및 추적 기술 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            6. 쿠키 및 추적 기술
          </h2>
          <p className="text-gray-700">
            완독이는 쿠키, 웹 비콘, 또는 기타 추적 기술을 사용하지 않습니다.
          </p>
        </section>

        {/* 7. 아동 개인정보 보호 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            7. 아동 개인정보 보호
          </h2>
          <p className="text-gray-700">
            완독이는 모든 연령대에 안전하게 사용할 수 있습니다. 개인정보를 수집하지 않으므로 아동의 
            개인정보 보호에 대한 우려가 없습니다.
          </p>
        </section>

        {/* 8. 개인정보 처리방침 변경 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            8. 개인정보 처리방침 변경
          </h2>
          <p className="text-gray-700">
            이 개인정보 처리방침은 필요에 따라 업데이트될 수 있습니다. 중요한 변경 사항이 있을 경우 
            확장 프로그램 업데이트 노트를 통해 공지합니다.
          </p>
        </section>

        {/* 9. 문의 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            9. 문의
          </h2>
          <p className="text-gray-700 mb-3">
            개인정보 처리방침에 대한 질문이나 우려사항이 있으시면 다음으로 연락해주세요:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>
              이메일: <a href="mailto:kwsong9212@gmail.com" className="text-blue-600 hover:underline">
                kwsong9212@gmail.com
              </a>
            </li>
            <li>
              이메일: <a href="mailto:hwangggim@gmail.com" className="text-blue-600 hover:underline">
                hwangggim@gmail.com
              </a>
            </li>
            <li>
              GitHub:{' '}
              <a 
                href="https://github.com/wandok-official/wandok-client" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://github.com/wandok-official/wandok-client
              </a>
            </li>
          </ul>
        </section>

        {/* 10. 법적 근거 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
            10. 법적 근거
          </h2>
          <p className="text-gray-700">
            완독이는 대한민국 「개인정보 보호법」 및 관련 법령을 준수합니다. 개인정보를 수집하지 
            않으므로 법적 의무사항은 최소화됩니다.
          </p>
        </section>

        {/* 홈으로 돌아가기 */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg 
                     hover:bg-blue-700 transition-colors duration-200"
          >
            ← 홈으로 돌아가기
          </a>
        </footer>
      </div>
    </div>
  );
}
