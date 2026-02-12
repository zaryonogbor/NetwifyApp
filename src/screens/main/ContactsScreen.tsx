import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { Avatar } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
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
            <View style={styles.contactItem}>
                <View style={styles.avatarContainer}>
                    <Avatar source={item.photoURL} name={item.displayName} size="lg" />
                </View>
                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.displayName}</Text>
                    <Text style={styles.contactRole} numberOfLines={1}>
                        {item.jobTitle}
                        {item.company && ` At ${item.company}`}
                    </Text>
                </View>
            </View>
            <View style={styles.separator} />
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

    // Mock avatars for the stack
    const mockStackAvatars = contacts.slice(0, 3).map(c => c.photoURL).filter(Boolean) as string[];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Connections</Text>

                <View style={styles.connectionCountContainer}>
                    <View style={styles.avatarStack}>
                        {mockStackAvatars.length > 0 ? (
                            mockStackAvatars.map((url, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: url }}
                                    style={[styles.stackAvatar, { marginLeft: index > 0 ? -12 : 0, zIndex: 3 - index }]}
                                />
                            ))
                        ) : (
                            // Fallback if no contacts have photos or no contacts
                            <View style={[styles.stackAvatar, { backgroundColor: colors.primary[100] }]}>
                                <Feather name="user" size={14} color={colors.primary[600]} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.subtitle}>{contacts.length > 0 ? `+${contacts.length} Connections` : '0 Connections'}</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Feather name="search" size={20} color={colors.text.tertiary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="search connections..."
                        placeholderTextColor={colors.text.tertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredContacts}
                renderItem={renderContact}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('QRScanner')} // Assume FAB opens scanner or add options
            >
                <Feather name="plus" size={32} color="#FFFFFF" />
            </TouchableOpacity>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600], // Dark Purple
        marginBottom: spacing.xs,
    },
    connectionCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    avatarStack: {
        flexDirection: 'row',
        marginRight: spacing.sm,
    },
    stackAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#FAFAFA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: '#9E97CA', // Light Purple
        fontWeight: '500',
    },
    searchContainer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1.5,
        borderColor: '#E5E7EB', // Light Grey Border
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
        paddingBottom: 100, // Space for FAB
        flexGrow: 1,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    avatarContainer: {
        marginRight: spacing.md,
        borderWidth: 2,
        borderColor: '#F2A090', // Salmon border
        borderRadius: 999,
        padding: 2,
    },
    contactInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    contactName: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600],
        marginBottom: 2,
    },
    contactRole: {
        fontSize: typography.fontSize.sm,
        color: '#9E97CA',
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginLeft: 70, // Align with text
    },
    fab: {
        position: 'absolute',
        bottom: spacing['4xl'],
        right: spacing.xl,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F2A090', // Salmon
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.lg,
        elevation: 5,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing['4xl'],
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
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
