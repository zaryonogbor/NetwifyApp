import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

export const PrivacySecurityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [profileVisible, setProfileVisible] = useState(true);
    const [showEmail, setShowEmail] = useState(true);
    const [showPhone, setShowPhone] = useState(false);
    const [allowRequests, setAllowRequests] = useState(true);
    const [shareActivity, setShareActivity] = useState(false);

    const ToggleRow = ({
        icon,
        label,
        subtitle,
        value,
        onToggle,
        isLast,
    }: {
        icon: string;
        label: string;
        subtitle?: string;
        value: boolean;
        onToggle: (val: boolean) => void;
        isLast?: boolean;
    }) => (
        <View style={[styles.row, !isLast && styles.rowBorder]}>
            <View style={styles.rowIconBox}>
                <Feather name={icon as any} size={18} color={colors.blue[500]} />
            </View>
            <View style={styles.rowTextBlock}>
                <Text style={styles.rowLabel}>{label}</Text>
                {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#E5E7EB', true: colors.blue[400] }}
                thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E7EB"
            />
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
        onPress?: () => void;
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
                <Feather name={icon as any} size={18} color={iconColor} />
            </View>
            <View style={styles.rowTextBlock}>
                <Text style={[styles.rowLabel, danger && { color: '#EF4444' }]}>{label}</Text>
                {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
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
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <MaterialCommunityIcons
                        name="shield-check-outline"
                        size={20}
                        color={colors.blue[600]}
                    />
                    <Text style={styles.infoBannerText}>
                        Your data is encrypted and securely stored. We never share your information without your consent.
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
                            value={profileVisible}
                            onToggle={setProfileVisible}
                        />
                        <ToggleRow
                            icon="mail"
                            label="Show Email"
                            subtitle="Display email on your card"
                            value={showEmail}
                            onToggle={setShowEmail}
                        />
                        <ToggleRow
                            icon="phone"
                            label="Show Phone Number"
                            subtitle="Display phone on your card"
                            value={showPhone}
                            onToggle={setShowPhone}
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
                            value={allowRequests}
                            onToggle={setAllowRequests}
                        />
                        <ToggleRow
                            icon="activity"
                            label="Share Activity Status"
                            subtitle="Show when you were last active"
                            value={shareActivity}
                            onToggle={setShareActivity}
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
                        />
                        <ActionRow
                            icon="list"
                            label="Login Activity"
                            subtitle="Review recent sessions"
                        />
                        <ActionRow
                            icon="shield"
                            label="Two-Factor Authentication"
                            subtitle="Add an extra layer of security"
                        />
                        <ActionRow
                            icon="trash-2"
                            label="Delete Account"
                            subtitle="Permanently remove your data"
                            iconColor="#EF4444"
                            iconBg="#FEF2F2"
                            danger
                            isLast
                        />
                    </View>
                </View>
            </ScrollView>
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
    rowTextBlock: {
        flex: 1,
    },
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
