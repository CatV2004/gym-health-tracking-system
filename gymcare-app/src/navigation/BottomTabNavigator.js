import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import HomeScreen from "../screens/home/HomeScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import AccountScreen from "../screens/Account/AccountScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import ChatStackNavigator from "./ChatStackNavigator";
import UserListScreen from "../screens/chat/UserListScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ navigation }) {
  const { accessToken } = useSelector((state) => state.auth);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Login")
            iconName = focused ? "log-in" : "log-in-outline";
          else if (route.name === "Account")
            iconName = focused ? "person" : "person-outline";
          else if (route.name === "Chat")
            iconName = focused ? "chatbubble" : "chatbubble-outline";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      {accessToken ? (
        <>
          <Tab.Screen name="Chat" component={UserListScreen} />
          <Tab.Screen name="Account" component={AccountScreen} />
        </>
      ) : (
        <Tab.Screen name="Login" options={{ tabBarStyle: { display: "none" } }}>
          {(props) => (
            <LoginScreen
              {...props}
              navigateToAuth={() => props.navigation.navigate("Auth")}
            />
          )}
        </Tab.Screen>
      )}
    </Tab.Navigator>
  );
}
