import React, { useState } from 'react';
import {
    View,
    TextInput as RNTextInput,
    Text,
    StyleSheet,
    TextInputProps as RNTextInputProps,
    ViewStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface InputProps extends RNTextInputProps {
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    required,
    error,
    helperText,
    leftIcon,
    rightIcon,
    containerStyle,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const getBorderColor = () => {
        if (error) return colors.error;
        if (isFocused) return colors.primary[600];
        return colors.border.light;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={{ color: colors.accent[500] }}> *</Text>}
                </Text>
            )}
            <View
                style={[
                    styles.inputContainer,
                    { borderColor: getBorderColor() },
                    isFocused && styles.inputFocused,
                ]}
            >
                {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                <RNTextInput
                    style={[
                        styles.input,
                        leftIcon ? { paddingLeft: 0 } : {},
                        rightIcon ? { paddingRight: 0 } : {},
                        style,
                    ]}
                    placeholderTextColor={colors.text.tertiary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.base,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background.primary,
    },
    inputFocused: {
        borderWidth: 2,
    },
    input: {
        flex: 1,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    iconLeft: {
        paddingLeft: spacing.md,
    },
    iconRight: {
        paddingRight: spacing.md,
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
    },
    helperText: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
});

export default Input;
