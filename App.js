import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import Toast from "react-native-toast-message";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import store from "./src/redux/store";

import ProductListScreen from "./screens/productListScreen";
import ProductDetailScreen from "./screens/productDetailScreen";
import CartScreen from "./screens/cartScreen";
import Checkout from "./screens/checkoutScreen";
import OrderSuccess from "./screens/orderScreen";

import Category from "./screens/category";
import SearchScreen from "./screens/searchScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Search">
            {() => (
              <Stack.Navigator>
                <Stack.Screen name="search">
                  {(props) => <SearchScreen {...props} />}
                </Stack.Screen>
                <Stack.Screen
                  name="ProductDetail"
                  component={ProductDetailScreen}
                />
              </Stack.Navigator>
            )}
          </Tab.Screen>

          <Tab.Screen name="Product List">
            {() => (
              <Stack.Navigator>
                <Stack.Screen
                  name="ProductListScreen"
                  options={{ headerShown: false }}
                >
                  {(props) => <ProductListScreen {...props} />}
                </Stack.Screen>
                <Stack.Screen
                  name="ProductDetail"
                  component={ProductDetailScreen}
                />
                <Stack.Screen name="Checkout" options={{ title: "Checkout" }}>
                  {(props) => <Checkout {...props} />}
                </Stack.Screen>
                <Stack.Screen
                  name="OrderSuccess"
                  options={{ title: "Order Success" }}
                  component={OrderSuccess}
                />
              </Stack.Navigator>
            )}
          </Tab.Screen>
          <Tab.Screen name="Cart">
            {(props) => <CartScreen {...props} />}
          </Tab.Screen>
          <Tab.Screen name="Category list screen">
            {() => (
              <Stack.Navigator>
                <Stack.Screen name="category" options={{ headerShown: false }}>
                  {(props) => <Category {...props} />}
                </Stack.Screen>
                <Stack.Screen
                  name="ProductDetail"
                  component={ProductDetailScreen}
                />
              </Stack.Navigator>
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </Provider>
  );
}

/*const styles = StyleSheet.create({
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
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
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
});*/
