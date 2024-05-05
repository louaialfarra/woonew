import { useRoute } from "@react-navigation/native";
import { View, Text, Image } from "react-native";
const NewProduct = () => {
  const route = useRoute();
  const { product } = route.params;
  return (
    <View>
      <Image
        source={{ uri: product.images[0].src }}
        style={{ height: 200, width: 200 }}
      />
      <Text>ths is text</Text>
      <Text>{product.price}</Text>
      <Text>{product.variations.name}</Text>
    </View>
  );
};
export default NewProduct;
