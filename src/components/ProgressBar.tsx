import { clamp } from "../utils/fx";

type ProgressBarProps = {
  value: number;
};

const ProgressBar = ({ value }: ProgressBarProps) => {
  const clamped = clamp(value, 0, 1);

  return (
    <div className="progress">
      <div className="progress__track">
        <div
          className="progress__fill"
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
