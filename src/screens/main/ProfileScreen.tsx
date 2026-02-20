import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    StatusBar,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 260;

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { userProfile, user } = useAuth();
    const [connectionCount, setConnectionCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        const fetchCount = async () => {
            const q = query(
                collection(db, 'contacts'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(q);
            setConnectionCount(snapshot.size);
        };
        fetchCount();
    }, [user]);

    const openLink = async (url: string) => {
        try {
            await Linking.openURL(url);
        } catch {
            Alert.alert('Error', 'Could not open link');
        }
    };

    const getInitials = (name?: string): string => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const ContactRow = ({
        icon,
        label,
        value,
        onPress,
        isLast,
    }: {
        icon: string;
        label: string;
        value?: string;
        onPress?: () => void;
        isLast?: boolean;
    }) => (
        <TouchableOpacity
            style={[styles.contactRow, !isLast && styles.contactRowBorder]}
            onPress={onPress}
            disabled={!onPress || !value}
            activeOpacity={onPress && value ? 0.7 : 1}
        >
            <View style={styles.contactIconBox}>
                <Feather name={icon as any} size={17} color={colors.blue[500]} />
            </View>
            <View style={styles.contactContent}>
                <Text style={styles.contactLabel}>{label}</Text>
                <Text style={[styles.contactValue, !value && styles.contactValueEmpty]}>
                    {value || 'Not set'}
                </Text>
            </View>
            {onPress && value && (
                <View style={styles.contactChevron}>
                    <Feather name="chevron-right" size={16} color={colors.blue[400]} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={colors.blue[500]} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Blue Hero Header ── */}
                <View style={styles.hero}>
                    {/* Decorative background circles */}
                    <View style={styles.decorCircle1} />
                    <View style={styles.decorCircle2} />
                    {/* Settings button */}
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => navigation.navigate('Settings')}
                        activeOpacity={0.8}
                    >
                        <Feather name="settings" size={20} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>

                    {/* Avatar */}
                    <View style={styles.avatarRing}>
                        {userProfile?.photoURL ? (
                            <Image source={{ uri: userProfile.photoURL }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>
                                    {getInitials(userProfile?.displayName)}
                                </Text>
                            </View>
                        )}
                        {/* Edit badge */}
                        <TouchableOpacity
                            style={styles.editBadge}
                            onPress={() => navigation.navigate('EditProfile')}
                            activeOpacity={0.85}
                        >
                            <Feather name="edit-2" size={11} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Name & Role */}
                    <Text style={styles.heroName}>{userProfile?.displayName || 'Your Name'}</Text>
                    <Text style={styles.heroRole}>
                        {userProfile?.jobTitle
                            ? `${userProfile.jobTitle}${userProfile.company ? ` · ${userProfile.company}` : ''}`
                            : 'Add your role'}
                    </Text>
                </View>

                {/* ── Floating Stats Card ── */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{connectionCount}</Text>
                        <Text style={styles.statLabel}>Connections</Text>
                    </View>

                    <View style={styles.statDivider} />

                    <TouchableOpacity
                        style={styles.editProfileBtn}
                        onPress={() => navigation.navigate('EditProfile')}
                        activeOpacity={0.85}
                    >
                        <Feather name="edit-3" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Bio ── */}
                {userProfile?.bio ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ABOUT</Text>
                        <View style={styles.bioCard}>
                            <View style={styles.bioAccent} />
                            <View style={styles.bioContent}>
                                <MaterialCommunityIcons
                                    name="format-quote-open"
                                    size={22}
                                    color={colors.blue[200]}
                                    style={styles.quoteIcon}
                                />
                                <Text style={styles.bioText}>{userProfile.bio}</Text>
                            </View>
                        </View>
                    </View>
                ) : null}

                {/* ── Contact Details ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>
                    <View style={styles.card}>
                        <ContactRow
                            icon="mail"
                            label="Email"
                            value={userProfile?.email}
                        />
                        <ContactRow
                            icon="phone"
                            label="Phone"
                            value={userProfile?.phone}
                        />
                        <ContactRow
                            icon="map-pin"
                            label="Address"
                            value={userProfile?.address}
                        />
                    </View>
                </View>

                {/* ── Online ── */}
                {(userProfile?.linkedIn || userProfile?.website) ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ONLINE</Text>
                        <View style={styles.card}>
                            {userProfile?.linkedIn && (
                                <ContactRow
                                    icon="linkedin"
                                    label="LinkedIn"
                                    value={userProfile.linkedIn}
                                    onPress={() => openLink(`https://${userProfile.linkedIn}`)}
                                />
                            )}
                            {userProfile?.website && (
                                <ContactRow
                                    icon="globe"
                                    label="Website"
                                    value={userProfile.website}
                                    onPress={() => openLink(`https://${userProfile.website}`)}
                                    isLast
                                />
                            )}
                        </View>
                    </View>
                ) : null}

                {/* Footer spacer */}
                <View style={{ height: spacing['2xl'] }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollContent: {
        paddingBottom: spacing['4xl'],
    },

    // ── Hero ──
    hero: {
        height: HERO_HEIGHT,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: spacing['4xl'], // top breathing room so avatar doesn't touch edge
        paddingBottom: 52, // space for the floating card overlap
        paddingHorizontal: spacing.lg,
        position: 'relative',
        overflow: 'hidden',
    },
    decorCircle1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    decorCircle2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    settingsBtn: {
        position: 'absolute',
        top: spacing.lg,
        right: spacing.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarRing: {
        position: 'relative',
        width: 104,
        height: 104,
        borderRadius: 52,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    avatarImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    avatarPlaceholder: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.blue[400],
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        fontSize: 34,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        zIndex: 2,
    },
    heroName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        marginBottom: 4,
        textAlign: 'center',
    },
    heroRole: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
        marginBottom: spacing.md,
    },

    // ── Floating Stats Card ──
    statsCard: {
        marginHorizontal: spacing.lg,
        marginTop: -28, // pull up over the hero
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...shadows.md,
        borderWidth: 1,
        borderColor: colors.border.light,
        zIndex: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
        fontWeight: typography.fontWeight.medium,
        marginTop: 2,
        letterSpacing: 0.4,
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: colors.border.light,
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.blue[500],
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        shadowColor: colors.blue[500],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    editProfileBtnText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },

    // ── Sections ──
    section: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[500],
        letterSpacing: 1.2,
        marginBottom: spacing.sm,
        marginLeft: 2,
    },
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        paddingHorizontal: spacing.base,
        borderWidth: 1,
        borderColor: colors.border.light,
        ...shadows.sm,
    },

    // ── Bio Card ──
    bioCard: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border.light,
        flexDirection: 'row',
        overflow: 'hidden',
        ...shadows.sm,
    },
    bioAccent: {
        width: 4,
        backgroundColor: colors.blue[500],
    },
    bioContent: {
        flex: 1,
        padding: spacing.lg,
    },
    quoteIcon: {
        marginBottom: 4,
    },
    bioText: {
        fontSize: typography.fontSize.sm,
        color: colors.neutral[600],
        lineHeight: 22,
    },

    // ── Contact Rows ──
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.base,
    },
    contactRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    contactIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    contactContent: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 11,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[500],
        letterSpacing: 0.6,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    contactValue: {
        fontSize: typography.fontSize.base,
        color: colors.neutral[900],
        fontWeight: typography.fontWeight.medium,
    },
    contactValueEmpty: {
        color: colors.neutral[400],
        fontStyle: 'italic',
        fontSize: typography.fontSize.sm,
    },
    contactChevron: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.sm,
    },
});

export default ProfileScreen;
