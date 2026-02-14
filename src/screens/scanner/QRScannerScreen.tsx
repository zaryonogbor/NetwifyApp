import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { Button, Card, Avatar } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { QRCodeData, UserProfile, ConnectionRequest } from '../../types';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

export const QRScannerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user, userProfile } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scannedUser, setScannedUser] = useState<UserProfile | null>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission, requestPermission]);

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

    if (!permission) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.permissionText}>Requesting camera permission...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.permissionContainer}>
                <View style={styles.centerContent}>
                    <View style={styles.iconCircle}>
                        <Feather name="camera-off" size={40} color={colors.accent[500]} />
                    </View>
                    <Text style={styles.permissionTitle}>Camera Access Needed</Text>
                    <Text style={styles.permissionText}>
                        Please enable camera access in your settings to scan QR codes and connect with others.
                    </Text>
                    <Button
                        title="Grant Permission"
                        onPress={requestPermission}
                        style={styles.permissionButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    if (scannedUser) {
        return (
            <SafeAreaView style={styles.confirmContainer} edges={['top']}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                        <Feather name="x" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Connect</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.confirmContent}>
                    <View style={styles.cardWrapper}>
                        <View style={styles.avatarOverlap}>
                            <Avatar
                                source={scannedUser.photoURL}
                                name={scannedUser.displayName}
                                size="xl"
                                style={styles.avatarBorder}
                            />
                        </View>
                        <Card variant="elevated" style={styles.userCard}>
                            <View style={{ height: 40 }} />
                            <Text style={styles.userName}>{scannedUser.displayName}</Text>
                            <Text style={styles.userRole}>
                                {scannedUser.jobTitle}
                            </Text>
                            {scannedUser.company && (
                                <Text style={styles.userCompany}>{scannedUser.company}</Text>
                            )}

                            {scannedUser.bio && (
                                <View style={styles.bioContainer}>
                                    <Text style={styles.userBio}>{scannedUser.bio}</Text>
                                </View>
                            )}
                        </Card>
                    </View>

                    <Text style={styles.confirmInstruction}>
                        Would you like to send a connection request?
                    </Text>

                    <View style={styles.confirmActions}>
                        <Button
                            title="Not Now"
                            onPress={handleCancel}
                            variant="outline"
                            style={styles.actionButton}
                        />
                        <Button
                            title="Send Request"
                            onPress={handleSendRequest}
                            loading={sending}
                            style={{ ...styles.actionButton, backgroundColor: colors.accent[500] }}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.scannerRoot}>
            <StatusBar barStyle="light-content" />
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.scannerUI} edges={['top']}>
                <View style={styles.scannerHeader}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={24} color={colors.text.inverse} />
                    </TouchableOpacity>
                    <Text style={styles.scannerTitle}>Scan QR Code</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.scannerOverlay}>
                    <View style={styles.frameContainer}>
                        <View style={styles.scannerFrame}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                            <View style={styles.scanLine} />
                        </View>
                    </View>
                </View>

                <View style={styles.scannerFooter}>
                    <Text style={styles.footerText}>Align the QR code within the frame</Text>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    confirmContainer: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scannerRoot: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing['2xl'],
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary[50], // Light purple background
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    permissionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600],
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing['2xl'],
    },
    permissionButton: {
        width: '100%',
        backgroundColor: colors.accent[500],
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
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmContent: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing['3xl'],
    },
    cardWrapper: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    avatarOverlap: {
        zIndex: 1,
        marginBottom: -40,
        ...shadows.lg,
    },
    avatarBorder: {
        borderWidth: 4,
        borderColor: colors.background.primary,
    },
    userCard: {
        width: '100%',
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        ...shadows.lg,
    },
    userName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
        marginBottom: spacing.xs,
    },
    userRole: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.accent[500],
        marginBottom: spacing.xs,
    },
    userCompany: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[200],
        marginBottom: spacing.md,
    },
    bioContainer: {
        width: '100%',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        marginTop: spacing.md,
    },
    userBio: {
        fontSize: typography.fontSize.sm,
        color: colors.text.inverse,
        textAlign: 'center',
        lineHeight: 20,
        opacity: 0.9,
    },
    confirmInstruction: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    confirmActions: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
        maxWidth: 400,
    },
    actionButton: {
        flex: 1,
    },
    scannerUI: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scannerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 22,
    },
    scannerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    scannerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    frameContainer: {
        width: SCANNER_SIZE,
        height: SCANNER_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerFrame: {
        width: SCANNER_SIZE,
        height: SCANNER_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: colors.accent[500],
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 5,
        borderLeftWidth: 5,
        borderTopLeftRadius: 15,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 5,
        borderRightWidth: 5,
        borderTopRightRadius: 15,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 5,
        borderLeftWidth: 5,
        borderBottomLeftRadius: 15,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 5,
        borderRightWidth: 5,
        borderBottomRightRadius: 15,
    },
    scanLine: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: colors.accent[500],
        opacity: 0.5,
        top: '50%',
    },
    scannerFooter: {
        padding: spacing['2xl'],
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    footerText: {
        fontSize: typography.fontSize.base,
        color: colors.text.inverse,
        textAlign: 'center',
        fontWeight: typography.fontWeight.medium,
    },
});

export default QRScannerScreen;
