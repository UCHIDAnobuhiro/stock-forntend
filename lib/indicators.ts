import type { Interval } from "@/hooks/useSelectedSymbol";

export const BOLLINGER_PERIOD = 20;

export type BollingerBandData = {
  time: string;
  middle: number;
  upper1: number;
  lower1: number;
  upper2: number;
  lower2: number;
  upper3: number;
  lower3: number;
};

export function calcBollingerBands(
  data: { time: string; value: number }[]
): BollingerBandData[] {
  const period = BOLLINGER_PERIOD;
  if (data.length < period) return [];

  const result: BollingerBandData[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].value;
    const mean = sum / period;

    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) {
      variance += (data[j].value - mean) ** 2;
    }
    const stdDev = Math.sqrt(variance / period);

    result.push({
      time: data[i].time,
      middle: mean,
      upper1: mean + stdDev,
      lower1: mean - stdDev,
      upper2: mean + 2 * stdDev,
      lower2: mean - 2 * stdDev,
      upper3: mean + 3 * stdDev,
      lower3: mean - 3 * stdDev,
    });
  }

  return result;
}

export const BOLLINGER_COLORS = {
  middle: "#f59e0b",
  sigma1: "#93c5fd",
  sigma2: "#60a5fa",
  sigma3: "#3b82f6",
} as const;

export const SMA_PERIODS: Record<Interval, number[]> = {
  "1day": [5, 25, 75],
  "1week": [13, 26, 52],
  "1month": [9, 24, 60],
};

const SMA_COLOR_LIST = ["#2962ff", "#ff6d00", "#ab47bc"] as const;

export function getSmaColor(index: number): string {
  return SMA_COLOR_LIST[index % SMA_COLOR_LIST.length];
}

export function calcSMA(
  data: { time: string; value: number }[],
  period: number
): { time: string; value: number }[] {
  if (period <= 0 || data.length < period) return [];

  const result: { time: string; value: number }[] = [];
  let sum = 0;

  for (let i = 0; i < period; i++) {
    sum += data[i].value;
  }
  result.push({ time: data[period - 1].time, value: sum / period });

  for (let i = period; i < data.length; i++) {
    sum += data[i].value - data[i - period].value;
    result.push({ time: data[i].time, value: sum / period });
  }

  return result;
}
