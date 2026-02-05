import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../theme';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    style,
}) => {
    const getCardStyle = (): ViewStyle[] => {
        const baseStyle: ViewStyle = {
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius.lg,
        };

        const paddingStyles: Record<string, ViewStyle> = {
            none: { padding: 0 },
            sm: { padding: spacing.sm },
            md: { padding: spacing.base },
            lg: { padding: spacing.xl },
        };

        const variantStyles: Record<string, ViewStyle> = {
            default: {
                ...shadows.sm,
            },
            elevated: {
                ...shadows.lg,
            },
            outlined: {
                borderWidth: 1,
                borderColor: colors.border.light,
            },
        };

        return [baseStyle, paddingStyles[padding], variantStyles[variant]];
    };

    return <View style={[...getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({});

export default Card;
