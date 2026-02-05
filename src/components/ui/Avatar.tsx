import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { colors, typography, borderRadius } from '../../theme';

interface AvatarProps {
    source?: string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    style?: ViewStyle;
}

const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
};

const fontSizeMap = {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
};

export const Avatar: React.FC<AvatarProps> = ({
    source,
    name = '',
    size = 'md',
    style,
}) => {
    const dimension = sizeMap[size];
    const fontSize = fontSizeMap[size];

    const getInitials = (name: string): string => {
        const names = name.trim().split(' ');
        if (names.length === 0) return '?';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const dimensionStyle = {
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
    };

    if (source) {
        return (
            <Image
                source={{ uri: source }}
                style={[styles.image, dimensionStyle, style as ImageStyle]}
            />
        );
    }

    return (
        <View style={[styles.placeholder, dimensionStyle, style]}>
            <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    image: {
        backgroundColor: colors.neutral[200],
    },
    placeholder: {
        backgroundColor: colors.primary[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        color: colors.primary[600],
        fontWeight: typography.fontWeight.semibold,
    },
});

export default Avatar;
