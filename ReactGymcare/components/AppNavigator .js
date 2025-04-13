import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ChangePassword from "./User/changePassword";
import MainTabs from "./MainTabs";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{ headerShown: true, title: "Thay đổi mật khẩu" }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
