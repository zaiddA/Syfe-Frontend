export type Currency = "USD" | "INR";

export type Contribution = {
  id: string;
  amount: number;
  date: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  currency: Currency;
  contributions: Contribution[];
  createdAt: string;
};
