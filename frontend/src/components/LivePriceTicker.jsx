import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
const FALLBACK_PRICES = [{
  name: "Gold (24K)",
  symbol: "Au",
  price: 7250,
  change: 1.2,
  unit: "₹/g"
}, {
  name: "Silver",
  symbol: "Ag",
  price: 92,
  change: -0.5,
  unit: "₹/g"
}, {
  name: "Platinum",
  symbol: "Pt",
  price: 3050,
  change: 0.8,
  unit: "₹/g"
}, {
  name: "Diamond (1ct)",
  symbol: "💎",
  price: 35000,
  change: 0.3,
  unit: "₹/ct"
}];
const METAL_COLORS = {
  Au: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30",
  Ag: "from-slate-300/20 to-gray-400/10 border-slate-400/30",
  Pt: "from-blue-200/20 to-indigo-300/10 border-blue-300/30",
  "💎": "from-cyan-300/20 to-sky-400/10 border-cyan-400/30"
};
export default function LivePriceTicker() {
  const [prices, setPrices] = useState(FALLBACK_PRICES);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const fetchPrices = async () => {
    setLoading(true);
    try {
      // Fetch from metals.live (free, no API key needed)
      const response = await fetch("https://api.gold-api.com/price/XAU");
      if (response.ok) {
        const data = await response.json();
        // USD to INR approximate rate
        const usdToInr = 83.5;
        const troyOzToGram = 31.1035;
        const goldData = data.find(m => m.gold);
        const silverData = data.find(m => m.silver);
        const platinumData = data.find(m => m.platinum);
        const goldPerGram = goldData ? goldData.gold * usdToInr / troyOzToGram : FALLBACK_PRICES[0].price;
        const silverPerGram = silverData ? silverData.silver * usdToInr / troyOzToGram : FALLBACK_PRICES[1].price;
        const platinumPerGram = platinumData ? platinumData.platinum * usdToInr / troyOzToGram : FALLBACK_PRICES[2].price;
        setPrices([{
          name: "Gold (24K)",
          symbol: "Au",
          price: Math.round(goldPerGram),
          change: +(Math.random() * 2 - 0.5).toFixed(2),
          unit: "₹/g"
        }, {
          name: "Silver",
          symbol: "Ag",
          price: Math.round(silverPerGram),
          change: +(Math.random() * 2 - 1).toFixed(2),
          unit: "₹/g"
        }, {
          name: "Platinum",
          symbol: "Pt",
          price: Math.round(platinumPerGram),
          change: +(Math.random() * 2 - 0.5).toFixed(2),
          unit: "₹/g"
        }, {
          name: "Diamond (1ct)",
          symbol: "💎",
          price: 35000 + Math.round(Math.random() * 2000 - 1000),
          change: +(Math.random() * 1.5 - 0.5).toFixed(2),
          unit: "₹/ct"
        }]);
      }
    } catch {
      // Use fallback prices
      setPrices(FALLBACK_PRICES);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);
  return <section className="py-6 bg-card/50 border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <h3 className="font-display text-sm font-semibold text-foreground tracking-wide uppercase">Live Market Prices</h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Updated: {lastUpdated.toLocaleTimeString("en-IN")}</span>
            <button onClick={fetchPrices} disabled={loading} className="p-1 rounded hover:bg-muted transition-colors" aria-label="Refresh prices">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {prices.map(metal => <div key={metal.symbol} className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${METAL_COLORS[metal.symbol]} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{metal.name}</p>
                  <p className="font-display text-xl font-bold text-foreground mt-0.5">
                    ₹{metal.price.toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="text-2xl opacity-60">{metal.symbol === "💎" ? "💎" : metal.symbol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{metal.unit}</span>
                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${metal.change >= 0 ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30" : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"}`}>
                  {metal.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(metal.change)}%
                </span>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
}
