import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Profile from "./User/profile";  
import Home from "./Home/home";  
import LoginStack from "./User/loginStack";
import { useSelector } from "react-redux";
import HomeStackScreen from "./HomeStackScreen";

const Tab = createBottomTabNavigator();

const PRIMARY_COLOR = "#FF6347"; 

const MainTabs = () => {
  const { token } = useSelector((state) => state.auth);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "HomeTab") {
            iconName = "home-outline";
          } else if (route.name === "LoginStack") {
            iconName = "log-in-outline";
          } else if (route.name === "Account") {
            iconName = "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: PRIMARY_COLOR, 
        tabBarInactiveTintColor: "#999", 
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff", 
          height: 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          elevation: 10,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} />
      {token ? (
        <Tab.Screen name="Account" component={Profile} />
      ) : (
        <Tab.Screen
          name="LoginStack"
          component={LoginStack}
          options={{ title: "Login", headerShown: false }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainTabs;
