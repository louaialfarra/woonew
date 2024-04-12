import { useState } from "react";
import {
  TextInput,
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import fetchProducts from "../hooks/fetch";

const SearchScreen = ({ navigation }) => {
  const handleSearch = async () => {
    const search = searchQuery;
    const page = 1;

    try {
      const result = await fetchProducts(page, search);

      setProducts(result);
      console.log(products);
      return result;
    } catch (error) {
      console.error(error);
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate("ProductDetail", { product });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);

  console.log("this is seach query " + searchQuery);

  const renderSearch = ({ item }) => {
    return (
      <View style={{}}>
        <TouchableOpacity
          on
          onPress={() => {
            handleProductPress(item);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: "lightgray",
            }}
          >
            <View>
              <Text>{item.name}</Text>
              <Text>{item.priceInCurrency}</Text>
            </View>
            <Image
              source={{ uri: item.images[0].src }}
              style={{ height: 50, width: 50 }}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Text>this is text </Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: "red" }}
        placeholder="placer holder for  search "
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Button title="thie is button " onPress={handleSearch} />

      <View style={{ flex: 1 }}>
        <FlatList data={products} renderItem={renderSearch} />
      </View>
    </View>
  );
};
export default SearchScreen;
