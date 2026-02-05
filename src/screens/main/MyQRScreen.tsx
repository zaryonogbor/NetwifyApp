import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Share,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import { Card, Avatar, Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { QRCodeData } from '../../types';

export const MyQRScreen: React.FC = () => {
    const { user, userProfile } = useAuth();

    const qrData: QRCodeData = {
        type: 'netwify_connect',
        userId: user?.uid || '',
        timestamp: Date.now(),
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Connect with me on Netwify! Scan my QR code or use this link: netwify://connect/${user?.uid}`,
                title: 'Share your Netwify profile',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>My QR Code</Text>
                    <Text style={styles.subtitle}>
                        Let others scan to connect with you
                    </Text>
                </View>

                {/* QR Card */}
                <Card variant="elevated" style={styles.qrCard}>
                    {/* Profile Info */}
                    <View style={styles.profileSection}>
                        <Avatar
                            source={userProfile?.photoURL}
                            name={userProfile?.displayName}
                            size="lg"
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{userProfile?.displayName}</Text>
                            <Text style={styles.profileRole}>
                                {userProfile?.jobTitle}
                                {userProfile?.company && ` at ${userProfile?.company}`}
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* QR Code */}
                    <View style={styles.qrContainer}>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={JSON.stringify(qrData)}
                                size={200}
                                color={colors.primary[900]}
                                backgroundColor={colors.background.primary}
                            />
                        </View>
                    </View>

                    {/* Scan Instructions */}
                    <View style={styles.instructions}>
                        <Feather name="smartphone" size={16} color={colors.text.tertiary} />
                        <Text style={styles.instructionsText}>
                            Point camera at this code to connect
                        </Text>
                    </View>
                </Card>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button
                        title="Share Profile"
                        onPress={handleShare}
                        icon={<Feather name="share-2" size={18} color={colors.text.inverse} />}
                        fullWidth
                        size="lg"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    qrCard: {
        padding: spacing.xl,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    profileName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
    },
    profileRole: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border.light,
        marginVertical: spacing.xl,
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    qrWrapper: {
        padding: spacing.lg,
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.primary[100],
    },
    instructions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    instructionsText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.tertiary,
    },
    actions: {
        marginTop: spacing['2xl'],
        gap: spacing.md,
    },
});

export default MyQRScreen;
