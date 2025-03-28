import Button from "@/components/Button";
import {
  Text,
  View,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import axios from "axios";

interface Stats {
  downloads: number;
  views: number;
}

interface Photo {
  _id: string;
  imageLinks: {
    original: string;
  };
  imageAnalytics: {
    views: number;
  };
}

export default function AboutScreen() {
  const { photographer, isHydrated, signout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [catalogues, setCatalogues] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [limit, setLimit] = useState(1);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/photographeranalytics/get-photographer-analytics?photographer=${photographer?._id}`
      );
      setStats(res.data);
    } catch (error: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePlan = async () => {
    if (!photographer || !photographer._id) {
      console.log("Photographer data is missing");
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/subscriptions/get-user-active-subscription?photographer=${photographer._id}`
      );
      setActivePlan(res.data.subscription?.planId?.name?.toLowerCase());
      if (res.data.subscription?.planId?.name?.toLowerCase() === "basic") {
        setLimit(1);
      } else if (
        res.data.subscription?.planId?.name?.toLowerCase() === "intermediate"
      ) {
        setLimit(5);
      } else if (
        res.data.subscription?.planId?.name?.toLowerCase() === "premium"
      ) {
        setLimit(999999);
      }
    } catch (error: any) {
      console.log(error.response ? error.response.data : error.message);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/images/get-images-by-photographer?photographer=${photographer?._id}&pageSize=1000`
      );
      setPhotos(res.data.photos);
    } catch (error: any) {
      setError(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPhotos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/photographer/get-pending-images-by-photographer?photographer=${photographer?._id}`
      );
      setPendingPhotos(res.data.pendingImages);
      setLoading(false);
    } catch (error: any) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchCatalogues = async () => {
    try {
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/catalogue/get-catalogues-by-photographer?photographer=${photographer?._id}&pageSize=1000`
      );
      setCatalogues(res.data.catalogues);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/blog/get-my-blogs?author=${photographer?._id}&pageSize=1000`
      );
      const data = response.data;

      setBlogs(data.blogs);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!photographer) return;

    fetchStats();
    fetchPhotos();
    fetchPendingPhotos();
    fetchCatalogues();
    fetchBlogs();
    fetchActivePlan();
    console.log("Data fetched");
  }, [photographer]);

  useEffect(() => {
    if (isHydrated && !photographer) {
      router.replace("/login");
    }
  }, [isHydrated, photographer]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photographer?.coverImage }}
        style={{ width: "100%", height: 200 }}
      />
      <Image
        source={{ uri: photographer?.profileImage }}
        style={{ width: 100, height: 100, borderRadius: 50, marginTop: -50 }}
      />
      <Text className="text-white text-2xl font-medium">{`${
        photographer
          ? `${photographer.firstName || ""} ${photographer.lastName || ""}`
          : "Profile Page"
      }`}</Text>
      <Text className="text-white text-lg">
        {photographer?.shippingAddress?.city || ""},{" "}
        {photographer?.shippingAddress?.country || ""}
      </Text>
      <Button label="Logout" onPress={signout} />
      <View>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <View className="flex flex-row gap-2 lg:gap-8 mt-4 px-4 max-w-2xl ">
            <View className="flex flex-col items-center text-center border-r-2  border-gray-500 pr-2 lg:pr-8">
              <Text className="text-white">{photos?.length}</Text>
              <Text className="text-white">Gallery Items</Text>
            </View>
            <View className="flex flex-col items-center text-center">
              <Text className="text-white">
                {photos
                  ?.filter((photo) => photo.imageAnalytics?.views)
                  .reduce(
                    (acc, photo) => acc + (photo.imageAnalytics?.views || 0),
                    0
                  )}
              </Text>
              <Text className="text-white">Impressions</Text>
            </View>
            <View className="flex flex-col items-center text-center border-l-2 border-gray-400 pl-2 lg:pl-8 ">
              <Text className="text-white">{stats?.downloads || 0}</Text>
              <Text className="text-white">Downloads</Text>
            </View>
          </View>
        )}
        <FlatList
          data={photos}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.imageLinks?.original }}
                style={styles.image}
              />
            </View>
          )}
        />
      </View>
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
  imageContainer: {
    flex: 1,
    margin: 5,
    alignItems: "flex-start",
    width: "50%",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
  },
});
