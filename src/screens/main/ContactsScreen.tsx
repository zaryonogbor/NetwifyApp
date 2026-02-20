import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { Avatar } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Contact } from '../../types';

export const ContactsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        if (!user) return;

        const contactsQuery = query(
            collection(db, 'contacts'),
            where('userId', '==', user.uid),
            orderBy('displayName', 'asc')
        );

        const unsubscribe = onSnapshot(contactsQuery, (snapshot) => {
            const contactsList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Contact[];
            setContacts(contactsList);
            setFilteredContacts(contactsList);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredContacts(contacts);
        } else {
            const q = searchQuery.toLowerCase();
            const filtered = contacts.filter(
                (contact) =>
                    contact.displayName.toLowerCase().includes(q) ||
                    contact.company?.toLowerCase().includes(q) ||
                    contact.jobTitle?.toLowerCase().includes(q)
            );
            setFilteredContacts(filtered);
        }
    }, [searchQuery, contacts]);

    const renderContact = ({ item }: { item: Contact }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ContactDetail', { contactId: item.id })}
            style={styles.contactCard}
        >
            <View style={styles.contactLeft}>
                <Avatar source={item.photoURL} name={item.displayName} size="lg" />
                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.displayName}</Text>
                    <Text style={styles.contactRole} numberOfLines={1}>
                        {item.jobTitle}
                        {item.company && ` @ ${item.company}`}
                    </Text>
                </View>
            </View>
            <Feather name="chevron-right" size={20} color={colors.neutral[300]} />
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Feather name="users" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No contacts yet</Text>
            <Text style={styles.emptyText}>
                Start networking by scanning QR codes at your next event
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Contacts</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchInputContainer, searchFocused && styles.searchInputFocused]}>
                    <Feather name="search" size={18} color={searchFocused ? colors.blue[500] : colors.neutral[400]} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search contacts..."
                        placeholderTextColor={colors.neutral[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <Feather name="sliders" size={18} color={colors.neutral[600]} />
                </TouchableOpacity>
            </View>

            {/* Contact List */}
            <FlatList
                data={filteredContacts}
                renderItem={renderContact}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        gap: spacing.sm,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInputFocused: {
        borderColor: colors.blue[500],
        borderWidth: 1.5,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: typography.fontSize.base,
        color: colors.neutral[800],
        paddingVertical: spacing.xs,
    },
    filterButton: {
        width: 42,
        height: 42,
        borderRadius: borderRadius.lg,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    // List
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
    },

    // Contact Card
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.xl,
        padding: spacing.base,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    contactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    contactInfo: {
        flex: 1,
        justifyContent: 'center',
        marginLeft: spacing.md,
    },
    contactName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.neutral[900],
        marginBottom: 2,
    },
    contactRole: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[500],
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing['4xl'],
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[800],
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[500],
        textAlign: 'center',
        maxWidth: '80%',
    },
});

export default ContactsScreen;
