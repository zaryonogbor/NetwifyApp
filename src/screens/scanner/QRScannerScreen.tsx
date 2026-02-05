import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { Button, Card, Avatar } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
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
        // Automatically request permission on mount if not determined
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

            // Fetch the scanned user's profile
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
            // Create connection request
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
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Feather name="camera-off" size={64} color={colors.neutral[400]} />
                    <Text style={styles.permissionTitle}>Camera Access Needed</Text>
                    <Text style={styles.permissionText}>
                        Please enable camera access in your settings to scan QR codes.
                    </Text>
                    <Button
                        title="Open Settings"
                        onPress={requestPermission}
                        style={{ marginTop: spacing.xl }}
                    />
                </View>
            </SafeAreaView>
        );
    }

    // Show scanned user confirmation
    if (scannedUser) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel}>
                        <Feather name="x" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Connect</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.confirmContent}>
                    <Card variant="elevated" style={styles.userCard}>
                        <Avatar
                            source={scannedUser.photoURL}
                            name={scannedUser.displayName}
                            size="xl"
                        />
                        <Text style={styles.userName}>{scannedUser.displayName}</Text>
                        <Text style={styles.userRole}>
                            {scannedUser.jobTitle}
                            {scannedUser.company && ` at ${scannedUser.company}`}
                        </Text>

                        {scannedUser.bio && (
                            <Text style={styles.userBio}>{scannedUser.bio}</Text>
                        )}
                    </Card>

                    <Text style={styles.confirmText}>
                        Send a connection request to {scannedUser.displayName}?
                    </Text>

                    <View style={styles.confirmActions}>
                        <Button
                            title="Cancel"
                            onPress={handleCancel}
                            variant="outline"
                            style={{ flex: 1, marginRight: spacing.sm }}
                        />
                        <Button
                            title="Connect"
                            onPress={handleSendRequest}
                            loading={sending}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="x" size={24} color={colors.text.inverse} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text.inverse }]}>
                    Scan QR Code
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Scanner */}
            <View style={styles.scannerContainer}>
                <CameraView
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Overlay */}
                <View style={styles.overlay}>
                    <View style={styles.scannerFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
                <Text style={styles.instructionsTitle}>Point camera at a QR code</Text>
                <Text style={styles.instructionsText}>
                    Align the QR code within the frame to scan
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[900],
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing['2xl'],
    },
    permissionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    permissionText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
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
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
    },
    scannerContainer: {
        flex: 1,
        position: 'relative',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scannerFrame: {
        width: SCANNER_SIZE,
        height: SCANNER_SIZE,
        backgroundColor: 'transparent',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: colors.primary[400],
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 8,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 8,
    },
    instructions: {
        padding: spacing['2xl'],
        alignItems: 'center',
    },
    instructionsTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.inverse,
        marginBottom: spacing.xs,
    },
    instructionsText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[400],
        textAlign: 'center',
    },
    confirmContent: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing['2xl'],
        backgroundColor: colors.background.secondary,
    },
    userCard: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
        marginBottom: spacing.xl,
    },
    userName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginTop: spacing.md,
    },
    userRole: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    userBio: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: spacing.md,
        paddingHorizontal: spacing.lg,
        lineHeight: 20,
    },
    confirmText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    confirmActions: {
        flexDirection: 'row',
    },
});

export default QRScannerScreen;
