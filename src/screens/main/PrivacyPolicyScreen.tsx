import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

export const PrivacyPolicyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Intro Banner */}
                <View style={styles.introBanner}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={24} color={colors.blue[600]} />
                    <Text style={styles.introText}>
                        Your privacy is our priority. We are committed to protecting your personal data.
                    </Text>
                </View>

                <Text style={styles.lastUpdated}>Last Updated: February 2026</Text>

                <View style={styles.card}>
                    <Section title="1. Information We Collect">
                        • Account Information (Name, email, job title, company)
                        {'\n'}• Profile Information (Photos, bio, social links)
                        {'\n'}• Usage Data (App interactions, connection activity)
                        {'\n'}• Device Information (Device type, OS version)
                    </Section>

                    <Section title="2. How We Use Your Data">
                        We use your data to:
                        {'\n'}• Provide and improve our networking services
                        {'\n'}• Personalize your experience
                        {'\n'}• Facilitate connections with other users
                        {'\n'}• Communicate important updates
                    </Section>

                    <Section title="3. Data Sharing">
                        We do not sell your personal data. We only share information:
                        {'\n'}• With other users you choose to connect with
                        {'\n'}• With service providers who assist our operations
                        {'\n'}• As required by law or legal process
                    </Section>

                    <Section title="4. Data Security">
                        We implement industry-standard security measures to protect your information, including encryption and secure server infrastructure. However, no method of transmission is 100% secure.
                    </Section>

                    <Section title="5. Your Rights">
                        You have the right to access, correct, or delete your personal data. You can manage your profile settings within the app or contact us for assistance.
                    </Section>

                    <Section title="6. Cookies & Tracking">
                        We use standard tracking technologies to understand user behavior and improve app performance. You can control these preferences in your device settings.
                    </Section>

                    <Section title="7. Contact Us">
                        Questions about this policy? Reach out to our Data Protection Officer at privacy@netwify.com.
                    </Section>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By using Netwify, you agree to the collection and use of information in accordance with this policy.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionText}>{children}</Text>
    </View>
);

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
    introBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.blue[50],
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    introText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.blue[800],
        fontWeight: typography.fontWeight.medium,
        lineHeight: 20,
    },
    lastUpdated: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginBottom: spacing.lg,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: spacing.xs,
    },
    sectionText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
        lineHeight: 22,
    },
    footer: {
        paddingHorizontal: spacing.md,
    },
    footerText: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default PrivacyPolicyScreen;
