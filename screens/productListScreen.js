import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Text,
  View,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { addToCart } from "../src/redux/cartSlice";
import store from "../src/redux/store";
import fetchProducts from "../hooks/fetch";

const ProductListScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  const loadProducts = async () => {
    try {
      //fetch 2 pages = 20 product updated by louai and copilot
      const data = await fetchProducts(page);
      const data2 = await fetchProducts(page + 1);
      const allProduct = [...data, ...data2];
      if (data.allProduct === 0) {
        setHasMoreProducts(false);
      } else {
        setProducts((prevProducts) => [...prevProducts, ...allProduct]);
        setPage((prevPage) => prevPage + 2);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreProducts) {
      setIsLoadingMore(true);
    }
  };
  //the use effect is exectured when the isloading more changed in handel andin the reac hend and the product is loaded
  useEffect(() => {
    if (isLoadingMore && hasMoreProducts) {
      loadProducts()
        .then(() => setIsLoadingMore(false))
        .catch((error) => {
          console.error(error);
          setIsLoadingMore(false);
        });
    }
  }, [isLoadingMore, hasMoreProducts]);

  const onEndReached = () => {
    if (!isLoadingMore && hasMoreProducts) {
      handleLoadMore();
    }
  };

  const handleOptionSelect = (productId, attributeName, option) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [productId]: {
        ...prevSelectedOptions[productId],
        [attributeName]: option,
      },
    }));
  };
  // handleoption is very simple  first we copy the prevselected option  then we acces the product ID
  // the we type ...prevselected OPtion[product ir] we copy every thing inside the product id and update only  the attribute

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
    //This ensures uniqueness for each item with different attribute selections.  in the prodict id json stringfy
    /*{
  // Original product properties (spread from 'product')
  id: 'originalProductId_[{"name":"Color","selectedOption":"Blue"},{"name":"Size","selectedOption":"Medium"}]',
  // Other properties
  quantity: 1,
  selectedAttributes: [
    {
      name: 'Color',
      selectedOption: 'Blue'
    },
    {
      name: 'Size',
      selectedOption: 'Medium'
    }
  ]
} */

    /*const selectedAttributes = [
  {
    name: 'Color',
    selectedOption: 'Blue'
  },
  {
    name: 'Size',
    selectedOption: 'Medium'
  }
];*/
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
      } /*The .every() method iterates over each attribute in item.selectedAttributes.
For each itemAttr (attribute in the existing item), it looks for a corresponding attribute in itemWithAttributes.selectedAttributes with the same name.
If found, it compares the selectedOption values of the corresponding attributes.
If all comparisons match (i.e., every attribute in the existing item has a matching attribute in the new item with the same selected option), the condition evaluates to true. */
      //It ensures that the lengths of item.selectedAttributes and itemWithAttributes.selectedAttributes are the same.
      //This ensures that both items have the same number of attributes.
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
          {item.images?.[0]?.src ? (
            <Image
              source={{ uri: item.images[0].src }}
              style={styles.productImage}
            />
          ) : (
            <Text>No image available</Text>
          )}

          <Text style={styles.itemName}>{item.name}</Text>

          {hasVariationSalePrice ? (
            <Text style={styles.salePrice}>
              Sale Price: {item.salePrice.toLocaleString()}
            </Text>
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

  const renderProductList = () => {
    const numColumns = 2;
    return (
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator style={styles.loader} size="medium" />
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

export default ProductListScreen;

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
