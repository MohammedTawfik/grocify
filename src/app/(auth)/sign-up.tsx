import { useSignUp } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error;
    if (typeof message === "string") return message;
  }
  return "Something went wrong. Please try again.";
}

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const isFetching = fetchStatus === "fetching";

  const handleSignUp = async () => {
    setMessage("");
    const { error } = await signUp.password({ emailAddress: emailAddress.trim(), password });
    if (error) {
      setMessage(getErrorMessage(error));
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setMessage(getErrorMessage(sendError));
      return;
    }
    setIsVerifying(true);
  };

  const handleVerify = async () => {
    setMessage("");
    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (error) {
      setMessage(getErrorMessage(error));
      return;
    }

    if (signUp.status !== "complete") {
      setMessage("Your signup needs another step. Please contact support or try again.");
      return;
    }

    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) {
      setMessage(getErrorMessage(finalizeError));
      return;
    }
    router.replace("/");
  };

  const resendCode = async () => {
    setMessage("");
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) setMessage(getErrorMessage(error));
    else setMessage("A new code has been sent to your email.");
  };

  const startOver = async () => {
    await signUp.reset();
    setIsVerifying(false);
    setCode("");
    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F7F8F3]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerClassName="grow justify-center px-[26px] py-10" keyboardShouldPersistTaps="handled">
        <View className="mb-[26px] h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-[#E4F1E3]"><Text className="text-[30px]">🥬</Text></View>
        <Text className="mb-[9px] text-[11px] font-extrabold tracking-[1.7px] text-[#56845A]">A BETTER WAY TO SHOP</Text>
        <Text className="text-[32px] font-extrabold leading-[38px] tracking-[-0.8px] text-[#1F3022]">{isVerifying ? "Verify your email" : "Join Grocify"}</Text>
        <Text className="mb-7 mt-[9px] text-[15px] leading-[22px] text-[#737C71]">
          {isVerifying
            ? `We sent a one-time code to ${emailAddress}.`
            : "Create an account and make your next grocery run a little easier."}
        </Text>

        {!isVerifying ? (
          <View className="gap-2.5">
            <Text className="mt-1 text-[13px] font-bold text-[#354337]">Email address</Text>
            <TextInput
              className="rounded-[14px] border border-[#E1E6DD] bg-white px-[15px] py-[15px] text-[15px] text-[#1F3022]"
              value={emailAddress}
              onChangeText={setEmailAddress}
              placeholder="you@example.com"
              placeholderTextColor="#92998F"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isFetching}
              returnKeyType="next"
            />
            {errors.fields.emailAddress?.message ? (
              <Text className="mt-[7px] text-[13px] leading-[19px] text-[#B33A34]">{errors.fields.emailAddress.message}</Text>
            ) : null}
            <Text className="mt-1 text-[13px] font-bold text-[#354337]">Password</Text>
            <TextInput
              className="rounded-[14px] border border-[#E1E6DD] bg-white px-[15px] py-[15px] text-[15px] text-[#1F3022]"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#92998F"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              editable={!isFetching}
              onSubmitEditing={handleSignUp}
              returnKeyType="done"
            />
            {errors.fields.password?.message ? (
              <Text className="mt-[7px] text-[13px] leading-[19px] text-[#B33A34]">{errors.fields.password.message}</Text>
            ) : null}
          </View>
        ) : (
          <View className="gap-2.5">
            <Text className="mt-1 text-[13px] font-bold text-[#354337]">Verification code</Text>
            <TextInput
              className="rounded-[14px] border border-[#E1E6DD] bg-white px-[15px] py-[15px] text-[15px] text-[#1F3022]"
              value={code}
              onChangeText={setCode}
              placeholder="Enter the code"
              placeholderTextColor="#92998F"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              editable={!isFetching}
              onSubmitEditing={handleVerify}
              returnKeyType="done"
            />
            {errors.fields.code?.message ? (
              <Text className="mt-[7px] text-[13px] leading-[19px] text-[#B33A34]">{errors.fields.code.message}</Text>
            ) : null}
          </View>
        )}

        {message ? <Text accessibilityRole="alert" className="mt-[7px] text-[13px] leading-[19px] text-[#B33A34]">{message}</Text> : null}

        <Pressable
          accessibilityRole="button"
          className="mt-5 min-h-[54px] items-center justify-center rounded-[15px] bg-[#2F7041] active:opacity-[0.86] disabled:opacity-[0.55]"
          onPress={isVerifying ? handleVerify : handleSignUp}
          disabled={isFetching || (isVerifying ? !code.trim() : !emailAddress.trim() || !password)}
        >
          {isFetching ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-extrabold text-white">{isVerifying ? "Verify and create account" : "Create account"}</Text>
          )}
        </Pressable>

        {isVerifying ? (
          <View className="mt-2 flex-row justify-center gap-5">
            <Pressable onPress={resendCode} disabled={isFetching} className="self-center p-3">
              <Text className="text-[14px] font-extrabold text-[#2F7041]">Resend code</Text>
            </Pressable>
            <Pressable onPress={startOver} disabled={isFetching} className="self-center p-3">
              <Text className="text-[14px] font-extrabold text-[#2F7041]">Change email</Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-[23px] flex-row justify-center gap-[5px]">
            <Text className="text-[14px] text-[#737C71]">Already have an account?</Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable><Text className="text-[14px] font-extrabold text-[#2F7041]">Sign in</Text></Pressable>
            </Link>
          </View>
        )}

        {/* Required for Clerk bot protection on web; Clerk skips it on iOS and Android. */}
        <View nativeID="clerk-captcha" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
