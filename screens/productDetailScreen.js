import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import store from "../src/redux/store";
import { addToCart } from "../src/redux/cartSlice";

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

export default ProductDetailScreen;

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
