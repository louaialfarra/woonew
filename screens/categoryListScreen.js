import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ActivityIndicator,
  Text,
  View,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { addToCart, selectOption } from "../src/redux/cartSlice";
import store from "../src/redux/store";
import fetchProducts from "../hooks/fetch";
import showToast from "../components/showToast";

const CategoryListScreen = () => {
  const dispatch = useDispatch();

  const [products, setProducts] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const selectedOptions = useSelector((store) => store.cart.selectedOptions);
};
export default CategoryListScreen;
