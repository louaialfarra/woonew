import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import fetchProducts from "../hooks/fetch";

const CategoryPage = ({ route }) => {
  const [products, setProducts] = useState([]);
  const { category } = route.params;
  const selectedCategoryId = category.id;

  const ProductsByCategory = async () => {
    const data = await fetchProducts(
      1,
      undefined,
      undefined,
      selectedCategoryId
    );
    setProducts(data);
    console.log(data + "this is data category");
  };
  useEffect(() => {
    ProductsByCategory();
  }, []);

  const renderProductItem = ({ item }) => {
    return (
      <View>
        <TouchableOpacity>
          {item.images?.[0]?.src ? (
            <Image
              source={{ uri: item.images[0].src }}
              style={{ height: 200, width: 200 }}
            />
          ) : (
            <Text>No image available</Text>
          )}

          <Text>{item.name}</Text>

          <Text>
            Price: {item.priceInCurrency.toLocaleString()} {item.currency}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Text>this is category id {category.id} </Text>
      <Text>this is category id {selectedCategoryId} </Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
      />
      <Text>text</Text>
    </View>
  );
};
export default CategoryPage;
