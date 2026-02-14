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
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { QRCodeData } from '../../types';

export const MyQRScreen: React.FC = () => {
    const { user, userProfile } = useAuth();
    const { width } = useWindowDimensions();

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

    // Calculate responsive sizes with constraints
    const maxCardWidth = 450;
    const effectiveWidth = Math.min(width - spacing.xl * 2, maxCardWidth);
    const qrSize = effectiveWidth * 0.6;

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

                {/* QR Card Container */}
                <View style={[styles.cardWrapper, { maxWidth: maxCardWidth }]}>
                    {/* The Dark Purple Card */}
                    <View style={styles.qrCard}>
                        {/* Profile Info */}
                        <View style={styles.profileSection}>
                            <Text style={styles.profileName}>{userProfile?.displayName}</Text>
                            <Text style={styles.profileRole}>
                                {userProfile?.jobTitle}
                                {userProfile?.company && ` At ${userProfile?.company}`}
                            </Text>
                        </View>

                        {/* QR Code Container (White Box) */}
                        <View style={[styles.qrContainer, { width: effectiveWidth * 0.75, height: effectiveWidth * 0.75 }]}>
                            <QRCode
                                value={JSON.stringify(qrData)}
                                size={qrSize}
                                color="#000000"
                                backgroundColor="#FFFFFF"
                            />
                        </View>

                        {/* Scan Instructions */}
                        <Text style={styles.instructionsText}>
                            Scan this code to send connection request
                        </Text>
                    </View>

                    {/* Overlapping Avatar */}
                    <View style={styles.avatarContainer}>
                        <Avatar
                            source={userProfile?.photoURL}
                            name={userProfile?.displayName}
                            size="xl"
                        />
                    </View>
                </View>

                {/* Actions */}
                <View style={[styles.actions, { maxWidth: maxCardWidth }]}>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShare}
                        activeOpacity={0.8}
                    >
                        <Feather name="share-2" size={20} color="#FFFFFF" style={styles.shareIcon} />
                        <Text style={styles.shareButtonText}>Share Profile</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing['3xl'],
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['4xl'],
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600],
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: '#9E97CA',
        textAlign: 'center',
    },
    cardWrapper: {
        width: '100%',
        alignItems: 'center',
        position: 'relative',
        marginBottom: spacing.xl,
    },
    qrCard: {
        backgroundColor: '#433D62',
        width: '100%',
        borderRadius: 30,
        paddingTop: 80,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        ...shadows.lg,
    },
    avatarContainer: {
        position: 'absolute',
        top: -45,
        zIndex: 10,
        borderRadius: 999,
        borderWidth: 4,
        borderColor: '#FAFAFA',
        padding: 4,
        backgroundColor: '#FAFAFA',
        ...shadows.md,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    profileName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        marginBottom: 4,
        textAlign: 'center',
    },
    profileRole: {
        fontSize: typography.fontSize.sm,
        color: '#F2A090',
        fontWeight: '500',
        textAlign: 'center',
    },
    qrContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    instructionsText: {
        fontSize: typography.fontSize.sm,
        color: '#FFFFFF',
        opacity: 0.8,
        textAlign: 'center',
    },
    actions: {
        width: '100%',
        marginTop: spacing.xl,
    },
    shareButton: {
        backgroundColor: '#F2A090',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: borderRadius.full,
        ...shadows.md,
    },
    shareIcon: {
        marginRight: spacing.sm,
    },
    shareButtonText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
    },
});

export default MyQRScreen;
