import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigator from "./BottomTabNavigator";
import AuthStack from "./AuthStack";
import HealthUpdateScreen from "../screens/member/Account/HealthUpdate/HealthUpdateScreen";
import PackagesOfCategoryScreen from "../screens/member/home/PackagesOfCategory/PackagesOfCategoryScreen";
import PackageDetailScreen from "../screens/member/home/PackageDetail/PackageDetailScreen";
import ChangePasswordScreen from "../screens/member/Account/PassUpdate/ChangePasswordScreen";
import SubscriptionDetailScreen from "../screens/member/home/package/SubscriptionDetailScreen";
import PaymentScreen from "../screens/member/payment/PaymentScreen";
import VNPayPaymentScreen from "../screens/member/payment/VNPAY/VNPayPaymentScreen";
import PaymentResultScreen from "../screens/member/payment/PaymentResultScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import UserListScreen from "../screens/chat/UserListScreen";
import { useSelector } from "react-redux";
import PTClientDetailScreen from "../screens/pt/PTClientDetailScreen";
import PTDashboardScreen from "../screens/pt/PTDashboardScreen";
import SubscriptionListScreen from "../screens/member/subscription/SubscriptionListScreen";
import BookSessionScreen from "../screens/member/subscription/schedule/BookSessionScreen";
import MemberScheduleScreen from "../screens/member/subscription/schedule/MemberScheduleScreen";
import TrainerWorkoutSchedulesScreen from "../screens/pt/TrainerWorkoutSchedulesScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;
  // console.log("rolee: ", role)
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="UserListScreen" component={UserListScreen} />

      <Stack.Screen
        name="PackagesOfCategory"
        component={PackagesOfCategoryScreen}
      />
      <Stack.Screen name="PackageDetail" component={PackageDetailScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      {role === 2 && (
        <>
          <Stack.Screen name="UpdateHealth" component={HealthUpdateScreen} />
          <Stack.Screen name="SubscriptionDetail" component={SubscriptionDetailScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="VNPayPayment" component={VNPayPaymentScreen} />
          <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
          <Stack.Screen name="SubscriptionList"component={SubscriptionListScreen}/>
          <Stack.Screen name="BookSession" component={BookSessionScreen} />
          <Stack.Screen name="MemberSchedule" component={MemberScheduleScreen} />
        </>
      )}
      {role === 1 && (
        <>
          <Stack.Screen
            name="PTClientDetail"
            component={PTClientDetailScreen}
          />
          <Stack.Screen
            name="TrainerWorkoutSchedules"
            component={TrainerWorkoutSchedulesScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
