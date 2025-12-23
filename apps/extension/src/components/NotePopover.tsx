import { useRef } from 'react';
import { CloseIcon } from './CloseIcon';

interface NotePopoverProps {
  onClose: () => void;
  onSubmit: (noteText: string) => void;
}

export const NotePopover = ({ onClose, onSubmit }: NotePopoverProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const noteText = textareaRef.current?.value || '';
    onSubmit(noteText);
  };

  return (
    <>
      <div
        className="flex flex-col w-85 border border-solid border-gray-300 bg-white rounded-md p-2"
      >
        <div className="flex flex-row justify-between items-center mb-2.5">
          <span className="font-medium text-md">사용자 1</span>
          <button
            onClick={onClose}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <textarea 
          ref={textareaRef}
          className="h-20 w-full border border-solid border-gray-300 rounded-lg p-1.5"
        />
        <button
          onClick={handleSubmit}
          className="rounded-md p-2.5 bg-black text-white mt-2.5 ml-auto px-4 text-xs"
        >
          작성
        </button>
      </div>
    </>
  );
};
