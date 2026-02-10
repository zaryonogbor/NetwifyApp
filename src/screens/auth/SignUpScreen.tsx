import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RootStackParamList } from '../../types';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

interface Props {
    navigation: SignUpScreenNavigationProp;
}

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
        terms?: string;
    }>({});

    const { signUp } = useAuth();

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!acceptedTerms) {
            newErrors.terms = 'You must accept the terms and privacy policy';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        console.log('Sign up attempt started with:', { email: email.trim() });

        if (!validateForm()) {
            console.log('Form validation failed:', errors);
            return;
        }

        // Check if Firebase config still has placeholders (though user said they added them)
        // This is a safety check
        if (auth.app.options.apiKey === 'YOUR_API_KEY') {
            Alert.alert('Configuration Error', 'Firebase credentials are not properly configured.');
            return;
        }

        setLoading(true);
        try {
            console.log('Calling signUp in AuthContext...');
            await signUp(email.trim(), password);
            console.log('Sign up successful, automatic navigation will handle stack switch');
        } catch (error: any) {
            console.error('Sign up error details:', error);
            let message = 'An error occurred during sign up';
            if (error.code === 'auth/email-already-in-use') {
                message = 'An account with this email already exists';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Invalid email address';
            } else if (error.code === 'auth/weak-password') {
                message = 'Password is too weak';
            } else if (error.code === 'auth/network-request-failed') {
                message = 'Network error. Please check your internet connection.';
            } else if (error.message) {
                message = error.message;
            }
            Alert.alert('Sign Up Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Start building your professional network</Text>

                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            error={errors.email}
                            leftIcon={<Feather name="mail" size={20} color={colors.text.tertiary} />}
                        />

                        <Input
                            label="Password"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            error={errors.password}
                            leftIcon={<Feather name="lock" size={20} color={colors.text.tertiary} />}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Feather
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={colors.text.tertiary}
                                    />
                                </TouchableOpacity>
                            }
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            error={errors.confirmPassword}
                            leftIcon={<Feather name="lock" size={20} color={colors.text.tertiary} />}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Feather
                                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={colors.text.tertiary}
                                    />
                                </TouchableOpacity>
                            }
                        />

                        {/* Terms Checkbox */}
                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={() => setAcceptedTerms(!acceptedTerms)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                                {acceptedTerms && <Feather name="check" size={14} color={colors.text.inverse} />}
                            </View>
                            <Text style={styles.termsText}>
                                I agree to the{' '}
                                <Text style={styles.termsLink}>Terms of Service</Text>
                                {' '}and{' '}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>
                        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

                        <Button
                            title="Create Account"
                            onPress={handleSignUp}
                            loading={loading}
                            fullWidth
                            size="lg"
                            style={styles.signUpButton}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => {
                            Keyboard.dismiss();
                            navigation.navigate('Login');
                        }}>
                            <Text style={styles.footerLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    logo: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600],
        marginBottom: spacing.xs,
    },
    tagline: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
    },
    form: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 32, // Larger title
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        marginBottom: spacing['2xl'], // More space
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: colors.primary[600], // Use primary color for border
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
    },
    termsText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: 20,
    },
    termsLink: {
        color: colors.accent[500],
        fontWeight: typography.fontWeight.medium,
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        color: colors.error,
        marginBottom: spacing.sm,
    },
    signUpButton: {
        marginTop: spacing.lg,
        backgroundColor: colors.primary[600],
        height: 56,
        borderRadius: borderRadius.xl,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.xs,
    },
    footerText: {
        fontSize: typography.fontSize.base,
        color: colors.text.tertiary,
    },
    footerLink: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.accent[500], // Salmon color
    },
});

export default SignUpScreen;
