import type { Goal } from "../types";
import { formatCurrency, formatPercent } from "../utils/format";
import { otherCurrency, toOtherCurrency } from "../utils/fx";
import ProgressBar from "./ProgressBar";

type GoalCardProps = {
  goal: Goal;
  usdToInr: number;
  onOpenContribution: (goal: Goal) => void;
};

const GoalCard = ({ goal, usdToInr, onOpenContribution }: GoalCardProps) => {
  const saved = goal.contributions.reduce((sum, entry) => sum + entry.amount, 0);
  const progress = goal.target > 0 ? saved / goal.target : 0;
  const clampedProgress = Math.min(progress, 1);
  const converted = toOtherCurrency(goal.target, goal.currency, usdToInr);
  const convertedCurrency = otherCurrency(goal.currency);

  return (
    <article className="card goal-card">
      <header className="goal-card__header">
        <div>
          <p className="eyebrow">Goal</p>
          <h3>{goal.name}</h3>
        </div>
        <span className="pill pill--soft">{goal.currency}</span>
      </header>

      <div className="goal-card__stats">
        <div>
          <p className="label">Target</p>
          <p className="value">{formatCurrency(goal.target, goal.currency)}</p>
          <p className="subtext">
            ~ {formatCurrency(converted, convertedCurrency)}
          </p>
        </div>
        <div>
          <p className="label">Saved</p>
          <p className="value">{formatCurrency(saved, goal.currency)}</p>
          <p className="subtext">{goal.contributions.length} contributions</p>
        </div>
      </div>

      <ProgressBar value={clampedProgress} />
      <div className="goal-card__footer">
        <span className="progress-label">
          {formatPercent(clampedProgress)} funded
        </span>
        <button
          className="btn btn--ghost"
          type="button"
          onClick={() => onOpenContribution(goal)}
        >
          Add contribution
        </button>
      </div>
    </article>
  );
};

export default GoalCard;
