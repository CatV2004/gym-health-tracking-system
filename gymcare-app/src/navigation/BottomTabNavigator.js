import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import HomeScreen from "../screens/member/home/HomeScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import AccountScreen from "../screens/member/Account/AccountScreen";
import UserListScreen from "../screens/chat/UserListScreen";
import PTDashboardScreen from "../screens/pt/PTDashboardScreen";
import SubscriptionStack from "./SubscriptionStack";
import MemberScheduleScreen from "../screens/member/subscription/schedule/MemberScheduleScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator({ navigation }) {
  const { accessToken, user } = useSelector((state) => state.auth);
  console.log("role: ", user?.role);

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
          else if (route.name === "MySubscriptions")
            iconName = focused ? "barbell" : "barbell-outline";
          else if (route.name === "Schedule")
            iconName = focused ? "calendar" : "calendar-outline";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={
          accessToken
            ? user?.role === 1
              ? PTDashboardScreen
              : HomeScreen
            : HomeScreen
        }
      />
      {accessToken ? (
        <>
          {user?.role === 2 && (
            <>
              <Tab.Screen
                name="MySubscriptions"
                component={SubscriptionStack}
                options={{ title: "Gói tập" }}
              />
              <Tab.Screen
                name="Schedule"
                component={MemberScheduleScreen}
                options={{ title: "Lịch tập" }}
              />
            </>
          )}
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
