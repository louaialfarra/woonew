import { useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { selectOptionD, addToCart } from "../src/redux/cartSlice";
import showToast from "../components/showToast";
import { useSelector, useDispatch } from "react-redux";
import store from "../src/redux/store";
import { useState } from "react";

const NewProduct = () => {
  const route = useRoute();
  const { product } = route.params;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const dispatch = useDispatch();

  const selectedOptions = useSelector((state) => state.cart.selectedOptions);
  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
  };

  const handleOptionSelect = (attributeName, option) => {
    dispatch(selectOptionD({ attributeName, option }));
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
      showToast(
        "info",
        "Item Already in Cart",
        "This item is already in your cart."
      );
    } else {
      dispatch(addToCart(itemWithAttributes));
      showToast(
        "success",
        "Item Added to Cart",
        "The item has been added to your cart."
      );
    }
  };

  return (
    <View>
      <Image
        source={{ uri: product.images[selectedImageIndex]?.src }}
        style={{ height: 200, width: 200 }}
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
      <Text>ths is text</Text>
      <Text>{product.price}</Text>
      <Text>{product.sale_price}</Text>
      <Text>{product.price}</Text>
      <Text>this is variation test</Text>

      <Text>this is map arrray</Text>
      {product.attributes.map((attribute) => (
        <View key={attribute.name}>
          <Text>{attribute.name}</Text>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            {attribute.options.map((option) => (
              <View
                key={option}
                style={{
                  alignItems: "center",
                  padding: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleOptionSelect(attribute.name, option)}
                  style={{
                    alignItems: "center",
                    padding: 10,
                    borderColor: "blue",
                    borderWidth: 2,
                    width: 100,
                  }}
                >
                  <Text>{option}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ))}
      <TouchableOpacity onPress={handleAddToCart}>
        <Text>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};
export default NewProduct;

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
