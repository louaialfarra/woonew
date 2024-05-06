import { useRoute } from "@react-navigation/native";
import { View, Text, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
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
      <Text>{product.sale_price}</Text>
      <Text>{product.price}</Text>
      <Text>this is variation test</Text>
      <Text>{product.variations[0]}</Text>

      <Text>{product.categories[0].name}</Text>
      <Text>{product.attributes[0].name}</Text>
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
      <Text>{product.attributes[0].options}</Text>
    </View>
  );
};
export default NewProduct;
