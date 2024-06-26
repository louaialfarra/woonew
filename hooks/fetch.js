import { WOO_API_URL, CONSUMER_KEY, CONSUMER_SECRET } from "@env";
import axios from "axios";
import Base64 from "js-base64";

const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;

const fetchProducts = async (page, search, on_sale, category) => {
  try {
    const authString = `${apiKey}:${apiSecret}`;
    const encodedAuth = Base64.encode(authString);

    const response = await axios.get(`${apiUrl}/products`, {
      headers: {
        Authorization: `Basic ${encodedAuth}`,
      },
      params: {
        per_page: 20,
        page,
        status: "publish",
        orderby: "date",
        order: "desc",
        search,
        on_sale,
        category,
      },
    });

    const products = response.data;
    console.log(products);

    const productsWithCurrency = await Promise.all(
      products.map(async (product) => {
        const priceInCurrency = product.price;
        const currency = "SYP";

        if (product.on_sale === true && product.type === "variable") {
          const variationResponse = await axios.get(
            `${apiUrl}/products/${product.id}/variations`,
            {
              headers: {
                Authorization: `Basic ${encodedAuth}`,
              },
            }
          );
          const variations = variationResponse.data;
          const regularPrice = variations[0].regular_price;

          const salePrice = variations[0].sale_price;

          console.log(salePrice);

          return {
            ...product,
            priceInCurrency,
            variations,
            regularPrice,
            salePrice,
            currency,
          };
        } else {
          return {
            ...product,
            priceInCurrency,
            currency,
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
