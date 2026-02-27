import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Share,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../config/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Contact } from '../../types';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 200;

interface Props {
    navigation: any;
    route: { params: { contactId: string } };
}

type Tone = 'professional' | 'friendly';
type Channel = 'Email' | 'WhatsApp' | 'LinkedIn';

export const AIFollowUpScreen: React.FC<Props> = ({ navigation, route }) => {
    const { contactId } = route.params;
    const [contact, setContact] = useState<Contact | null>(null);
    const [selectedTone, setSelectedTone] = useState<Tone>('professional');
    const [selectedChannel, setSelectedChannel] = useState<Channel>('Email');
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    React.useEffect(() => {
        fetchContact();
    }, [contactId]);

    const fetchContact = async () => {
        try {
            const contactDoc = await getDoc(doc(db, 'contacts', contactId));
            if (contactDoc.exists()) {
                setContact({ ...contactDoc.data(), id: contactDoc.id } as Contact);
            }
        } catch (error) {
            console.error('Error fetching contact:', error);
        }
    };

    const tones: { value: Tone; label: string; icon: string; desc: string }[] = [
        { value: 'professional', label: 'Professional', icon: 'briefcase', desc: 'Formal & concise' },
        { value: 'friendly', label: 'Friendly', icon: 'smile', desc: 'Warm & casual' },
    ];

    const channels: { value: Channel; label: string; icon: string; color: string; bg: string }[] = [
        { value: 'Email', label: 'Email', icon: 'mail', color: colors.blue[500], bg: colors.blue[50] },
        { value: 'WhatsApp', label: 'WhatsApp', icon: 'message-circle', color: '#25D366', bg: '#EDFBF1' },
        { value: 'LinkedIn', label: 'LinkedIn', icon: 'linkedin', color: '#0077B5', bg: '#E8F4FB' },
    ];

    const handleGenerate = async () => {
        if (!contact) return;
        setIsGenerating(true);
        try {
            const generateFollowUp = httpsCallable(functions, 'generateFollowUp');
            const result = await generateFollowUp({
                contactId: contact.id,
                tone: selectedTone,
                channel: selectedChannel,
            });
            const { message } = result.data as { message: string };
            setGeneratedMessage(message);
            setIsEditing(true);
        } catch (error: any) {
            console.error('Error generating AI message:', error);
            Alert.alert('Error', error.message || 'Failed to generate message. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!generatedMessage) return;
        try {
            await Share.share({ message: generatedMessage, title: 'Follow-up Message' });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleCopy = () => {
        Alert.alert('Copied!', 'Message copied to clipboard');
    };

    const getInitials = (name?: string): string => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const activeChannel = channels.find(c => c.value === selectedChannel)!;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={colors.blue[500]} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Blue Hero Header ── */}
                <View style={styles.hero}>
                    <View style={styles.decorCircle1} />
                    <View style={styles.decorCircle2} />

                    {/* Nav */}
                    <View style={styles.heroNav}>
                        <TouchableOpacity
                            style={styles.navIconBtn}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>
                        <View style={styles.heroBadge}>
                            <MaterialCommunityIcons name="lightning-bolt" size={13} color={colors.secondary[400]} />
                            <Text style={styles.heroBadgeText}>AI Follow-up</Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Hero body */}
                    <View style={styles.heroBody}>
                        <Text style={styles.heroTitle}>Draft a Follow-up</Text>
                        {contact ? (
                            <Text style={styles.heroSubtitle}>
                                Personalized message for{' '}
                                <Text style={styles.heroContactName}>{contact.displayName}</Text>
                            </Text>
                        ) : (
                            <Text style={styles.heroSubtitle}>Loading contact...</Text>
                        )}
                    </View>
                </View>
                {/* ── Floating Contact Context Card ── */}
                {contact && (
                    <View style={styles.contextCard}>
                        <View style={styles.contextAvatar}>
                            <Text style={styles.contextAvatarText}>
                                {getInitials(contact.displayName)}
                            </Text>
                        </View>
                        <View style={styles.contextInfo}>
                            <Text style={styles.contextName}>{contact.displayName}</Text>
                            {contact.jobTitle && (
                                <Text style={styles.contextRole} numberOfLines={1}>
                                    {contact.jobTitle}{contact.company ? ` · ${contact.company}` : ''}
                                </Text>
                            )}
                        </View>
                        <View style={[styles.channelPill, { backgroundColor: activeChannel.bg }]}>
                            <Feather name={activeChannel.icon as any} size={13} color={activeChannel.color} />
                            <Text style={[styles.channelPillText, { color: activeChannel.color }]}>
                                {activeChannel.label}
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── Channel Selector ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CHANNEL</Text>
                    <View style={styles.channelRow}>
                        {channels.map((ch) => {
                            const isActive = selectedChannel === ch.value;
                            return (
                                <TouchableOpacity
                                    key={ch.value}
                                    style={[
                                        styles.channelBtn,
                                        isActive && { backgroundColor: ch.bg, borderColor: ch.color },
                                    ]}
                                    onPress={() => setSelectedChannel(ch.value)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[
                                        styles.channelIconCircle,
                                        { backgroundColor: isActive ? ch.color : colors.neutral[100] },
                                    ]}>
                                        <Feather
                                            name={ch.icon as any}
                                            size={15}
                                            color={isActive ? '#FFFFFF' : colors.neutral[500]}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.channelBtnLabel,
                                        isActive && { color: ch.color, fontWeight: typography.fontWeight.bold },
                                    ]}>
                                        {ch.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── Tone Selector ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>TONE</Text>
                    <View style={styles.toneRow}>
                        {tones.map((tone) => {
                            const isActive = selectedTone === tone.value;
                            return (
                                <TouchableOpacity
                                    key={tone.value}
                                    style={[styles.toneCard, isActive && styles.toneCardActive]}
                                    onPress={() => setSelectedTone(tone.value)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[
                                        styles.toneIconBox,
                                        isActive && styles.toneIconBoxActive,
                                    ]}>
                                        <Feather
                                            name={tone.icon as any}
                                            size={18}
                                            color={isActive ? '#FFFFFF' : colors.neutral[400]}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.toneName, isActive && styles.toneNameActive]}>
                                            {tone.label}
                                        </Text>
                                        <Text style={styles.toneDesc}>{tone.desc}</Text>
                                    </View>
                                    {isActive && (
                                        <View style={styles.toneCheckmark}>
                                            <Feather name="check" size={12} color="#FFFFFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── Generate Button ── */}
                {!generatedMessage && (
                    <TouchableOpacity
                        style={[styles.generateBtn, isGenerating && styles.generateBtnLoading]}
                        onPress={handleGenerate}
                        activeOpacity={0.88}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={styles.generateBtnText}>Generating message...</Text>
                            </>
                        ) : (
                            <>
                                <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FFFFFF" />
                                <Text style={styles.generateBtnText}>Generate Message</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* ── Generated Message Card ── */}
                {generatedMessage ? (
                    <View style={styles.messageSection}>
                        {/* message section label row */}
                        <View style={styles.messageSectionHeader}>
                            <Text style={styles.sectionTitle}>YOUR MESSAGE</Text>
                            <TouchableOpacity
                                style={styles.regenerateBtn}
                                onPress={() => {
                                    setGeneratedMessage('');
                                    setIsEditing(false);
                                }}
                                activeOpacity={0.7}
                            >
                                <Feather name="refresh-cw" size={13} color={colors.blue[500]} />
                                <Text style={styles.regenerateBtnText}>Regenerate</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Message card */}
                        <View style={styles.messageCard}>
                            <View style={styles.messageCardAccent} />
                            <View style={styles.messageCardBody}>
                                <TextInput
                                    style={styles.messageInput}
                                    value={generatedMessage}
                                    onChangeText={setGeneratedMessage}
                                    multiline
                                    editable={isEditing}
                                    placeholderTextColor={colors.neutral[400]}
                                />
                            </View>
                        </View>

                        {/* Action buttons */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.actionBtnOutline}
                                onPress={handleCopy}
                                activeOpacity={0.8}
                            >
                                <Feather name="copy" size={15} color={colors.blue[500]} />
                                <Text style={styles.actionBtnOutlineText}>Copy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionBtnFilled}
                                onPress={handleShare}
                                activeOpacity={0.88}
                            >
                                <Feather name="share-2" size={15} color="#FFFFFF" />
                                <Text style={styles.actionBtnFilledText}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {/* ── Disclaimer ── */}
                <View style={styles.disclaimer}>
                    <View style={styles.disclaimerIconBox}>
                        <Feather name="info" size={12} color={colors.neutral[400]} />
                    </View>
                    <Text style={styles.disclaimerText}>
                        AI-generated content. Review and personalize before sending.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },

    // ── Hero ──
    hero: {
        backgroundColor: colors.blue[500],
        overflow: 'hidden',
        position: 'relative',
        paddingBottom: 52,
    },
    decorCircle1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    heroNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    navIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    heroBadgeText: {
        fontSize: 13,
        fontWeight: typography.fontWeight.semibold,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    heroBody: {
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
    },
    heroTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        marginBottom: 6,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    heroContactName: {
        color: 'rgba(255,255,255,0.95)',
        fontWeight: typography.fontWeight.bold,
    },

    // ── Scroll ──
    scrollView: { flex: 1 },
    scrollContent: {
        paddingBottom: spacing['4xl'],
        flexGrow: 1,
    },

    // ── Context Card ──
    contextCard: {
        marginHorizontal: spacing.lg,
        marginTop: -28,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        ...shadows.md,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    contextAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.blue[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    contextAvatarText: {
        fontSize: 16,
        fontWeight: typography.fontWeight.bold,
        color: colors.blue[600],
    },
    contextInfo: {
        flex: 1,
    },
    contextName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: 2,
    },
    contextRole: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
    },
    channelPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
    },
    channelPillText: {
        fontSize: 12,
        fontWeight: typography.fontWeight.semibold,
    },

    // ── Sections ──
    section: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[500],
        letterSpacing: 1.2,
        marginBottom: spacing.md,
        marginLeft: 2,
    },

    // ── Channel Selector ──
    channelRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    channelBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
        borderRadius: borderRadius.xl,
        borderWidth: 1.5,
        borderColor: colors.border.light,
        backgroundColor: colors.background.secondary,
        gap: 8,
        ...shadows.sm,
    },
    channelIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    channelBtnLabel: {
        fontSize: 12,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral[500],
    },

    // ── Tone Selector ──
    toneRow: {
        gap: spacing.sm,
    },
    toneCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.base,
        borderWidth: 1.5,
        borderColor: colors.border.light,
        gap: spacing.md,
        ...shadows.sm,
    },
    toneCardActive: {
        borderColor: colors.blue[400],
        backgroundColor: colors.blue[50],
    },
    toneIconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    toneIconBoxActive: {
        backgroundColor: colors.blue[500],
    },
    toneName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[700],
        marginBottom: 2,
    },
    toneNameActive: {
        color: colors.blue[700],
    },
    toneDesc: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
    },
    toneCheckmark: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Generate Button ──
    generateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.blue[500],
        marginHorizontal: spacing.lg,
        marginTop: spacing.xl,
        paddingVertical: spacing.base + 2,
        borderRadius: borderRadius.xl,
        shadowColor: colors.blue[500],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 5,
    },
    generateBtnLoading: {
        opacity: 0.8,
    },
    generateBtnText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },

    // ── Generated Message ──
    messageSection: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    messageSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    regenerateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: colors.blue[50],
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.blue[100],
    },
    regenerateBtnText: {
        fontSize: 12,
        fontWeight: typography.fontWeight.semibold,
        color: colors.blue[500],
    },
    messageCard: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border.light,
        flexDirection: 'row',
        overflow: 'hidden',
        ...shadows.sm,
    },
    messageCardAccent: {
        width: 4,
        backgroundColor: colors.blue[500],
    },
    messageCardBody: {
        flex: 1,
        padding: spacing.lg,
    },
    messageInput: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[800],
        lineHeight: 24,
        minHeight: 180,
        textAlignVertical: 'top',
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    actionBtnOutline: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingVertical: spacing.base,
        borderRadius: borderRadius.xl,
        borderWidth: 1.5,
        borderColor: colors.blue[300],
        backgroundColor: colors.blue[50],
    },
    actionBtnOutlineText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.blue[500],
    },
    actionBtnFilled: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingVertical: spacing.base,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.blue[500],
        shadowColor: colors.blue[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    actionBtnFilledText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },

    // ── Disclaimer ──
    disclaimer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        marginTop: spacing.xl,
        paddingHorizontal: spacing.xl,
    },
    disclaimerIconBox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    disclaimerText: {
        flex: 1,
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
        lineHeight: 18,
    },
});

export default AIFollowUpScreen;
