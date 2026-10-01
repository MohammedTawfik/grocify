import { useAuth, useUser } from "@clerk/expo";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");
  const firstName = user?.firstName?.trim();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setError("");
    try {
      await signOut();
    } catch {
      setError("Unable to sign out right now. Please try again.");
      setIsSigningOut(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F7F8F3] px-6 pb-7 pt-[22px]">
      <View className="flex-row items-center gap-2.5">
        <View className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#E4F1E3]"><Text className="text-[23px]">🥬</Text></View>
        <Text className="text-[19px] font-black tracking-[-0.5px] text-[#1F3022]">grocify</Text>
      </View>

      <View className="flex-1 justify-center">
        <Text className="mb-2.5 text-[11px] font-extrabold tracking-[1.5px] text-[#56845A]">YOUR GROCERY COMPANION</Text>
        <Text className="text-[34px] font-extrabold leading-[41px] tracking-[-1px] text-[#1F3022]">Good to see you{firstName ? `, ${firstName}` : ""}.</Text>
        <Text className="mt-3 max-w-[330px] text-[16px] leading-6 text-[#737C71]">
          Your account is ready. We’ll help make your next grocery run easier.
        </Text>
        <View className="mt-[30px] flex-row items-center gap-[14px] rounded-[18px] border border-[#E5E9E1] bg-white p-[17px]">
          <Text className="text-[28px]">🛒</Text>
          <View className="flex-1 gap-1">
            <Text className="text-[15px] font-extrabold text-[#26392A]">You&apos;re signed in</Text>
            <Text className="text-[13px] leading-[19px] text-[#737C71]">Your Grocify account is secure and ready to use.</Text>
          </View>
        </View>
      </View>

      <View className="gap-2.5">
        {error ? <Text accessibilityRole="alert" className="text-center text-[13px] text-[#B33A34]">{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          disabled={isSigningOut}
          className="min-h-[54px] items-center justify-center rounded-[15px] border border-[#D5DFD1] bg-white active:bg-[#EEF4EC] disabled:opacity-60"
        >
          {isSigningOut ? <ActivityIndicator color="#2F7041" /> : <Text className="text-[15px] font-extrabold text-[#2F7041]">Sign out</Text>}
        </Pressable>
      </View>
    </View>
  );
}
