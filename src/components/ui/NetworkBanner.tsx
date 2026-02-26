import React, { useEffect, useState, useRef } from 'react';
import { Animated, Text, StyleSheet, Platform, View, StatusBar } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

export const NetworkBanner: React.FC = () => {
    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();
    const [isOffline, setIsOffline] = useState(false);
    const translateY = useRef(new Animated.Value(-150)).current;

    useEffect(() => {
        // netInfo.isConnected can initially be null
        if (netInfo.isConnected === null) return;

        const offline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

        if (offline !== isOffline) {
            setIsOffline(offline);

            Animated.spring(translateY, {
                toValue: offline ? 0 : -150,
                useNativeDriver: true,
                speed: 12,
                bounciness: 4,
            }).start();
        }
    }, [netInfo.isConnected, netInfo.isInternetReachable, isOffline]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0)
                }
            ]}
        >
            <View style={styles.content}>
                <Feather name="wifi-off" size={16} color="#FFFFFF" />
                <Text style={styles.text}>Connect to the internet to sync updates.</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.warning,
        zIndex: 9999,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
        gap: spacing.sm,
    },
    text: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
});
