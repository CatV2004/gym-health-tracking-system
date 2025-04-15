import { useState } from "react";
import { ActivityIndicator, Button, Text, TextInput, View } from "react-native";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";
import api, { endpoint } from "../../configs/API";

const Register = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    avatar: "",
    role: 2,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();

  const change = (field, value) => {
    setUser((current) => ({ ...current, [field]: value }));
  };

  const handleRegister = async () => {
    if (user.password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let res = await api.post(endpoint.register, {
        username: user.username,
        password: user.password,
        first_name: user.first_name,
        last_name: user.last_name,
      });

      if (res.status === 201) {
        navigation.navigate("Login");
      }
    } catch (ex) {
      console.error(ex);
      setError("Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={user.first_name}
        onChangeText={(t) => change("first_name", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={user.last_name}
        onChangeText={(t) => change("last_name", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={user.username}
        onChangeText={(t) => change("username", t)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={user.password}
        onChangeText={(t) => change("password", t)}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={(t) => setConfirmPassword(t)}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
    </View>
  );
};

export default Register;
