import { useDispatch, useSelector } from "react-redux";
import { Feather } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import {
  incrementQuantity,
  decrementQuantity,
  removeCartItem,
} from "../src/redux/cartSlice";

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
export default CartScreen;

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
