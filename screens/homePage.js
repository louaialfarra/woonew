import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import IMAGES from "../assets/src/images";
import { useRef, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";

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
  const handleItemPress = () => {};
  const handleProductPress = (product) => {
    navigation.navigate("newProduct", { product });
  };

  _renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          handleItemPress;
        }}
      >
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
  useEffect(() => {
    getrate();

    const fetchProduts = async () => {
      try {
        const authString = `${apiKey}:${apiSecret}`;
        const encodedAuth = Base64.encode(authString);
        const response = await axios.get(`${apiUrl}/products`, {
          headers: { Authorization: `Basic ${encodedAuth}` },
        });
        /*
        const productVariation= await Promise.all(
          response.data.map((product)=>{

          })

        )
*/

        setNewProduct(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProduts();
  }, []);
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
        <Text>this is homepage</Text>
        <Text>this is homepage</Text>
        <View style={{ flex: 1, alignItems: "center" }}>
          <FlatList
            horizontal={true}
            data={newProduct}
            renderItem={({ item }) => {
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
                    <Text> PRICE {(item.price * rate).toLocaleString()}</Text>
                  </TouchableOpacity>
                  <Text> PRICE {item.price}</Text>
                </View>
              );
            }}
          />
        </View>
        <Text>test</Text>
      </View>
    </ScrollView>
  );
};

export default HomePage;
