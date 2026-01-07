import { useMemo, useState, type FormEvent } from "react";
import type { Currency, Goal } from "../types";

const MAX_TARGET = 1_000_000_000;

type GoalFormProps = {
  onAddGoal: (goal: Goal) => void;
};

const GoalForm = ({ onAddGoal }: GoalFormProps) => {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [touched, setTouched] = useState(false);

  const parsedTarget = useMemo(() => Number(target), [target]);
  const isNameValid = name.trim().length >= 2;
  const isTargetValid =
    Number.isFinite(parsedTarget) &&
    parsedTarget > 0 &&
    parsedTarget <= MAX_TARGET;

  const errors = {
    name: !isNameValid ? "Name should be at least 2 characters." : "",
    target: !isTargetValid
      ? `Enter a positive number up to ${MAX_TARGET.toLocaleString()}.`
      : "",
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);

    if (!isNameValid || !isTargetValid) return;

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      name: name.trim(),
      target: parsedTarget,
      currency,
      contributions: [],
      createdAt: new Date().toISOString(),
    };

    onAddGoal(newGoal);
    setName("");
    setTarget("");
    setCurrency("INR");
    setTouched(false);
  };

  return (
    <form className="card card--form" onSubmit={handleSubmit}>
      <div className="card__header">
        <div>
          <p className="eyebrow">Create goal</p>
          <h2>Add Goal</h2>
        </div>
        <span className="pill">Client-side</span>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Goal name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Emergency fund"
          />
          {touched && errors.name ? (
            <span className="field__error">{errors.name}</span>
          ) : null}
        </label>

        <label className="field">
          <span>Target amount</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={MAX_TARGET}
            step={0.01}
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="100000"
          />
          {touched && errors.target ? (
            <span className="field__error">{errors.target}</span>
          ) : null}
        </label>

        <label className="field">
          <span>Currency</span>
          <div className="segmented">
            {(["INR", "USD"] as Currency[]).map((option) => (
              <button
                key={option}
                type="button"
                className={
                  option === currency
                    ? "segmented__option segmented__option--active"
                    : "segmented__option"
                }
                onClick={() => setCurrency(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </label>
      </div>

      <button className="btn btn--primary" type="submit">
        Add goal
      </button>
    </form>
  );
};

export default GoalForm;
