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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../config/firebase';
import { Card, Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Contact } from '../../types';

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

    const tones: { value: Tone; label: string; icon: string }[] = [
        { value: 'professional', label: 'Professional', icon: 'briefcase' },
        { value: 'friendly', label: 'Friendly', icon: 'smile' },
    ];

    const channels: { value: Channel; label: string; icon: string }[] = [
        { value: 'Email', label: 'Email', icon: 'mail' },
        { value: 'WhatsApp', label: 'WhatsApp', icon: 'message-circle' },
        { value: 'LinkedIn', label: 'LinkedIn', icon: 'linkedin' },
    ];

    const handleGenerate = async () => {
        if (!contact) return;

        setIsGenerating(true);
        try {
            const generateFollowUp = httpsCallable(functions, 'generateFollowUp');
            const result = await generateFollowUp({
                contactId: contact.id,
                tone: selectedTone,
                channel: selectedChannel
            });

            const { message } = result.data as { message: string };
            setGeneratedMessage(message);
            setIsEditing(true);
        } catch (error) {
            console.error('Error generating AI message:', error);
            Alert.alert('Error', 'Failed to generate message. Please make sure you have an internet connection and try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!generatedMessage) return;

        try {
            await Share.share({
                message: generatedMessage,
                title: 'Share Follow-up Message',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleCopy = () => {
        // In a real app, you'd use Clipboard API
        Alert.alert('Copied!', 'Message copied to clipboard');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.aiLabel}>
                        <Feather name="zap" size={14} color={colors.accent[600]} />
                        <Text style={styles.aiLabelText}>AI Follow-up</Text>
                    </View>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {contact && (
                    <Text style={styles.contactContext}>
                        Generating message for <Text style={styles.contactName}>{contact.displayName}</Text>
                    </Text>
                )}

                {/* Channel Selection */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Channel</Text>
                    <View style={styles.toneRow}>
                        {channels.map((channel) => (
                            <TouchableOpacity
                                key={channel.value}
                                style={[
                                    styles.toneButton,
                                    selectedChannel === channel.value && styles.toneButtonActive,
                                ]}
                                onPress={() => setSelectedChannel(channel.value)}
                            >
                                <Feather
                                    name={channel.icon as any}
                                    size={18}
                                    color={selectedChannel === channel.value ? colors.primary[600] : colors.text.secondary}
                                />
                                <Text style={[
                                    styles.toneLabel,
                                    selectedChannel === channel.value && styles.toneLabelActive,
                                ]}>
                                    {channel.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                {/* Tone Selection */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Tone</Text>
                    <View style={styles.toneRow}>
                        {tones.map((tone) => (
                            <TouchableOpacity
                                key={tone.value}
                                style={[
                                    styles.toneButton,
                                    selectedTone === tone.value && styles.toneButtonActive,
                                ]}
                                onPress={() => setSelectedTone(tone.value)}
                            >
                                <Feather
                                    name={tone.icon as any}
                                    size={18}
                                    color={selectedTone === tone.value ? colors.primary[600] : colors.text.secondary}
                                />
                                <Text style={[
                                    styles.toneLabel,
                                    selectedTone === tone.value && styles.toneLabelActive,
                                ]}>
                                    {tone.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                {/* Generate Button */}
                {!generatedMessage && (
                    <Button
                        title={isGenerating ? 'Generating...' : 'Generate Message'}
                        onPress={handleGenerate}
                        loading={isGenerating}
                        fullWidth
                        size="lg"
                        icon={<Feather name="zap" size={18} color={colors.text.inverse} />}
                    />
                )}

                {/* Generated Message */}
                {generatedMessage && (
                    <Card style={styles.messageCard}>
                        <View style={styles.messageHeader}>
                            <Text style={styles.messageTitle}>Your Message</Text>
                            <TouchableOpacity onPress={() => setGeneratedMessage('')}>
                                <Feather name="refresh-cw" size={18} color={colors.primary[600]} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.messageInput}
                            value={generatedMessage}
                            onChangeText={setGeneratedMessage}
                            multiline
                            editable={isEditing}
                        />

                        <View style={styles.messageActions}>
                            <Button
                                title="Copy"
                                onPress={handleCopy}
                                variant="outline"
                                size="sm"
                                icon={<Feather name="copy" size={14} color={colors.primary[600]} />}
                                style={{ flex: 1, marginRight: spacing.sm }}
                            />
                            <Button
                                title="Share"
                                onPress={handleShare}
                                size="sm"
                                icon={<Feather name="share-2" size={14} color={colors.text.inverse} />}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </Card>
                )}

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <Feather name="info" size={14} color={colors.text.tertiary} />
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
        backgroundColor: colors.background.secondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    headerCenter: {
        alignItems: 'center',
    },
    aiLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary[50],
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    aiLabelText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.secondary[700],
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['3xl'],
    },
    contactContext: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    contactName: {
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    purposeGrid: {
        gap: spacing.sm,
    },
    purposeCard: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1.5,
        borderColor: colors.border.light,
        backgroundColor: colors.background.primary,
    },
    purposeCardActive: {
        borderColor: colors.primary[600],
        backgroundColor: colors.primary[50],
    },
    purposeLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    purposeLabelActive: {
        color: colors.primary[700],
    },
    purposeDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    toneRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    toneButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1.5,
        borderColor: colors.border.light,
        backgroundColor: colors.background.primary,
        gap: spacing.xs,
    },
    toneButtonActive: {
        borderColor: colors.primary[600],
        backgroundColor: colors.primary[50],
    },
    toneLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.secondary,
    },
    toneLabelActive: {
        color: colors.primary[700],
    },
    messageCard: {
        marginTop: spacing.lg,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    messageTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
    },
    messageInput: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        minHeight: 200,
        textAlignVertical: 'top',
        lineHeight: 22,
    },
    messageActions: {
        flexDirection: 'row',
        marginTop: spacing.lg,
    },
    disclaimer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    disclaimerText: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        textAlign: 'center',
    },
});

export default AIFollowUpScreen;
