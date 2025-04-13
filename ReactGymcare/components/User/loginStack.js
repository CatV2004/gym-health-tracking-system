import { createStackNavigator } from "@react-navigation/stack";
import Login from "./login";
import register from "./register";
const Stack = createStackNavigator();

const LoginStack = () => {
  return (  
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: true, title: "Login" }}/>
      <Stack.Screen name="Register" component={register} options={{ headerShown: true, title: "Register" }}/>
    </Stack.Navigator>
  );
};

export default LoginStack;