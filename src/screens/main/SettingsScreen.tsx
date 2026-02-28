import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { ConnectionRequest, UserProfile } from '../../types';

const LANGUAGE_KEY = '@netwify_language';
const APPEARANCE_KEY = '@netwify_appearance';

const languageLabels: Record<string, string> = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German',
    it: 'Italian', pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese',
    ru: 'Russian', ar: 'Arabic',
};
const appearanceLabels: Record<string, string> = {
    light: 'Light', dark: 'Dark', system: 'System Default',
};

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { signOut, user } = useAuth();
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const [languageLabel, setLanguageLabel] = useState('English');
    const [appearanceLabel, setAppearanceLabel] = useState('Light');

    // Reload labels every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            AsyncStorage.getItem(LANGUAGE_KEY).then((val) => {
                if (val) setLanguageLabel(languageLabels[val] ?? 'English');
            });
            AsyncStorage.getItem(APPEARANCE_KEY).then((val) => {
                if (val) setAppearanceLabel(appearanceLabels[val] ?? 'Light');
            });
        }, [])
    );

    const handleSignOut = () => setShowSignOutModal(true);

    const performSignOut = async () => {
        setShowSignOutModal(false);
        try {
            await signOut();
        } catch (error) {
            console.error('Error during sign out:', error);
            Alert.alert('Error', 'An error occurred during sign out. Please try again.');
        }
    };

    const generateTestConnection = async () => {
        if (!user) return;

        try {
            const dummyId = 'dummy_' + Date.now();

            const dummyProfile: UserProfile = {
                uid: dummyId,
                email: 'jane.test@example.com',
                displayName: 'Jane Smith (AI Tester)',
                jobTitle: 'Senior Product Manager',
                company: 'Innovatech Corp',
                bio: 'Passionate about building scalable AI products and connecting with engineers.',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await setDoc(doc(db, 'users', dummyId), dummyProfile);

            const testRequest: Omit<ConnectionRequest, 'id'> = {
                fromUserId: dummyId,
                toUserId: user.uid,
                fromUserProfile: {
                    displayName: dummyProfile.displayName,
                    jobTitle: dummyProfile.jobTitle,
                    company: dummyProfile.company,
                },
                status: 'pending',
                message: 'Hi there! I would love to test the AI summary features with you. I work on product at Innovatech.',
                createdAt: new Date(),
            };

            await addDoc(collection(db, 'connectionRequests'), testRequest);
            Alert.alert('Success!', 'Test connection injected. Check Notifications!');
        } catch (error) {
            console.error('Test connection error:', error);
            Alert.alert('Error', 'Failed to generate test connection.');
        }
    };

    const SettingsRow = ({
        icon,
        label,
        subtitle,
        onPress,
        iconBg = colors.blue[50],
        iconColor = colors.blue[500],
        isLast,
    }: {
        icon: string;
        label: string;
        subtitle?: string;
        onPress?: () => void;
        iconBg?: string;
        iconColor?: string;
        isLast?: boolean;
    }) => (
        <TouchableOpacity
            style={[styles.settingsRow, !isLast && styles.settingsRowBorder]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.settingsIconBox, { backgroundColor: iconBg }]}>
                <Feather name={icon as any} size={18} color={iconColor} />
            </View>
            <View style={styles.settingsTextBlock}>
                <Text style={styles.settingsLabel}>{label}</Text>
                {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
            </View>
            <Feather name="chevron-right" size={18} color={colors.neutral[300]} />
        </TouchableOpacity>
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
                <Text style={styles.title}>Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Account */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ACCOUNT</Text>
                    <View style={styles.sectionCard}>
                        <SettingsRow
                            icon="bell"
                            label="Notifications"
                            subtitle="Manage alerts & sounds"
                            onPress={() => navigation.navigate('Notifications')}
                        />
                        <SettingsRow
                            icon="shield"
                            label="Privacy & Security"
                            subtitle="Control your data"
                            onPress={() => navigation.navigate('PrivacySecurity')}
                        />
                        <SettingsRow
                            icon="lock"
                            label="Change Password"
                            onPress={() => navigation.navigate('ChangePassword')}
                            isLast
                        />
                    </View>
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>PREFERENCES</Text>
                    <View style={styles.sectionCard}>
                        <SettingsRow
                            icon="globe"
                            label="Language"
                            subtitle={languageLabel}
                            onPress={() => navigation.navigate('Language')}
                        />
                        <SettingsRow
                            icon="moon"
                            label="Appearance"
                            subtitle={appearanceLabel}
                            onPress={() => navigation.navigate('Appearance')}
                            isLast
                        />
                    </View>
                </View>

                {/* Support & About */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SUPPORT & ABOUT</Text>
                    <View style={styles.sectionCard}>
                        <SettingsRow
                            icon="help-circle"
                            label="Help & Support"
                            onPress={() => navigation.navigate('HelpSupport')}
                        />
                        <SettingsRow
                            icon="file-text"
                            label="Terms of Service"
                            onPress={() => navigation.navigate('TermsOfService')}
                        />
                        <SettingsRow
                            icon="shield"
                            label="Privacy Policy"
                            onPress={() => navigation.navigate('PrivacyPolicy')}
                        />
                        <SettingsRow
                            icon="info"
                            label="About Netwify"
                            subtitle="v1.0.0"
                            onPress={() => navigation.navigate('About')}
                        />
                        <SettingsRow
                            icon="cpu"
                            label="Developer: Test AI Flow"
                            subtitle="Generate incoming connection test"
                            onPress={generateTestConnection}
                            iconBg={colors.warning + '20'}
                            iconColor={colors.warning}
                            isLast
                        />
                    </View>
                </View>

                {/* Sign Out */}
                <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                    activeOpacity={0.85}
                >
                    <Feather name="log-out" size={18} color="#EF4444" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>

                {/* Version Footer */}
                <Text style={styles.versionText}>Netwify v1.0.0</Text>
            </ScrollView>

            {/* ── Sign Out Confirmation Modal ── */}
            <Modal
                visible={showSignOutModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSignOutModal(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        {/* Icon */}
                        <View style={styles.modalIconBadge}>
                            <Feather name="log-out" size={26} color="#EF4444" />
                        </View>

                        {/* Text */}
                        <Text style={styles.modalTitle}>Sign Out?</Text>
                        <Text style={styles.modalBody}>
                            You'll be returned to the login screen. Your data will remain safe and intact.
                        </Text>

                        {/* Actions */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setShowSignOutModal(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirmBtn}
                                onPress={performSignOut}
                                activeOpacity={0.85}
                            >
                                <Feather name="log-out" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                                <Text style={styles.modalConfirmText}>Yes, Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

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
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
    },
    headerSpacer: {
        width: 40,
    },

    // Sections
    section: {
        marginBottom: spacing.xl,
    },
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

    // Settings Row
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
    },
    settingsRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    settingsIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    settingsTextBlock: {
        flex: 1,
    },
    settingsLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral[800],
    },
    settingsSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
        marginTop: 2,
    },

    // Sign Out
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: '#FFFFFF',
        paddingVertical: spacing.base,
        borderRadius: borderRadius.xl,
        borderWidth: 1.5,
        borderColor: '#FEE2E2',
        marginBottom: spacing.lg,
    },
    signOutText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: '#EF4444',
    },

    // Version
    versionText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[400],
        textAlign: 'center',
        marginBottom: spacing['2xl'],
    },

    // ── Sign Out Modal ──
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    modalCard: {
        width: '100%',
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 16,
    },
    modalIconBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        borderWidth: 1.5,
        borderColor: '#FECACA',
    },
    modalTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    modalBody: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.sm,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: spacing.base,
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    modalCancelText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[700],
    },
    modalConfirmBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.base,
        backgroundColor: '#EF4444',
        borderRadius: borderRadius.xl,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    modalConfirmText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
});

export default SettingsScreen;
