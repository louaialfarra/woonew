import {
  WOO_API_URL,
  CONSUMER_KEY,
  CONSUMER_SECRET,
  WOO_API_CURRENCY,
} from "@env";
import axios from "axios";
import Base64 from "js-base64";

const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;
const apiCur = WOO_API_CURRENCY;

const fetchCurrencyData = async () => {
  try {
    const authString = `${apiKey}:${apiSecret}`;
    const encodedAuth = Base64.encode(authString);
    const response = await axios.get(`${apiCur}`, {
      headers: {
        Authorization: `Basic ${encodedAuth}`,
      },
    });

    const data = await response.data;

    const rate = data.SYP.rate;
    console.log("Rate for SYP:", rate);
    return rate;
  } catch (error) {
    console.error("Error fetching currency data:", error);
    return 0;
  }
};

export default fetchCurrencyData;
