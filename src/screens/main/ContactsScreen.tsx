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
import { Card, Avatar } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Contact } from '../../types';

export const ContactsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);

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
            const query = searchQuery.toLowerCase();
            const filtered = contacts.filter(
                (contact) =>
                    contact.displayName.toLowerCase().includes(query) ||
                    contact.company?.toLowerCase().includes(query) ||
                    contact.jobTitle?.toLowerCase().includes(query)
            );
            setFilteredContacts(filtered);
        }
    }, [searchQuery, contacts]);

    const renderContact = ({ item }: { item: Contact }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ContactDetail', { contactId: item.id })}
        >
            <Card style={styles.contactCard}>
                <Avatar source={item.photoURL} name={item.displayName} size="lg" />
                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.displayName}</Text>
                    <Text style={styles.contactRole} numberOfLines={1}>
                        {item.jobTitle}
                        {item.company && ` at ${item.company}`}
                    </Text>
                    {item.aiSummary && (
                        <View style={styles.aiTag}>
                            <Feather name="zap" size={10} color={colors.accent[600]} />
                            <Text style={styles.aiTagText}>AI Summary</Text>
                        </View>
                    )}
                </View>
                <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
            </Card>
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

    const renderHeader = () => (
        <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
                <Feather name="search" size={20} color={colors.text.tertiary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search contacts..."
                    placeholderTextColor={colors.text.tertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Feather name="x" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Contacts</Text>
                <Text style={styles.subtitle}>{contacts.length} connections</Text>
            </View>

            {renderHeader()}

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
        backgroundColor: colors.background.secondary,
    },
    header: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginTop: 2,
    },
    searchContainer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.md,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.primary,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        paddingVertical: spacing.xs,
    },
    listContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['3xl'],
        flexGrow: 1,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    contactInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    contactName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
    },
    contactRole: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginTop: 2,
    },
    aiTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
        backgroundColor: colors.accent[50],
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
    },
    aiTagText: {
        fontSize: typography.fontSize.xs,
        color: colors.accent[700],
        marginLeft: 4,
        fontWeight: typography.fontWeight.medium,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing['4xl'],
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginTop: spacing.lg,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        textAlign: 'center',
        maxWidth: '80%',
    },
});

export default ContactsScreen;
