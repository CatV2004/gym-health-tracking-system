import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import styles from "./styles";
import Register from "../../components/User/register";
import Home from "../Home/home";
import { useNavigation } from "@react-navigation/native";
import LoginAction from '../../redux/actions/authActions'


const Login = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  const { token, loading, errorLogin } = useSelector((state) => state.auth);
  console.log("Redux State:", state);

  useEffect(() => {
    if (token) {
      Alert.alert("Login Success", `Your token: ${token}`);
      navigation.navigate(Home);
    }
  }, [token]);

  const handleLogin = () => {
    dispatch(LoginAction(username, password));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      {errorLogin ? <Text style={styles.error}>{errorLogin}</Text> : null}

      <TouchableOpacity onPress={() => navigation.navigate(Register)}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
