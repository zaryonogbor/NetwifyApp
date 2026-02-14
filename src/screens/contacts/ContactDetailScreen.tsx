import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    TextInput,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../config/firebase';
import { Card, Avatar, Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Contact } from '../../types';

interface Props {
    navigation: any;
    route: { params: { contactId: string } };
}

export const ContactDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { contactId } = route.params;
    const [contact, setContact] = useState<Contact | null>(null);
    const [notes, setNotes] = useState('');
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [isSummaryDisabled, setIsSummaryDisabled] = useState(false);

    useEffect(() => {
        fetchContact();
    }, [contactId]);

    const fetchContact = async () => {
        try {
            const contactDoc = await getDoc(doc(db, 'contacts', contactId));
            if (contactDoc.exists()) {
                const data = contactDoc.data() as Contact;
                setContact({ ...data, id: contactDoc.id });
                setNotes(data.notes || '');
            }
        } catch (error) {
            console.error('Error fetching contact:', error);
            Alert.alert('Error', 'Failed to load contact details');
        }
    };

    const handleSaveNotes = async () => {
        if (!contact) return;
        try {
            await updateDoc(doc(db, 'contacts', contactId), { notes });
            setIsEditingNotes(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to save notes');
        }
    };

    const handleGenerateSummary = async () => {
        setLoadingSummary(true);
        try {
            const generateSummaryManual = httpsCallable(functions, 'generateSummaryManual');
            const result = await generateSummaryManual({ contactId });

            const { summary } = result.data as { summary: string };

            setContact(prev => prev ? { ...prev, aiSummary: summary } : null);
            Alert.alert('Success', 'AI Summary generated successfully!');
        } catch (error) {
            console.error('Error generating summary:', error);
            Alert.alert('Error', 'Failed to generate summary. Please try again later.');
        } finally {
            setLoadingSummary(false);
        }
    };

    const openLink = async (url: string) => {
        try {
            await Linking.openURL(url);
        } catch {
            Alert.alert('Error', 'Could not open link');
        }
    };

    const handleCall = () => {
        if (contact?.phone) {
            Linking.openURL(`tel:${contact.phone}`);
        }
    };

    const handleEmail = () => {
        if (contact?.email) {
            Linking.openURL(`mailto:${contact.email}`);
        }
    };

    if (!contact) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading connection...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.primary[600]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contact Detail</Text>
                <TouchableOpacity style={styles.moreButton}>
                    <Feather name="more-vertical" size={24} color={colors.primary[600]} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Section */}
                <View style={styles.profileWrapper}>
                    <View style={styles.avatarOverlap}>
                        <Avatar
                            source={contact.photoURL}
                            name={contact.displayName}
                            size="xl"
                            style={styles.avatarBorder}
                        />
                    </View>
                    <Card variant="elevated" style={styles.profileCard}>
                        <View style={{ height: 40 }} />
                        <Text style={styles.profileName}>{contact.displayName}</Text>
                        <Text style={styles.profileRole}>
                            {contact.jobTitle}
                        </Text>
                        {contact.company && (
                            <Text style={styles.profileCompany}>{contact.company}</Text>
                        )}

                        {/* Quick Actions */}
                        <View style={styles.quickActions}>
                            {contact.phone && (
                                <TouchableOpacity style={styles.quickAction} onPress={handleCall}>
                                    <View style={styles.quickActionIcon}>
                                        <Feather name="phone" size={20} color={colors.accent[500]} />
                                    </View>
                                    <Text style={styles.quickActionLabel}>Call</Text>
                                </TouchableOpacity>
                            )}
                            {contact.email && (
                                <TouchableOpacity style={styles.quickAction} onPress={handleEmail}>
                                    <View style={styles.quickActionIcon}>
                                        <Feather name="mail" size={20} color={colors.accent[500]} />
                                    </View>
                                    <Text style={styles.quickActionLabel}>Email</Text>
                                </TouchableOpacity>
                            )}
                            {contact.linkedIn && (
                                <TouchableOpacity
                                    style={styles.quickAction}
                                    onPress={() => openLink(`https://${contact.linkedIn}`)}
                                >
                                    <View style={styles.quickActionIcon}>
                                        <Feather name="linkedin" size={20} color={colors.accent[500]} />
                                    </View>
                                    <Text style={styles.quickActionLabel}>LinkedIn</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Card>
                </View>

                {/* AI Summary Section */}
                {!isSummaryDisabled && (
                    <Card style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.aiLabel}>
                                <Feather name="zap" size={14} color={colors.accent[500]} />
                                <Text style={styles.aiLabelText}>AI SUMMARY</Text>
                            </View>
                            {contact.aiSummary && (
                                <View style={styles.aiHeaderActions}>
                                    <TouchableOpacity
                                        onPress={handleGenerateSummary}
                                        disabled={loadingSummary}
                                        style={styles.aiHeaderButton}
                                    >
                                        <Feather name="refresh-cw" size={14} color={colors.primary[400]} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setIsSummaryDisabled(true)}
                                        style={styles.aiHeaderButton}
                                    >
                                        <Feather name="eye-off" size={14} color={colors.primary[400]} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {contact.aiSummary ? (
                            <Text style={styles.summaryText}>{contact.aiSummary}</Text>
                        ) : (
                            <View style={styles.noSummary}>
                                <Text style={styles.noSummaryText}>
                                    No AI summary yet. Insights will appear here once generated.
                                </Text>
                                <Button
                                    title={loadingSummary ? 'Generating...' : 'Generate AI Summary'}
                                    onPress={handleGenerateSummary}
                                    variant="secondary"
                                    size="sm"
                                    loading={loadingSummary}
                                    icon={<Feather name="zap" size={14} color={colors.accent[500]} />}
                                    style={styles.aiButton}
                                />
                            </View>
                        )}
                    </Card>
                )}

                {isSummaryDisabled && (
                    <TouchableOpacity
                        style={styles.enableSummaryButton}
                        onPress={() => setIsSummaryDisabled(false)}
                    >
                        <Feather name="zap" size={14} color={colors.accent[500]} />
                        <Text style={styles.enableSummaryText}>Show AI Summary</Text>
                    </TouchableOpacity>
                )}

                {/* AI Follow-up Section */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.aiLabel}>
                            <Feather name="message-square" size={14} color={colors.accent[500]} />
                            <Text style={styles.aiLabelText}>AI FOLLOW-UP</Text>
                        </View>
                    </View>
                    <Text style={styles.followUpDescription}>
                        Draft a personalized follow-up message instantly based on your meeting context.
                    </Text>
                    <Button
                        title="Draft Follow-up Message"
                        onPress={() => navigation.navigate('AIFollowUp', { contactId })}
                        variant="outline"
                        size="sm"
                        style={styles.followUpButton}
                        icon={<Feather name="edit-3" size={14} color={colors.primary[600]} />}
                    />
                </Card>

                {/* Personal Notes Section */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>PERSONAL NOTES</Text>
                        {!isEditingNotes && (
                            <TouchableOpacity onPress={() => setIsEditingNotes(true)} style={styles.editNotesButton}>
                                <Feather name="edit-2" size={16} color={colors.primary[600]} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {isEditingNotes ? (
                        <View>
                            <TextInput
                                style={styles.notesInput}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Add context, where you met, or discussion points..."
                                placeholderTextColor={colors.text.tertiary}
                                multiline
                                numberOfLines={4}
                            />
                            <View style={styles.notesActions}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setNotes(contact.notes || '');
                                        setIsEditingNotes(false);
                                    }}
                                    style={styles.cancelNotes}
                                >
                                    <Text style={styles.cancelNotesText}>Cancel</Text>
                                </TouchableOpacity>
                                <Button
                                    title="Save Notes"
                                    onPress={handleSaveNotes}
                                    size="sm"
                                    style={styles.saveNotesButton}
                                />
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.notesText}>
                            {notes || 'Add personal notes about this contact to help the AI generate better summaries.'}
                        </Text>
                    )}
                </Card>

                {/* Contact Info Details */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>

                    {contact.email && (
                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Feather name="mail" size={16} color={colors.primary[400]} />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Email</Text>
                                <Text style={styles.infoValue}>{contact.email}</Text>
                            </View>
                        </View>
                    )}

                    {contact.phone && (
                        <View style={styles.infoItem}>
                            <View style={styles.infoIcon}>
                                <Feather name="phone" size={16} color={colors.primary[400]} />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Phone</Text>
                                <Text style={styles.infoValue}>{contact.phone}</Text>
                            </View>
                        </View>
                    )}

                    {contact.linkedIn && (
                        <TouchableOpacity
                            style={styles.infoItem}
                            onPress={() => openLink(`https://${contact.linkedIn}`)}
                        >
                            <View style={styles.infoIcon}>
                                <Feather name="linkedin" size={16} color={colors.primary[400]} />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>LinkedIn</Text>
                                <Text style={[styles.infoValue, { color: colors.accent[500] }]}>
                                    {contact.linkedIn}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                            <Feather name="calendar" size={16} color={colors.primary[400]} />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Connected On</Text>
                            <Text style={styles.infoValue}>
                                {new Date(contact.connectedAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: colors.text.secondary,
        fontSize: typography.fontSize.base,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600],
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    moreButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['4xl'],
    },
    profileWrapper: {
        alignItems: 'center',
        marginTop: spacing['2xl'],
        marginBottom: spacing.xl,
    },
    avatarOverlap: {
        zIndex: 1,
        marginBottom: -40,
        ...shadows.lg,
    },
    avatarBorder: {
        borderWidth: 4,
        borderColor: colors.background.primary,
    },
    profileCard: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.xl,
        ...shadows.lg,
    },
    profileName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
        marginBottom: spacing.xs,
    },
    profileRole: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.accent[500],
        marginBottom: spacing.xs,
    },
    profileCompany: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[200],
        marginBottom: spacing.lg,
    },
    quickActions: {
        flexDirection: 'row',
        gap: spacing['2xl'],
        marginTop: spacing.md,
    },
    quickAction: {
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    quickActionLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.inverse,
        fontWeight: typography.fontWeight.medium,
    },
    section: {
        marginBottom: spacing.lg,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background.secondary,
        ...shadows.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[400],
        letterSpacing: 1.2,
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
        letterSpacing: 1,
    },
    summaryText: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        lineHeight: 24,
    },
    noSummary: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    noSummaryText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    aiButton: {
        marginTop: spacing.lg,
        borderColor: colors.accent[500],
        borderRadius: borderRadius.md,
    },
    aiHeaderActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    aiHeaderButton: {
        padding: spacing.xs,
    },
    enableSummaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        marginBottom: spacing.lg,
    },
    enableSummaryText: {
        fontSize: typography.fontSize.sm,
        color: colors.accent[500],
        fontWeight: typography.fontWeight.semibold,
    },
    followUpDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    followUpButton: {
        marginTop: spacing.sm,
    },
    editNotesButton: {
        padding: spacing.xs,
    },
    notesInput: {
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        minHeight: 120,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    notesActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: spacing.lg,
        marginTop: spacing.md,
    },
    cancelNotes: {
        padding: spacing.sm,
    },
    cancelNotesText: {
        color: colors.text.secondary,
        fontWeight: typography.fontWeight.medium,
    },
    saveNotesButton: {
        width: 120,
    },
    notesText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        gap: spacing.lg,
    },
    infoIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    infoLabel: {
        fontSize: 11,
        color: colors.text.tertiary,
        fontWeight: typography.fontWeight.medium,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        fontWeight: typography.fontWeight.medium,
    },
});

export default ContactDetailScreen;
