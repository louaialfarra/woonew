import { View, Text, FlatList, TouchableHighlight } from "react-native";
import React, { useState, useEffect } from "react";
import fetchCurrencyData from "../hooks/fetchCurrency";

import { WOO_API_URL, CONSUMER_KEY, CONSUMER_SECRET } from "@env";
import axios from "axios";
import Base64 from "js-base64";

const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;

const Category = ({ navigation }) => {
  const fetchCategories = async (page) => {
    try {
      const authString = `${apiKey}:${apiSecret}`;
      const encodedAuth = Base64.encode(authString);

      const response = await axios.get(`${apiUrl}/products/categories`, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
        params: { page },
      });

      const catdata = response.data;
      return catdata;
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

          return {
            ...product,
            priceInCurrency,
            currency,
          };
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
      //fix
      const data1 = await fetchCategories(1);
      const data2 = await fetchCategories(2);
      const data3 = await fetchCategories(3);
      allcat = [...data1, ...data2, ...data3];

      setCategories(allcat);
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

    const renderCategoryItem = ({ item }) => (
      <TouchableHighlight onPress={() => handleCategoryPress(item.id)}>
        <View>
          <Text>{item.name}</Text>
        </View>
      </TouchableHighlight>
    );

    const renderProductItem = ({ item }) => (
      <TouchableHighlight onPress={() => handleProductPress(item)}>
        <View>
          <Text>{item.name}</Text>
        </View>
      </TouchableHighlight>
    );

    return (
      <View>
        <Text>Categories:</Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategoryItem}
        />

        {selectedCategory && (
          <>
            <Text style={{ fontSize: 50 }}>Products:</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderProductItem}
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
