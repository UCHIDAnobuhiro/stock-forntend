import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { CandlestickChart } from "@/components/chart/CandlestickChart";
import type { CandleResponse } from "@/hooks/useCandles";

// ---- モック設定 ----

const { mockSeriesInstances, createChartMock } = vi.hoisted(() => {
  const mockSeriesInstances: Array<{
    setData: ReturnType<typeof vi.fn>;
    applyOptions: ReturnType<typeof vi.fn>;
  }> = [];

  const mockChart = {
    addSeries: vi.fn(() => {
      const series = { setData: vi.fn(), applyOptions: vi.fn() };
      mockSeriesInstances.push(series);
      return series;
    }),
    removeSeries: vi.fn(),
    priceScale: vi.fn(() => ({ applyOptions: vi.fn() })),
    timeScale: vi.fn(() => ({ setVisibleLogicalRange: vi.fn() })),
    subscribeCrosshairMove: vi.fn(),
    applyOptions: vi.fn(),
    remove: vi.fn(),
  };

  const createChartMock = vi.fn(() => mockChart);

  return { mockSeriesInstances, createChartMock };
});

vi.mock("lightweight-charts", () => ({
  createChart: createChartMock,
  CandlestickSeries: {},
  HistogramSeries: {},
  LineSeries: {},
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

// jsdom に ResizeObserver が無いためスタブを用意する
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// ---- テストデータ ----

const candlesWithData: CandleResponse[] = [
  { time: "2024-01-01", open: 100, high: 110, low: 90, close: 105, volume: 1000 },
  { time: "2024-01-02", open: 105, high: 115, low: 95, close: 110, volume: 1200 },
];

// ---- テスト ----

describe("CandlestickChart", () => {
  beforeEach(() => {
    mockSeriesInstances.length = 0;
    vi.clearAllMocks();
    // @ts-expect-error jsdom に ResizeObserver が存在しないためグローバルへ追加する
    global.ResizeObserver = ResizeObserverStub;
  });

  it("データが空になったら candle/volume 両シリーズの setData が空配列で呼ばれる（Issue #41 の回帰防止）", async () => {
    const { rerender } = render(
      <CandlestickChart candles={candlesWithData} interval="1day" smaEnabled={false} bollingerEnabled={false} />
    );

    // チャート生成 effect 内の queueMicrotask(() => setChartReady(true)) を反映させる
    await act(async () => {});

    // addSeries は 1 回目がローソク足、2 回目が出来高
    expect(mockSeriesInstances).toHaveLength(2);
    const [candleSeries, volumeSeries] = mockSeriesInstances;

    // データありでレンダリングした直後は、それぞれのシリーズにデータが設定される
    expect(candleSeries.setData).toHaveBeenCalledTimes(1);
    expect(candleSeries.setData.mock.calls[0][0]).toHaveLength(candlesWithData.length);
    expect(volumeSeries.setData).toHaveBeenCalledTimes(1);
    expect(volumeSeries.setData.mock.calls[0][0]).toHaveLength(candlesWithData.length);

    // データが空の配列に切り替わって rerender
    rerender(<CandlestickChart candles={[]} interval="1day" smaEnabled={false} bollingerEnabled={false} />);

    await act(async () => {});

    // 空配列で setData が呼ばれ、前回のローソク足・出来高がクリアされること
    expect(candleSeries.setData).toHaveBeenCalledTimes(2);
    expect(candleSeries.setData).toHaveBeenLastCalledWith([]);
    expect(volumeSeries.setData).toHaveBeenCalledTimes(2);
    expect(volumeSeries.setData).toHaveBeenLastCalledWith([]);
  });
});
