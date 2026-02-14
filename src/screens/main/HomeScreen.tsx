import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { Card, Avatar, Button } from '../../components/ui';
import { acceptConnectionRequest, declineConnectionRequest } from '../../services/connectionService';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Contact, ConnectionRequest } from '../../types';

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
                    <View style={styles.greetingPill}>
                        <Avatar
                            source={userProfile?.photoURL}
                            name={userProfile?.displayName}
                            size="md"
                        />
                        <Text style={styles.greetingText}>
                            Hi, <Text style={styles.userName}>{userProfile?.displayName?.split(' ')[0] || 'User'}!</Text>
                        </Text>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            {pendingRequests.length > 0 && <View style={styles.notificationBadge} />}
                            <Feather name="bell" size={24} color={colors.primary[600]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Action Text */}
                <Text style={styles.actionTitle}>Add a connection</Text>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#F9DCC4' }]} // Peach
                        onPress={() => navigation.navigate('MyQR')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionIconContainer}>
                            <MaterialCommunityIcons name="qrcode-scan" size={32} color={colors.primary[800]} />
                        </View>
                        <Text style={styles.actionLabel}>My QR Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: '#F2A090' }]} // Salmon
                        onPress={() => navigation.navigate('QRScanner')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionIconContainer}>
                            <Feather name="camera" size={32} color={colors.primary[800]} />
                        </View>
                        <Text style={styles.actionLabel}>Scan QR Code</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Connections */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Connections</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Contacts')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentContacts.length > 0 ? (
                        recentContacts.map((contact) => (
                            <TouchableOpacity
                                key={contact.id}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('ContactDetail', { contactId: contact.id })}
                            >
                                <View style={styles.contactItem}>
                                    <View style={styles.avatarContainer}>
                                        <Avatar
                                            source={contact.photoURL}
                                            name={contact.displayName}
                                            size="lg"
                                        />
                                    </View>
                                    <View style={styles.contactInfo}>
                                        <Text style={styles.contactName}>{contact.displayName}</Text>
                                        <Text style={styles.contactRole} numberOfLines={1}>
                                            {contact.jobTitle}
                                            {contact.company && ` At ${contact.company}`}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.separator} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Feather name="users" size={32} color={colors.neutral[300]} />
                            <Text style={styles.emptyText}>No recent connections</Text>
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
        backgroundColor: '#FAFAFA', // Very light gray background
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing['3xl'],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    greetingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECEBFA', // Light purple pill background
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        gap: spacing.sm,
    },
    greetingText: {
        fontSize: typography.fontSize.lg,
        color: colors.primary[600],
        marginRight: spacing.sm,
    },
    userName: {
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600],
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconButton: {
        padding: spacing.xs,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444', // Red dot
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: '#FAFAFA',
    },
    actionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    quickActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing['2xl'],
    },
    actionCard: {
        flex: 1,
        height: 160,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIconContainer: {
        marginBottom: spacing.md,
    },
    actionLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[800],
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold, // Matches "Recent Connections"
        color: colors.primary[600],
    },
    seeAll: {
        fontSize: typography.fontSize.base,
        color: '#F2A090', // Salmon color for "See All"
        fontWeight: '500',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    avatarContainer: {
        marginRight: spacing.md,
        borderWidth: 2,
        borderColor: '#F2A090', // Salmon border around avatar
        borderRadius: 999,
        padding: 2,
    },
    contactInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    contactName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600],
        marginBottom: 2,
    },
    contactRole: {
        fontSize: typography.fontSize.sm,
        color: '#9E97CA', // Light purple/grey text
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#E5E7EB', // Light divider
        marginLeft: 70, // Offset to align with text
        marginVertical: spacing.xs,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        marginTop: spacing.sm,
        color: colors.text.secondary,
    },
});

export default HomeScreen;