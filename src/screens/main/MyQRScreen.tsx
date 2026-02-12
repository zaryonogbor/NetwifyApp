import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Share,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { QRCodeData } from '../../types';

const { width } = Dimensions.get('window');

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

                {/* QR Card Container */}
                <View style={styles.cardWrapper}>
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
                        <View style={styles.qrContainer}>
                            <QRCode
                                value={JSON.stringify(qrData)}
                                size={width * 0.5} // Responsive size
                                color="#000000"
                                backgroundColor="#FFFFFF"
                            />
                        </View>

                        {/* Scan Instructions */}
                        <Text style={styles.instructionsText}>
                            Scan this code to send connection request
                        </Text>
                    </View>

                    {/* Overlapping Avatar - Positioned outside the card but visually on top */}
                    <View style={styles.avatarContainer}>
                        <Avatar
                            source={userProfile?.photoURL}
                            name={userProfile?.displayName}
                            size="xl" // Assuming 'xl' is supported or will default to large
                        />
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShare}
                        activeOpacity={0.8}
                    >
                        <Feather name="share-2" size={20} color="#FFFFFF" style={styles.shareIcon} />
                        <Text style={styles.shareButtonText}>Sign Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA', // Light background
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['3xl'], // Space for avatar overlap
    },
    title: {
        fontSize: typography.fontSize['3xl'], // Larger title
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600], // Dark Purple
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: '#9E97CA', // Light Purple Grey
        textAlign: 'center',
    },
    cardWrapper: {
        width: '100%',
        alignItems: 'center',
        marginTop: spacing.xl, // Push down to make room for avatar
        position: 'relative',
    },
    qrCard: {
        backgroundColor: '#433D62', // Dark Purple Card Background
        width: '100%',
        borderRadius: 30,
        paddingTop: 70, // Space for avatar
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        ...shadows.lg,
    },
    avatarContainer: {
        position: 'absolute',
        top: -50, // Pull up to overlap
        zIndex: 10,
        borderRadius: 999,
        borderWidth: 4,
        borderColor: '#FAFAFA', // Match background
        padding: 4, // Inner spacing
        backgroundColor: '#FAFAFA',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    profileName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF', // White text
        marginBottom: 4,
    },
    profileRole: {
        fontSize: typography.fontSize.sm,
        color: '#F2A090', // Salmon/Peach
        fontWeight: '500',
    },
    qrContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        width: width * 0.65,
        height: width * 0.65,
    },
    instructionsText: {
        fontSize: typography.fontSize.sm,
        color: '#FFFFFF',
        opacity: 0.8,
        textAlign: 'center',
    },
    actions: {
        width: '100%',
        marginTop: spacing['2xl'],
        paddingHorizontal: spacing.sm,
    },
    shareButton: {
        backgroundColor: '#F2A090', // Salmon Button
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md + 4, // Taller button
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
