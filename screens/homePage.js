import { View, Text, Dimensions, Image, TouchableOpacity } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import IMAGES from "../assets/src/images";
import { useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";

const HomePage = () => {
  const navigation = useNavigation();
  const _carousel = useRef();
  const [activeDotIndex, setActiveDotIndex] = useState(0);
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
  const handleItemPress = (index) => {
    if (index === 1) {
      navigation.navigate("Cart");
    }
  };
  _renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={handleItemPress(index)}>
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
  return (
    <View style={{ marginTop: 10 }}>
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
      <Text>this is homepage</Text>
      <Text>this is homepage</Text>
    </View>
  );
};

export default HomePage;
