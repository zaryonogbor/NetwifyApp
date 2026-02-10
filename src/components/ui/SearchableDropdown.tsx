import React, { useState, useRef, useEffect } from 'react';
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

interface Option {
    label: string;
    value: string;
}

interface SearchableDropdownProps {
    label?: string;
    required?: boolean;
    options: Option[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

const windowHeight = Dimensions.get('window').height;

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
    label,
    required,
    options,
    value,
    onSelect,
    placeholder = 'Select an option',
    error,
    leftIcon,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);

    useEffect(() => {
        setFilteredOptions(
            options.filter((option) =>
                option.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, options]);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (val: string) => {
        onSelect(val);
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
                style={[
                    styles.inputContainer,
                    error ? { borderColor: colors.error } : { borderColor: colors.border.light }
                ]}
                onPress={() => setIsVisible(true)}
                activeOpacity={0.7}
            >
                {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                <Text
                    style={[
                        styles.input,
                        !selectedOption && { color: colors.text.tertiary }
                    ]}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Feather name="chevron-down" size={20} color={colors.text.tertiary} style={styles.iconRight} />
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal
                visible={isVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsVisible(false)}
            >
                <SafeAreaView style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                            <TouchableOpacity onPress={() => setIsVisible(false)}>
                                <Feather name="x" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Feather name="search" size={20} color={colors.text.tertiary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                        </View>

                        <FlatList
                            data={filteredOptions}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        value === item.value && styles.selectedOptionItem
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        value === item.value && styles.selectedOptionText
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {value === item.value && (
                                        <Feather name="check" size={20} color={colors.primary[600]} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No results found</Text>
                                </View>
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
        minHeight: 52,
    },
    input: {
        flex: 1,
        paddingHorizontal: spacing.base,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background.primary,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        height: windowHeight * 0.8,
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
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    selectedOptionItem: {
        backgroundColor: colors.primary[50],
    },
    optionText: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    selectedOptionText: {
        color: colors.primary[600],
        fontWeight: typography.fontWeight.semibold,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
    },
});

export default SearchableDropdown;
