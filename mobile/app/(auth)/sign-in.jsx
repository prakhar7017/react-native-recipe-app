import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, Platform, ScrollView, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image';
import { authStyles } from '../../assets/styles/auth.styles';
import { KeyboardAvoidingView } from 'react-native';
import { TextInput } from 'react-native';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
const SignInScreen = () => {
    const router = useRouter();
    const { signIn, setActive, isLoaded } = useSignIn();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert("Please fill all fields");
            return;
        }

        if (!isLoaded) return;

        setLoading(true);
        try {
            const signInAttempt = await signIn.create({
                identifier: email,
                password: password
            })

            if (signInAttempt.status === "complete") await setActive({ session: signInAttempt.createdSessionId });
            else {
                Alert.alert("Error", "Sign in failed.Please try again");
                console.error(JSON.stringify(signInAttempt, null, 2));
            }
        } catch (error) {
            Alert.alert("Error", error.errors?.[0].message || "Sign in failed")
            console.error(JSON.stringify(error, null, 2));
        } finally {
            setLoading(false);
        }
    }
    return (
        <View style={authStyles.container}>
            <KeyboardAvoidingView
                style={authStyles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={authStyles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={authStyles.imageContainer}>
                        <Image
                            source={require("../../assets/images/i1.png")}
                            style={authStyles.image}
                            contentFit="contain"
                        />
                    </View>
                    <Text style={authStyles.title}>Welcome Back</Text>
                    {/* Form Container */}
                    <View style={authStyles.formContainer}>
                        {/* Email */}
                        <View style={authStyles.inputContainer}>
                            <TextInput
                                style={authStyles.textInput}
                                placeholder="Email"
                                placeholderTextColor={COLORS.textLight}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                secureTextEntry={false}
                            />
                        </View>

                        {/* Password */}
                        <View style={authStyles.inputContainer}>
                            <TextInput
                                style={authStyles.textInput}
                                placeholder="Password"
                                placeholderTextColor={COLORS.textLight}
                                value={password}
                                onChangeText={setPassword}
                                keyboardType="default"
                                autoCapitalize="none"
                                autoCorrect={false}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={authStyles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color={COLORS.textLight}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                            onPress={handleSignIn}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={authStyles.buttonText}>
                                {loading ? "Signing In..." : "Sign In"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={authStyles.linkContainer}
                            onPress={() => router.push("/(auth)/sing-up")}
                        >
                            <Text
                                style={authStyles.linkText}
                            >
                                Don&apos;t have an account ? <Text style={authStyles.link}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>
        </View>
    )
}

export default SignInScreen;
