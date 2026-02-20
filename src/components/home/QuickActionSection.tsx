import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface QuickActionSectionProps {
    onShowQR: () => void;
    onScanQR: () => void;
}

export const QuickActionSection: React.FC<QuickActionSectionProps> = ({
    onShowQR,
    onScanQR,
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.showQRCard}
                onPress={onShowQR}
                activeOpacity={0.85}
            >
                <View style={styles.qrIconContainer}>
                    <MaterialCommunityIcons name="qrcode" size={36} color="#FFFFFF" />
                </View>
                <Text style={styles.showQRLabel}>Show My QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.scanQRCard}
                onPress={onScanQR}
                activeOpacity={0.85}
            >
                <View style={styles.scanIconContainer}>
                    <Feather name="maximize" size={32} color={colors.blue[600]} />
                </View>
                <Text style={styles.scanQRLabel}>Scan QR</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    showQRCard: {
        flex: 1,
        height: 140,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.blue[500],
        // Gradient effect simulated via background
    },
    qrIconContainer: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    showQRLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    scanQRCard: {
        flex: 1,
        height: 140,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    scanIconContainer: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    scanQRLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[800],
    },
});

export default QuickActionSection;
