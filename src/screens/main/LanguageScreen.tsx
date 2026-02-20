import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    FlatList,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

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

    const renderItem = ({ item }: { item: LanguageOption }) => {
        const isSelected = selectedLanguage === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.languageRow,
                    isSelected && styles.languageRowSelected,
                ]}
                onPress={() => setSelectedLanguage(item.id)}
                activeOpacity={0.7}
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
                        <Feather name="check" size={20} color="#FFFFFF" />
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
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
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
        overflow: 'hidden', // Ensure rounded corners clip the image
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    flagImage: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[900],
    },
    labelSelected: {
        color: colors.blue[700],
    },
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
