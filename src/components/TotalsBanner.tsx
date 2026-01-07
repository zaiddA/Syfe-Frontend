import { formatCurrency, formatPercent } from "../utils/format";

type TotalsBannerProps = {
  totalTargetUsd: number;
  totalSavedUsd: number;
  usdToInr: number;
  avgProgress: number;
};

const TotalsBanner = ({
  totalTargetUsd,
  totalSavedUsd,
  usdToInr,
  avgProgress,
}: TotalsBannerProps) => {
  const totalTargetInr = totalTargetUsd * usdToInr;
  const totalSavedInr = totalSavedUsd * usdToInr;

  return (
    <section className="totals">
      <div>
        <p className="eyebrow">Portfolio totals</p>
        <h1>Goal-based savings planner</h1>
      </div>
      <div className="totals__grid">
        <div>
          <p className="label">Total target</p>
          <p className="value">{formatCurrency(totalTargetUsd, "USD")}</p>
          <p className="subtext">~ {formatCurrency(totalTargetInr, "INR")}</p>
        </div>
        <div>
          <p className="label">Total saved</p>
          <p className="value">{formatCurrency(totalSavedUsd, "USD")}</p>
          <p className="subtext">~ {formatCurrency(totalSavedInr, "INR")}</p>
        </div>
        <div>
          <p className="label">Overall progress</p>
          <p className="value">{formatPercent(avgProgress)}</p>
          <p className="subtext">Average across goals</p>
        </div>
      </div>
    </section>
  );
};

export default TotalsBanner;
