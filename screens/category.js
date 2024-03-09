import { View, Text, FlatList, TouchableHighlight } from "react-native";
import React, { useState, useEffect } from "react";

import { WOO_API_URL, CONSUMER_KEY, CONSUMER_SECRET } from "@env";
import axios from "axios";
import Base64 from "js-base64";

const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;

const Category = () => {
  const fetchCategories = async () => {
    try {
      const authString = `${apiKey}:${apiSecret}`;
      const encodedAuth = Base64.encode(authString);

      const response = await axios.get(`${apiUrl}/products/categories`, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
      });

      const catdata = response.data;
      return catdata;
      console.log(catdata);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchProductsByCategory = async (categoryId) => {
    try {
      const authString = `${apiKey}:${apiSecret}`;
      const encodedAuth = Base64.encode(authString);

      const response = await axios.get(
        `${apiUrl}/products?category=${categoryId}`,
        {
          headers: {
            Authorization: `Basic ${encodedAuth}`,
          },
        }
      );
      const productCatData = response.data;
      return productCatData;
    } catch (error) {
      console.error(error);
    }
  };

  const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);

    useEffect(() => {
      const fetchCategoriesData = async () => {
        const data = await fetchCategories();
        setCategories(data);
      };

      fetchCategoriesData();
    }, []);

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
      <View>
        <Text>{item.name}</Text>
      </View>
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
            <Text>Products:</Text>
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
