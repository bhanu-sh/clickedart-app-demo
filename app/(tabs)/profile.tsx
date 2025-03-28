import Button from "@/components/Button";
import { Text, View, StyleSheet } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Image } from "expo-image";

export default function AboutScreen() {
  const { photographer, isHydrated, signout } = useAuthStore();

  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photographer?.profileImage }}
        style={{ width: 100, height: 100, borderRadius: 50 }}
      />
      <Text className="text-red-500 text-xl">{`${
        photographer
          ? `${photographer.firstName || ""} ${photographer.lastName || ""}`
          : "Profile Page"
      }`}</Text>
      {photographer && <Button label="Logout" onPress={signout} />}
      {/* Button to refresh Page */}
      <Button
        label="Refresh"
        onPress={useAuthStore.getState().fetchUserProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
});
