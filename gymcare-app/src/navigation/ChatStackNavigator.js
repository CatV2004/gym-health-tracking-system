import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChatScreen from "../screens/chat/ChatScreen";
import UserListScreen from "../screens/chat/UserListScreen";

const Stack = createNativeStackNavigator();

export default function ChatStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Stack.Screen name="UserListScreen" component={UserListScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
}
