import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { acceptConnectionRequest, declineConnectionRequest } from '../../services/connectionService';
import { Avatar } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { ConnectionRequest } from '../../types';

// Helper for relative time
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
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
};

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const showAlert = (title: string, message: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'connectionRequests'),
            where('toUserId', '==', user.uid),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const newRequests = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as ConnectionRequest[];
                setRequests(newRequests);
                setLoading(false);
                setRefreshing(false);
            },
            (error) => {
                console.error('Error fetching notifications:', error);
                setLoading(false);
                setRefreshing(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const handleAccept = async (request: ConnectionRequest) => {
        if (!user) return;
        setActionLoading(`accept_${request.id}`);
        try {
            await acceptConnectionRequest(request, user.uid);
            showAlert(
                'Connected!',
                `You are now connected with ${request.fromUserProfile.displayName}.`
            );
        } catch (error: any) {
            console.error('Error accepting request:', error);
            showAlert('Error', `Failed to accept connection request. ${error.message || ''}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async (requestId: string) => {
        setActionLoading(`decline_${requestId}`);
        try {
            await declineConnectionRequest(requestId);
        } catch (error: any) {
            console.error('Error declining request:', error);
            showAlert('Error', `Failed to decline connection request. ${error.message || ''}`);
        } finally {
            setActionLoading(null);
        }
    };

    const renderRequestItem = ({ item }: { item: ConnectionRequest }) => (
        <View style={styles.requestCard}>
            {/* Top Row: Avatar + Info + Time */}
            <View style={styles.requestTop}>
                <Avatar
                    source={item.fromUserProfile.photoURL}
                    name={item.fromUserProfile.displayName}
                    size="lg"
                />
                <View style={styles.requestInfo}>
                    <Text style={styles.senderName}>
                        {item.fromUserProfile.displayName}
                    </Text>
                    <Text style={styles.senderRole} numberOfLines={1}>
                        {item.fromUserProfile.jobTitle}
                        {item.fromUserProfile.company &&
                            ` @ ${item.fromUserProfile.company}`}
                    </Text>
                </View>
                <Text style={styles.requestTime}>
                    {getRelativeTime(item.createdAt)}
                </Text>
            </View>

            {/* Optional Message */}
            {item.message && (
                <View style={styles.messageBox}>
                    <View style={styles.messageAccent} />
                    <Text style={styles.messageText}>"{item.message}"</Text>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.declineButton, { opacity: actionLoading ? 0.5 : 1 }]}
                    onPress={() => handleDecline(item.id)}
                    disabled={actionLoading !== null}
                    activeOpacity={0.8}
                >
                    {actionLoading === `decline_${item.id}` ? (
                        <ActivityIndicator size="small" color={colors.neutral[500]} />
                    ) : (
                        <>
                            <Feather name="x" size={16} color={colors.neutral[500]} />
                            <Text style={styles.declineText}>Decline</Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.acceptButton, { opacity: actionLoading ? 0.5 : 1 }]}
                    onPress={() => handleAccept(item)}
                    disabled={actionLoading !== null}
                    activeOpacity={0.85}
                >
                    {actionLoading === `accept_${item.id}` ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Feather name="check" size={16} color="#FFFFFF" />
                            <Text style={styles.acceptText}>Accept</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

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
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Badge Count */}
            {requests.length > 0 && (
                <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>
            )}

            <FlatList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={renderRequestItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Feather
                                    name="bell"
                                    size={36}
                                    color={colors.blue[400]}
                                />
                            </View>
                            <Text style={styles.emptyTitle}>All caught up!</Text>
                            <Text style={styles.emptyText}>
                                No new connection requests at the moment.{'\n'}
                                Scan a QR code to start connecting.
                            </Text>
                        </View>
                    ) : null
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => setRefreshing(true)}
                        tintColor={colors.blue[500]}
                    />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },

    // Header
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

    // Badge Row
    badgeRow: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.blue[50],
        paddingVertical: spacing.xs + 1,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    badgeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.blue[600],
    },

    // List
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['4xl'],
        flexGrow: 1,
    },

    // Request Card
    requestCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.base,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    requestTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    requestInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    senderName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[900],
        marginBottom: 2,
    },
    senderRole: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
    },
    requestTime: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[400],
        marginLeft: spacing.sm,
    },

    // Message
    messageBox: {
        flexDirection: 'row',
        backgroundColor: colors.blue[50],
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginTop: spacing.md,
        overflow: 'hidden',
    },
    messageAccent: {
        width: 3,
        backgroundColor: colors.blue[500],
        borderRadius: 2,
        marginRight: spacing.sm,
    },
    messageText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.neutral[700],
        lineHeight: 20,
        fontStyle: 'italic',
    },

    // Actions
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: spacing.base,
        gap: spacing.sm,
    },
    declineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.base,
        borderRadius: borderRadius.full,
        backgroundColor: '#F3F4F6',
    },
    declineText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
        fontWeight: typography.fontWeight.medium,
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        backgroundColor: colors.blue[500],
    },
    acceptText: {
        fontSize: typography.fontSize.sm,
        color: '#FFFFFF',
        fontWeight: typography.fontWeight.bold,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing['4xl'] * 2,
    },
    emptyIconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: spacing['2xl'],
    },
});

export default NotificationsScreen;
