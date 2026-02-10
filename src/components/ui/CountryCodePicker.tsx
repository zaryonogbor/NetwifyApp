import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

export interface CountryCode {
    code: string;
    name: string;
    flag: string;
}

export const COUNTRIES: CountryCode[] = [
    { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'China', code: '+86', flag: '🇨🇳' },
    { name: 'Japan', code: '+81', flag: '🇯🇵' },
    { name: 'South Africa', code: '+27', flag: '🇿🇦' },
    { name: 'Ghana', code: '+233', flag: '🇬🇭' },
    { name: 'Kenya', code: '+254', flag: '🇰🇪' },
    { name: 'South Korea', code: '+82', flag: '🇰🇷' },
    { name: 'Brazil', code: '+55', flag: '🇧🇷' },
    { name: 'Mexico', code: '+52', flag: '🇲🇽' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
    { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
];

interface CountryCodePickerProps {
    value: string; // The code, e.g., "+234"
    onSelect: (code: string) => void;
    label?: string;
    required?: boolean;
}

const windowHeight = Dimensions.get('window').height;

export const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
    value,
    onSelect,
    label,
    required,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);

    useEffect(() => {
        setFilteredCountries(
            COUNTRIES.filter((country) =>
                country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                country.code.includes(searchQuery)
            )
        );
    }, [searchQuery]);

    const selectedCountry = COUNTRIES.find((c) => c.code === value) || COUNTRIES[0];

    const handleSelect = (code: string) => {
        onSelect(code);
        setIsVisible(false);
        setSearchQuery('');
    };

    return (
        <View style={styles.container}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={{ color: colors.accent[500] }}> *</Text>}
                </Text>
            )}
            <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setIsVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.flag}>{selectedCountry?.flag}</Text>
                <Text style={styles.code}>{value}</Text>
                <Feather name="chevron-down" size={16} color={colors.text.tertiary} />
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsVisible(false)}
            >
                <SafeAreaView style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Country Code</Text>
                            <TouchableOpacity onPress={() => setIsVisible(false)}>
                                <Feather name="x" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Feather name="search" size={20} color={colors.text.tertiary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search country or code..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                        </View>

                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item, index) => `${item.code}-${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.countryItem,
                                        value === item.code && styles.selectedItem
                                    ]}
                                    onPress={() => handleSelect(item.code)}
                                >
                                    <View style={styles.countryInfo}>
                                        <Text style={styles.itemFlag}>{item.flag}</Text>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                    </View>
                                    <Text style={styles.itemCode}>{item.code}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: spacing.sm,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border.light,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background.primary,
        height: 52,
        paddingHorizontal: spacing.sm,
        minWidth: 80,
    },
    flag: {
        fontSize: 20,
        marginRight: 4,
    },
    code: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        fontWeight: typography.fontWeight.medium,
        marginRight: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        height: windowHeight * 0.7,
        paddingTop: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        marginHorizontal: spacing.xl,
        paddingHorizontal: spacing.base,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    searchInput: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    selectedItem: {
        backgroundColor: colors.primary[50],
    },
    countryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemFlag: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    itemName: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    itemCode: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        fontWeight: typography.fontWeight.medium,
    },
});

export default CountryCodePicker;
