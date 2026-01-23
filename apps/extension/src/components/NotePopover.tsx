import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { CloseIcon } from './CloseIcon';

interface NotePopoverProps {
  onClose: () => void;
  onSubmit: (noteText: string) => void;
  username: string;
}

export const NotePopover = ({ onClose, onSubmit, username }: NotePopoverProps) => {
  const [noteText, setNoteText] = useState('');

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
  };

  const handleSubmit = () => {
    if (!noteText.trim()) return;
    onSubmit(noteText);
  };

  const isSubmitDisabled = !noteText.trim();

  return (
    <>
      <div
        className="flex flex-col w-85 border border-solid border-gray-300 bg-white rounded-md p-2"
      >
        <div className="flex flex-row justify-between items-center mb-2.5">
          <span className="font-medium text-md">{username}</span>
          <button
            onClick={onClose}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <textarea
          value={noteText}
          onChange={handleChange}
          className="h-20 w-full border border-solid border-gray-300 rounded-lg p-1.5"
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`rounded-md p-2.5 mt-2.5 ml-auto px-4 text-xs ${isSubmitDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-black text-white'
          }`}
        >
          작성
        </button>
      </div>
    </>
  );
};
