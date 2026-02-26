import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Share,
    TouchableOpacity,
    useWindowDimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { QRCodeData } from '../../types';

export const MyQRScreen: React.FC = () => {
    const { user, userProfile } = useAuth();
    const { width } = useWindowDimensions();

    const qrData: QRCodeData = {
        type: 'netwify_connect',
        userId: user?.uid || '',
        timestamp: Date.now(),
        displayName: userProfile?.displayName,
        jobTitle: userProfile?.jobTitle,
        company: userProfile?.company,
        photoURL: userProfile?.photoURL,
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

    const maxCardWidth = 420;
    const effectiveWidth = Math.min(width - spacing.lg * 2, maxCardWidth);
    const qrSize = effectiveWidth * 0.5;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>My QR Code</Text>
                    <Text style={styles.subtitle}>
                        Let others scan to connect with you
                    </Text>
                </View>

                {/* Main QR Card */}
                <View style={[styles.cardOuter, { maxWidth: maxCardWidth }]}>
                    <View style={styles.qrCard}>
                        {/* Decorative background circles */}
                        <View style={styles.decorCircle1} />
                        <View style={styles.decorCircle2} />

                        {/* Avatar */}
                        <View style={styles.avatarWrapper}>
                            <Avatar
                                source={userProfile?.photoURL}
                                name={userProfile?.displayName}
                                size="xl"
                            />
                        </View>

                        {/* Profile Info */}
                        <Text style={styles.profileName}>{userProfile?.displayName}</Text>
                        <Text style={styles.profileRole}>
                            {userProfile?.jobTitle}
                            {userProfile?.company && ` • ${userProfile.company}`}
                        </Text>

                        {/* QR Code */}
                        <View style={[styles.qrContainer, { width: effectiveWidth * 0.65, height: effectiveWidth * 0.65 }]}>
                            <QRCode
                                value={JSON.stringify(qrData)}
                                size={qrSize}
                                color={colors.blue[700]}
                                backgroundColor="#FFFFFF"
                            />
                        </View>

                        {/* Scan Instruction */}
                        <View style={styles.instructionRow}>
                            <MaterialCommunityIcons name="cellphone-nfc" size={16} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.instructionText}>
                                Scan this code to connect
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={[styles.actions, { maxWidth: maxCardWidth }]}>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShare}
                        activeOpacity={0.85}
                    >
                        <Feather name="share-2" size={18} color="#FFFFFF" />
                        <Text style={styles.shareButtonText}>Share Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={handleShare}
                        activeOpacity={0.85}
                    >
                        <Feather name="copy" size={18} color={colors.blue[500]} />
                        <Text style={styles.copyButtonText}>Copy Link</Text>
                    </TouchableOpacity>
                </View>

                {/* Tip */}
                <View style={styles.tipContainer}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={16} color={colors.blue[500]} />
                    <Text style={styles.tipText}>
                        Tip: Your QR code works even without internet
                    </Text>
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing['3xl'],
        alignItems: 'center',
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        textAlign: 'center',
    },

    // Card
    cardOuter: {
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    qrCard: {
        width: '100%',
        borderRadius: 24,
        paddingTop: spacing['2xl'],
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        backgroundColor: colors.blue[500],
        overflow: 'hidden',
        position: 'relative',
    },
    decorCircle1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },

    // Avatar
    avatarWrapper: {
        borderRadius: 999,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        padding: 3,
        marginBottom: spacing.md,
    },

    // Profile
    profileName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        marginBottom: 4,
        textAlign: 'center',
    },
    profileRole: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },

    // QR
    qrContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.base,
    },

    // Instruction
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    instructionText: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.7)',
    },

    // Actions
    actions: {
        width: '100%',
        flexDirection: 'row',
        gap: spacing.md,
    },
    shareButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.blue[500],
        paddingVertical: spacing.base,
        borderRadius: borderRadius.xl,
    },
    shareButtonText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
    },
    copyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: '#FFFFFF',
        paddingVertical: spacing.base,
        borderRadius: borderRadius.xl,
        borderWidth: 1.5,
        borderColor: colors.blue[500],
    },
    copyButtonText: {
        color: colors.blue[500],
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
    },

    // Tip
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xl,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.blue[50],
        borderRadius: borderRadius.lg,
    },
    tipText: {
        fontSize: typography.fontSize.sm,
        color: colors.blue[700],
        fontWeight: typography.fontWeight.medium,
    },
});

export default MyQRScreen;
