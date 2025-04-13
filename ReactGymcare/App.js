import React from "react";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import store from "./redux/store";
import AppNavigator from "./components/AppNavigator ";

// import { requestUserPermission, NotificationListener } from "./src/utils/pushnotification_helper";
// import messaging from "@react-native-firebase/messaging";

export default function App() {
  // useEffect(() => {
  //   requestUserPermission();
  //   NotificationListener();
  // }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator/>
      </NavigationContainer>
    </Provider>
  );
}
