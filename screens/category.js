import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import fetchCurrencyData from "../hooks/fetchCurrency";
import { addToCart, selectOption } from "../src/redux/cartSlice";
import { WOO_API_URL, CONSUMER_KEY, CONSUMER_SECRET } from "@env";
import axios from "axios";
import Base64 from "js-base64";
import { useDispatch, useSelector } from "react-redux";
import store from "../src/redux/store";
import showToast from "../components/showToast";
const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;

const Category = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedOptions = useSelector((store) => store.cart.selectedOptions);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [page, setPage] = useState(1);
  //const [test, setTest] = useState(false);

  const fetchCategories = async () => {
    try {
      const authString = `${apiKey}:${apiSecret}`;
      const encodedAuth = Base64.encode(authString);

      const response = await axios.get(`${apiUrl}/products/categories`, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
        params: { parent: 0, per_page: 30 },
      });

      const catdata = response.data;
      const uncategorizedID = 15;
      const filterId = catdata.filter(
        (category) => category.id !== uncategorizedID
      );
      filterId.sort((a, b) => a.menu_order - b.menu_order);

      // Fetch all products and add them to the empty category
      const allProductsResponse = await axios.get(`${apiUrl}/products`, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
        params: { per_page: 100 }, // Adjust per_page as needed
      });

      const allProducts = allProductsResponse.data;

      // Add an empty category option and all products to the categories array
      const categories = [
        { id: "all", name: "All Products", products: allProducts },
        ...filterId,
      ];

      return categories;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategoriesData = async () => {
    const catdata = await fetchCategories();

    catdata.sort((a, b) => a.menu_order - b.menu_order);
    setCategories(catdata);
  };

  const fetchProductsByCategory = async (categoryId, page) => {
    try {
      const authString = `${apiKey}:${apiSecret}`;
      const encodedAuth = Base64.encode(authString);
      const currencyRate = await fetchCurrencyData();

      let params = { category: categoryId, per_page: 20, page };

      if (categoryId === "all") {
        params.category = null;
      }

      const response = await axios.get(`${apiUrl}/products`, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
        params,
      });
      const products = response.data;

      const productsWithCurrency = await Promise.all(
        products.map(async (product) => {
          const priceInCurrency = product.price * currencyRate;
          const currency = "SYP";

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
              currency,
            };
          } else {
            return {
              ...product,
              priceInCurrency,
              currency,
            };
          }
        })
      );

      return productsWithCurrency;
    } catch (error) {
      console.error(error);
    }
  };

  const handleOptionSelect = (productId, attributeName, option) => {
    dispatch(selectOption({ productId, attributeName, option }));
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

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

  const handleProductPress = (product) => {
    navigation.navigate("ProductDetail", { product });
  };
  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const products = await fetchProductsByCategory(
        selectedCategory,
        nextPage
      );

      if (products.length === 0) {
        setHasMoreProducts(false);
      }

      setProducts((prevProducts) => [...prevProducts, ...products]);
      setPage(nextPage);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (hasMoreProducts) {
      const fetchProducts = async () => {
        const products = await fetchProductsByCategory(selectedCategory, page);
        setProducts(products);
      };

      fetchProducts();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (isLoadingMore && hasMoreProducts) {
      loadMore()
        .then(() => setIsLoadingMore(false))
        .catch((error) => {
          console.error(error);
          setIsLoadingMore(false);
        });
    }
  }, [isLoadingMore, hasMoreProducts]);

  const handleCategoryPress = async (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setHasMoreProducts(true);
  };

  const renderCategoryItem = ({ item }) => {
    const imageSrc = item.image?.src;

    return (
      <TouchableOpacity onPress={() => handleCategoryPress(item.id)}>
        <View style={{ marginLeft: 10, alignItems: "center" }}>
          {imageSrc ? (
            <Image source={{ uri: imageSrc }} style={styles.imagecontainer} />
          ) : (
            <View
              style={[
                styles.imagecontainer,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text
                style={{
                  fontSize: 9,
                }}
              >
                No Image Available
              </Text>
            </View>
          )}
          <Text>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
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
                style={[styles.attributeOption]}
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
        <View>
          <TouchableOpacity onPress={() => handleProductPress(item)}>
            {item.images?.[0]?.src ? (
              <View style={{ borderWidth: 2 }}>
                <Image
                  source={{ uri: item.images[0].src }}
                  style={styles.productImage}
                />
              </View>
            ) : (
              <Text>No image available</Text>
            )}
          </TouchableOpacity>
        </View>
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
        {renderAttributes(item)}
        <View>
          <TouchableOpacity
            style={{
              backgroundColor: "black",
              padding: 16,
              borderRadius: 24,
            }}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={{ color: "white" }}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreProducts) {
      setIsLoadingMore(true);
    }
  };
  // here  it is changeung the value on the isl oading more  b calling hamdle more we shuold take care of it
  const onEndReached = () => {
    if (!isLoadingMore && hasMoreProducts) {
      handleLoadMore();
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View>
        <Text>Categories:</Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategoryItem}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 20 }}>Products:</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          numColumns={2}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator style={styles.loader} size="medium" />
            ) : hasMoreProducts ? (
              <Button title="Load More" onPress={handleLoadMore} />
            ) : null
          }
        />
      </View>
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  imagecontainer: {
    height: 80,
    width: 80,
    borderRadius: 50,
    borderColor: "green",
    borderWidth: 2,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    //alignItems: "center",
    //justifyContent: "center",
  },
  productItem: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#cccc",
    margin: 10,
    borderRadius: 12,
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
    height: 200,
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
