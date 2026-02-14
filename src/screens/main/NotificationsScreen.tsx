import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    addDoc
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { Card, Avatar, Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { ConnectionRequest } from '../../types';

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'connectionRequests'),
            where('toUserId', '==', user.uid),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ConnectionRequest[];
            setRequests(newRequests);
            setLoading(false);
            setRefreshing(false);
        }, (error) => {
            console.error('Error fetching notifications:', error);
            setLoading(false);
            setRefreshing(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAccept = async (request: ConnectionRequest) => {
        try {
            // Update request status
            await updateDoc(doc(db, 'connectionRequests', request.id), {
                status: 'accepted',
                respondedAt: serverTimestamp()
            });

            // Create contact entries for both users
            // (In a real app, this logic might be in a Cloud Function triggered by the status change)

            // For now, we'll just show a success message
            Alert.alert('Success', `You are now connected with ${request.fromUserProfile.displayName}!`);
        } catch (error) {
            console.error('Error accepting request:', error);
            Alert.alert('Error', 'Failed to accept connection request.');
        }
    };

    const handleDecline = async (requestId: string) => {
        try {
            await updateDoc(doc(db, 'connectionRequests', requestId), {
                status: 'declined',
                respondedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error declining request:', error);
            Alert.alert('Error', 'Failed to decline connection request.');
        }
    };

    const renderRequestItem = ({ item }: { item: ConnectionRequest }) => (
        <Card style={styles.requestCard}>
            <View style={styles.requestHeader}>
                <Avatar
                    source={item.fromUserProfile.photoURL}
                    name={item.fromUserProfile.displayName}
                    size="lg"
                    style={styles.avatar}
                />
                <View style={styles.requestInfo}>
                    <Text style={styles.senderName}>{item.fromUserProfile.displayName}</Text>
                    <Text style={styles.senderRole}>
                        {item.fromUserProfile.jobTitle}
                        {item.fromUserProfile.company && ` at ${item.fromUserProfile.company}`}
                    </Text>
                    <Text style={styles.requestTime}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            {item.message && (
                <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{item.message}</Text>
                </View>
            )}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleDecline(item.id)}
                >
                    <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
                <Button
                    title="Accept"
                    onPress={() => handleAccept(item)}
                    size="sm"
                    style={styles.acceptButton}
                />
            </View>
        </Card>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={colors.primary[600]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={renderRequestItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Feather name="bell-off" size={48} color={colors.primary[100]} />
                            </View>
                            <Text style={styles.emptyTitle}>All caught up!</Text>
                            <Text style={styles.emptyText}>
                                No new connection requests at the moment.
                            </Text>
                        </View>
                    ) : null
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => setRefreshing(true)}
                        tintColor={colors.accent[500]}
                    />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
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
    listContent: {
        padding: spacing.xl,
        paddingBottom: spacing['4xl'],
        flexGrow: 1,
    },
    requestCard: {
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background.secondary,
        ...shadows.sm,
    },
    requestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginRight: spacing.md,
    },
    requestInfo: {
        flex: 1,
    },
    senderName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600],
    },
    senderRole: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginTop: 2,
    },
    requestTime: {
        fontSize: 10,
        color: colors.text.tertiary,
        marginTop: 4,
    },
    messageBox: {
        backgroundColor: colors.background.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.accent[500],
    },
    messageText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.primary,
        lineHeight: 20,
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: spacing.lg,
        gap: spacing.xl,
    },
    declineButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    declineText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        fontWeight: typography.fontWeight.medium,
    },
    acceptButton: {
        backgroundColor: colors.accent[500],
        paddingHorizontal: spacing.xl,
        minWidth: 100,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing['4xl'] * 2,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600],
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: spacing['2xl'],
    },
});

export default NotificationsScreen;
