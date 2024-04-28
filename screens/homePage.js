import { View, Text, Dimensions } from "react-native";
import Carousel from "react-native-snap-carousel";

const HomePage = () => {
  const data = [
    {
      id: 1,
      title: "this is titile bu louai",
      descrption: "this is dexcrption",
    },
    {
      id: 2,
      title: "this is titile bu louai",
      descrption: "this is dexcrption",
    },
    {
      id: 3,
      title: "this is titile bu louai",
      descrption: "this is dexcrption",
    },
  ];
  _renderItem = ({ item }) => {
    return <Text>{item.title}</Text>;
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
export default HomePage;
