import React, { useEffect, useState } from "react";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
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
//redux files

import fetchCurrencyData from "../hooks/fetchCurrency";

// end of redux
const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;

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
export default Checkout;

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
