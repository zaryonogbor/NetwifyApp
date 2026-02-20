import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.75)).current;
    const logoGlowAnim = useRef(new Animated.Value(0)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;
    const textSlideAnim = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        // Step 1: Logo pop-in
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Step 2: Glow pulses subtly
            Animated.loop(
                Animated.sequence([
                    Animated.timing(logoGlowAnim, {
                        toValue: 1,
                        duration: 900,
                        useNativeDriver: true,
                    }),
                    Animated.timing(logoGlowAnim, {
                        toValue: 0,
                        duration: 900,
                        useNativeDriver: true,
                    }),
                ]),
                { iterations: 3 }
            ).start();

            // Step 3: Text slides up
            Animated.parallel([
                Animated.timing(textFadeAnim, {
                    toValue: 1,
                    duration: 400,
                    delay: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(textSlideAnim, {
                    toValue: 0,
                    duration: 400,
                    delay: 100,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        });
    }, []);

    const glowOpacity = logoGlowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.25, 0.55],
    });

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background glow ring */}
            <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />

            {/* Logo */}
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={styles.logoSquare}>
                    <MaterialCommunityIcons
                        name="access-point-network"
                        size={52}
                        color="#FFFFFF"
                    />
                </View>
            </Animated.View>

            {/* Text */}
            <Animated.View
                style={[
                    styles.textBlock,
                    {
                        opacity: textFadeAnim,
                        transform: [{ translateY: textSlideAnim }],
                    },
                ]}
            >
                <Text style={styles.title}>Netwify</Text>
                <Text style={styles.tagline}>Connect. Share. Grow.</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.blue[600],
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowRing: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    logoContainer: {
        marginBottom: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    logoSquare: {
        width: 110,
        height: 110,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    textBlock: {
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    tagline: {
        fontSize: typography.fontSize.base,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: typography.fontWeight.medium,
        letterSpacing: 0.5,
    },
});

export default SplashScreen;
