import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../theme';

export const ChangePasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const isValid =
        currentPassword.length >= 6 &&
        newPassword.length >= 8 &&
        newPassword === confirmPassword &&
        newPassword !== currentPassword;

    const getStrength = (pw: string): { label: string; color: string; width: string } => {
        if (pw.length === 0) return { label: '', color: '#E5E7EB', width: '0%' };
        if (pw.length < 6) return { label: 'Weak', color: '#EF4444', width: '25%' };
        if (pw.length < 8) return { label: 'Fair', color: '#F59E0B', width: '50%' };
        const hasUpper = /[A-Z]/.test(pw);
        const hasNumber = /[0-9]/.test(pw);
        const hasSpecial = /[^A-Za-z0-9]/.test(pw);
        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        if (score >= 2 && pw.length >= 10) return { label: 'Strong', color: '#10B981', width: '100%' };
        if (score >= 1) return { label: 'Good', color: colors.blue[500], width: '75%' };
        return { label: 'Fair', color: '#F59E0B', width: '50%' };
    };

    const strength = getStrength(newPassword);

    const handleChangePassword = async () => {
        if (!user || !user.email) return;

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            Alert.alert('Success', 'Your password has been updated.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error: any) {
            let message = 'Failed to update password. Please try again.';
            if (error.code === 'auth/wrong-password') {
                message = 'Current password is incorrect.';
            } else if (error.code === 'auth/weak-password') {
                message = 'New password is too weak. Use at least 8 characters.';
            }
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const PasswordField = ({
        label,
        value,
        onChangeText,
        show,
        onToggle,
        placeholder,
        fieldKey,
    }: {
        label: string;
        value: string;
        onChangeText: (t: string) => void;
        show: boolean;
        onToggle: () => void;
        placeholder: string;
        fieldKey: string;
    }) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View
                style={[
                    styles.inputWrapper,
                    focusedField === fieldKey && styles.inputWrapperFocused,
                ]}
            >
                <Feather
                    name="lock"
                    size={18}
                    color={focusedField === fieldKey ? colors.blue[500] : colors.neutral[400]}
                />
                <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!show}
                    placeholder={placeholder}
                    placeholderTextColor={colors.neutral[400]}
                    onFocus={() => setFocusedField(fieldKey)}
                    onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={onToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Feather
                        name={show ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.neutral[400]}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Feather name="arrow-left" size={22} color={colors.neutral[800]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <MaterialCommunityIcons
                        name="lock-check-outline"
                        size={20}
                        color={colors.blue[600]}
                    />
                    <Text style={styles.infoBannerText}>
                        Choose a strong password that you don't use for other accounts. It should be at least 8 characters long.
                    </Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <PasswordField
                        label="Current Password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        show={showCurrent}
                        onToggle={() => setShowCurrent(!showCurrent)}
                        placeholder="Enter current password"
                        fieldKey="current"
                    />

                    <View style={styles.divider} />

                    <PasswordField
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        show={showNew}
                        onToggle={() => setShowNew(!showNew)}
                        placeholder="Enter new password"
                        fieldKey="new"
                    />

                    {/* Strength Indicator */}
                    {newPassword.length > 0 && (
                        <View style={styles.strengthContainer}>
                            <View style={styles.strengthBarBg}>
                                <View
                                    style={[
                                        styles.strengthBarFill,
                                        { width: strength.width as any, backgroundColor: strength.color },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.strengthLabel, { color: strength.color }]}>
                                {strength.label}
                            </Text>
                        </View>
                    )}

                    <PasswordField
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        show={showConfirm}
                        onToggle={() => setShowConfirm(!showConfirm)}
                        placeholder="Re-enter new password"
                        fieldKey="confirm"
                    />

                    {/* Mismatch warning */}
                    {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                        <View style={styles.warningRow}>
                            <Feather name="alert-circle" size={14} color="#EF4444" />
                            <Text style={styles.warningText}>Passwords do not match</Text>
                        </View>
                    )}
                </View>

                {/* Requirements */}
                <View style={styles.requirementsCard}>
                    <Text style={styles.requirementsTitle}>Password Requirements</Text>
                    <Requirement met={newPassword.length >= 8} text="At least 8 characters" />
                    <Requirement met={/[A-Z]/.test(newPassword)} text="One uppercase letter" />
                    <Requirement met={/[0-9]/.test(newPassword)} text="One number" />
                    <Requirement met={/[^A-Za-z0-9]/.test(newPassword)} text="One special character" />
                </View>

                {/* Update Button */}
                <TouchableOpacity
                    style={[styles.updateButton, !isValid && styles.updateButtonDisabled]}
                    onPress={handleChangePassword}
                    activeOpacity={0.85}
                    disabled={!isValid || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Feather name="check" size={18} color="#FFFFFF" />
                            <Text style={styles.updateButtonText}>Update Password</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const Requirement = ({ met, text }: { met: boolean; text: string }) => (
    <View style={styles.requirementRow}>
        <Feather
            name={met ? 'check-circle' : 'circle'}
            size={15}
            color={met ? '#10B981' : colors.neutral[300]}
        />
        <Text style={[styles.requirementText, met && styles.requirementMet]}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['4xl'],
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
    },
    headerSpacer: {
        width: 40,
    },

    // Info Banner
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.blue[50],
        borderRadius: borderRadius.xl,
        padding: spacing.base,
        marginBottom: spacing.xl,
        gap: spacing.sm,
    },
    infoBannerText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.blue[700],
        lineHeight: 20,
        fontWeight: typography.fontWeight.medium,
    },

    // Form Card
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: spacing.lg,
    },
    fieldContainer: {
        marginBottom: spacing.md,
    },
    fieldLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[700],
        marginBottom: spacing.sm,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: spacing.sm,
    },
    inputWrapperFocused: {
        borderColor: colors.blue[500],
        borderWidth: 1.5,
        backgroundColor: '#FFFFFF',
    },
    textInput: {
        flex: 1,
        fontSize: typography.fontSize.base,
        color: colors.neutral[800],
        paddingVertical: spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: spacing.md,
    },

    // Strength
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    strengthBarBg: {
        flex: 1,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
    },
    strengthBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        minWidth: 40,
    },

    // Warning
    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    warningText: {
        fontSize: typography.fontSize.xs,
        color: '#EF4444',
        fontWeight: typography.fontWeight.medium,
    },

    // Requirements
    requirementsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: spacing.xl,
    },
    requirementsTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[700],
        marginBottom: spacing.md,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.xs + 1,
    },
    requirementText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[400],
    },
    requirementMet: {
        color: '#10B981',
    },

    // Update Button
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.blue[500],
        paddingVertical: spacing.base,
        borderRadius: borderRadius.xl,
    },
    updateButtonDisabled: {
        opacity: 0.5,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
    },
});

export default ChangePasswordScreen;
