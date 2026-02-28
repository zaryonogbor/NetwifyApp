import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

export const APPEARANCE_KEY = '@netwify_appearance';
type ThemeOption = 'light' | 'dark' | 'system';

export const AppearanceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const systemScheme = useColorScheme();
    const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('light');
    const [saving, setSaving] = useState(false);

    // Load saved preference on mount
    useEffect(() => {
        AsyncStorage.getItem(APPEARANCE_KEY).then((val) => {
            if (val) setSelectedTheme(val as ThemeOption);
        });
    }, []);

    const handleSelect = async (theme: ThemeOption) => {
        setSaving(true);
        setSelectedTheme(theme);
        try {
            await AsyncStorage.setItem(APPEARANCE_KEY, theme);
            const labels: Record<ThemeOption, string> = {
                light: 'Light Mode',
                dark: 'Dark Mode',
                system: 'System Default',
            };
            Alert.alert(
                'Appearance Updated',
                `${labels[theme]} has been applied. Full dark mode support is coming in a future update.`
            );
        } catch (error) {
            Alert.alert('Error', 'Could not save appearance preference.');
        } finally {
            setSaving(false);
        }
    };

    const themeOptions: { theme: ThemeOption; label: string; icon: string; description: string }[] = [
        { theme: 'light', label: 'Light Mode', icon: 'sun', description: 'Default bright appearance' },
        { theme: 'dark', label: 'Dark Mode', icon: 'moon', description: 'Easier on the eyes at night' },
        { theme: 'system', label: 'System Default', icon: 'smartphone', description: `Follows your device (currently ${systemScheme ?? 'light'})` },
    ];

    const ThemeCard = ({
        theme,
        label,
        icon,
        description,
    }: {
        theme: ThemeOption;
        label: string;
        icon: string;
        description: string;
    }) => {
        const isSelected = selectedTheme === theme;
        return (
            <TouchableOpacity
                style={[styles.themeCard, isSelected && styles.themeCardSelected]}
                onPress={() => handleSelect(theme)}
                activeOpacity={0.8}
                disabled={saving}
            >
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                    <Feather
                        name={icon as any}
                        size={22}
                        color={isSelected ? colors.blue[500] : colors.neutral[400]}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
                <View style={styles.radioContainer}>
                    {isSelected ? (
                        <View style={styles.radioSelected}>
                            <Feather name="check" size={13} color="#FFFFFF" />
                        </View>
                    ) : (
                        <View style={styles.radioUnselected} />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Feather name="arrow-left" size={22} color={colors.neutral[800]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Appearance</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>APP THEME</Text>

                {themeOptions.map((opt) => (
                    <ThemeCard key={opt.theme} {...opt} />
                ))}

                <View style={styles.infoBox}>
                    <Feather name="info" size={16} color={colors.blue[600]} />
                    <Text style={styles.infoText}>
                        Your selection is saved and applied at next launch. Full dark mode support is coming soon.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
    },
    headerSpacer: { width: 40 },
    content: { flex: 1 },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing['4xl'],
    },
    sectionTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[400],
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...shadows.sm,
    },
    themeCardSelected: {
        borderColor: colors.blue[500],
        backgroundColor: colors.blue[50],
        borderWidth: 1.5,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    iconContainerSelected: { backgroundColor: '#FFFFFF' },
    textContainer: { flex: 1 },
    label: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
        marginBottom: 2,
    },
    labelSelected: { color: colors.blue[700] },
    description: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
    },
    radioContainer: { marginLeft: spacing.md },
    radioUnselected: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    radioSelected: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.blue[50],
        padding: spacing.base,
        borderRadius: borderRadius.xl,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.blue[700],
        lineHeight: 20,
    },
});

export default AppearanceScreen;
