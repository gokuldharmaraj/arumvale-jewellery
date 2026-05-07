import axios from "axios";

let cachedPrices = null;
let lastFetchTime = 0;

export const getMetalPrices = async (req, res) => {
  const now = Date.now();

  // 30 minutes cache
  const CACHE_DURATION = 30 * 60 * 1000;

  if (cachedPrices && now - lastFetchTime < CACHE_DURATION) {
    return res.json(cachedPrices);
  }

  try {
    const response = await axios.get(
      "https://api.metalpriceapi.com/v1/latest",
      {
        params: {
          api_key: process.env.METAL_API_KEY,
          base: "USD",
          currencies: "XAU,XAG,XPT,INR",
        },
      },
    );

    const rates = response.data.rates;
    const ozToGram = 31.1035;

    const prices = {
      gold: `₹${(((1 / rates.XAU) * rates.INR) / ozToGram).toFixed(2)} / g`,
      silver: `₹${(((1 / rates.XAG) * rates.INR) / ozToGram).toFixed(2)} / g`,
      platinum: `₹${(((1 / rates.XPT) * rates.INR) / ozToGram).toFixed(2)} / g`,
      diamond: "Market Based",
    };

    cachedPrices = prices;
    lastFetchTime = now;

    res.json(prices);
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      message: "Metal price fetch failed",
    });
  }
};
