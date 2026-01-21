/* eslint-disable @stylistic/indent */
import { useState } from 'react';
import { DEMO_PARAGRAPHS, type Paragraph } from '../../mocks/demo';

interface InteractiveDemoProps {
  isDarkMode: boolean;
}

function InteractiveDemo({ isDarkMode }: InteractiveDemoProps) {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>(DEMO_PARAGRAPHS);

  const [hoveredSentence, setHoveredSentence] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(35);

  const handleToggleParagraph = (
    paragraphIndex: number,
    sentenceIndex: number
  ) => {
    setParagraphs((prev) => {
      const newParagraphs = [...prev];
      const targetParagraph = newParagraphs[paragraphIndex];

      if (sentenceIndex === targetParagraph.sentences.length - 1) {
        const nextParagraph = newParagraphs[paragraphIndex + 1];
        if (nextParagraph) {
          const mergedParagraph: Paragraph = {
            id: targetParagraph.id, // 첫 번째 문단의 id 유지
            sentences: [...targetParagraph.sentences, ...nextParagraph.sentences],
          };
          const result = [
            ...newParagraphs.slice(0, paragraphIndex),
            mergedParagraph,
            ...newParagraphs.slice(paragraphIndex + 2),
          ];
          return result;
        }
      }

      const beforeSentences = targetParagraph.sentences.slice(0, sentenceIndex + 1);
      const afterSentences = targetParagraph.sentences.slice(sentenceIndex + 1);

      if (afterSentences.length === 0) {
        return prev;
      }

      const result = [
        ...newParagraphs.slice(0, paragraphIndex),
        { id: targetParagraph.id, sentences: beforeSentences }, // 기존 id 유지
        { id: crypto.randomUUID(), sentences: afterSentences }, // 새 id 생성
        ...newParagraphs.slice(paragraphIndex + 1),
      ];

      return result;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercentage =
      (element.scrollTop / (element.scrollHeight - element.clientHeight)) *
      100;
    setScrollProgress(Math.min(100, Math.max(0, scrollPercentage)));
  };

  return (
    <div className="relative">
      <div
        className={`
          rounded-lg p-6 transition-colors duration-300 relative
          ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}
        `}
      >
        <div className="mb-4 flex items-center gap-2">
          <div
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}
            `}
          >
            ✨ 체험해보세요
          </div>
        </div>

        <p
          className={`
            text-xs mb-4 transition-colors duration-300
            ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
          `}
        >
          💡 마우스 올리기: 강조 | 클릭: 분리/병합
        </p>

        <div
          className="relative pr-8"
          style={{ height: '400px', overflow: 'hidden' }}
        >
          <div
            className="pr-2"
            style={{
              height: '100%',
              overflowY: 'scroll',
              overflowX: 'hidden',
            }}
            onScroll={handleScroll}
          >
            <div className="space-y-4">
              {paragraphs.map((paragraph, pIndex) => (
                <div
                  key={paragraph.id}
                  className={`
                    transition-all duration-300 p-3 rounded
                    ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
                  `}
                >
                  {paragraph.sentences.map((sentence, sIndex) => {
                    const sentenceId = `${pIndex}-${sIndex}`;
                    const isHovered = hoveredSentence === sentenceId;
                    const isOtherHovered =
                      hoveredSentence !== null && !isHovered;

                    return (
                      <span
                        key={sentenceId}
                        className={`
                          inline cursor-pointer transition-all duration-200
                          ${isHovered ? 'font-semibold' : ''}
                          ${isOtherHovered ? 'opacity-30 blur-[1px]' : 'opacity-100'}
                          ${isDarkMode
                            ? 'text-gray-200 hover:text-white'
                            : 'text-gray-800 hover:text-black'
                          }
                        `}
                        onMouseEnter={() => setHoveredSentence(sentenceId)}
                        onMouseLeave={() => setHoveredSentence(null)}
                        onClick={() => handleToggleParagraph(pIndex, sIndex)}
                      >
                        {sentence}{' '}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`
              absolute top-0 right-0 w-2 rounded-full overflow-hidden
              ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}
            `}
            style={{ height: '100%' }}
          >
            <div
              className="w-full bg-amber-500 transition-all duration-200"
              style={{ height: `${scrollProgress}%` }}
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3">
            <div
              className={`
                shrink-0 w-6 h-6 rounded-full flex items-center
                justify-center text-xs font-bold
                ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}
              `}
            >
              1
            </div>
            <div>
              <p
                className={`
                  text-sm font-medium transition-colors duration-300
                  ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}
                `}
              >
                포커스 모드
              </p>
              <p
                className={`
                  text-xs transition-colors duration-300
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                `}
              >
                마우스 호버 시 해당 문장만 강조
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`
                shrink-0 w-6 h-6 rounded-full flex items-center
                justify-center text-xs font-bold
                ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'}
              `}
            >
              2
            </div>
            <div>
              <p
                className={`
                  text-sm font-medium transition-colors duration-300
                  ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}
                `}
              >
                문단 분리
              </p>
              <p
                className={`
                  text-xs transition-colors duration-300
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                `}
              >
                문장 클릭으로 문단을 자유롭게 분리
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`
                shrink-0 w-6 h-6 rounded-full flex items-center
                justify-center text-xs font-bold
                ${isDarkMode ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-600'}
              `}
            >
              3
            </div>
            <div>
              <p
                className={`
                  text-sm font-medium transition-colors duration-300
                  ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}
                `}
              >
                진행률 추적
              </p>
              <p
                className={`
                  text-xs transition-colors duration-300
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                `}
              >
                우측 바로 독서 진행도 실시간 확인
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveDemo;
