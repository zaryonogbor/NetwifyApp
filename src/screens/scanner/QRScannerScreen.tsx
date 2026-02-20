import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
    StatusBar,
    Animated,
    Easing,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { QRCodeData, UserProfile, ConnectionRequest } from '../../types';

const { width, height } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.75;
const SCREEN_HEIGHT = height;
const SCREEN_WIDTH = width;

export const QRScannerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user, userProfile } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scannedUser, setScannedUser] = useState<UserProfile | null>(null);
    const [sending, setSending] = useState(false);
    const [flashMode, setFlashMode] = useState<'on' | 'off'>('off');

    // Animation for scanning line
    const scanLineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    useEffect(() => {
        startScanAnimation();
    }, []);

    const startScanAnimation = () => {
        scanLineAnim.setValue(0);
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 0, // Reset instantly
                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
        if (scanned) return;
        setScanned(true);

        try {
            const qrData: QRCodeData = JSON.parse(data);

            if (qrData.type !== 'netwify_connect') {
                Alert.alert('Invalid QR Code', 'This is not a valid Netwify QR code.', [
                    { text: 'OK', onPress: () => setScanned(false) }
                ]);
                return;
            }

            if (qrData.userId === user?.uid) {
                Alert.alert('Oops!', "You can't connect with yourself.", [
                    { text: 'OK', onPress: () => setScanned(false) }
                ]);
                return;
            }

            const userDoc = await getDoc(doc(db, 'users', qrData.userId));
            if (!userDoc.exists()) {
                Alert.alert('User Not Found', 'This user profile does not exist.', [
                    { text: 'OK', onPress: () => setScanned(false) }
                ]);
                return;
            }

            setScannedUser(userDoc.data() as UserProfile);
        } catch (error) {
            console.error('Error parsing QR code:', error);
            Alert.alert('Invalid QR Code', 'Could not read this QR code.', [
                { text: 'OK', onPress: () => setScanned(false) }
            ]);
        }
    };

    const handleSendRequest = async () => {
        if (!scannedUser || !user || !userProfile) return;

        setSending(true);
        try {
            const request: Omit<ConnectionRequest, 'id'> = {
                fromUserId: user.uid,
                toUserId: scannedUser.uid,
                fromUserProfile: {
                    displayName: userProfile.displayName,
                    photoURL: userProfile.photoURL,
                    jobTitle: userProfile.jobTitle,
                    company: userProfile.company,
                },
                status: 'pending',
                createdAt: new Date(),
            };

            await addDoc(collection(db, 'connectionRequests'), request);

            Alert.alert(
                'Request Sent!',
                `Connection request sent to ${scannedUser.displayName}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Error sending request:', error);
            Alert.alert('Error', 'Failed to send connection request. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleCancel = () => {
        setScannedUser(null);
        setScanned(false);
    };

    const toggleFlash = () => {
        setFlashMode(prev => prev === 'on' ? 'off' : 'on');
    };

    if (!permission) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.blue[500]} />
                </View>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.permissionContainer}>
                <View style={styles.centerContent}>
                    <View style={styles.iconCircle}>
                        <Feather name="camera-off" size={40} color={colors.blue[500]} />
                    </View>
                    <Text style={styles.permissionTitle}>Camera Access Needed</Text>
                    <Text style={styles.permissionText}>
                        Netwify needs camera access to scan QR codes and connect you with others.
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.permissionButtonText}>Grant Access</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.secondaryButtonText}>Not Now</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (scannedUser) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                        <Feather name="x" size={24} color={colors.neutral[800]} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>User Found</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.foundContent}>
                    <View style={styles.userCard}>
                        <View style={styles.avatarContainer}>
                            {scannedUser.photoURL ? (
                                <Animated.Image
                                    source={{ uri: scannedUser.photoURL }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarInitials}>
                                        {scannedUser.displayName.charAt(0)}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.verifiedBadge}>
                                <MaterialCommunityIcons name="check-decagram" size={20} color={colors.blue[500]} />
                            </View>
                        </View>

                        <Text style={styles.userName}>{scannedUser.displayName}</Text>
                        <Text style={styles.userRole}>{scannedUser.jobTitle}</Text>
                        {scannedUser.company && (
                            <Text style={styles.userCompany}>{scannedUser.company}</Text>
                        )}

                        <View style={styles.divider} />

                        <Text style={styles.connectText}>
                            Would you like to connect with {scannedUser.displayName.split(' ')[0]}?
                        </Text>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCancel}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.connectButton}
                                onPress={handleSendRequest}
                                disabled={sending}
                            >
                                {sending ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <>
                                        <Feather name="user-plus" size={18} color="#FFFFFF" />
                                        <Text style={styles.connectButtonText}>Connect</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.scannerContainer}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <CameraView
                style={StyleSheet.absoluteFill}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                enableTorch={flashMode === 'on'}
            />

            {/* Dark Overlay with cutout */}
            <View style={styles.overlay}>
                <View style={styles.overlayTop} />
                <View style={styles.overlayCenterRow}>
                    <View style={styles.overlaySide} />
                    <View style={styles.window}>
                        {/* Animated Scan Line */}
                        <Animated.View
                            style={[
                                styles.laserLine,
                                {
                                    transform: [{
                                        translateY: scanLineAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, SCANNER_SIZE]
                                        })
                                    }]
                                }
                            ]}
                        />
                        {/* Corner Markers */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <View style={styles.overlaySide} />
                </View>
                <View style={styles.overlayBottom}>
                    <Text style={styles.instructionText}>
                        Align the QR code within the frame to scan
                    </Text>
                </View>
            </View>

            {/* Header Controls */}
            <SafeAreaView style={styles.controlsHeader} edges={['top']}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.scannerTitle}>Scan QR Code</Text>

                <TouchableOpacity
                    style={[
                        styles.controlButton,
                        flashMode === 'on' && styles.controlButtonActive
                    ]}
                    onPress={toggleFlash}
                >
                    <Feather
                        name={flashMode === 'on' ? "zap" : "zap-off"}
                        size={24}
                        color={flashMode === 'on' ? colors.blue[500] : "#FFFFFF"}
                    />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scannerContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },

    // Permission State
    permissionContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        alignItems: 'center',
        padding: spacing.xl,
        width: '100%',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    permissionTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: spacing.sm,
    },
    permissionText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[500],
        textAlign: 'center',
        marginBottom: spacing['2xl'],
        lineHeight: 24,
    },
    permissionButton: {
        backgroundColor: colors.blue[500],
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.xl,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontWeight: typography.fontWeight.bold,
        fontSize: typography.fontSize.base,
    },
    secondaryButton: {
        paddingVertical: spacing.sm,
    },
    secondaryButtonText: {
        color: colors.neutral[500],
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },

    // Scanner UI
    controlsHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        zIndex: 50,
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlButtonActive: {
        backgroundColor: '#FFFFFF',
    },
    scannerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },

    // Overlay
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
    overlayTop: {
        height: (SCREEN_HEIGHT - SCANNER_SIZE) / 2,
        width: SCREEN_WIDTH,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayCenterRow: {
        height: SCANNER_SIZE,
        flexDirection: 'row',
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    window: {
        width: SCANNER_SIZE,
        height: SCANNER_SIZE,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        paddingTop: spacing.xl,
    },
    instructionText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        opacity: 0.8,
        marginTop: spacing.lg,
    },

    // Laser & Corners
    laserLine: {
        height: 2,
        width: '100%',
        backgroundColor: colors.blue[500], // Blue laser
        shadowColor: colors.blue[500],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#FFFFFF',
        borderWidth: 4,
        borderRadius: 4,
    },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

    // Found User UI
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    foundContent: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.xl,
        backgroundColor: '#F9FAFB',
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius['2xl'],
        padding: spacing['2xl'],
        alignItems: 'center',
        ...shadows.lg,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.lg,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: colors.blue[500],
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.blue[100],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.blue[500],
    },
    avatarInitials: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.blue[600],
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 2,
    },
    userName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: 4,
        textAlign: 'center',
    },
    userRole: {
        fontSize: typography.fontSize.base,
        color: colors.blue[600],
        fontWeight: typography.fontWeight.medium,
        marginBottom: 2,
        textAlign: 'center',
    },
    userCompany: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: spacing.lg,
    },
    connectText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[600],
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    cancelButtonText: {
        color: colors.neutral[600],
        fontWeight: typography.fontWeight.bold,
    },
    connectButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.blue[500],
        ...shadows.md,
    },
    connectButtonText: {
        color: '#FFFFFF',
        fontWeight: typography.fontWeight.bold,
    },
});

export default QRScannerScreen;
