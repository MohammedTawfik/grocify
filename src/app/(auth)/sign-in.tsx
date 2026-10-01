import { useSignIn } from "@clerk/expo";
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

type SecondFactorStrategy = "email_code" | "phone_code" | "totp" | "backup_code";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error;
    if (typeof message === "string") return message;
  }
  return "Something went wrong. Please try again.";
}

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verificationStrategy, setVerificationStrategy] =
    useState<SecondFactorStrategy | null>(null);
  const [message, setMessage] = useState("");
  const isFetching = fetchStatus === "fetching";

  const finishSignIn = async () => {
    if (signIn.status !== "complete") return;

    const { error } = await signIn.finalize();
    if (error) setMessage(getErrorMessage(error));
    else router.replace("/");
  };

  const prepareSecondFactor = async () => {
    const availableFactors = signIn.supportedSecondFactors;
    const preferredFactor = availableFactors.find((factor) => factor.strategy === "email_code")
      ?? availableFactors.find((factor) => factor.strategy === "phone_code")
      ?? availableFactors.find((factor) => factor.strategy === "totp")
      ?? availableFactors.find((factor) => factor.strategy === "backup_code");

    if (!preferredFactor) {
      setMessage("This account requires a verification method that this screen does not support.");
      return;
    }

    const strategy = preferredFactor.strategy as SecondFactorStrategy;
    setVerificationStrategy(strategy);

    if (strategy === "email_code") {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) setMessage(getErrorMessage(error));
    } else if (strategy === "phone_code") {
      const { error } = await signIn.mfa.sendPhoneCode();
      if (error) setMessage(getErrorMessage(error));
    }
  };

  const handleSignIn = async () => {
    setMessage("");
    const { error } = await signIn.password({ emailAddress: emailAddress.trim(), password });
    if (error) {
      setMessage(getErrorMessage(error));
      return;
    }

    if (signIn.status === "complete") {
      await finishSignIn();
      return;
    }

    if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
      await prepareSecondFactor();
      return;
    }

    setMessage("The sign-in needs another step. Check your account settings and try again.");
  };

  const handleVerify = async () => {
    setMessage("");
    let error: unknown = null;

    if (verificationStrategy === "email_code") {
      ({ error } = await signIn.mfa.verifyEmailCode({ code: code.trim() }));
    } else if (verificationStrategy === "phone_code") {
      ({ error } = await signIn.mfa.verifyPhoneCode({ code: code.trim() }));
    } else if (verificationStrategy === "totp") {
      ({ error } = await signIn.mfa.verifyTOTP({ code: code.trim() }));
    } else if (verificationStrategy === "backup_code") {
      ({ error } = await signIn.mfa.verifyBackupCode({ code: code.trim() }));
    }

    if (error) {
      setMessage(getErrorMessage(error));
      return;
    }
    await finishSignIn();
  };

  const handleReset = async () => {
    await signIn.reset();
    setVerificationStrategy(null);
    setCode("");
    setMessage("");
  };

  const isVerifying = verificationStrategy !== null;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F7F8F3]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerClassName="grow justify-center px-[26px] py-10" keyboardShouldPersistTaps="handled">
        <View className="mb-[26px] h-[62px] w-[62px] items-center justify-center rounded-[20px] bg-[#E4F1E3]">
          <Text className="text-[30px]">🥬</Text>
        </View>
        <Text className="mb-[9px] text-[11px] font-extrabold tracking-[1.7px] text-[#56845A]">FRESH PICKS, EVERY DAY</Text>
        <Text className="text-[32px] font-extrabold leading-[38px] tracking-[-0.8px] text-[#1F3022]">{isVerifying ? "Check your inbox" : "Welcome back"}</Text>
        <Text className="mb-7 mt-[9px] text-[15px] leading-[22px] text-[#737C71]">
          {isVerifying
            ? "Enter the verification code to finish signing in."
            : "Sign in to get back to your Grocify list."}
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
            <Text className="mt-1 text-[13px] font-bold text-[#354337]">Password</Text>
            <TextInput
              className="rounded-[14px] border border-[#E1E6DD] bg-white px-[15px] py-[15px] text-[15px] text-[#1F3022]"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#92998F"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              editable={!isFetching}
              onSubmitEditing={handleSignIn}
              returnKeyType="done"
            />
            {errors.fields.identifier?.message ? (
              <Text className="mt-[7px] text-[13px] leading-[19px] text-[#B33A34]">{errors.fields.identifier.message}</Text>
            ) : null}
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
          onPress={isVerifying ? handleVerify : handleSignIn}
          disabled={isFetching || (isVerifying ? !code.trim() : !emailAddress.trim() || !password)}
        >
          {isFetching ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-extrabold text-white">{isVerifying ? "Verify and sign in" : "Sign in"}</Text>
          )}
        </Pressable>

        {isVerifying ? (
          <Pressable onPress={handleReset} className="mt-2 self-center p-[14px]" disabled={isFetching}>
            <Text className="text-[14px] font-extrabold text-[#2F7041]">Use a different account</Text>
          </Pressable>
        ) : (
          <View className="mt-[23px] flex-row justify-center gap-[5px]">
            <Text className="text-[14px] text-[#737C71]">New to Grocify?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable><Text className="text-[14px] font-extrabold text-[#2F7041]">Create an account</Text></Pressable>
            </Link>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
