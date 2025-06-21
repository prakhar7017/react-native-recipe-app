import { useSignUp } from '@clerk/clerk-expo';
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { authStyles } from '../../assets/styles/auth.styles';
import { Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';
import { ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import VerifyEmail from './verify-email';

const SignUpScreen = () => {
    const router = useRouter();
    const { signUp, setActive, isLoaded } = useSignUp();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        if (password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters long");

        if (!isLoaded) return;

        setLoading(true);
        try {
            const signUpAttempt = await signUp.create({
                emailAddress: email,
                password: password
            })

            const pendingVerificationAttempt = await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })

            setPendingVerification(true);

            // if (signUpAttempt.status === "complete") await setActive({ session: signUpAttempt.createdSessionId });
            // else {
            //     Alert.alert("Error", "Sign up failed.Please try again");
            //     console.error(JSON.stringify(signUpAttempt, null, 2));
            // }
        } catch (error) {
            Alert.alert("Error", error.errors?.[0].message || "Sign up failed")
            console.error(JSON.stringify(error, null, 2));
        } finally {
            setLoading(false);
        }
    };

    if (pendingVerification) {
        return <VerifyEmail
            email={email}
            onBack={() => setPendingVerification(false)}
        />
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
                            source={require("../../assets/images/i2.png")}
                            style={authStyles.image}
                            contentFit="contain"
                        />
                    </View>
                    <Text style={authStyles.title}>Create Account</Text>
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
                            onPress={handleSignUp}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={authStyles.buttonText}>
                                {loading ? "Signing Up..." : "Sign Up"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={authStyles.linkContainer}
                            onPress={() => router.push("/(auth)/sign-in")}
                        >
                            <Text
                                style={authStyles.linkText}
                            >
                                Don&apos;t have an account ? <Text style={authStyles.link}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

            </KeyboardAvoidingView>
        </View>
    )
}

export default SignUpScreen;