import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface NetworkingSnapshotProps {
    newConnectionsCount: number;
    pendingFollowUpsCount: number;
    onViewDetails?: () => void;
}

export const NetworkingSnapshot: React.FC<NetworkingSnapshotProps> = ({
    newConnectionsCount,
    pendingFollowUpsCount,
    onViewDetails,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <MaterialCommunityIcons
                        name="star-four-points"
                        size={20}
                        color={colors.blue[500]}
                    />
                    <Text style={styles.title}>Your Networking Snapshot</Text>
                </View>
                <TouchableOpacity onPress={onViewDetails}>
                    <Text style={styles.viewDetails}>VIEW DETAILS</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                    <View style={[styles.bullet, { backgroundColor: colors.blue[500] }]} />
                    <Text style={styles.statText}>
                        {newConnectionsCount} new connections this week
                    </Text>
                </View>
                <View style={styles.statRow}>
                    <View style={[styles.bullet, { backgroundColor: colors.blue[500] }]} />
                    <Text style={styles.statText}>
                        {pendingFollowUpsCount} follow-ups pending
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    title: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[800],
    },
    viewDetails: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.blue[500],
        letterSpacing: 0.5,
    },
    statsContainer: {
        gap: spacing.sm,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    bullet: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    statText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
    },
});

export default NetworkingSnapshot;
