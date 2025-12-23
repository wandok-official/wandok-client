import { CloseIcon } from './CloseIcon';

export const NotePopover = () => {
  return (
    <>
      <div
        className="flex flex-col w-85 border border-solid border-gray-300 bg-white rounded-md p-2"
      >
        <div className="flex flex-row justify-between items-center mb-2.5">
          <span className="font-medium text-md">사용자 1</span>
          <button
            onClick={() => { console.log('Close button click'); }}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <textarea className="h-20 w-full border border-solid border-gray-300 rounded-lg p-1.5" />
        <button
          onClick={() => { console.log('Note button click'); }}
          className="rounded-md p-2.5 bg-black text-white mt-2.5 ml-auto px-4 text-xs"
        >
          작성
        </button>
      </div>
    </>
  );
};
