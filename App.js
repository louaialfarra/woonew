import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider, connect } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { Feather } from "@expo/vector-icons";
import {
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  Button,
  FlatList,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import {
  WOO_API_URL,
  CONSUMER_KEY,
  CONSUMER_SECRET,
  WOO_API_CURRENCY,
} from "@env";
import axios from "axios";
import Base64 from "js-base64";
import { TouchableOpacity } from "react-native";
// Action Creators
const addToCart = (product) => {
  return {
    type: "cart/addToCart",
    payload: product,
  };
};

const incrementQuantity = (productId) => {
  return {
    type: "cart/incrementQuantity",
    payload: productId,
  };
};

const decrementQuantity = (productId) => {
  return {
    type: "cart/decrementQuantity",
    payload: productId,
  };
};
const removeCartItem = (productId) => {
  return {
    type: "cart/removeCartItem",
    payload: productId,
  };
}; // this is for redux fix them in componetn soon
// Reducers
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    quantityMap: {},
  },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.items.find((item) => item.id === product.id);

      if (!existingItem) {
        state.items.push(product);
        state.quantityMap[product.id] = 1;
      }
    },
    incrementQuantity: (state, action) => {
      const productId = action.payload;
      state.quantityMap[productId] += 1;
    },
    decrementQuantity: (state, action) => {
      const productId = action.payload;
      if (state.quantityMap[productId] > 1) {
        state.quantityMap[productId] -= 1;
      } else {
        state.items = state.items.filter((item) => item.id !== productId);
        delete state.quantityMap[productId];
      }
    },
    removeCartItem: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.id !== productId);
      delete state.quantityMap[productId];
    },
  },
});

const rootReducer = combineReducers({
  cart: cartSlice.reducer,
});

const store = configureStore({
  reducer: rootReducer,
});
// end of redux
const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;
const apiCur = WOO_API_CURRENCY;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const fetchCurrencyData = async () => {
  try {
    const authString = `${apiKey}:${apiSecret}`;
    const encodedAuth = Base64.encode(authString);
    const response = await axios.get(`${apiCur}`, {
      headers: {
        Authorization: `Basic ${encodedAuth}`,
      },
    });

    const data = await response.data;

    const rate = data.SYP.rate;
    console.log("Rate for SYP:", rate);
    return rate;
  } catch (error) {
    console.error("Error fetching currency data:", error);
    return 0;
  }
};

const fetchProducts = async () => {
  try {
    const currencyRate = await fetchCurrencyData();

    const authString = `${apiKey}:${apiSecret}`;
    const encodedAuth = Base64.encode(authString);
    const response = await axios.get(`${apiUrl}/products`, {
      headers: {
        Authorization: `Basic ${encodedAuth}`,
      },
    });
    const products = response.data;
    console.log(products);

    const productsWithCurrency = response.data.map(async (product) => {
      const priceInCurrency = product.price * currencyRate; // Multiply the product price with the currency rate

      // Fetch the variation data for the product
      const variationResponse = await axios.get(
        `${apiUrl}/products/${product.id}/variations`,
        {
          headers: {
            Authorization: `Basic ${encodedAuth}`,
          },
        }
      );
      const variations = variationResponse.data;

      return {
        ...product,
        priceInCurrency,
        variations,
      };
    });

    const productsWithVariations = await Promise.all(productsWithCurrency);
    console.log("test");

    console.log(productsWithVariations);
    console.log("test");
    return productsWithVariations;
  } catch (error) {
    console.error(error);
    return [];
  }
};

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

  const renderFooter = () => {
    if (!hasMoreProducts) {
      return (
        <View style={styles.noMoreProductsContainer}>
          <Text>No more products to load</Text>
        </View>
      );
    }

    if (isLoadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text>Loading more products...</Text>
        </View>
      );
    }

    return null;
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

const CartScreen = ({ navigation }) => {
  const cartItems = useSelector((state) => state.cart.items);
  const quantityMap = useSelector((state) => state.cart.quantityMap);
  const dispatch = useDispatch();

  const handleCheckout = () => {
    const updatedCartItems = cartItems.map((item) => {
      const updatedQuantity = quantityMap[item.id] || 1;
      const subtotal = item.priceInCurrency * updatedQuantity;
      const updatedItem = {
        ...item,
        quantity: updatedQuantity,
        subtotal: subtotal,
      };
      return updatedItem;
    });

    navigation.navigate("Checkout", { cartItems: updatedCartItems });
  };

  const handleIncrementQuantity = (item) => {
    dispatch(incrementQuantity(item.id));

    const updatedQuantity = quantityMap[item.id] + 1;
    const subtotal = item.priceInCurrency * updatedQuantity;

    // Update the subtotal in the cart item object
    item.subtotal = subtotal;
  };

  const handleDecrementQuantity = (item) => {
    const currentQuantity = quantityMap[item.id];

    if (currentQuantity > 1) {
      dispatch(decrementQuantity(item.id));

      // Calculate the updated subtotal when quantity is decreased
      const updatedQuantity = currentQuantity - 1;
      const subtotal = item.priceInCurrency * updatedQuantity;

      // Update the subtotal in the cart item object
      item.subtotal = subtotal;
    }
  };

  const renderCartItem = ({ item }) => {
    const imageSrc = item.images?.[0]?.src;
    const quantity = quantityMap[item.id] || 1;

    const handleRemoveItem = () => {
      dispatch(removeCartItem(item.id));
    };

    const subtotal = item.priceInCurrency * quantity;

    return (
      <View style={styles.cartItemContainer}>
        {imageSrc ? (
          <Image style={styles.cartItemImage} source={{ uri: imageSrc }} />
        ) : (
          <Text style={{ fontSize: 12, color: "#ccc" }}>
            No image available
          </Text>
        )}
        <View>
          <Text style={styles.cartItemName}>{item.name}</Text>
          <Text style={styles.cartItemPrice}>
            Price: {subtotal.toLocaleString()} .SYP
          </Text>
          {item.selectedAttributes.map((attribute) => (
            <View key={attribute.name}>
              <Text>
                {attribute.name}: {attribute.selectedOption}
              </Text>
            </View>
          ))}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleDecrementQuantity(item)}
              disabled={quantity === 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleIncrementQuantity(item)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleRemoveItem}>
            <Feather name="trash" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  // Calculate the total price of all products
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.priceInCurrency * (quantityMap[item.id] || 1),
    0
  );
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart</Text>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyCartText}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.cartItemList}
          />
          <Text style={styles.totalPriceText}>
            Total Price: {totalPrice.toLocaleString()} .SYP
          </Text>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const Checkout = ({ navigation, route }) => {
  const { cartItems } = route.params;
  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    // Include additional billing fields as needed
  });

  const handleOrderSubmit = async () => {
    // Perform the submission logic here, e.g., create an order with WooCommerce

    // Example implementation using axios
    try {
      const currencyRate = await fetchCurrencyData();
      //const currPri = await fetchProducts();
      const lineItems = cartItems.map((item) => {
        const priceInCurrency = item.price * item.quantity; // Convert price to SYP
        const convert = priceInCurrency * currencyRate;
        const selectedAttributes = item.selectedAttributes.map((attribute) => ({
          name: attribute.name,
          option: attribute.selectedOption,
        }));
        // Find the matching variation based on selected attributes
        const variation = item.variations.find((variation) =>
          variation.attributes.every((attribute) =>
            selectedAttributes.some(
              (selectedAttribute) =>
                selectedAttribute.name === attribute.name &&
                selectedAttribute.option === attribute.option
            )
          )
        );
        return {
          product_id: item.id,
          quantity: item.quantity,
          total: convert.toFixed(2), // Round the price to 2 decimal places
          selectedAttributes: selectedAttributes,
          meta_data: selectedAttributes.map((attribute) => ({
            key: attribute.name,
            value: attribute.option,
          })),
          variation_id: variation ? variation.id : 0, // Set the variation ID or 0 if no matching variation found
        };
      });
      const orderData = {
        billing: {
          first_name: billingInfo.firstName,
          last_name: billingInfo.lastName,
          address_1: billingInfo.address,
          city: billingInfo.city,
          // Include additional billing fields as needed
        },
        shipping: {
          first_name: billingInfo.firstName,
          last_name: billingInfo.lastName,
          address_1: billingInfo.address,
          city: billingInfo.city,
          // Include additional shipping fields as needed
        },
        line_items: lineItems,
        currency: "SYP",
        shipping_lines: [
          {
            method_id: "local_pickup",
            method_title: "Local Pickup",
          },
        ],
        payment_method: "cod",
        payment_method_title: "Cash on Delivery",
        status: "processing",
      };

      const authString = `${apiKey}:${apiSecret}`;
      const encodedAuth = Base64.encode(authString); // Encode the authentication string

      const response = await axios.post(`${apiUrl}/orders`, orderData, {
        headers: {
          Authorization: `Basic ${encodedAuth}`, // Include the authentication header
        },
      });

      // Handle the response as needed
      console.log("Order created:", response.data);

      // Optionally, you can navigate to a success screen or perform any other action
      navigation.navigate("OrderSuccess");
    } catch (error) {
      // Handle the error
      console.error("Error creating order:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={billingInfo.firstName}
        onChangeText={(text) =>
          setBillingInfo((prevInfo) => ({ ...prevInfo, firstName: text }))
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={billingInfo.lastName}
        onChangeText={(text) =>
          setBillingInfo((prevInfo) => ({ ...prevInfo, lastName: text }))
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={billingInfo.address}
        onChangeText={(text) =>
          setBillingInfo((prevInfo) => ({ ...prevInfo, address: text }))
        }
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={billingInfo.city}
        onChangeText={(text) =>
          setBillingInfo((prevInfo) => ({ ...prevInfo, city: text }))
        }
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleOrderSubmit}>
        <Text style={styles.submitButtonText}>Submit Order</Text>
      </TouchableOpacity>
    </View>
  );
};

const OrderSuccess = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Success</Text>
      <Text style={styles.message}>
        Your order has been submitted successfully!
      </Text>
      <Text style={styles.message}>Thank you for your purchase.</Text>
    </View>
  );
};
const ProductDetailScreen = ({ route }) => {
  const { product } = route.params;
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleOptionSelect = (attributeName, option) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [attributeName]: option,
    }));
  };
  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
  };
  const handleAddToCart = () => {
    const selectedAttributes = product.attributes.map((attribute) => ({
      name: attribute.name,
      selectedOption: selectedOptions[attribute.name] || attribute.options[0],
    }));

    const itemWithAttributes = {
      ...product,
      id: product.id + "_" + JSON.stringify(selectedAttributes),
      quantity: 1,
      selectedAttributes,
    };

    const existingItem = cartItems.find((item) => {
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

  return (
    <View style={styles.container}>
      <Text>{product.name}</Text>
      <Image
        source={{ uri: product.images?.[selectedImageIndex]?.src }}
        style={styles.selectedProductImage}
      />
      <ScrollView horizontal>
        <View style={styles.imageGallery}>
          {product.images && product.images.length > 0 ? (
            product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(index)}
              >
                <Image
                  source={{ uri: image.src }}
                  style={[
                    styles.productImage,
                    selectedImageIndex === index && styles.selectedImage,
                  ]}
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text>No image available</Text>
          )}
        </View>
      </ScrollView>
      <View>
        <Text>Price: {product.priceInCurrency.toLocaleString()}.SYP</Text>

        {product.attributes.map((attribute) => (
          <View key={attribute.name}>
            <Text>{attribute.name}: </Text>
            <View style={styles.attributeOptions}>
              {attribute.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleOptionSelect(attribute.name, option)}
                  style={[
                    styles.attributeOption,
                    selectedOptions[attribute.name] === option &&
                      styles.selectedAttributeOption,
                  ]}
                >
                  <Text>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={handleAddToCart}>
          <Text>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function App() {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevCartItems) => [...prevCartItems, product]);
    showToast(
      "success",
      "Item Added to Cart",
      "The item has been added to your cart."
    );
  };
  const handleCheckout = () => {
    // Handle the checkout logic
  };
  const showToast = (type, text1, text2) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
      visibilityTime: 2000, // 2 seconds
      autoHide: true,
    });
  };
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Product List">
            {() => (
              <Stack.Navigator>
                <Stack.Screen
                  name="ProductListScreen"
                  options={{ headerShown: false }}
                >
                  {(props) => (
                    <ProductListScreen {...props} addToCart={addToCart} />
                  )}
                </Stack.Screen>
                <Stack.Screen
                  name="ProductDetail"
                  component={ProductDetailScreen}
                />
                <Stack.Screen name="Checkout" options={{ title: "Checkout" }}>
                  {(props) => (
                    <Checkout
                      {...props}
                      cartItems={cartItems}
                      handleCheckout={handleCheckout}
                    />
                  )}
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
            {(props) => (
              <CartScreen
                {...props}
                cartItems={cartItems}
                handleCheckout={handleCheckout}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </Provider>
  );
}

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
});
