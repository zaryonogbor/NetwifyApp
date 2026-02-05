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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Card, Avatar, Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
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
            // This would call a Firebase Cloud Function
            // For now, simulate a delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockSummary = `${contact?.displayName} is a ${contact?.jobTitle} at ${contact?.company}. Connected at a networking event.`;

            await updateDoc(doc(db, 'contacts', contactId), { aiSummary: mockSummary });
            setContact(prev => prev ? { ...prev, aiSummary: mockSummary } : null);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate summary');
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
                    <Text>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contact</Text>
                <TouchableOpacity>
                    <Feather name="more-vertical" size={24} color={colors.text.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <Card variant="elevated" style={styles.profileCard}>
                    <Avatar
                        source={contact.photoURL}
                        name={contact.displayName}
                        size="xl"
                    />
                    <Text style={styles.profileName}>{contact.displayName}</Text>
                    <Text style={styles.profileRole}>
                        {contact.jobTitle}
                        {contact.company && ` at ${contact.company}`}
                    </Text>

                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        {contact.phone && (
                            <TouchableOpacity style={styles.quickAction} onPress={handleCall}>
                                <View style={styles.quickActionIcon}>
                                    <Feather name="phone" size={20} color={colors.primary[600]} />
                                </View>
                                <Text style={styles.quickActionLabel}>Call</Text>
                            </TouchableOpacity>
                        )}
                        {contact.email && (
                            <TouchableOpacity style={styles.quickAction} onPress={handleEmail}>
                                <View style={styles.quickActionIcon}>
                                    <Feather name="mail" size={20} color={colors.primary[600]} />
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
                                    <Feather name="linkedin" size={20} color={colors.primary[600]} />
                                </View>
                                <Text style={styles.quickActionLabel}>LinkedIn</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Card>

                {/* AI Summary */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.aiLabel}>
                            <Feather name="zap" size={14} color={colors.accent[600]} />
                            <Text style={styles.aiLabelText}>AI Summary</Text>
                        </View>
                    </View>

                    {contact.aiSummary ? (
                        <Text style={styles.summaryText}>{contact.aiSummary}</Text>
                    ) : (
                        <View style={styles.noSummary}>
                            <Text style={styles.noSummaryText}>
                                No AI summary yet. Generate one to get quick insights about this contact.
                            </Text>
                            <Button
                                title={loadingSummary ? 'Generating...' : 'Generate Summary'}
                                onPress={handleGenerateSummary}
                                variant="secondary"
                                size="sm"
                                loading={loadingSummary}
                                icon={<Feather name="zap" size={14} color={colors.accent[600]} />}
                                style={{ marginTop: spacing.md }}
                            />
                        </View>
                    )}
                </Card>

                {/* AI Follow-up */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.aiLabel}>
                            <Feather name="zap" size={14} color={colors.accent[600]} />
                            <Text style={styles.aiLabelText}>AI Follow-up</Text>
                        </View>
                    </View>
                    <Text style={styles.followUpDescription}>
                        Generate a personalized follow-up message based on your connection.
                    </Text>
                    <Button
                        title="Generate Follow-up Message"
                        onPress={() => navigation.navigate('AIFollowUp', { contactId })}
                        variant="outline"
                        size="sm"
                        icon={<Feather name="edit-3" size={14} color={colors.primary[600]} />}
                        style={{ marginTop: spacing.md }}
                    />
                </Card>

                {/* Contact Info */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    {contact.email && (
                        <View style={styles.infoItem}>
                            <Feather name="mail" size={18} color={colors.text.tertiary} />
                            <Text style={styles.infoValue}>{contact.email}</Text>
                        </View>
                    )}

                    {contact.phone && (
                        <View style={styles.infoItem}>
                            <Feather name="phone" size={18} color={colors.text.tertiary} />
                            <Text style={styles.infoValue}>{contact.phone}</Text>
                        </View>
                    )}

                    {contact.company && (
                        <View style={styles.infoItem}>
                            <Feather name="briefcase" size={18} color={colors.text.tertiary} />
                            <Text style={styles.infoValue}>{contact.company}</Text>
                        </View>
                    )}

                    {contact.linkedIn && (
                        <TouchableOpacity
                            style={styles.infoItem}
                            onPress={() => openLink(`https://${contact.linkedIn}`)}
                        >
                            <Feather name="linkedin" size={18} color={colors.text.tertiary} />
                            <Text style={[styles.infoValue, { color: colors.primary[600] }]}>
                                {contact.linkedIn}
                            </Text>
                        </TouchableOpacity>
                    )}
                </Card>

                {/* Personal Notes */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Notes</Text>
                        {!isEditingNotes && (
                            <TouchableOpacity onPress={() => setIsEditingNotes(true)}>
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
                                placeholder="Add notes about this contact..."
                                placeholderTextColor={colors.text.tertiary}
                                multiline
                                numberOfLines={4}
                            />
                            <View style={styles.notesActions}>
                                <Button
                                    title="Cancel"
                                    onPress={() => {
                                        setNotes(contact.notes || '');
                                        setIsEditingNotes(false);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                />
                                <Button
                                    title="Save"
                                    onPress={handleSaveNotes}
                                    size="sm"
                                />
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.notesText}>
                            {notes || 'No notes yet. Tap the edit icon to add notes about this contact.'}
                        </Text>
                    )}
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['3xl'],
    },
    profileCard: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
        marginBottom: spacing.lg,
    },
    profileName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginTop: spacing.md,
    },
    profileRole: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    quickActions: {
        flexDirection: 'row',
        marginTop: spacing.xl,
        gap: spacing['2xl'],
    },
    quickAction: {
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    quickActionLabel: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
    },
    aiLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent[50],
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        gap: 4,
    },
    aiLabelText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.accent[700],
    },
    summaryText: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        lineHeight: 22,
    },
    noSummary: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    noSummaryText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    followUpDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        lineHeight: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.md,
    },
    infoValue: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    notesInput: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    notesActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    notesText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        lineHeight: 22,
        fontStyle: 'italic',
    },
});

export default ContactDetailScreen;
