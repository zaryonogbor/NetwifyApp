import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    FlatList,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, borderRadius } from '../../theme';

export const LANGUAGE_KEY = '@netwify_language';

interface LanguageOption {
    id: string;
    label: string;
    nativeName: string;
    countryCode: string;
}

const languages: LanguageOption[] = [
    { id: 'en', label: 'English', nativeName: 'English', countryCode: 'us' },
    { id: 'es', label: 'Spanish', nativeName: 'Español', countryCode: 'es' },
    { id: 'fr', label: 'French', nativeName: 'Français', countryCode: 'fr' },
    { id: 'de', label: 'German', nativeName: 'Deutsch', countryCode: 'de' },
    { id: 'it', label: 'Italian', nativeName: 'Italiano', countryCode: 'it' },
    { id: 'pt', label: 'Portuguese', nativeName: 'Português', countryCode: 'br' },
    { id: 'zh', label: 'Chinese', nativeName: '中文', countryCode: 'cn' },
    { id: 'ja', label: 'Japanese', nativeName: '日本語', countryCode: 'jp' },
    { id: 'ru', label: 'Russian', nativeName: 'Русский', countryCode: 'ru' },
    { id: 'ar', label: 'Arabic', nativeName: 'العربية', countryCode: 'sa' },
];

export const LanguageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [saving, setSaving] = useState(false);

    // Load saved language on mount
    useEffect(() => {
        AsyncStorage.getItem(LANGUAGE_KEY).then((val) => {
            if (val) setSelectedLanguage(val);
        });
    }, []);

    const handleSelect = async (id: string) => {
        setSaving(true);
        setSelectedLanguage(id);
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, id);
            const selected = languages.find((l) => l.id === id);
            Alert.alert(
                'Language Updated',
                `App language set to ${selected?.label}. Some changes may require a restart.`
            );
        } catch (error) {
            Alert.alert('Error', 'Could not save language preference.');
        } finally {
            setSaving(false);
        }
    };

    const renderItem = ({ item }: { item: LanguageOption }) => {
        const isSelected = selectedLanguage === item.id;
        return (
            <TouchableOpacity
                style={[styles.languageRow, isSelected && styles.languageRowSelected]}
                onPress={() => handleSelect(item.id)}
                activeOpacity={0.7}
                disabled={saving}
            >
                <View style={styles.flagContainer}>
                    <Image
                        source={{ uri: `https://flagcdn.com/w80/${item.countryCode}.png` }}
                        style={styles.flagImage}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.label, isSelected && styles.labelSelected]}>
                        {item.label}
                    </Text>
                    <Text style={styles.nativeName}>{item.nativeName}</Text>
                </View>
                {isSelected ? (
                    <View style={styles.checkIcon}>
                        <Feather name="check" size={16} color="#FFFFFF" />
                    </View>
                ) : (
                    <View style={styles.radioCircle} />
                )}
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
                <Text style={styles.headerTitle}>Language</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Feather name="globe" size={16} color={colors.blue[600]} />
                <Text style={styles.infoBannerText}>
                    Your selected language is saved and will be applied across the app. A restart may be needed for full effect.
                </Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>SELECT LANGUAGE</Text>
                <FlatList
                    data={languages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
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
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.blue[50],
        borderRadius: borderRadius.xl,
        padding: spacing.base,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    infoBannerText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        color: colors.blue[700],
        lineHeight: 20,
        fontWeight: typography.fontWeight.medium,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[400],
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
    listContent: {
        paddingBottom: spacing['4xl'],
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    languageRowSelected: {
        borderColor: colors.blue[500],
        borderWidth: 1.5,
        backgroundColor: colors.blue[50],
    },
    flagContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    flagImage: {
        width: '100%',
        height: '100%',
    },
    textContainer: { flex: 1 },
    label: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[900],
    },
    labelSelected: { color: colors.blue[700] },
    nativeName: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
        marginTop: 2,
    },
    checkIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
});

export default LanguageScreen;
