import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Contribution, Goal } from "../types";
import { formatCurrency } from "../utils/format";

const MAX_CONTRIBUTION = 1_000_000_000;

type ContributionModalProps = {
  goal: Goal;
  onClose: () => void;
  onSave: (goalId: string, contribution: Contribution) => void;
};

const ContributionModal = ({ goal, onClose, onSave }: ContributionModalProps) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [touched, setTouched] = useState(false);

  const parsedAmount = useMemo(() => Number(amount), [amount]);
  const isAmountValid =
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= MAX_CONTRIBUTION;
  const isDateValid = Boolean(date);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!isAmountValid || !isDateValid) return;

    onSave(goal.id, {
      id: crypto.randomUUID(),
      amount: parsedAmount,
      date,
    });
    onClose();
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__content" aria-labelledby="modal-title">
        <header className="modal__header">
          <div>
            <p className="eyebrow">Add contribution</p>
            <h2 id="modal-title">{goal.name}</h2>
          </div>
          <button className="btn btn--ghost" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Amount ({goal.currency})</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={MAX_CONTRIBUTION}
              step={0.01}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={formatCurrency(goal.target * 0.1, goal.currency)}
            />
            {touched && !isAmountValid ? (
              <span className="field__error">
                Enter a positive amount up to {MAX_CONTRIBUTION.toLocaleString()}.
              </span>
            ) : null}
          </label>

          <label className="field">
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            {touched && !isDateValid ? (
              <span className="field__error">Pick a contribution date.</span>
            ) : null}
          </label>

          <div className="modal__actions">
            <button className="btn btn--ghost" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" type="submit">
              Save contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributionModal;
