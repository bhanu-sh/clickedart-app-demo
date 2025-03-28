import React from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ToastAndroid } from "react-native";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInScreen() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<SignInFormData>();
  const { signin, photographer } = useAuthStore();

  const onSubmit = async (data: SignInFormData) => {
    try {
      const response = await axios.post("http://192.168.29.92:5000/api/photographer/login", data);
      const token = response.data.token;
      const photographer = response.data.photographer;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(photographer));
      signin(token);
      router.replace("/profile");

      ToastAndroid.show("Login successful!", ToastAndroid.SHORT);
    } catch (error: any) {
        console.log(error);
      Alert.alert("Error", error.response?.data?.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <Controller
        control={control}
        name="email"
        rules={{ required: "Email is required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Email" onChangeText={onChange} value={value} keyboardType="email-address" />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        rules={{ required: "Password is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Password" onChangeText={onChange} value={value} secureTextEntry />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <Button title="Sign In" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});
