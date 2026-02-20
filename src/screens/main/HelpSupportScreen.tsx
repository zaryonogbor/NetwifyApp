import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Linking,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        id: '1',
        question: 'How do I scan a QR code?',
        answer: 'Navigate to the "Scan" tab at the bottom of the screen. Point your camera at another user\'s Netwify QR code to instantly connect.',
    },
    {
        id: '2',
        question: 'Can I edit my profile information?',
        answer: 'Yes! Go to the "Profile" tab and tap the "Edit Profile" button to update your photo, bio, and contact details.',
    },
    {
        id: '3',
        question: 'Is my data secure?',
        answer: 'Absolutely. We use industry-standard encryption to protect your data. You can also manage your privacy settings in the "Privacy & Security" section.',
    },
    {
        id: '4',
        question: 'How does the AI follow-up work?',
        answer: 'After connecting with someone, you can use our AI features to generate personalized follow-up messages based on your shared interests and conversation.',
    },
];

export const HelpSupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (expandedIds.includes(id)) {
            setExpandedIds(expandedIds.filter((i) => i !== id));
        } else {
            setExpandedIds([...expandedIds, id]);
        }
    };

    const handleContactSupport = () => {
        Linking.openURL('mailto:support@netwify.com?subject=Netwify Support Request');
    };

    const handleVisitWebsite = () => {
        Linking.openURL('https://netwify.com/support');
    };

    const FAQRow = ({ item }: { item: FAQItem }) => {
        const isExpanded = expandedIds.includes(item.id);
        return (
            <TouchableOpacity
                style={[styles.faqRow, isExpanded && styles.faqRowExpanded]}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.faqHeader}>
                    <Text style={[styles.question, isExpanded && styles.questionExpanded]}>
                        {item.question}
                    </Text>
                    <Feather
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={isExpanded ? colors.blue[500] : colors.neutral[400]}
                    />
                </View>
                {isExpanded && (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answer}>{item.answer}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

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
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero / Search (Visual only for now) */}
                <View style={styles.heroSection}>
                    <MaterialCommunityIcons name="lifebuoy" size={48} color={colors.blue[500]} />
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtitle}>
                        Browse our FAQs or get in touch with our team.
                    </Text>
                </View>

                {/* Contact Options */}
                <View style={styles.contactRow}>
                    <TouchableOpacity
                        style={styles.contactCard}
                        onPress={handleContactSupport}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconCircle}>
                            <Feather name="mail" size={24} color={colors.blue[600]} />
                        </View>
                        <Text style={styles.contactLabel}>Email Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactCard}
                        onPress={handleVisitWebsite}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                            <Feather name="globe" size={24} color="#059669" />
                        </View>
                        <Text style={styles.contactLabel}>Web Support</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQs */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
                    <View style={styles.faqList}>
                        {faqs.map((item) => (
                            <FAQRow key={item.id} item={item} />
                        ))}
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
        paddingVertical: spacing.xl,
        marginBottom: spacing.md,
    },
    heroTitle: {
        fontSize: typography.fontSize['xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    heroSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        textAlign: 'center',
    },

    // Contact Options
    contactRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing['2xl'],
    },
    contactCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    contactLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[800],
    },

    // FAQs
    faqSection: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[400],
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
    faqList: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        overflow: 'hidden',
    },
    faqRow: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    faqRowExpanded: {
        backgroundColor: '#FAFAFA',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    question: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral[800],
        marginRight: spacing.md,
    },
    questionExpanded: {
        color: colors.blue[600],
        fontWeight: typography.fontWeight.bold,
    },
    answerContainer: {
        marginTop: spacing.sm,
        paddingRight: spacing.lg,
    },
    answer: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        lineHeight: 20,
    },
});

export default HelpSupportScreen;
