import { View, Text } from "react-native";
import React from "react";

const CategoryPage = ({ route }) => {
  const { category } = route.params;
  return (
    <View>
      <Text>this is category id {category.id} </Text>
    </View>
  );
};
export default CategoryPage;
