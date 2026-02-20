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
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RootStackParamList } from '../../types';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loginError, setLoginError] = useState<string | null>(null);

    const { signIn } = useAuth();

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!validateForm()) return;
        setLoginError(null);
        setLoading(true);
        try {
            await signIn(email.trim(), password);
        } catch (error: any) {
            let message = 'An error occurred. Please try again.';
            if (
                error.code === 'auth/user-not-found' ||
                error.code === 'auth/invalid-credential' ||
                error.code === 'auth/wrong-password'
            ) {
                message = 'Incorrect email or password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'The email address is not valid.';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/user-disabled') {
                message = 'This account has been disabled.';
            }
            setLoginError(message);
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
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue networking</Text>
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
                            autoComplete="email"
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

                        {/* Forgot Password Link */}
                        <TouchableOpacity
                            style={styles.forgotPasswordContainer}
                            onPress={() => Alert.alert('Coming Soon', 'Forgot password flow will be implemented here.')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Inline Login Error */}
                        {loginError ? (
                            <View style={styles.errorBanner}>
                                <Feather name="alert-circle" size={15} color={colors.error || '#DC2626'} style={{ marginRight: 8 }} />
                                <Text style={styles.errorBannerText}>{loginError}</Text>
                            </View>
                        ) : null}

                        <Button
                            title={loading ? "Signing In..." : "Sign In"}
                            onPress={handleLogin}
                            loading={loading}
                            fullWidth
                            size="lg"
                            style={styles.loginButton}
                        />
                    </View>

                    {/* Footer - Sign Up Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.signUpLink}>Sign Up</Text>
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
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: spacing.xl,
        marginTop: spacing.xs,
    },
    forgotPasswordText: {
        color: colors.blue[600],
        fontWeight: typography.fontWeight.medium,
        fontSize: typography.fontSize.sm,
    },
    loginButton: {
        backgroundColor: colors.blue[600],
        height: 56,
        borderRadius: borderRadius.xl,
        shadowColor: colors.blue[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    errorBannerText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: '#DC2626',
        fontWeight: typography.fontWeight.medium,
        lineHeight: 20,
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
    signUpLink: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.blue[600],
    },
});

export default LoginScreen;
