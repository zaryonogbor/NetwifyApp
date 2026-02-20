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
    ActivityIndicator,
    Image,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RootStackParamList } from '../../types';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

interface Props {
    navigation: SignUpScreenNavigationProp;
}

const { width } = Dimensions.get('window');

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

        // Removed explicit error for terms to keep it cleaner, but could block action
        if (!acceptedTerms) {
            // Optional: Block if strict, but UI pattern often just disables button
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && acceptedTerms;
    };

    const handleSignUp = async () => {
        const isValid = validateForm();
        if (!isValid) {
            if (!acceptedTerms) {
                Alert.alert('Terms Required', 'Please accept the Terms of Service and Privacy Policy to continue.');
            }
            return;
        }

        if (auth.app.options.apiKey === 'YOUR_API_KEY') {
            Alert.alert('Configuration Error', 'Firebase credentials are not properly configured.');
            return;
        }

        setLoading(true);
        try {
            await signUp(email.trim(), password);
        } catch (error: any) {
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
                    {/* Header Graphic */}
                    <View style={styles.graphicContainer}>
                        <View style={styles.logoContainer}>
                            <MaterialCommunityIcons name="access-point-network" size={40} color="#FFFFFF" />
                        </View>
                    </View>

                    {/* Header Text */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Join Netwify</Text>
                        <Text style={styles.subtitle}>Create an account to start networking</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Email"
                            placeholder="hello@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                            leftIcon={<Feather name="mail" size={20} color={colors.neutral[400]} />}
                            containerStyle={styles.inputContainer}
                        />

                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            error={errors.password}
                            leftIcon={<Feather name="lock" size={20} color={colors.neutral[400]} />}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Feather
                                        name={showPassword ? 'eye' : 'eye-off'}
                                        size={20}
                                        color={colors.neutral[400]}
                                    />
                                </TouchableOpacity>
                            }
                            containerStyle={styles.inputContainer}
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            error={errors.confirmPassword}
                            leftIcon={<Feather name="lock" size={20} color={colors.neutral[400]} />}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Feather
                                        name={showConfirmPassword ? 'eye' : 'eye-off'}
                                        size={20}
                                        color={colors.neutral[400]}
                                    />
                                </TouchableOpacity>
                            }
                            containerStyle={styles.inputContainer}
                        />

                        {/* Custom Checkbox Row */}
                        <TouchableOpacity
                            style={styles.termsRow}
                            onPress={() => setAcceptedTerms(!acceptedTerms)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
                                {acceptedTerms && <Feather name="check" size={12} color="#FFFFFF" />}
                            </View>
                            <Text style={styles.termsText}>
                                I agree to the <Text style={styles.linkText}>Terms</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>

                        <Button
                            title={loading ? "Creating Account..." : "Sign Up"}
                            onPress={handleSignUp}
                            loading={loading}
                            fullWidth
                            size="lg"
                            style={styles.signUpButton}
                            disabled={!acceptedTerms || loading}
                        />
                    </View>

                    {/* Footer - Login Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Log In</Text>
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
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing['4xl'],
        paddingBottom: spacing['2xl'],
    },
    graphicContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.blue[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[500],
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.neutral[300],
        marginRight: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: colors.blue[500],
        borderColor: colors.blue[500],
    },
    termsText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
    },
    linkText: {
        color: colors.blue[600],
        fontWeight: typography.fontWeight.bold,
    },
    signUpButton: {
        backgroundColor: colors.blue[600],
        height: 56,
        borderRadius: borderRadius.xl,
        shadowColor: colors.blue[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: spacing.xl,
    },
    footerText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[500],
        marginRight: spacing.xs,
    },
    loginLink: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.blue[600],
    },
});

export default SignUpScreen;
