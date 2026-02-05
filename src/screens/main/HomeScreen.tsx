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
import { Feather } from '@expo/vector-icons';
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
    const [processingRequest, setProcessingRequest] = useState<string | null>(null);

    const handleAcceptRequest = async (request: ConnectionRequest) => {
        if (!user) return;
        setProcessingRequest(request.id);
        try {
            await acceptConnectionRequest(request, user.uid);
            Alert.alert('Connected!', `You are now connected with ${request.fromUserProfile.displayName}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to accept request. Please try again.');
        } finally {
            setProcessingRequest(null);
        }
    };

    const handleDeclineRequest = async (request: ConnectionRequest) => {
        Alert.alert(
            'Decline Request',
            `Are you sure you want to decline the request from ${request.fromUserProfile.displayName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Decline',
                    style: 'destructive',
                    onPress: async () => {
                        setProcessingRequest(request.id);
                        try {
                            await declineConnectionRequest(request.id);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to decline request.');
                        } finally {
                            setProcessingRequest(null);
                        }
                    },
                },
            ]
        );
    };

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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
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
                        <Text style={styles.greeting}>{getGreeting()}</Text>
                        <Text style={styles.userName}>{userProfile?.displayName || 'Welcome'}</Text>
                    </View>
                    <Avatar
                        source={userProfile?.photoURL}
                        name={userProfile?.displayName}
                        size="md"
                    />
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => navigation.navigate('MyQR')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.primary[100] }]}>
                            <Feather name="maximize" size={24} color={colors.primary[600]} />
                        </View>
                        <Text style={styles.quickActionLabel}>My QR Code</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionCard}
                        onPress={() => navigation.navigate('QRScanner')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: colors.accent[100] }]}>
                            <Feather name="camera" size={24} color={colors.accent[600]} />
                        </View>
                        <Text style={styles.quickActionLabel}>Scan QR</Text>
                    </TouchableOpacity>
                </View>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Pending Requests</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
                            </View>
                        </View>
                        {pendingRequests.map((request) => (
                            <Card key={request.id} style={styles.requestCard}>
                                <View style={styles.requestContent}>
                                    <Avatar
                                        source={request.fromUserProfile.photoURL}
                                        name={request.fromUserProfile.displayName}
                                        size="md"
                                    />
                                    <View style={styles.requestInfo}>
                                        <Text style={styles.requestName}>
                                            {request.fromUserProfile.displayName}
                                        </Text>
                                        <Text style={styles.requestRole}>
                                            {request.fromUserProfile.jobTitle}
                                            {request.fromUserProfile.company && ` at ${request.fromUserProfile.company}`}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.requestActions}>
                                    <Button
                                        title="Accept"
                                        onPress={() => handleAcceptRequest(request)}
                                        size="sm"
                                        loading={processingRequest === request.id}
                                        disabled={processingRequest !== null}
                                        style={{ marginRight: spacing.sm }}
                                    />
                                    <Button
                                        title="Decline"
                                        onPress={() => handleDeclineRequest(request)}
                                        variant="outline"
                                        size="sm"
                                        disabled={processingRequest !== null}
                                    />
                                </View>
                            </Card>
                        ))}
                    </View>
                )}

                {/* Recent Contacts */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Connections</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Contacts')}>
                            <Text style={styles.seeAll}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {recentContacts.length > 0 ? (
                        recentContacts.map((contact) => (
                            <TouchableOpacity
                                key={contact.id}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('ContactDetail', { contactId: contact.id })}
                            >
                                <Card style={styles.contactCard}>
                                    <Avatar
                                        source={contact.photoURL}
                                        name={contact.displayName}
                                        size="md"
                                    />
                                    <View style={styles.contactInfo}>
                                        <Text style={styles.contactName}>{contact.displayName}</Text>
                                        <Text style={styles.contactRole}>
                                            {contact.jobTitle}
                                            {contact.company && ` at ${contact.company}`}
                                        </Text>
                                    </View>
                                    <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                                </Card>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Feather name="users" size={40} color={colors.neutral[300]} />
                            <Text style={styles.emptyTitle}>No connections yet</Text>
                            <Text style={styles.emptyText}>
                                Scan a QR code or share yours to start networking
                            </Text>
                            <Button
                                title="Scan QR Code"
                                onPress={() => navigation.navigate('QRScanner')}
                                variant="secondary"
                                size="sm"
                                style={{ marginTop: spacing.md }}
                            />
                        </Card>
                    )}
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['3xl'],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    greeting: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
    },
    userName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
    },
    quickActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        ...shadows.sm,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    quickActionLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
    },
    seeAll: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[600],
        fontWeight: typography.fontWeight.medium,
    },
    badge: {
        backgroundColor: colors.primary[600],
        borderRadius: 10,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        color: colors.text.inverse,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
    },
    requestCard: {
        marginBottom: spacing.sm,
    },
    requestContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    requestInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    requestName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
    },
    requestRole: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginTop: 2,
    },
    requestActions: {
        flexDirection: 'row',
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    contactInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    contactName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
    },
    contactRole: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginTop: 2,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
    },
    emptyTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
        maxWidth: '80%',
    },
});

export default HomeScreen;
