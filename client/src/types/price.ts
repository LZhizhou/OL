export default interface Price {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type PriceType = "open" | "high" | "low" | "close";
