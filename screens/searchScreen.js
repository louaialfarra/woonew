import { useState } from "react";
import {
  TextInput,
  View,
  Text,
  Button,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { WOO_API_URL, CONSUMER_KEY, CONSUMER_SECRET } from "@env";
import axios from "axios";
import Base64 from "js-base64";

const apiUrl = WOO_API_URL;
const apiKey = CONSUMER_KEY;
const apiSecret = CONSUMER_SECRET;

const SearchScreen = () => {
  const handleSearch = async () => {
    try {
      const authString = `${apiKey}:${apiSecret}`;
      const encodedAuth = Base64.encode(authString);

      const response = await axios.get(`${apiUrl}/products`, {
        headers: {
          Authorization: `Basic ${encodedAuth}`,
        },
        params: {
          search: searchQuery,
          per_page: 100,
        },
      });
      const data = response.data;
      setProducts(data);
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);

  console.log("this is seach query " + searchQuery);

  const renderSearch = ({ item }) => {
    return (
      <View>
        <Text>{item.name}</Text>
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
      <TouchableOpacity>
        <Text>Button search</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <FlatList data={products} renderItem={renderSearch} />
      </View>
    </View>
  );
};
export default SearchScreen;
