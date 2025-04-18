import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./Home/home";
import PackageListScreen from "./Package/PackageListScreen";
import PackageDetailScreen from "./Package/PackageDetailScreen";

const Stack = createStackNavigator();

const HomeStackScreen = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}  
        />
        <Stack.Screen
          name="PackageListScreen"
          component={PackageListScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="PackageDetail" 
          component={PackageDetailScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  };
  
  
export default HomeStackScreen;
