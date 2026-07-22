import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartContainer } from "@/components/chart/ChartContainer";

// ---- モック設定 ----

const mockUseSelectedSymbol = vi.fn();
const mockUseCandles = vi.fn();
const mockUseIndicators = vi.fn();

vi.mock("@/hooks/useSelectedSymbol", () => ({
  useSelectedSymbol: () => mockUseSelectedSymbol(),
}));

vi.mock("@/hooks/useCandles", () => ({
  useCandles: () => mockUseCandles(),
}));

vi.mock("@/hooks/useIndicators", () => ({
  useIndicators: () => mockUseIndicators(),
}));

// ChartContainer は相対パス（./CandlestickChart, ./ChartToolbar）で import しているが、
// 同一ファイルを指す絶対パスでモックすれば解決される
vi.mock("@/components/chart/CandlestickChart", () => ({
  CandlestickChart: () => <div data-testid="candlestick-chart" />,
}));

vi.mock("@/components/chart/ChartToolbar", () => ({
  ChartToolbar: () => <div data-testid="chart-toolbar" />,
}));

// ---- テスト ----

describe("ChartContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIndicators.mockReturnValue({
      smaEnabled: false,
      toggleSma: vi.fn(),
      bollingerEnabled: false,
      toggleBollinger: vi.fn(),
    });
  });

  it("symbol選択済み・ローディング/エラーなし・candles が空のとき「データがありません」を表示し、CandlestickChart は描画しない（Issue #41 の回帰防止）", () => {
    mockUseSelectedSymbol.mockReturnValue({ symbol: "AAPL", interval: "1day" });
    mockUseCandles.mockReturnValue({ candles: [], isLoading: false, error: undefined });

    render(<ChartContainer />);

    expect(screen.getByText("データがありません")).toBeTruthy();
    expect(screen.queryByTestId("candlestick-chart")).toBeNull();
  });

  it("candles にデータがあるとき CandlestickChart を描画する", () => {
    mockUseSelectedSymbol.mockReturnValue({ symbol: "AAPL", interval: "1day" });
    mockUseCandles.mockReturnValue({
      candles: [{ time: "2024-01-01", open: 100, high: 110, low: 90, close: 105, volume: 1000 }],
      isLoading: false,
      error: undefined,
    });

    render(<ChartContainer />);

    expect(screen.getByTestId("candlestick-chart")).toBeTruthy();
    expect(screen.queryByText("データがありません")).toBeNull();
  });
});
