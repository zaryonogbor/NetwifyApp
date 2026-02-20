import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { Avatar } from '../../components/ui';
import { QuickActionSection, NetworkingSnapshot, NeedsAttentionCard } from '../../components/home';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Contact, ConnectionRequest } from '../../types';

// Helper to get relative time string
const getRelativeTime = (date: Date | any): string => {
    if (!date) return '';
    const now = new Date();
    const d = date?.toDate ? date.toDate() : new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
};

// Helper to get initials
const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { userProfile, user } = useAuth();
    const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
    const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Listen for recent contacts
        const contactsQuery = query(
            collection(db, 'contacts'),
            where('userId', '==', user.uid),
            orderBy('connectedAt', 'desc'),
            limit(5)
        );

        const unsubContacts = onSnapshot(contactsQuery, (snapshot) => {
            const contacts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Contact[];
            setRecentContacts(contacts);
        });

        // Listen for pending connection requests
        const requestsQuery = query(
            collection(db, 'connectionRequests'),
            where('toUserId', '==', user.uid),
            where('status', '==', 'pending')
        );

        const unsubRequests = onSnapshot(requestsQuery, (snapshot) => {
            const requests = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as ConnectionRequest[];
            setPendingRequests(requests);
        });

        return () => {
            unsubContacts();
            unsubRequests();
        };
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    // Derive "needs attention" items from contacts
    const needsAttentionItems = recentContacts
        .filter((c) => !c.aiSummary || !c.lastInteractionAt)
        .slice(0, 3)
        .map((c) => ({
            id: c.id,
            name: c.displayName,
            initials: getInitials(c.displayName),
            reason: !c.aiSummary ? 'No summary' : 'Follow-up due',
        }));

    // Count new connections (within last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newConnectionsCount = recentContacts.filter((c) => {
        const d = (c.connectedAt as any)?.toDate
            ? (c.connectedAt as any).toDate()
            : new Date(c.connectedAt);
        return d >= oneWeekAgo;
    }).length;

    // Check if a contact is "new" (connected within last 24 hours)
    const isNewContact = (connectedAt: Date | any): boolean => {
        const d = connectedAt?.toDate ? connectedAt.toDate() : new Date(connectedAt);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return d >= oneDayAgo;
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <Text style={styles.userName}>
                            {userProfile?.displayName || 'User'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.bellButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        {pendingRequests.length > 0 && (
                            <View style={styles.notificationBadge} />
                        )}
                        <Feather name="bell" size={22} color={colors.blue[500]} />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <QuickActionSection
                    onShowQR={() => navigation.navigate('MyQR')}
                    onScanQR={() => navigation.navigate('QRScanner')}
                />

                {/* Networking Snapshot */}
                <NetworkingSnapshot
                    newConnectionsCount={newConnectionsCount}
                    pendingFollowUpsCount={
                        needsAttentionItems.filter((i) => i.reason === 'Follow-up due').length
                    }
                    onViewDetails={() => navigation.navigate('Contacts')}
                />

                {/* Needs Attention */}
                {needsAttentionItems.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>NEEDS ATTENTION</Text>
                        {needsAttentionItems.map((item) => (
                            <NeedsAttentionCard
                                key={item.id}
                                initials={item.initials}
                                name={item.name}
                                reason={item.reason}
                                onGenerate={() =>
                                    navigation.navigate('AIFollowUp', { contactId: item.id })
                                }
                            />
                        ))}
                    </View>
                )}

                {/* Recent Connections */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Connections</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Contacts')}>
                            <Text style={styles.viewAll}>View all</Text>
                        </TouchableOpacity>
                    </View>

                    {recentContacts.length > 0 ? (
                        recentContacts.map((contact) => (
                            <TouchableOpacity
                                key={contact.id}
                                activeOpacity={0.7}
                                onPress={() =>
                                    navigation.navigate('ContactDetail', {
                                        contactId: contact.id,
                                    })
                                }
                                style={styles.contactCard}
                            >
                                <View style={styles.contactLeft}>
                                    <View style={styles.avatarWrapper}>
                                        <Avatar
                                            source={contact.photoURL}
                                            name={contact.displayName}
                                            size="lg"
                                        />
                                        {isNewContact(contact.connectedAt) && (
                                            <View style={styles.newBadge}>
                                                <Text style={styles.newBadgeText}>NEW</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.contactInfo}>
                                        <Text style={styles.contactName}>
                                            {contact.displayName}
                                        </Text>
                                        <Text style={styles.contactRole} numberOfLines={1}>
                                            {contact.jobTitle}
                                            {contact.company && ` @ ${contact.company}`}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.contactRight}>
                                    <Text style={styles.timeAgo}>
                                        {getRelativeTime(contact.connectedAt)}
                                    </Text>
                                    <MaterialCommunityIcons
                                        name="lightning-bolt"
                                        size={18}
                                        color={colors.blue[500]}
                                    />
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Feather name="users" size={32} color={colors.neutral[300]} />
                            <Text style={styles.emptyText}>No recent connections</Text>
                            <Text style={styles.emptySubtext}>
                                Scan a QR code to get started!
                            </Text>
                        </View>
                    )}
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
        paddingTop: spacing.lg,
        paddingBottom: spacing['3xl'],
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    welcomeText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    userName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
    },
    bellButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginTop: spacing.xs,
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: '#F9FAFB',
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
        textTransform: 'uppercase',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.base,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
    },
    viewAll: {
        fontSize: typography.fontSize.sm,
        color: colors.blue[500],
        fontWeight: typography.fontWeight.medium,
    },

    // Contact Card
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.base,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: spacing.md,
    },
    newBadge: {
        position: 'absolute',
        bottom: -2,
        left: -2,
        backgroundColor: '#EF4444',
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    newBadgeText: {
        fontSize: 8,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    contactInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    contactName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[900],
        marginBottom: 2,
    },
    contactRole: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
    },
    contactRight: {
        alignItems: 'flex-end',
        gap: spacing.xs,
        marginLeft: spacing.sm,
    },
    timeAgo: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
    },

    // Empty state
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
    },
    emptyText: {
        marginTop: spacing.sm,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.neutral[500],
    },
    emptySubtext: {
        marginTop: spacing.xs,
        fontSize: typography.fontSize.sm,
        color: colors.neutral[400],
    },
});

export default HomeScreen;