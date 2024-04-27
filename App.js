import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import Toast from "react-native-toast-message";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";

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
import { Feather } from "@expo/vector-icons";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "black", height: 120 },
            headerTitleStyle: { fontWeight: "bold" },
            //headerTitle: "Hooboo" for text
            headerTitle: () => (
              <View style={{ alignItems: "center" }}>
                <Image
                  source={require("./assets/logo/hooboo_logo.png")}
                  style={{ height: 50, resizeMode: "contain" }}
                />
              </View>
            ),
            headerRight: () => <SearchButton />,
          }}
        >
          <Tab.Screen name="Searchname" component={SearchStackScreen} />
          <Tab.Screen name="Product List" component={ProductListStackScreen} />
          <Tab.Screen name="Cart" component={CartScreen} />
          <Tab.Screen
            name="Category List Screen"
            component={CategoryListStack}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </Provider>
  );
}
function SearchStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
function ProductListStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductList">
        {(props) => <ProductListScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />

      <Stack.Screen name="Checkout">
        {(props) => <Checkout {...props} />}
      </Stack.Screen>

      <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
    </Stack.Navigator>
  );
}
function CategoryListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="category">
        {(props) => <Category {...props} />}
      </Stack.Screen>
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
function SearchButton() {
  const navigation = useNavigation();

  const handleSearch = () => {
    navigation.navigate("Search");
  };

  return (
    <TouchableOpacity
      style={{
        height: 40,
        width: 30,
        marginRight: 20,
        marginTop: 30,
      }}
      onPress={handleSearch}
    >
      <Feather name="search" size={28} color="white" />
    </TouchableOpacity>
  );
}
