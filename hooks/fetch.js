import { WOO_API_URL, CONSUMER_KEY, CONSUMER_SECRET } from "@env";
import axios from "axios";
import Base64 from "js-base64";

import fetchCurrencyData from "../hooks/fetchCurrency";
// end of redux
const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;

const fetchProducts = async (page) => {
  try {
    const currencyRate = await fetchCurrencyData();

    const authString = `${apiKey}:${apiSecret}`;
    const encodedAuth = Base64.encode(authString);

    // Modify the API URL to include the page parameter for pagination
    const response = await axios.get(`${apiUrl}/products`, {
      headers: {
        Authorization: `Basic ${encodedAuth}`,
      },
      params: {
        page,
        status: "publish",
        orderby: "date",
        order: "desc",
      },
    });

    const products = response.data;
    console.log(products);

    const productsWithCurrency = await Promise.all(
      products.map(async (product) => {
        const priceInCurrency = product.price * currencyRate;

        if (product.type === "variable") {
          const variationResponse = await axios.get(
            `${apiUrl}/products/${product.id}/variations`,
            {
              headers: {
                Authorization: `Basic ${encodedAuth}`,
              },
            }
          );
          const variations = variationResponse.data;
          const reg = variations[0].regular_price;
          const regularPrice = reg * currencyRate;

          const sale = variations[0].sale_price;
          const salePrice = sale * currencyRate;
          console.log(salePrice);
          return {
            ...product,
            priceInCurrency,
            variations,
            regularPrice,
            salePrice,
          };
        } else {
          return {
            ...product,
            priceInCurrency,
          };
        }
      })
    );

    console.log(productsWithCurrency);
    return productsWithCurrency;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default fetchProducts;
