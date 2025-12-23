import CloseIcon from '@mui/icons-material/Close';

export const NotePopover = () => {
  return (
    <>
      <div className="flex flex-col w-85 border rounded-md p-2">
        <div className="flex flex-row justify-between items-center mb-2.5">
          <span className="font-medium text-md">사용자 1</span>
          <button
            onClick={() => { console.log('Close button click'); }}
            className="z-1"
          >
            <CloseIcon />
          </button>
        </div>
        <textarea className="h-20 w-full border rounded-lg border-gray-400 p-1.5" />
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
