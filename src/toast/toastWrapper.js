import { useRef, useEffect } from "react";
import Toast from "react-native-toast-message";

const ToastWrapper = () => {
  const toastRef = useRef(null);

  useEffect(() => {
    Toast.setRef(toastRef);
  }, []);

  return <Toast ref={(ref) => (toastRef.current = ref)} />;
};
export default ToastWrapper;
