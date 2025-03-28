import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  profileImage?: string;
  coverImage?: string;
  shippingAddress?: {
    city: string;
    state: string;
    country: string;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  photographer: User | null;
  userType: string | null;
  isHydrated: boolean;
  signin: (newToken: string) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  signout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  photographer: null,
  userType: null,
  isHydrated: false,

  // Sign in and fetch user profile
  signin: async (newToken) => {
    await AsyncStorage.setItem("authToken", newToken);
    set({ token: newToken });
    await get().fetchUserProfile();
  },

  // Fetch user profile from the server
  fetchUserProfile: async () => {
    const token = get().token || (await AsyncStorage.getItem("authToken"));
    if (!token) {
      set({ isHydrated: true });
      return;
    }

    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/get-user-profile-by-token`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const userType = data.user?.type;

        set({ userType });

        if (userType === "User") {
          set({ user: data.user, photographer: null });
        } else {
          set({ photographer: data.user, user: null });
        }
      } else {
        get().signout();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      get().signout();
    } finally {
      set({ isHydrated: true });
    }
  },

  // Sign out and clear data
  signout: async () => {
    await AsyncStorage.removeItem("authToken");
    set({ token: null, user: null, photographer: null, userType: null, isHydrated: true });
  },
}));

// Auto-fetch on initialization
useAuthStore.getState().fetchUserProfile();
