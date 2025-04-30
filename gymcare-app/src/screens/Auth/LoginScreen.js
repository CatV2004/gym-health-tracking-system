import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ImageBackground,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, getCurrentUser } from "../../store/authSlice";
import { fetchMemberHealth } from "../../store/memberSlice";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./Login.styles";

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error, accessToken } = useSelector((state) => state.auth);
  const { health } = useSelector((state) => state.member);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleValue] = useState(new Animated.Value(1));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      const result = await dispatch(loginUser({ username, password }));
      if (loginUser.fulfilled.match(result)) {
        await dispatch(getCurrentUser());
        await dispatch(fetchMemberHealth(accessToken));
        // navigation.navigate("Main");
        // if (navigation.canGoBack()) {
        //   navigation.goBack();
        // } else {
        navigation.navigate("Main");
        // }
      } else {
        console.log("Đăng nhập thất bại:", result.payload);
      }
    });
  };

  return (
    <ImageBackground
      source={{
        uri: "https://res.cloudinary.com/dohsfqs6d/image/upload/v1745386662/164d7ca0-52d9-4705-a76f-3e777015344b.png",
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Đăng nhập</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Tên đăng nhập"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {error.message || "Đăng nhập thất bại"}
                </Text>
              </View>
            )}

            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginText}>ĐĂNG NHẬP</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Auth", { screen: "Register" })
              }
              style={styles.registerBtn}
            >
              <Text style={styles.registerText}>
                Chưa có tài khoản?{" "}
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default LoginScreen;
