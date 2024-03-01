import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Text,
  View,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  WOO_API_URL,
  CONSUMER_KEY,
  CONSUMER_SECRET,
  WOO_API_CURRENCY,
} from "@env";
import axios from "axios";
import Base64 from "js-base64";
//redux files
import { addToCart } from "../src/redux/cartSlice";
import store from "../src/redux/store";

import fetchCurrencyData from "../components/fetchCurrency";
// end of redux
const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;
const apiCur = WOO_API_CURRENCY;

const ProductListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts(page);
      if (data.length === 0) {
        setHasMoreProducts(false);
      } else {
        setProducts((prevProducts) => [...prevProducts, ...data]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchProducts = async (page) => {
    try {
      const currencyRate = await fetchCurrencyData();

      const authString = `${apiKey}:${apiSecret}`;
      const encodedAuth = Base64.encode(authString);

      // Modify the API URL to include the page parameter for pagination
      const response = await axios.get(`${apiUrl}/products?page=${page}`, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
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

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    if (isLoadingMore) {
      loadProducts()
        .then(() => setIsLoadingMore(false))
        .catch((error) => {
          console.error(error);
          setIsLoadingMore(false);
        });
    }
  }, [isLoadingMore]);

  const handleOptionSelect = (productId, attributeName, option) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [productId]: {
        ...prevSelectedOptions[productId],
        [attributeName]: option,
      },
    }));
  };
  const handleAddToCart = (product) => {
    const selectedAttributes = product.attributes.map((attribute) => ({
      name: attribute.name,
      selectedOption:
        selectedOptions[product.id]?.[attribute.name] || attribute.options[0],
    }));

    const itemWithAttributes = {
      ...product,
      id: product.id + "_" + JSON.stringify(selectedAttributes),
      quantity: 1,
      selectedAttributes,
    };

    const existingItem = store.getState().cart.items.find((item) => {
      if (item.id === itemWithAttributes.id) {
        return (
          item.selectedAttributes.length ===
            itemWithAttributes.selectedAttributes.length &&
          item.selectedAttributes.every((itemAttr) => {
            const correspondingAttr =
              itemWithAttributes.selectedAttributes.find(
                (attr) => attr.name === itemAttr.name
              );
            return correspondingAttr.selectedOption === itemAttr.selectedOption;
          })
        );
      }
      return false;
    });

    if (existingItem) {
      Toast.show({
        type: "info",
        text1: "Item Already in Cart",
        text2: "This item is already in your cart.",
        visibilityTime: 2000,
        autoHide: true,
      });
    } else {
      dispatch(addToCart(itemWithAttributes));
      Toast.show({
        type: "success",
        text1: "Item Added to Cart",
        text2: "The item has been added to your cart.",
        visibilityTime: 2000,
        autoHide: true,
      });
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate("ProductDetail", { product });
  };

  const renderAttributes = (item) => {
    if (item.type === "variable") {
      return item.attributes.map((attribute) => (
        <View key={attribute.name}>
          <Text>{attribute.name}:</Text>
          <View style={styles.attributeOptions}>
            {attribute.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.attributeOption,
                  selectedOptions[item.id]?.[attribute.name] === option &&
                    styles.selectedAttributeOption,
                ]}
                onPress={() =>
                  handleOptionSelect(item.id, attribute.name, option)
                }
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ));
    } else {
      return null;
    }
  };
  const renderProductItem = ({ item }) => {
    const hasVariationSalePrice = item.variations.some(
      (variation) => variation.sale_price
    );

    return (
      <View style={styles.productItem}>
        <TouchableOpacity onPress={() => handleProductPress(item)}>
          {item.images && item.images?.[0]?.src ? (
            <Image
              source={{ uri: item.images?.[0]?.src }}
              style={styles.productImage}
            />
          ) : (
            <Text>No image available</Text>
          )}
          <Text style={styles.itemName}>{item.name}</Text>
          {hasVariationSalePrice ? (
            <Text style={styles.salePrice}>Sale Price: {item.salePrice}</Text>
          ) : (
            <Text style={styles.price}>
              Price: {item.priceInCurrency.toLocaleString()} {item.currency}
            </Text>
          )}
        </TouchableOpacity>
        {renderAttributes(item)}
        <Button title="Add to Cart" onPress={() => handleAddToCart(item)} />
      </View>
    );
  };

  const renderProductList = () => {
    const numColumns = 2;
    return (
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator style={styles.loader} size="small" />
          ) : hasMoreProducts ? (
            <Button title="Load More" onPress={handleLoadMore} />
          ) : null
        }
      />
    );
  };
  return (
    <View style={styles.container}>
      <Text>Product List</Text>
      {renderProductList()}
    </View>
  );
};

export default ProductListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  productItem: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cartItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cartItemImage: {
    height: 50,
    width: 50,
    marginRight: 10,
  },

  submitButton: {
    backgroundColor: "blue",
    paddingVertical: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  attributeOptions: {
    flexDirection: "row",
    marginTop: 5,
  },
  attributeOption: {
    padding: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  selectedAttributeOption: {
    backgroundColor: "lightblue",
  },
  imageGallery: {
    flexDirection: "row",
    marginBottom: 20,
  },
  productImage: {
    width: 150,
    height: 150,
    marginRight: 5,
    borderWidth: 1,
    borderColor: "gray",
  },
  selectedImage: {
    borderWidth: 2,
    borderColor: "blue",
  },
  selectedProductImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "gray",
  },
  attributeOptions: {
    flexDirection: "row",
    marginBottom: 10,
  },
  attributeOption: {
    marginRight: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: "gray",
  },
  selectedAttributeOption: {
    borderColor: "blue",
  },
  itemName: {
    fontWeight: "bold",
  },
  oldPrice: {
    textDecorationLine: "line-through",
  },
  salePrice: {
    color: "red",
  },
});
