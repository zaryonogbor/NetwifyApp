import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
    fullWidth = false,
}) => {
    const getButtonStyle = (): ViewStyle[] => {
        const baseStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: borderRadius.lg,
        };

        const sizeStyles: Record<string, ViewStyle> = {
            sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 36 },
            md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 44 },
            lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.base, minHeight: 52 },
        };

        const variantStyles: Record<string, ViewStyle> = {
            primary: { backgroundColor: colors.primary[600] },
            secondary: { backgroundColor: colors.primary[50] },
            outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary[600] },
            ghost: { backgroundColor: 'transparent' },
        };

        const disabledStyle: ViewStyle = disabled ? { opacity: 0.5 } : {};
        const widthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};

        return [baseStyle, sizeStyles[size], variantStyles[variant], disabledStyle, widthStyle];
    };

    const getTextStyle = (): TextStyle => {
        const sizeStyles: Record<string, TextStyle> = {
            sm: { fontSize: typography.fontSize.sm },
            md: { fontSize: typography.fontSize.base },
            lg: { fontSize: typography.fontSize.lg },
        };

        const variantStyles: Record<string, TextStyle> = {
            primary: { color: colors.text.inverse },
            secondary: { color: colors.primary[600] },
            outline: { color: colors.primary[600] },
            ghost: { color: colors.primary[600] },
        };

        return {
            fontWeight: typography.fontWeight.semibold,
            ...sizeStyles[size],
            ...variantStyles[variant],
        };
    };

    return (
        <TouchableOpacity
            style={[...getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.text.inverse : colors.primary[600]}
                    size="small"
                />
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <Text style={[getTextStyle(), icon ? { marginLeft: spacing.sm } : {}, textStyle]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({});

export default Button;
