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
    Image,
    Dimensions,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useNetInfo } from '@react-native-community/netinfo';
import { db, functions } from '../../config/firebase';
import { Avatar } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Contact } from '../../types';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 280;

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
    const [showOptions, setShowOptions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const netInfo = useNetInfo();
    const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

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
            Alert.alert('Saved', 'Your notes have been updated.');
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
        if (contact?.phone) Linking.openURL(`tel:${contact.phone}`);
    };

    const handleEmail = () => {
        if (contact?.email) Linking.openURL(`mailto:${contact.email}`);
    };

    const handleRemoveContact = () => {
        setShowOptions(false);
        setShowDeleteConfirm(true);
    };

    const confirmDeletion = async () => {
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'contacts', contactId));
            setShowDeleteConfirm(false);
            navigation.goBack();
        } catch (error) {
            console.error('Error removing contact:', error);
            Alert.alert('Error', 'Failed to remove contact. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const getInitials = (name?: string): string => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    if (!contact) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={colors.blue[500]} />
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingSpinner}>
                        <Feather name="user" size={28} color={colors.blue[400]} />
                    </View>
                    <Text style={styles.loadingText}>Loading contact...</Text>
                    <Text style={styles.loadingSubtext}>Just a moment</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.blue[500]} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Blue Hero Header ── */}
                <View style={styles.hero}>
                    {/* Decorative circles */}
                    <View style={styles.decorCircle1} />
                    <View style={styles.decorCircle2} />
                    <View style={styles.decorCircle3} />

                    {/* Back button */}
                    <SafeAreaView edges={['top']} style={styles.heroNav}>
                        <TouchableOpacity
                            style={styles.navIconBtn}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>
                        <Text style={styles.heroNavTitle}>Contact</Text>
                        <TouchableOpacity
                            style={styles.navIconBtn}
                            onPress={() => setShowOptions(true)}
                            activeOpacity={0.8}
                        >
                            <Feather name="more-horizontal" size={22} color="rgba(255,255,255,0.9)" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    {/* Avatar */}
                    <View style={styles.avatarRing}>
                        {contact.photoURL ? (
                            <Image source={{ uri: contact.photoURL }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>
                                    {getInitials(contact.displayName)}
                                </Text>
                            </View>
                        )}
                        {/* Verified badge */}
                        <View style={styles.verifiedBadge}>
                            <Feather name="check" size={10} color="#FFFFFF" />
                        </View>
                    </View>

                    {/* Name & Role */}
                    <Text style={styles.heroName}>{contact.displayName}</Text>
                    {contact.jobTitle && (
                        <Text style={styles.heroRole}>
                            {contact.jobTitle}{contact.company ? ` · ${contact.company}` : ''}
                        </Text>
                    )}
                </View>

                {/* ── Floating Quick Action Card ── */}
                <View style={styles.actionCard}>
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={handleCall}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIconCircle, { backgroundColor: colors.blue[50] }]}>
                            <Feather name="phone" size={18} color={colors.blue[500]} />
                        </View>
                        <Text style={styles.actionLabel}>Call</Text>
                    </TouchableOpacity>

                    <View style={styles.actionDivider} />

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={handleEmail}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIconCircle, { backgroundColor: '#FFF3F0' }]}>
                            <Feather name="mail" size={18} color={colors.accent[500]} />
                        </View>
                        <Text style={styles.actionLabel}>Email</Text>
                    </TouchableOpacity>

                    <View style={styles.actionDivider} />

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => contact.linkedIn && openLink(`https://${contact.linkedIn}`)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIconCircle, { backgroundColor: '#E8F0FE' }]}>
                            <Feather name="linkedin" size={18} color="#0077B5" />
                        </View>
                        <Text style={styles.actionLabel}>LinkedIn</Text>
                    </TouchableOpacity>

                    <View style={styles.actionDivider} />

                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => navigation.navigate('AIFollowUp', { contactId })}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.actionIconCircle, { backgroundColor: colors.secondary[100] }]}>
                            <MaterialCommunityIcons name="lightning-bolt" size={18} color={colors.secondary[600]} />
                        </View>
                        <Text style={styles.actionLabel}>Follow-up</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Connected date chip ── */}
                <View style={styles.connectedChipRow}>
                    <View style={styles.connectedChip}>
                        <Feather name="clock" size={12} color={colors.neutral[500]} />
                        <Text style={styles.connectedChipText}>
                            Connected{' '}
                            {new Date(contact.connectedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </Text>
                    </View>
                </View>

                {/* ── AI Smart Insight ── */}
                {!isSummaryDisabled && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleRow}>
                                <View style={styles.aiBadge}>
                                    <Feather name="zap" size={11} color={colors.secondary[700]} />
                                    <Text style={styles.aiBadgeText}>AI INSIGHT</Text>
                                </View>
                            </View>
                            {contact.aiSummary && (
                                <View style={styles.aiIconRow}>
                                    <TouchableOpacity
                                        onPress={handleGenerateSummary}
                                        style={styles.iconBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Feather name="refresh-cw" size={14} color={colors.blue[500]} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setIsSummaryDisabled(true)}
                                        style={styles.iconBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Feather name="eye-off" size={14} color={colors.neutral[400]} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {contact.aiSummary ? (
                            <View style={styles.card}>
                                <View style={styles.bioAccent} />
                                <View style={styles.bioContentWrapper}>
                                    <MaterialCommunityIcons
                                        name="format-quote-open"
                                        size={20}
                                        color={colors.blue[200]}
                                        style={{ marginBottom: 4 }}
                                    />
                                    <Text style={styles.insightText}>{contact.aiSummary}</Text>
                                    <TouchableOpacity
                                        style={styles.followUpLink}
                                        onPress={() => navigation.navigate('AIFollowUp', { contactId })}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.followUpLinkText}>Draft personalized follow-up</Text>
                                        <Feather name="arrow-right" size={13} color={colors.blue[500]} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.generateAiEmpty}
                                onPress={handleGenerateSummary}
                                activeOpacity={0.8}
                            >
                                <View style={styles.generateAiIconCircle}>
                                    <Feather name="zap" size={20} color={colors.secondary[600]} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.generateAiTitle}>Generate AI Insight</Text>
                                    <Text style={styles.generateAiSubtitle}>
                                        Get a professional summary about this contact
                                    </Text>
                                </View>
                                <Feather name="chevron-right" size={16} color={colors.neutral[400]} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {isSummaryDisabled && (
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.restoreAiBtn}
                            onPress={() => setIsSummaryDisabled(false)}
                            activeOpacity={0.7}
                        >
                            <Feather name="zap" size={14} color={colors.secondary[600]} />
                            <Text style={styles.restoreAiText}>Show AI Summary</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Professional Info ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROFESSIONAL INFO</Text>
                    <View style={styles.cardPlain}>
                        <InfoRow
                            icon="at-sign"
                            label="Email"
                            value={contact.email || 'Not provided'}
                            isLast={false}
                        />
                        <InfoRow
                            icon="phone"
                            label="Phone"
                            value={contact.phone || 'Not provided'}
                            isLast={false}
                        />
                        <InfoRow
                            icon="briefcase"
                            label="Bio"
                            value={contact.bio || 'Professional networker'}
                            isLast={true}
                        />
                    </View>
                </View>

                {/* ── Personal Notes ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>PERSONAL NOTES</Text>
                        {!isEditingNotes && (
                            <TouchableOpacity
                                onPress={() => setIsEditingNotes(true)}
                                style={styles.editNoteBtn}
                                activeOpacity={0.7}
                            >
                                <Feather name="edit-3" size={13} color={colors.blue[500]} />
                                <Text style={styles.editNoteBtnText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.notesCard}>
                        {isEditingNotes ? (
                            <View>
                                <TextInput
                                    style={styles.notesInput}
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="Add thoughts about this connection..."
                                    placeholderTextColor={colors.neutral[400]}
                                    multiline
                                    autoFocus
                                />
                                <View style={styles.notesButtonRow}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setNotes(contact.notes || '');
                                            setIsEditingNotes(false);
                                        }}
                                        style={styles.notesDiscardBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.notesDiscardText}>Discard</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleSaveNotes}
                                        style={styles.notesSaveBtn}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={styles.notesSaveText}>Save Notes</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.notesReadView}>
                                <MaterialCommunityIcons
                                    name="notebook-outline"
                                    size={18}
                                    color={colors.neutral[400]}
                                    style={{ marginRight: spacing.md, marginTop: 2 }}
                                />
                                <Text style={styles.notesParagraph}>
                                    {notes || 'Jot down details about when you met, shared interests, or future collaboration ideas.'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={{ height: spacing['4xl'] }} />
            </ScrollView>

            {/* ── Options Modal ── */}
            <Modal
                visible={showOptions}
                transparent
                animationType="slide"
                onRequestClose={() => setShowOptions(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <View style={styles.optionsSheet}>
                                {/* Handle bar */}
                                <View style={styles.sheetHandle} />

                                {/* Contact name label */}
                                <Text style={styles.sheetContactName}>{contact.displayName}</Text>
                                <Text style={styles.sheetSubtitle}>Contact Options</Text>

                                <View style={styles.sheetDivider} />

                                {/* Share contact */}
                                <TouchableOpacity
                                    style={styles.sheetRow}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        setShowOptions(false);
                                        Alert.alert('Share', 'Share contact feature coming soon.');
                                    }}
                                >
                                    <View style={[styles.sheetIconBox, { backgroundColor: colors.blue[50] }]}>
                                        <Feather name="share-2" size={18} color={colors.blue[500]} />
                                    </View>
                                    <Text style={styles.sheetRowLabel}>Share Contact</Text>
                                    <Feather name="chevron-right" size={18} color={colors.neutral[300]} />
                                </TouchableOpacity>

                                {/* AI Follow-up */}
                                <TouchableOpacity
                                    style={styles.sheetRow}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        setShowOptions(false);
                                        navigation.navigate('AIFollowUp', { contactId });
                                    }}
                                >
                                    <View style={[styles.sheetIconBox, { backgroundColor: colors.secondary[100] }]}>
                                        <MaterialCommunityIcons name="lightning-bolt" size={18} color={colors.secondary[600]} />
                                    </View>
                                    <Text style={styles.sheetRowLabel}>Draft AI Follow-up</Text>
                                    <Feather name="chevron-right" size={18} color={colors.neutral[300]} />
                                </TouchableOpacity>

                                <View style={styles.sheetDivider} />

                                {/* Remove contact — destructive */}
                                <TouchableOpacity
                                    style={styles.sheetRow}
                                    activeOpacity={0.7}
                                    onPress={handleRemoveContact}
                                >
                                    <View style={[styles.sheetIconBox, { backgroundColor: '#FEF2F2' }]}>
                                        <Feather name="user-x" size={18} color="#EF4444" />
                                    </View>
                                    <Text style={[styles.sheetRowLabel, { color: '#EF4444' }]}>Remove Contact</Text>
                                    <Feather name="chevron-right" size={18} color="#FCA5A5" />
                                </TouchableOpacity>

                                {/* Cancel */}
                                <TouchableOpacity
                                    style={styles.sheetCancelBtn}
                                    onPress={() => setShowOptions(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.sheetCancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* ── Deletion Confirmation Modal ── */}
            <Modal
                visible={showDeleteConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteConfirm(false)}
            >
                <View style={styles.modalBackdropCenter}>
                    <View style={styles.confirmCard}>
                        {/* Icon Badge */}
                        <View style={styles.confirmIconBadge}>
                            <Feather name="trash-2" size={28} color="#EF4444" />
                        </View>

                        {/* Text Content */}
                        <Text style={styles.confirmTitle}>Remove Contact?</Text>
                        <Text style={styles.confirmBody}>
                            Are you sure you want to remove <Text style={{ fontWeight: 'bold', color: colors.neutral[900] }}>{contact.displayName}</Text>? This action will permanently delete this contact and cannot be undone.
                        </Text>

                        {/* Action Buttons */}
                        <View style={styles.confirmActions}>
                            <TouchableOpacity
                                style={styles.confirmCancelBtn}
                                onPress={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.confirmCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmDeleteBtn, isDeleting && { opacity: 0.7 }]}
                                onPress={confirmDeletion}
                                disabled={isDeleting}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.confirmDeleteText}>
                                    {isDeleting ? 'Removing...' : 'Yes, Remove'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ── Info Row Component ──
const InfoRow = ({ icon, label, value, isLast }: {
    icon: string;
    label: string;
    value: string;
    isLast: boolean;
}) => (
    <View style={[infoRowStyles.row, !isLast && infoRowStyles.rowBorder]}>
        <View style={infoRowStyles.iconBox}>
            <Feather name={icon as any} size={16} color={colors.blue[500]} />
        </View>
        <View style={infoRowStyles.content}>
            <Text style={infoRowStyles.label}>{label}</Text>
            <Text style={infoRowStyles.value} numberOfLines={2}>{value}</Text>
        </View>
    </View>
);

const infoRowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 11,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[500],
        letterSpacing: 0.6,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[900],
        fontWeight: typography.fontWeight.medium,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollContent: {
        paddingBottom: spacing['4xl'],
    },

    // ── Loading ──
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingSpinner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    loadingText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[700],
    },
    loadingSubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[400],
    },

    // ── Hero ──
    hero: {
        height: HERO_HEIGHT,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 56,
        paddingHorizontal: spacing.lg,
        position: 'relative',
        overflow: 'hidden',
    },
    decorCircle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: -40,
        left: -40,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    decorCircle3: {
        position: 'absolute',
        top: 60,
        left: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    heroNav: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        zIndex: 10,
    },
    heroNavTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 0.3,
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

    // ── Avatar ──
    avatarRing: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },
    avatarImage: {
        width: 92,
        height: 92,
        borderRadius: 46,
    },
    avatarPlaceholder: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: colors.blue[400],
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        fontSize: 32,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2.5,
        borderColor: '#FFFFFF',
        zIndex: 2,
    },
    heroName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        marginBottom: 4,
        textAlign: 'center',
    },
    heroRole: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
    },

    // ── Floating Action Card ──
    actionCard: {
        marginHorizontal: spacing.lg,
        marginTop: -28,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        ...shadows.md,
        borderWidth: 1,
        borderColor: colors.border.light,
        zIndex: 10,
    },
    actionItem: {
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    actionIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[600],
    },
    actionDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border.light,
    },

    // ── Connected chip ──
    connectedChipRow: {
        alignItems: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
    },
    connectedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.neutral[100],
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },
    connectedChipText: {
        fontSize: 12,
        color: colors.neutral[500],
        fontWeight: typography.fontWeight.medium,
    },

    // ── Sections ──
    section: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[500],
        letterSpacing: 1.2,
        marginLeft: 2,
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: colors.secondary[100],
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: borderRadius.full,
    },
    aiBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.secondary[700],
        letterSpacing: 1.2,
    },
    aiIconRow: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border.light,
    },

    // ── Card styles ──
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border.light,
        flexDirection: 'row',
        overflow: 'hidden',
        ...shadows.sm,
    },
    bioAccent: {
        width: 4,
        backgroundColor: colors.blue[500],
    },
    bioContentWrapper: {
        flex: 1,
        padding: spacing.lg,
    },
    insightText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[700],
        lineHeight: 22,
    },
    followUpLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        gap: 5,
    },
    followUpLinkText: {
        fontSize: 13,
        fontWeight: typography.fontWeight.bold,
        color: colors.blue[500],
    },
    generateAiEmpty: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.light,
        gap: spacing.md,
        ...shadows.sm,
    },
    generateAiIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.secondary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    generateAiTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[800],
        marginBottom: 2,
    },
    generateAiSubtitle: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
    },
    restoreAiBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        backgroundColor: colors.secondary[50],
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.secondary[200],
    },
    restoreAiText: {
        fontSize: 14,
        fontWeight: typography.fontWeight.semibold,
        color: colors.secondary[700],
    },
    cardPlain: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.base,
        borderWidth: 1,
        borderColor: colors.border.light,
        ...shadows.sm,
    },

    // ── Notes Card ──
    notesCard: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.light,
        ...shadows.sm,
    },
    notesReadView: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    notesParagraph: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
        lineHeight: 22,
    },
    notesInput: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[900],
        lineHeight: 24,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    notesButtonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.md,
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
    },
    notesDiscardBtn: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    notesDiscardText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral[500],
    },
    notesSaveBtn: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.blue[500],
        shadowColor: colors.blue[500],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    notesSaveText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    editNoteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: colors.blue[50],
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },
    editNoteBtnText: {
        fontSize: 12,
        fontWeight: typography.fontWeight.semibold,
        color: colors.blue[500],
    },

    // ── Options Modal ──
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    optionsSheet: {
        backgroundColor: colors.background.secondary,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['3xl'],
        paddingTop: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 16,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.neutral[200],
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    sheetContactName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        textAlign: 'center',
        marginBottom: 2,
    },
    sheetSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[400],
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    sheetDivider: {
        height: 1,
        backgroundColor: colors.border.light,
        marginVertical: spacing.sm,
    },
    sheetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
        gap: spacing.md,
    },
    sheetIconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetRowLabel: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral[800],
    },
    sheetCancelBtn: {
        marginTop: spacing.md,
        backgroundColor: colors.neutral[100],
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.base,
        alignItems: 'center',
    },
    sheetCancelText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[600],
    },

    // ── Confirmation Modal ──
    modalBackdropCenter: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    confirmCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius['2xl'],
        padding: spacing.xl,
        alignItems: 'center',
        ...shadows.lg,
    },
    confirmIconBadge: {
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
    confirmTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    confirmBody: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.sm,
    },
    confirmActions: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    confirmCancelBtn: {
        flex: 1,
        paddingVertical: spacing.base,
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    confirmCancelText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[700],
    },
    confirmDeleteBtn: {
        flex: 1,
        paddingVertical: spacing.base,
        backgroundColor: '#EF4444',
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmDeleteText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
});

export default ContactDetailScreen;
