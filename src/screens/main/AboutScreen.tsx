import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Linking,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

export const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const handleUrl = (url: string) => {
        Linking.openURL(url);
    };

    const SocialButton = ({ icon, url }: { icon: string; url: string }) => (
        <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleUrl(url)}
            activeOpacity={0.8}
        >
            <Feather name={icon as any} size={20} color={colors.blue[600]} />
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
                <Text style={styles.headerTitle}>About</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Brand Hero */}
                <View style={styles.heroSection}>
                    <View style={styles.logoContainer}>
                        <MaterialCommunityIcons name="access-point-network" size={56} color="#FFFFFF" />
                    </View>
                    <Text style={styles.appName}>Netwify</Text>
                    <Text style={styles.appVersion}>Version 1.0.0</Text>
                    <Text style={styles.tagline}>
                        The ultimate networking tool for modern professionals. Connect, share, and grow your network with ease.
                    </Text>
                </View>

                {/* Socials */}
                <View style={styles.socialsRow}>
                    <SocialButton icon="twitter" url="https://twitter.com" />
                    <SocialButton icon="instagram" url="https://instagram.com" />
                    <SocialButton icon="linkedin" url="https://linkedin.com" />
                    <SocialButton icon="globe" url="https://netwify.com" />
                </View>

                {/* Info Card */}
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => handleUrl('https://netwify.com')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.rowIcon}>
                            <Feather name="globe" size={18} color={colors.blue[500]} />
                        </View>
                        <Text style={styles.rowLabel}>Visit Website</Text>
                        <Feather name="external-link" size={16} color={colors.neutral[400]} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.row}
                        activeOpacity={0.7}
                    >
                        <View style={styles.rowIcon}>
                            <Feather name="star" size={18} color={colors.blue[500]} />
                        </View>
                        <Text style={styles.rowLabel}>Rate Us</Text>
                        <Feather name="chevron-right" size={16} color={colors.neutral[400]} />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.row}
                        activeOpacity={0.7}
                    >
                        <View style={styles.rowIcon}>
                            <Feather name="share" size={18} color={colors.blue[500]} />
                        </View>
                        <Text style={styles.rowLabel}>Share App</Text>
                        <Feather name="chevron-right" size={16} color={colors.neutral[400]} />
                    </TouchableOpacity>
                </View>

                {/* Credits / Footer */}
                <View style={styles.footer}>
                    <Text style={styles.copyright}>© 2026 Netwify Inc.</Text>
                    <Text style={styles.credits}>
                        Designed with ❤️ for connectivity.
                    </Text>
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
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['4xl'],
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 30,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        ...shadows.md,
    },
    appName: {
        fontSize: 28,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: 4,
    },
    appVersion: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginBottom: spacing.md,
        backgroundColor: colors.blue[50],
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    tagline: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
        textAlign: 'center',
        lineHeight: 22,
    },

    // Socials
    socialsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
        marginBottom: spacing['2xl'],
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...shadows.sm,
    },

    // Card
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: spacing.xl,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    rowIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    rowLabel: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral[800],
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },

    // Footer
    footer: {
        alignItems: 'center',
        gap: 4,
    },
    copyright: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral[500],
    },
    credits: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
    },
});

export default AboutScreen;
