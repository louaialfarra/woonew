import { View, Text, Dimensions, Image } from "react-native";
import Carousel from "react-native-snap-carousel";
import IMAGES from "../assets/src/images";

const HomePage = () => {
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
  ];
  _renderItem = ({ item }) => {
    return (
      <View>
        <Image
          source={item.image}
          style={{
            height: 170,
            width: Dimensions.get("window").width,
            resizeMode: "cover",
          }}
        />
        <Text>{item.title}</Text>
      </View>
    );
  };
  return (
    <View>
      <Carousel
        data={data}
        renderItem={_renderItem}
        sliderWidth={Dimensions.get("window").width}
        itemWidth={Dimensions.get("window").width}
      />
      <Text>this is homepage</Text>
    </View>
  );
};
// this is to  fix error in carousle  snap
HomePage.propTypes = {};

export default HomePage;
