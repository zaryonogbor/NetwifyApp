import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const { width, height } = Dimensions.get('window');
const ONBOARDING_DONE_KEY = '@netwify_onboarding_done';

const slides = [
    {
        id: '1',
        title: 'Connect Instantly',
        description:
            'Scan a QR code to exchange contact details in seconds. No more fumbling with business cards.',
        icon: 'zap' as const,
        iconColor: '#3B82F6',
        bgColor: '#EFF6FF',
        accentColor: '#2563EB',
    },
    {
        id: '2',
        title: 'Grow Your Network',
        description:
            'Build your professional circle and nurture relationships that matter — all in one place.',
        icon: 'users' as const,
        iconColor: '#7C3AED',
        bgColor: '#F5F3FF',
        accentColor: '#6D28D9',
    },
    {
        id: '3',
        title: 'Never Lose a Contact',
        description:
            'Your connections are safely stored and AI-powered follow-ups keep every relationship fresh.',
        icon: 'cpu' as const,
        iconColor: '#0891B2',
        bgColor: '#ECFEFF',
        accentColor: '#0E7490',
    },
];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems?.length > 0) {
            setCurrentIndex(viewableItems[0].index ?? 0);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleComplete = useCallback(async () => {
        await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
        navigation.replace('Login');
    }, [navigation]);

    const scrollTo = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleComplete();
        }
    };

    const isLast = currentIndex === slides.length - 1;

    // ── Slide ──────────────────────────────────────────────────────────────────
    const SlideItem = ({ item }: { item: typeof slides[0] }) => (
        <View style={styles.slide}>
            {/* Illustration area */}
            <View style={[styles.illustrationBox, { backgroundColor: item.bgColor }]}>
                {/* Decorative rings */}
                <View style={[styles.ring, styles.ringOuter, { borderColor: item.iconColor + '18' }]} />
                <View style={[styles.ring, styles.ringInner, { borderColor: item.iconColor + '30' }]} />

                {/* Icon card */}
                <View style={[styles.iconCard, shadows.lg]}>
                    <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                        <Feather name={item.icon} size={48} color={item.iconColor} />
                    </View>
                </View>

                {/* Brand logo top-left */}
                <View style={styles.brandBadge}>
                    <MaterialCommunityIcons name="access-point-network" size={16} color="#FFFFFF" />
                </View>
            </View>

            {/* Text */}
            <View style={styles.textBlock}>
                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideDesc}>{item.description}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header row */}
            <View style={styles.header}>
                <View style={styles.brandRow}>
                    <View style={styles.brandLogo}>
                        <MaterialCommunityIcons name="access-point-network" size={18} color="#FFFFFF" />
                    </View>
                    <Text style={styles.brandName}>Netwify</Text>
                </View>
                <TouchableOpacity onPress={handleComplete} style={styles.skipBtn} activeOpacity={0.7}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Slides */}
            <FlatList
                ref={slidesRef}
                data={slides}
                renderItem={({ item }) => <SlideItem item={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                style={styles.flatList}
            />

            {/* Footer */}
            <View style={styles.footer}>
                {/* Paginator */}
                <View style={styles.dots}>
                    {slides.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 28, 8],
                            extrapolate: 'clamp',
                        });
                        const dotOpacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View
                                key={i}
                                style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
                            />
                        );
                    })}
                </View>

                {/* CTA button */}
                <TouchableOpacity
                    style={[styles.ctaBtn, isLast && styles.ctaBtnLast]}
                    onPress={scrollTo}
                    activeOpacity={0.85}
                >
                    <Text style={styles.ctaBtnText}>
                        {isLast ? 'Get Started' : 'Next'}
                    </Text>
                    <Feather
                        name={isLast ? 'arrow-right' : 'arrow-right'}
                        size={18}
                        color="#FFFFFF"
                        style={styles.ctaIcon}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export { ONBOARDING_DONE_KEY };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    brandLogo: {
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
    },
    skipBtn: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
    },
    skipText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[400],
        fontWeight: typography.fontWeight.medium,
    },

    // FlatList
    flatList: {
        flex: 1,
    },

    // Slide
    slide: {
        width,
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    illustrationBox: {
        flex: 1,
        marginBottom: spacing.xl,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    ring: {
        position: 'absolute',
        borderWidth: 1.5,
        borderRadius: 1000,
    },
    ringOuter: {
        width: '90%',
        aspectRatio: 1,
    },
    ringInner: {
        width: '55%',
        aspectRatio: 1,
    },
    iconCard: {
        width: 136,
        height: 136,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
    },
    textBlock: {
        alignItems: 'center',
        paddingBottom: spacing.md,
    },
    slideTitle: {
        fontSize: 26,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: spacing.sm,
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    slideDesc: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[500],
        textAlign: 'center',
        lineHeight: 25,
        maxWidth: 320,
    },

    // Footer
    footer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['2xl'],
        alignItems: 'center',
        gap: spacing.xl,
    },
    dots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.blue[500],
    },
    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.blue[600],
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.lg,
        width: '100%',
        gap: spacing.sm,
        shadowColor: colors.blue[600],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    ctaBtnLast: {
        backgroundColor: colors.blue[500],
    },
    ctaBtnText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: 0.2,
    },
    ctaIcon: {
        marginLeft: 2,
    },
});

export default OnboardingScreen;
