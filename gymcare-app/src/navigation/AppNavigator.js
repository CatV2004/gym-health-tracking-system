import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import AuthStack from './AuthStack';
import HealthUpdateScreen from '../screens/Account/HealthUpdate/HealthUpdateScreen';
import PackagesOfCategoryScreen from '../screens/home/PackagesOfCategory/PackagesOfCategoryScreen';
import PackageDetailScreen from '../screens/home/PackageDetail/PackageDetailScreen';
import ChangePasswordScreen from '../screens/Account/PassUpdate/ChangePasswordScreen';
import SubscriptionDetailScreen from '../screens/home/package/SubscriptionDetailScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import VNPayPaymentScreen from '../screens/payment/VNPAY/VNPayPaymentScreen';
import PaymentResultScreen from '../screens/payment/PaymentResultScreen';
import ChatStackNavigator from './ChatStackNavigator';
import ChatScreen from '../screens/chat/ChatScreen';
import UserListScreen from '../screens/chat/UserListScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="UpdateHealth" component={HealthUpdateScreen} />
      <Stack.Screen name="PackagesOfCategory"component={PackagesOfCategoryScreen}/>
      <Stack.Screen name="PackageDetail" component={PackageDetailScreen}/>
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="SubscriptionDetail" component={SubscriptionDetailScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="VNPayPayment" component={VNPayPaymentScreen} />
      <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="UserListScreen" component={UserListScreen} />


    </Stack.Navigator>
  );
}
