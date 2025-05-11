// navigation/SubscriptionStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SubscriptionListScreen from "../screens/member/subscription/SubscriptionListScreen";
import BookSessionScreen from "../screens/member/subscription/schedule/BookSessionScreen";
// import SubscriptionDetailScreen from "../screens/member/subscription/SubscriptionDetailScreen";

const Stack = createNativeStackNavigator();

export default function SubscriptionStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SubscriptionList"
        component={SubscriptionListScreen}
        options={{ title: "Gói tập của tôi", headerShown: false }}
      />
      {/* <Stack.Screen
        name="SubscriptionDetail"
        component={SubscriptionDetailScreen}
        options={{ title: "Chi tiết gói tập", headerShown: true }}
      /> */}
      <Stack.Screen
        name="BookSession"
        component={BookSessionScreen}
        options={{ title: "Đặt lịch tập" }}
      />
    </Stack.Navigator>
  );
}
