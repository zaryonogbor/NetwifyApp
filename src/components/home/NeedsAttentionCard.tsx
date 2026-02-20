import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface NeedsAttentionCardProps {
    initials: string;
    name: string;
    reason: string;
    onGenerate: () => void;
}

export const NeedsAttentionCard: React.FC<NeedsAttentionCardProps> = ({
    initials,
    name,
    reason,
    onGenerate,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.description} numberOfLines={1}>
                <Text style={styles.nameText}>{name}</Text> — {reason}
            </Text>
            <TouchableOpacity style={styles.generateButton} onPress={onGenerate}>
                <Text style={styles.generateText}>GENERATE</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.base,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.blue[600],
    },
    description: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
    },
    nameText: {
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[800],
    },
    generateButton: {
        paddingVertical: spacing.xs + 2,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        borderWidth: 1.5,
        borderColor: colors.blue[500],
        marginLeft: spacing.sm,
    },
    generateText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.blue[500],
        letterSpacing: 0.3,
    },
});

export default NeedsAttentionCard;
