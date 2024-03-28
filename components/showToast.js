import Toast from "react-native-toast-message";

export default showToast = (type, text1, text2) => {
  Toast.show({
    type: type,
    text1: text1,
    text2: text2,
    visibilityTime: 2000, // 2 seconds
    autoHide: true,
  });
};
