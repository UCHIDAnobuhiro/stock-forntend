import { useEffect, useRef } from "react";
import { LineSeries, type IChartApi, type ISeriesApi } from "lightweight-charts";
import type { CandleResponse } from "@/hooks/useCandles";
import { calcBollingerBands, BOLLINGER_COLORS } from "@/lib/indicators";

type BollingerKey =
  | "middle"
  | "upper1"
  | "lower1"
  | "upper2"
  | "lower2"
  | "upper3"
  | "lower3";

const SERIES_CONFIGS: Array<{ key: BollingerKey; color: string }> = [
  { key: "middle", color: BOLLINGER_COLORS.middle },
  { key: "upper1", color: BOLLINGER_COLORS.sigma1 },
  { key: "lower1", color: BOLLINGER_COLORS.sigma1 },
  { key: "upper2", color: BOLLINGER_COLORS.sigma2 },
  { key: "lower2", color: BOLLINGER_COLORS.sigma2 },
  { key: "upper3", color: BOLLINGER_COLORS.sigma3 },
  { key: "lower3", color: BOLLINGER_COLORS.sigma3 },
];

export function useBollingerSeries(
  chartRef: React.RefObject<IChartApi | null>,
  candles: CandleResponse[],
  bollingerEnabled: boolean,
  chartReady: boolean
) {
  const seriesMapRef = useRef<Map<BollingerKey, ISeriesApi<"Line">>>(new Map());

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const currentMap = seriesMapRef.current;

    for (const series of currentMap.values()) {
      chart.removeSeries(series);
    }
    currentMap.clear();

    if (!bollingerEnabled || candles.length === 0) return;

    const sorted = [...candles].sort((a, b) => (a.time < b.time ? -1 : 1));
    const closeData = sorted.map((c) => ({ time: c.time, value: c.close }));
    const bbData = calcBollingerBands(closeData);

    if (bbData.length === 0) return;

    SERIES_CONFIGS.forEach(({ key, color }) => {
      const series = chart.addSeries(LineSeries, {
        color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      series.setData(
        bbData.map((d) => ({
          time: d.time as `${number}-${number}-${number}`,
          value: d[key],
        }))
      );
      currentMap.set(key, series);
    });
  }, [chartRef, candles, bollingerEnabled, chartReady]);

  return seriesMapRef;
}
