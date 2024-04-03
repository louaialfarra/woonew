import {
  View,
  Text,
  FlatList,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";
import React, { useState, useEffect } from "react";
import fetchCurrencyData from "../hooks/fetchCurrency";

import { WOO_API_URL, CONSUMER_KEY, CONSUMER_SECRET } from "@env";
import axios from "axios";
import Base64 from "js-base64";

const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;

const Category = ({ navigation }) => {
  const fetchCategories = async () => {
    try {
      const authString = `${apiKey}:${apiSecret}`;
      const encodedAuth = Base64.encode(authString);

      const response = await axios.get(`${apiUrl}/products/categories`, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
        params: { parent: 0, per_page: 30 },
      });

      const catdata = response.data;
      const uncategorizedID = 15;
      const filterId = catdata.filter(
        (category) => category.id !== uncategorizedID
      );
      filterId.sort((a, b) => a.menu_order - b.menu_order);

      // Fetch all products and add them to the empty category
      const allProductsResponse = await axios.get(`${apiUrl}/products`, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
        params: { per_page: 100 }, // Adjust per_page as needed
      });

      const allProducts = allProductsResponse.data;

      // Add an empty category option and all products to the categories array
      const categories = [
        { id: "944846497", name: "All Products", products: allProducts },
        ...filterId,
      ];

      return categories;
    } catch (error) {
      console.error(error);
    }
  };

  // we can update this fetch by passing params and can normal fetch update it soon
  const fetchProductsByCategory = async (categoryId) => {
    try {
      const authString = `${apiKey}:${apiSecret}`;
      const encodedAuth = Base64.encode(authString);
      const currencyRate = await fetchCurrencyData();

      const response = await axios.get(`${apiUrl}/products`, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
        params: {
          category: categoryId,
        },
      });
      const products = response.data;

      const productsWithCurrency = await Promise.all(
        products.map(async (product) => {
          const priceInCurrency = product.price * currencyRate;
          const currency = "SYP";

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

      return productsWithCurrency;
    } catch (error) {
      console.error(error);
    }
  };

  const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);

    const fetchCategoriesData = async () => {
      const catdata = await fetchCategories();

      catdata.sort((a, b) => a.menu_order - b.menu_order);
      setCategories(catdata);
    };

    useEffect(() => {
      fetchCategoriesData();
    }, []);

    const handleProductPress = (product) => {
      navigation.navigate("ProductDetail", { product });
    };

    const handleCategoryPress = async (categoryId) => {
      const products = await fetchProductsByCategory(categoryId);
      setSelectedCategory(categoryId);
      setProducts(products);
    };

    const renderCategoryItem = ({ item }) => {
      const imageSrc = item.image?.src;

      return (
        <TouchableOpacity onPress={() => handleCategoryPress(item.id)}>
          <View style={{ marginLeft: 10, alignItems: "center" }}>
            {imageSrc ? (
              <Image source={{ uri: imageSrc }} style={styles.imagecontainer} />
            ) : (
              <View
                style={[
                  styles.imagecontainer,
                  { justifyContent: "center", alignItems: "center" },
                ]}
              >
                <Text
                  style={{
                    fontSize: 9,
                  }}
                >
                  No Image Available
                </Text>
              </View>
            )}
            <Text>{item.name}</Text>
          </View>
        </TouchableOpacity>
      );
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
                  style={[styles.attributeOption]}
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
            {item.images?.[0]?.src ? (
              <Image
                source={{ uri: item.images[0].src }}
                style={styles.productImage}
              />
            ) : (
              <Text>No image available</Text>
            )}

            <Text style={styles.itemName}>{item.name}</Text>

            {hasVariationSalePrice ? (
              <Text style={styles.salePrice}>
                Sale Price: {item.salePrice.toLocaleString()}
              </Text>
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

    return (
      <View>
        <Text>Categories:</Text>
        <View>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCategoryItem}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {selectedCategory && (
          <>
            <Text style={{ fontSize: 50 }}>Products:</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderProductItem}
              numColumns={2}
            />
          </>
        )}
      </View>
    );
  };

  return (
    <View>
      <Text>This is the category component</Text>
      <CategoryList />
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  imagecontainer: {
    height: 80,
    width: 80,
    borderRadius: 50,
    borderColor: "green",
    borderWidth: 2,
  },
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
