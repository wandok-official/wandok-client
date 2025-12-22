import { PROGRESS_BAR } from '../config/constants';

export const ProgressBar = () => {
  return (
    <div
      className="h-screen bg-amber-500 flex items-center justify-center"
      style={{ width: PROGRESS_BAR.WIDTH }}
    >
      <span className="transform -rotate-90 whitespace-nowrap text-white text-sm font-semibold">
        Progress
      </span>
    </div>
  );
};
