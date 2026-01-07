import { useEffect, useMemo, useState, type CSSProperties } from "react";
import ContributionModal from "./components/ContributionModal";
import GoalCard from "./components/GoalCard";
import GoalForm from "./components/GoalForm";
import TotalsBanner from "./components/TotalsBanner";
import { useExchangeRate } from "./hooks/useExchangeRate";
import type { Contribution, Goal } from "./types";
import { formatDateTime, formatNumber } from "./utils/format";
import { toUsd } from "./utils/fx";

const GOALS_STORAGE_KEY = "syfe.goals";

const loadGoals = (): Goal[] => {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Goal[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const App = () => {
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const { rateState, loading, error, refresh, hasLiveRate } = useExchangeRate();

  useEffect(() => {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const totals = useMemo(() => {
    let totalTargetUsd = 0;
    let totalSavedUsd = 0;
    const progressValues: number[] = [];

    goals.forEach((goal) => {
      const saved = goal.contributions.reduce(
        (sum, entry) => sum + entry.amount,
        0
      );
      totalTargetUsd += toUsd(goal.target, goal.currency, rateState.rate);
      totalSavedUsd += toUsd(saved, goal.currency, rateState.rate);
      const progress = goal.target > 0 ? saved / goal.target : 0;
      progressValues.push(Math.min(progress, 1));
    });

    const avgProgress =
      progressValues.length > 0
        ? progressValues.reduce((sum, value) => sum + value, 0) /
          progressValues.length
        : 0;

    return { totalTargetUsd, totalSavedUsd, avgProgress };
  }, [goals, rateState.rate]);

  const handleAddGoal = (goal: Goal) => {
    setGoals((prev) => [goal, ...prev]);
  };

  const handleSaveContribution = (goalId: string, contribution: Contribution) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, contributions: [...goal.contributions, contribution] }
          : goal
      )
    );
  };

  const sourceLabel =
    rateState.source === "live"
      ? "Live rate"
      : rateState.source === "mock"
      ? "Mock rate"
      : rateState.source === "cache"
      ? "Cached rate"
      : "Fallback rate";

  return (
    <div className="app">
      <TotalsBanner
        totalTargetUsd={totals.totalTargetUsd}
        totalSavedUsd={totals.totalSavedUsd}
        usdToInr={rateState.rate}
        avgProgress={totals.avgProgress}
      />

      <section className="overview">
        <div className="card rate-card">
          <div className="rate-card__header">
            <div>
              <p className="eyebrow">FX snapshot</p>
              <h2>{"USD <-> INR"}</h2>
            </div>
            <button className="btn btn--ghost" onClick={refresh} type="button">
              Refresh rate
            </button>
          </div>

          <div className="rate-card__body">
            <div>
              <p className="label">1 USD equals</p>
              <p className="rate-value">INR {formatNumber(rateState.rate)}</p>
            </div>
            <div className="rate-meta">
              <p className="subtext">{sourceLabel}</p>
              <p className="subtext">
                Last updated: {formatDateTime(rateState.updatedAt)}
              </p>
            </div>
          </div>

          {loading ? <p className="status">Refreshing rate...</p> : null}
          {error ? (
            <p className="status status--error">
              {error} {hasLiveRate ? "" : "Using cached/fallback rate."}
            </p>
          ) : null}
        </div>

        <GoalForm onAddGoal={handleAddGoal} />
      </section>

      <section className="goals">
        <div className="goals__header">
          <div>
            <p className="eyebrow">Goals</p>
            <h2>{goals.length ? "Your goals" : "Start with a goal"}</h2>
          </div>
          <p className="subtext">Add contributions to track progress.</p>
        </div>

        {goals.length === 0 ? (
          <div className="empty">
            <p>No goals yet.</p>
            <p className="subtext">
              Use the form to add your first savings goal.
            </p>
          </div>
        ) : (
          <div className="goals__grid">
            {goals.map((goal, index) => (
              <div
                key={goal.id}
                className="goal-wrapper"
                style={{ "--delay": `${index * 60}ms` } as CSSProperties}
              >
                <GoalCard
                  goal={goal}
                  usdToInr={rateState.rate}
                  onOpenContribution={setActiveGoal}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {activeGoal ? (
        <ContributionModal
          goal={activeGoal}
          onClose={() => setActiveGoal(null)}
          onSave={handleSaveContribution}
        />
      ) : null}
    </div>
  );
};

export default App;
