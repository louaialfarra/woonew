import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import IMAGES from "../assets/src/images";
import { useRef, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import fetchProducts from "../hooks/fetch";

import { WOO_API_URL, CONSUMER_KEY, CONSUMER_SECRET } from "@env";
import axios from "axios";
import Base64 from "js-base64";
import fetchCurrencyData from "../hooks/fetchCurrency";
import { updatedRate } from "../src/redux/cartSlice";
const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;

const HomePage = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const _carousel = useRef();
  const [activeDotIndex, setActiveDotIndex] = useState(0);
  const [newProduct, setNewProduct] = useState([]);
  const [rate, setRate] = useState();
  const [saleProducts, setSaleProducts] = useState([]);
  const [category, setCategory] = useState([]);

  const getrate = async () => {
    try {
      const rate = await fetchCurrencyData();
      dispatch(updatedRate(rate));
      setRate(rate);
      console.log(rate + "this is home rate");
    } catch {}
  };
  //console.log(rate + "thsi is rate home");

  const data = [
    {
      id: 1,
      title: "this is titile bu louai",
      descrption: "desc1",
      image: IMAGES.SALE,
    },
    {
      id: 2,
      title: "Men collection",
      descrption: "des2",
      image: IMAGES.MEN,
    },
    {
      id: 3,
      title: "Men collection",
      descrption: "des2",
      image: IMAGES.MEN,
    },
  ];
  const handleItemPress = () => {
    if (activeDotIndex === 1) {
      navigation.navigate("Cart");
    }
  };
  const handleProductPress = (product) => {
    navigation.navigate("newProduct", { product });
  };

  _renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={handleItemPress}>
        <View style={{ alignItems: "center" }}>
          <Image
            source={item.image}
            style={{
              alignItems: "center",
              height: 170,
              width: Dimensions.get("window").width - 50,
              resizeMode: "cover",
            }}
          />
          <Text>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const loadCategory = async () => {
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
      setCategory(catdata);
      return catdata;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getrate();

    const loadProducts = async () => {
      const data = await fetchProducts(1);

      setNewProduct(data);
    };
    const loadSaleProducts = async () => {
      const saledata = await fetchProducts(1, undefined, true);

      setSaleProducts(saledata);
    };
    loadSaleProducts();
    loadProducts();
    loadCategory();
  }, []);

  const renderRecentProducts = ({ item }) => {
    const hasSalePrice = item.variations.some(
      (variation) => variation.sale_price
    );

    return (
      <View style={{ paddingHorizontal: 10 }}>
        <TouchableOpacity onPress={() => handleProductPress(item)}>
          <Image
            source={{ uri: item.images[0].src }}
            style={{
              height: 150,
              width: 150,
              borderRadius: 5,
            }}
          />
          {hasSalePrice ? (
            <>
              <Text>
                oldPrice:{(item.regularPrice * rate).toLocaleString()}
              </Text>
              <Text>Sale Price{(item.salePrice * rate).toLocaleString()}</Text>
            </>
          ) : (
            <Text> PRICE {(item.price * rate).toLocaleString()}</Text>
          )}
        </TouchableOpacity>
        <Text> SALE {item.saleprice}</Text>
      </View>
    );
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("categoryPage", { category });
    console.log(category.id + "this is cat");
  };

  const renderCategoryItem = ({ item }) => {
    const imageSrc = item.image?.src;

    return (
      <TouchableOpacity onPress={() => handleCategoryPress(item)}>
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

  return (
    <ScrollView>
      <View style={{ marginTop: 10, flex: 1 }}>
        <View>
          <Carousel
            data={data}
            ref={_carousel}
            renderItem={_renderItem}
            sliderWidth={Dimensions.get("window").width}
            itemWidth={Dimensions.get("window").width - 50}
            onSnapToItem={(index) => setActiveDotIndex(index)}
          />
          <Pagination
            activeDotIndex={activeDotIndex}
            dotsLength={3}
            carouselRef={_carousel}
            tappableDots={true}
            dotStyle={{
              width: 15,
              backgroundColor: "orange",
            }}
            inactiveDotStyle={{
              width: 10,
              backgroundColor: "gray",
            }}
          />
        </View>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "700", paddingBottom: 30 }}>
            Recent Products
          </Text>
          <FlatList
            viewabilityConfig={{
              viewAreaCoveragePercentThreshold: 100, // Ensure item is fully visible
            }}
            horizontal={true}
            data={newProduct}
            renderItem={renderRecentProducts}
          />
          <Text style={{ fontSize: 24, fontWeight: "700", paddingBottom: 30 }}>
            Sale Products
          </Text>
          <FlatList
            viewabilityConfig={{
              viewAreaCoveragePercentThreshold: 100, // Ensure item is fully visible
            }}
            horizontal={true}
            data={saleProducts}
            renderItem={renderRecentProducts}
          />
        </View>
        <Text>test</Text>
        <View>
          <Text>Categories:</Text>
          <FlatList
            data={category}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCategoryItem}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;

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
