"use client";

import React, { useMemo, useState } from "react";

type StrategyType = "ma_crossover" | "rsi" | "macd";

type CommonParams = {
  symbol: string;
  timeframe: string;
  useRiskPercent: boolean;
  lotSize: number;
  riskPercent: number; // % of balance per trade
  stopLossPoints: number;
  takeProfitPoints: number;
  magicNumber: number;
  eaName: string;
  comment: string;
};

type MAParams = { fast: number; slow: number; method: string; price: string };
type RSIParams = { period: number; overbought: number; oversold: number };
type MACDParams = { fast: number; slow: number; signal: number };

export default function Home() {
  const [strategy, setStrategy] = useState<StrategyType>("ma_crossover");

  const [common, setCommon] = useState<CommonParams>({
    symbol: "EURUSD",
    timeframe: "PERIOD_H1",
    useRiskPercent: false,
    lotSize: 0.10,
    riskPercent: 1.0,
    stopLossPoints: 300,
    takeProfitPoints: 600,
    magicNumber: 123456,
    eaName: "EA_Gerado",
    comment: "EA Gerado pelo MT5 EA Builder",
  });

  const [ma, setMa] = useState<MAParams>({
    fast: 9,
    slow: 21,
    method: "MODE_EMA",
    price: "PRICE_CLOSE",
  });

  const [rsi, setRsi] = useState<RSIParams>({ period: 14, overbought: 70, oversold: 30 });
  const [macd, setMacd] = useState<MACDParams>({ fast: 12, slow: 26, signal: 9 });

  const mql = useMemo(() => buildMql5Code(strategy, common, { ma, rsi, macd }), [strategy, common, ma, rsi, macd]);

  function updateCommon<K extends keyof CommonParams>(key: K, value: CommonParams[K]) {
    setCommon((prev) => ({ ...prev, [key]: value }));
  }

  function handleDownload() {
    const blob = new Blob([mql], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${common.eaName || "EA_Gerado"}.mq5`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(mql);
      alert("C?digo copiado!");
    } catch (e) {
      alert("Falha ao copiar. Selecione e copie manualmente.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">MT5 EA Builder</h1>
          <div className="text-sm text-zinc-500">Gere c?digo MQL5 para EAs</div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold">Configura??es</h2>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">Estrat?gia</label>
                <select
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as StrategyType)}
                >
                  <option value="ma_crossover">Cruzamento de M?dias (MA)</option>
                  <option value="rsi">RSI (Sobrecompra/Sobrevenda)</option>
                  <option value="macd">MACD</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm">S?mbolo</label>
                <input
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                  value={common.symbol}
                  onChange={(e) => updateCommon("symbol", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Timeframe</label>
                <select
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                  value={common.timeframe}
                  onChange={(e) => updateCommon("timeframe", e.target.value)}
                >
                  {[
                    "PERIOD_M1",
                    "PERIOD_M5",
                    "PERIOD_M15",
                    "PERIOD_M30",
                    "PERIOD_H1",
                    "PERIOD_H4",
                    "PERIOD_D1",
                  ].map((tf) => (
                    <option key={tf} value={tf}>
                      {tf.replace("PERIOD_", "")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="risk"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={common.useRiskPercent}
                  onChange={(e) => updateCommon("useRiskPercent", e.target.checked)}
                />
                <label htmlFor="risk" className="text-sm">
                  Usar % do saldo (em vez de lote fixo)
                </label>
              </div>

              {!common.useRiskPercent ? (
                <div>
                  <label className="mb-1 block text-sm">Lote Fixo</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                    value={common.lotSize}
                    onChange={(e) => updateCommon("lotSize", parseFloat(e.target.value))}
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm">Risco (% do saldo)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                    value={common.riskPercent}
                    onChange={(e) => updateCommon("riskPercent", parseFloat(e.target.value))}
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm">Stop Loss (pontos)</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                  value={common.stopLossPoints}
                  onChange={(e) => updateCommon("stopLossPoints", parseInt(e.target.value || "0", 10))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Take Profit (pontos)</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                  value={common.takeProfitPoints}
                  onChange={(e) => updateCommon("takeProfitPoints", parseInt(e.target.value || "0", 10))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Magic Number</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                  value={common.magicNumber}
                  onChange={(e) => updateCommon("magicNumber", parseInt(e.target.value || "0", 10))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Nome do EA (arquivo)</label>
                <input
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                  value={common.eaName}
                  onChange={(e) => updateCommon("eaName", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">Coment?rio</label>
                <input
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                  value={common.comment}
                  onChange={(e) => updateCommon("comment", e.target.value)}
                />
              </div>
            </div>

            {strategy === "ma_crossover" && (
              <div className="mb-2 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
                <h3 className="mb-3 font-medium">Par?metros - M?dias M?veis</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm">R?pida</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                      value={ma.fast}
                      onChange={(e) => setMa((p) => ({ ...p, fast: parseInt(e.target.value || "0", 10) }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Lenta</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                      value={ma.slow}
                      onChange={(e) => setMa((p) => ({ ...p, slow: parseInt(e.target.value || "0", 10) }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">M?todo</label>
                    <select
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                      value={ma.method}
                      onChange={(e) => setMa((p) => ({ ...p, method: e.target.value }))}
                    >
                      <option value="MODE_SMA">SMA</option>
                      <option value="MODE_EMA">EMA</option>
                      <option value="MODE_SMMA">SMMA</option>
                      <option value="MODE_LWMA">LWMA</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Pre?o</label>
                    <select
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                      value={ma.price}
                      onChange={(e) => setMa((p) => ({ ...p, price: e.target.value }))}
                    >
                      <option value="PRICE_CLOSE">Fechamento</option>
                      <option value="PRICE_OPEN">Abertura</option>
                      <option value="PRICE_HIGH">M?xima</option>
                      <option value="PRICE_LOW">M?nima</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {strategy === "rsi" && (
              <div className="mb-2 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
                <h3 className="mb-3 font-medium">Par?metros - RSI</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm">Per?odo</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                      value={rsi.period}
                      onChange={(e) => setRsi((p) => ({ ...p, period: parseInt(e.target.value || "0", 10) }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Sobrecompra</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                      value={rsi.overbought}
                      onChange={(e) => setRsi((p) => ({ ...p, overbought: parseInt(e.target.value || "0", 10) }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Sobrevenda</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                      value={rsi.oversold}
                      onChange={(e) => setRsi((p) => ({ ...p, oversold: parseInt(e.target.value || "0", 10) }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {strategy === "macd" && (
              <div className="mb-2 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
                <h3 className="mb-3 font-medium">Par?metros - MACD</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm">R?pido</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                      value={macd.fast}
                      onChange={(e) => setMacd((p) => ({ ...p, fast: parseInt(e.target.value || "0", 10) }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Lento</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                      value={macd.slow}
                      onChange={(e) => setMacd((p) => ({ ...p, slow: parseInt(e.target.value || "0", 10) }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Sinal</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
                      value={macd.signal}
                      onChange={(e) => setMacd((p) => ({ ...p, signal: parseInt(e.target.value || "0", 10) }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="flex flex-col rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold">C?digo MQL5</h2>
            <div className="mb-3 flex gap-3">
              <button
                className="rounded-lg bg-black px-4 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-white"
                onClick={handleCopy}
              >
                Copiar
              </button>
              <button
                className="rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                onClick={handleDownload}
              >
                Baixar .mq5
              </button>
            </div>
            <textarea
              className="h-[600px] w-full flex-1 resize-none rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm text-black dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
              readOnly
              value={mql}
            />
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-zinc-500">
          Este c?digo ? um ponto de partida. Teste e valide no Strategy Tester.
        </footer>
      </div>
    </div>
  );
}

function buildMql5Code(
  strategy: StrategyType,
  common: CommonParams,
  parts: { ma: MAParams; rsi: RSIParams; macd: MACDParams }
) {
  const header = `//+------------------------------------------------------------------+\n` +
    `//| ${common.eaName}.mq5                                                |\n` +
    `//| Gerado por MT5 EA Builder (Next.js)                               |\n` +
    `//| Coment?rio: ${common.comment}                                     |\n` +
    `//+------------------------------------------------------------------+\n` +
    `#property strict\n` +
    `\n` +
    `input string InpSymbol = "${common.symbol}";\n` +
    `input ENUM_TIMEFRAMES InpTimeframe = ${common.timeframe};\n` +
    (common.useRiskPercent
      ? `input double InpRiskPercent = ${toFixed(common.riskPercent, 2)};\n`
      : `input double InpLotSize = ${toFixed(common.lotSize, 2)};\n`) +
    `input int InpSL = ${common.stopLossPoints}; // pontos\n` +
    `input int InpTP = ${common.takeProfitPoints}; // pontos\n` +
    `input long InpMagic = ${common.magicNumber};\n` +
    `\n` +
    `double PointValue;\n` +
    `\n`;

  const riskHelpers = `double CalculateLot(double slPoints) {\n` +
    (common.useRiskPercent
      ? `  double balance = AccountInfoDouble(ACCOUNT_BALANCE);\n` +
        `  double riskMoney = balance * (InpRiskPercent/100.0);\n` +
        `  double tickValue = SymbolInfoDouble(InpSymbol, SYMBOL_TRADE_TICK_VALUE);\n` +
        `  double tickSize  = SymbolInfoDouble(InpSymbol, SYMBOL_TRADE_TICK_SIZE);\n` +
        `  if(tickValue<=0 || tickSize<=0 || slPoints<=0) return 0.01;\n` +
        `  double moneyPerLotAtSL = (slPoints * (PointValue/tickSize)) * tickValue;\n` +
        `  double lots = riskMoney / MathMax(moneyPerLotAtSL, 0.00001);\n` +
        `  double minLot = SymbolInfoDouble(InpSymbol, SYMBOL_VOLUME_MIN);\n` +
        `  double maxLot = SymbolInfoDouble(InpSymbol, SYMBOL_VOLUME_MAX);\n` +
        `  double step   = SymbolInfoDouble(InpSymbol, SYMBOL_VOLUME_STEP);\n` +
        `  lots = MathMax(minLot, MathMin(maxLot, MathFloor(lots/step)*step));\n` +
        `  return lots;\n`
      : `  return InpLotSize;\n`) +
    `}\n\n` +
    `bool HasOpenPosition(int type) {\n` +
    `  for(int i=PositionsTotal()-1; i>=0; --i) {\n` +
    `    ulong ticket = PositionGetTicket(i);\n` +
    `    if(PositionSelectByTicket(ticket)) {\n` +
    `      if(PositionGetInteger(POSITION_MAGIC)==InpMagic && PositionGetString(POSITION_SYMBOL)==InpSymbol) {\n` +
    `        if((int)PositionGetInteger(POSITION_TYPE)==type) return true;\n` +
    `      }\n` +
    `    }\n` +
    `  }\n` +
    `  return false;\n` +
    `}\n`;

  let logic = "";

  if (strategy === "ma_crossover") {
    logic = `// --- Cruzamento de M?dias\n` +
      `int handleFast, handleSlow;\n` +
      `double maFast[3], maSlow[3];\n\n` +
      `int OnInit(){\n` +
      `  PointValue = SymbolInfoDouble(InpSymbol, SYMBOL_POINT);\n` +
      `  handleFast = iMA(InpSymbol, (int)InpTimeframe, ${parts.ma.fast}, 0, ${parts.ma.method}, ${parts.ma.price});\n` +
      `  handleSlow = iMA(InpSymbol, (int)InpTimeframe, ${parts.ma.slow}, 0, ${parts.ma.method}, ${parts.ma.price});\n` +
      `  if(handleFast==INVALID_HANDLE || handleSlow==INVALID_HANDLE) return(INIT_FAILED);\n` +
      `  return(INIT_SUCCEEDED);\n` +
      `}\n\n` +
      `void OnTick(){\n` +
      `  if(_Symbol!=InpSymbol || _Period!=(int)InpTimeframe) return;\n` +
      `  if(CopyBuffer(handleFast, 0, 0, 3, maFast)<3) return;\n` +
      `  if(CopyBuffer(handleSlow, 0, 0, 3, maSlow)<3) return;\n` +
      `  bool crossUp   = (maFast[1] < maSlow[1]) && (maFast[0] > maSlow[0]);\n` +
      `  bool crossDown = (maFast[1] > maSlow[1]) && (maFast[0] < maSlow[0]);\n` +
      `\n` +
      `  MqlTradeRequest req; MqlTradeResult res; ZeroMemory(req); ZeroMemory(res);\n` +
      `  req.symbol = InpSymbol; req.magic = InpMagic; req.deviation=20; req.type_filling=ORDER_FILLING_FOK;\n` +
      `\n` +
      `  if(crossUp && !HasOpenPosition(POSITION_TYPE_BUY)) {\n` +
      `    req.action = TRADE_ACTION_DEAL; req.type = ORDER_TYPE_BUY;\n` +
      `    req.volume = CalculateLot(InpSL);\n` +
      `    req.price  = SymbolInfoDouble(InpSymbol, SYMBOL_ASK);\n` +
      `    req.sl     = req.price - InpSL*PointValue;\n` +
      `    req.tp     = req.price + InpTP*PointValue;\n` +
      `    req.comment = "${escapeQuotes(common.comment)}";\n` +
      `    OrderSend(req, res);\n` +
      `  }\n` +
      `  if(crossDown && !HasOpenPosition(POSITION_TYPE_SELL)) {\n` +
      `    req.action = TRADE_ACTION_DEAL; req.type = ORDER_TYPE_SELL;\n` +
      `    req.volume = CalculateLot(InpSL);\n` +
      `    req.price  = SymbolInfoDouble(InpSymbol, SYMBOL_BID);\n` +
      `    req.sl     = req.price + InpSL*PointValue;\n` +
      `    req.tp     = req.price - InpTP*PointValue;\n` +
      `    req.comment = "${escapeQuotes(common.comment)}";\n` +
      `    OrderSend(req, res);\n` +
      `  }\n` +
      `}\n`;
  } else if (strategy === "rsi") {
    logic = `// --- RSI\n` +
      `int handleRSI; double rsi[2];\n\n` +
      `int OnInit(){\n` +
      `  PointValue = SymbolInfoDouble(InpSymbol, SYMBOL_POINT);\n` +
      `  handleRSI = iRSI(InpSymbol, (int)InpTimeframe, ${parts.rsi.period}, PRICE_CLOSE);\n` +
      `  if(handleRSI==INVALID_HANDLE) return(INIT_FAILED);\n` +
      `  return(INIT_SUCCEEDED);\n` +
      `}\n\n` +
      `void OnTick(){\n` +
      `  if(_Symbol!=InpSymbol || _Period!=(int)InpTimeframe) return;\n` +
      `  if(CopyBuffer(handleRSI, 0, 0, 2, rsi)<2) return;\n` +
      `  double val = rsi[0];\n` +
      `  bool buySignal  = (val < ${parts.rsi.oversold});\n` +
      `  bool sellSignal = (val > ${parts.rsi.overbought});\n` +
      `  MqlTradeRequest req; MqlTradeResult res; ZeroMemory(req); ZeroMemory(res);\n` +
      `  req.symbol = InpSymbol; req.magic = InpMagic; req.deviation=20; req.type_filling=ORDER_FILLING_FOK;\n` +
      `  if(buySignal && !HasOpenPosition(POSITION_TYPE_BUY)) {\n` +
      `    req.action = TRADE_ACTION_DEAL; req.type = ORDER_TYPE_BUY;\n` +
      `    req.volume = CalculateLot(InpSL);\n` +
      `    req.price  = SymbolInfoDouble(InpSymbol, SYMBOL_ASK);\n` +
      `    req.sl     = req.price - InpSL*PointValue;\n` +
      `    req.tp     = req.price + InpTP*PointValue;\n` +
      `    req.comment = "${escapeQuotes(common.comment)}";\n` +
      `    OrderSend(req, res);\n` +
      `  }\n` +
      `  if(sellSignal && !HasOpenPosition(POSITION_TYPE_SELL)) {\n` +
      `    req.action = TRADE_ACTION_DEAL; req.type = ORDER_TYPE_SELL;\n` +
      `    req.volume = CalculateLot(InpSL);\n` +
      `    req.price  = SymbolInfoDouble(InpSymbol, SYMBOL_BID);\n` +
      `    req.sl     = req.price + InpSL*PointValue;\n` +
      `    req.tp     = req.price - InpTP*PointValue;\n` +
      `    req.comment = "${escapeQuotes(common.comment)}";\n` +
      `    OrderSend(req, res);\n` +
      `  }\n` +
      `}\n`;
  } else {
    logic = `// --- MACD\n` +
      `int handleMACD; double macdMain[2], macdSignal[2];\n\n` +
      `int OnInit(){\n` +
      `  PointValue = SymbolInfoDouble(InpSymbol, SYMBOL_POINT);\n` +
      `  handleMACD = iMACD(InpSymbol, (int)InpTimeframe, ${parts.macd.fast}, ${parts.macd.slow}, ${parts.macd.signal}, PRICE_CLOSE);\n` +
      `  if(handleMACD==INVALID_HANDLE) return(INIT_FAILED);\n` +
      `  return(INIT_SUCCEEDED);\n` +
      `}\n\n` +
      `void OnTick(){\n` +
      `  if(_Symbol!=InpSymbol || _Period!=(int)InpTimeframe) return;\n` +
      `  if(CopyBuffer(handleMACD, 0, 0, 2, macdMain)<2) return; // MAIN\n` +
      `  if(CopyBuffer(handleMACD, 1, 0, 2, macdSignal)<2) return; // SIGNAL\n` +
      `  bool crossUp   = (macdMain[1] < macdSignal[1]) && (macdMain[0] > macdSignal[0]);\n` +
      `  bool crossDown = (macdMain[1] > macdSignal[1]) && (macdMain[0] < macdSignal[0]);\n` +
      `  MqlTradeRequest req; MqlTradeResult res; ZeroMemory(req); ZeroMemory(res);\n` +
      `  req.symbol = InpSymbol; req.magic = InpMagic; req.deviation=20; req.type_filling=ORDER_FILLING_FOK;\n` +
      `  if(crossUp && !HasOpenPosition(POSITION_TYPE_BUY)) {\n` +
      `    req.action = TRADE_ACTION_DEAL; req.type = ORDER_TYPE_BUY;\n` +
      `    req.volume = CalculateLot(InpSL);\n` +
      `    req.price  = SymbolInfoDouble(InpSymbol, SYMBOL_ASK);\n` +
      `    req.sl     = req.price - InpSL*PointValue;\n` +
      `    req.tp     = req.price + InpTP*PointValue;\n` +
      `    req.comment = "${escapeQuotes(common.comment)}";\n` +
      `    OrderSend(req, res);\n` +
      `  }\n` +
      `  if(crossDown && !HasOpenPosition(POSITION_TYPE_SELL)) {\n` +
      `    req.action = TRADE_ACTION_DEAL; req.type = ORDER_TYPE_SELL;\n` +
      `    req.volume = CalculateLot(InpSL);\n` +
      `    req.price  = SymbolInfoDouble(InpSymbol, SYMBOL_BID);\n` +
      `    req.sl     = req.price + InpSL*PointValue;\n` +
      `    req.tp     = req.price - InpTP*PointValue;\n` +
      `    req.comment = "${escapeQuotes(common.comment)}";\n` +
      `    OrderSend(req, res);\n` +
      `  }\n` +
      `}\n`;
  }

  const footer = `\n//+------------------------------------------------------------------+\n`;

  return header + riskHelpers + logic + footer;
}

function toFixed(n: number, d: number) { return Number.isFinite(n) ? n.toFixed(d) : "0"; }
function escapeQuotes(s: string) { return (s || "").replace(/"/g, '\\"'); }

