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
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

export const TermsOfServiceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.lastUpdated}>Last Updated: February 2026</Text>

                <View style={styles.card}>
                    <Section title="1. Introduction">
                        Welcome to Netwify! These Terms of Service ("Terms") govern your use of our app and services. By accessing or using Netwify, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use our services.
                    </Section>

                    <Section title="2. Account Registration">
                        To use certain features of the app, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                    </Section>

                    <Section title="3. User Conduct">
                        You agree not to engage in any of the following prohibited activities:
                        {'\n'}• Using the service for any illegal purpose.
                        {'\n'}• Harassing, threatening, or defrauding other users.
                        {'\n'}• Posting content that is infringing, obscene, or defamatory.
                        {'\n'}• Attempting to interfere with the proper working of the service.
                    </Section>

                    <Section title="4. Privacy">
                        Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and share your personal information. By using the app, you consent to our data practices as described in our Privacy Policy.
                    </Section>

                    <Section title="5. Intellectual Property">
                        The service and its original content, features, and functionality are and will remain the exclusive property of Netwify and its licensors. The service is protected by copyright, trademark, and other laws.
                    </Section>

                    <Section title="6. Termination">
                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </Section>

                    <Section title="7. Changes to Terms">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
                    </Section>

                    <Section title="8. Contact Us">
                        If you have any questions about these Terms, please contact us at support@netwify.com.
                    </Section>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By using Netwify, you acknowledge that you have read and understood these Terms of Service.
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
    lastUpdated: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginBottom: spacing.md,
        marginTop: spacing.sm,
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

export default TermsOfServiceScreen;
