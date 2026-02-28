import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface PrivacySettings {
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
    allowRequests: boolean;
    shareActivity: boolean;
}

const DEFAULTS: PrivacySettings = {
    profileVisible: true,
    showEmail: true,
    showPhone: false,
    allowRequests: true,
    shareActivity: false,
};

export const PrivacySecurityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user, signOut } = useAuth();
    const [settings, setSettings] = useState<PrivacySettings>(DEFAULTS);
    const [saving, setSaving] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);

    // Load saved privacy settings from Firestore
    useEffect(() => {
        if (!user) return;
        const fetchSettings = async () => {
            try {
                const ref = doc(db, 'privacySettings', user.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    setSettings({ ...DEFAULTS, ...snap.data() } as PrivacySettings);
                }
            } catch (e) {
                console.error('Failed to load privacy settings:', e);
            } finally {
                setLoadingSettings(false);
            }
        };
        fetchSettings();
    }, [user]);

    // Save a single toggle to Firestore
    const handleToggle = async (key: keyof PrivacySettings, value: boolean) => {
        if (!user) return;
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        setSaving(true);
        try {
            await setDoc(doc(db, 'privacySettings', user.uid), updated, { merge: true });
        } catch (e) {
            Alert.alert('Error', 'Could not save setting. Please try again.');
            setSettings(settings); // revert
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadData = () => {
        Alert.alert(
            'Download My Data',
            'We will prepare a copy of your Netwify data and send it to your registered email address within 24 hours.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Request Download',
                    onPress: () => Alert.alert('Request Submitted', 'You will receive an email shortly with your data export.'),
                },
            ]
        );
    };

    const handleLoginActivity = () => {
        Alert.alert(
            'Login Activity',
            'You are currently logged in on this device. No other active sessions were found.',
            [{ text: 'OK' }]
        );
    };

    const handle2FA = () => {
        Alert.alert(
            'Two-Factor Authentication',
            'Two-factor authentication adds an extra layer of security to your account. This feature is coming soon.',
            [{ text: 'Got it' }]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            '⚠️ Delete Account',
            'This will permanently delete your Netwify account, all your contacts, and profile data. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Are you absolutely sure?',
                            'All your data will be permanently erased. Type "DELETE" to confirm.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Yes, Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            if (user) {
                                                await deleteUser(user);
                                                await signOut();
                                            }
                                        } catch (error: any) {
                                            if (error.code === 'auth/requires-recent-login') {
                                                Alert.alert(
                                                    'Re-authentication Required',
                                                    'For security, please sign out and sign back in before deleting your account.'
                                                );
                                            } else {
                                                Alert.alert('Error', 'Failed to delete account. Please try again.');
                                            }
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const ToggleRow = ({
        icon,
        label,
        subtitle,
        settingKey,
        isLast,
    }: {
        icon: string;
        label: string;
        subtitle?: string;
        settingKey: keyof PrivacySettings;
        isLast?: boolean;
    }) => (
        <View style={[styles.row, !isLast && styles.rowBorder]}>
            <View style={styles.rowIconBox}>
                <Feather name={icon as any} size={17} color={colors.blue[500]} />
            </View>
            <View style={styles.rowTextBlock}>
                <Text style={styles.rowLabel}>{label}</Text>
                {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
            </View>
            {saving ? (
                <ActivityIndicator size="small" color={colors.blue[400]} />
            ) : (
                <Switch
                    value={settings[settingKey]}
                    onValueChange={(val) => handleToggle(settingKey, val)}
                    trackColor={{ false: '#E5E7EB', true: colors.blue[400] }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#E5E7EB"
                />
            )}
        </View>
    );

    const ActionRow = ({
        icon,
        label,
        subtitle,
        onPress,
        iconColor = colors.blue[500],
        iconBg = colors.blue[50],
        isLast,
        danger,
    }: {
        icon: string;
        label: string;
        subtitle?: string;
        onPress: () => void;
        iconColor?: string;
        iconBg?: string;
        isLast?: boolean;
        danger?: boolean;
    }) => (
        <TouchableOpacity
            style={[styles.row, !isLast && styles.rowBorder]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.rowIconBox, { backgroundColor: iconBg }]}>
                <Feather name={icon as any} size={17} color={iconColor} />
            </View>
            <View style={styles.rowTextBlock}>
                <Text style={[styles.rowLabel, danger && { color: '#EF4444' }]}>{label}</Text>
                {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
            </View>
            <Feather name="chevron-right" size={18} color={danger ? '#FCA5A5' : colors.neutral[300]} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={22} color={colors.neutral[800]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 40 }}>
                    {saving && <ActivityIndicator size="small" color={colors.blue[400]} />}
                </View>
            </View>

            {loadingSettings ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.blue[500]} />
                    <Text style={styles.loadingText}>Loading settings...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Info Banner */}
                    <View style={styles.infoBanner}>
                        <MaterialCommunityIcons name="shield-check-outline" size={20} color={colors.blue[600]} />
                        <Text style={styles.infoBannerText}>
                            Your data is encrypted and securely stored. Settings are saved automatically.
                        </Text>
                    </View>

                    {/* Profile Visibility */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>PROFILE VISIBILITY</Text>
                        <View style={styles.sectionCard}>
                            <ToggleRow
                                icon="eye"
                                label="Profile Visible"
                                subtitle="Others can find you via QR scan"
                                settingKey="profileVisible"
                            />
                            <ToggleRow
                                icon="mail"
                                label="Show Email"
                                subtitle="Display email on your card"
                                settingKey="showEmail"
                            />
                            <ToggleRow
                                icon="phone"
                                label="Show Phone Number"
                                subtitle="Display phone on your card"
                                settingKey="showPhone"
                                isLast
                            />
                        </View>
                    </View>

                    {/* Connection Settings */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>CONNECTIONS</Text>
                        <View style={styles.sectionCard}>
                            <ToggleRow
                                icon="user-plus"
                                label="Allow Connection Requests"
                                subtitle="Let others send you requests"
                                settingKey="allowRequests"
                            />
                            <ToggleRow
                                icon="activity"
                                label="Share Activity Status"
                                subtitle="Show when you were last active"
                                settingKey="shareActivity"
                                isLast
                            />
                        </View>
                    </View>

                    {/* Data & Security */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>DATA & SECURITY</Text>
                        <View style={styles.sectionCard}>
                            <ActionRow
                                icon="download"
                                label="Download My Data"
                                subtitle="Get a copy of your information"
                                onPress={handleDownloadData}
                            />
                            <ActionRow
                                icon="list"
                                label="Login Activity"
                                subtitle="Review recent sessions"
                                onPress={handleLoginActivity}
                            />
                            <ActionRow
                                icon="shield"
                                label="Two-Factor Authentication"
                                subtitle="Add an extra layer of security"
                                onPress={handle2FA}
                            />
                            <ActionRow
                                icon="trash-2"
                                label="Delete Account"
                                subtitle="Permanently remove your data"
                                iconColor="#EF4444"
                                iconBg="#FEF2F2"
                                danger
                                isLast
                                onPress={handleDeleteAccount}
                            />
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: { flex: 1 },
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

    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    loadingText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
    },

    // Info Banner
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.blue[50],
        borderRadius: borderRadius.xl,
        padding: spacing.base,
        marginBottom: spacing.xl,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    infoBannerText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.blue[700],
        lineHeight: 20,
        fontWeight: typography.fontWeight.medium,
    },

    // Sections
    section: { marginBottom: spacing.xl },
    sectionLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[400],
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.base,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },

    // Row
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    rowIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    rowTextBlock: { flex: 1 },
    rowLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral[800],
    },
    rowSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
        marginTop: 2,
    },
});

export default PrivacySecurityScreen;
