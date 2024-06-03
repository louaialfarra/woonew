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
import HomePage from "./screens/homePage";
import NewProduct from "./screens/newProduct";
import Category from "./screens/category";
import SearchScreen from "./screens/searchScreen";
import CategoryPage from "./screens/categoryPage";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "gray" }}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: "red",
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
            <Tab.Screen
              name="HomeStack"
              component={HomeScreenStack}
              options={{
                tabBarIcon: ({ focused }) => (
                  <Feather
                    name="home"
                    size={24}
                    color={focused ? "red" : "black"}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Product List"
              component={ProductListStackScreen}
            />
            <Tab.Screen name="Cart" component={CartScreen} />
            <Tab.Screen
              name="Category List Screen"
              component={CategoryListStack}
            />
          </Tab.Navigator>
        </NavigationContainer>
        <Toast />
      </SafeAreaView>
    </Provider>
  );
}
function HomeScreenStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="home" component={HomePage} />
      <Stack.Screen name="newProduct" component={NewProduct} />
      <Stack.Screen name="categoryPage" component={CategoryPage} />
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
      <Stack.Screen name="Search" component={SearchScreen} />
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
      <Stack.Screen name="Search" component={SearchScreen} />
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
