import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card, Avatar, Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { userProfile, signOut } = useAuth();

    const handleSignOut = () => {
        const performSignOut = async () => {
            console.log('User confirmed sign out, calling signOut...');
            try {
                await signOut();
                console.log('Sign out successful');
            } catch (error) {
                console.error('Error during sign out:', error);
                Alert.alert('Error', 'An error occurred during sign out. Please try again.');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to sign out?')) {
                performSignOut();
            }
        } else {
            Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign Out', style: 'destructive', onPress: performSignOut },
                ]
            );
        }
    };

    const handleEditProfile = () => {
        navigation.navigate('EditProfile');
    };

    const openLink = async (url: string) => {
        try {
            await Linking.openURL(url);
        } catch {
            Alert.alert('Error', 'Could not open link');
        }
    };

    const ProfileItem = ({
        icon,
        label,
        value,
        onPress
    }: {
        icon: string;
        label: string;
        value?: string;
        onPress?: () => void;
    }) => (
        <TouchableOpacity
            style={styles.profileItem}
            onPress={onPress}
            disabled={!onPress || !value}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.profileItemIcon}>
                <Feather name={icon as any} size={18} color={colors.primary[400]} />
            </View>
            <View style={styles.profileItemContent}>
                <Text style={styles.profileItemLabel}>{label}</Text>
                <Text style={[
                    styles.profileItemValue,
                    onPress && value && { color: colors.accent[500] }
                ]}>
                    {value || 'Not set'}
                </Text>
            </View>
            {onPress && value && (
                <Feather name="chevron-right" size={16} color={colors.text.tertiary} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
                <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
                    <Feather name="settings" size={24} color={colors.primary[600]} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Section */}
                <View style={styles.profileWrapper}>
                    <View style={styles.avatarOverlap}>
                        <Avatar
                            source={userProfile?.photoURL}
                            name={userProfile?.displayName}
                            size="xl"
                            style={styles.avatarBorder}
                        />
                        <TouchableOpacity
                            style={styles.editAvatarButton}
                            onPress={handleEditProfile}
                        >
                            <Feather name="camera" size={14} color={colors.text.inverse} />
                        </TouchableOpacity>
                    </View>
                    <Card variant="elevated" style={styles.profileCard}>
                        <View style={{ height: 40 }} />
                        <Text style={styles.profileName}>{userProfile?.displayName}</Text>
                        <Text style={styles.profileRole}>
                            {userProfile?.jobTitle}
                        </Text>
                        {userProfile?.company && (
                            <Text style={styles.profileCompany}>{userProfile?.company}</Text>
                        )}

                        {userProfile?.bio && (
                            <View style={styles.bioContainer}>
                                <Text style={styles.profileBio}>{userProfile.bio}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.editProfileButton}
                            onPress={handleEditProfile}
                            activeOpacity={0.8}
                        >
                            <Feather name="edit-2" size={18} color="#FFFFFF" style={styles.editIcon} />
                            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* Contact Info */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>CONTACT INFORMATION</Text>

                    <ProfileItem
                        icon="mail"
                        label="Email"
                        value={userProfile?.email}
                    />
                    <ProfileItem
                        icon="phone"
                        label="Phone"
                        value={userProfile?.phone}
                    />
                    <ProfileItem
                        icon="linkedin"
                        label="LinkedIn"
                        value={userProfile?.linkedIn}
                        onPress={userProfile?.linkedIn ?
                            () => openLink(`https://${userProfile.linkedIn}`) : undefined
                        }
                    />
                    <ProfileItem
                        icon="globe"
                        label="Website"
                        value={userProfile?.website}
                        onPress={userProfile?.website ?
                            () => openLink(`https://${userProfile.website}`) : undefined
                        }
                    />
                    <ProfileItem
                        icon="map-pin"
                        label="Office Address"
                        value={userProfile?.address}
                    />
                </Card>

                {/* Account Settings */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>

                    <TouchableOpacity
                        style={styles.settingsItem}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <View style={styles.settingsIcon}>
                            <Feather name="bell" size={18} color={colors.primary[400]} />
                        </View>
                        <Text style={styles.settingsItemText}>Notifications</Text>
                        <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsItem}>
                        <View style={styles.settingsIcon}>
                            <Feather name="shield" size={18} color={colors.primary[400]} />
                        </View>
                        <Text style={styles.settingsItemText}>Privacy & Security</Text>
                        <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsItem}>
                        <View style={styles.settingsIcon}>
                            <Feather name="help-circle" size={18} color={colors.primary[400]} />
                        </View>
                        <Text style={styles.settingsItemText}>Help & Support</Text>
                        <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>
                </Card>

                {/* Sign Out */}
                <Button
                    title="Sign Out"
                    onPress={handleSignOut}
                    variant="outline"
                    fullWidth
                    style={styles.signOutButton}
                    icon={<Feather name="log-out" size={18} color={colors.primary[600]} />}
                />

                {/* App Version */}
                <Text style={styles.version}>Netwify v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['4xl'],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600],
    },
    editButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileWrapper: {
        alignItems: 'center',
        marginTop: spacing['2xl'],
        marginBottom: spacing.xl,
    },
    avatarOverlap: {
        zIndex: 1,
        marginBottom: -40,
        position: 'relative',
        borderRadius: 999,
        borderWidth: 4,
        borderColor: '#FAFAFA',
        padding: 4,
        backgroundColor: '#FAFAFA',
    },
    avatarBorder: {
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.accent[500],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2.5,
        borderColor: '#FAFAFA',
        zIndex: 2,
    },
    profileCard: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.xl,
        ...shadows.lg,
    },
    profileName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.inverse,
        marginBottom: spacing.xs,
    },
    profileRole: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.accent[500],
        marginBottom: spacing.xs,
    },
    profileCompany: {
        fontSize: typography.fontSize.sm,
        color: colors.primary[200],
        marginBottom: spacing.lg,
    },
    bioContainer: {
        width: '100%',
        paddingHorizontal: spacing['2xl'],
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
    },
    profileBio: {
        fontSize: typography.fontSize.sm,
        color: colors.text.inverse,
        textAlign: 'center',
        lineHeight: 20,
        opacity: 0.9,
    },
    editProfileButton: {
        backgroundColor: colors.accent[500],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: spacing['3xl'],
        borderRadius: borderRadius.full,
        marginTop: spacing.sm,
        ...shadows.md,
    },
    editIcon: {
        marginRight: spacing.sm,
    },
    editProfileButtonText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.lg, // Matching typography.fontSize.lg (18)
        fontWeight: typography.fontWeight.bold,
    },
    section: {
        marginBottom: spacing.lg,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.background.secondary,
        ...shadows.sm,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[400],
        letterSpacing: 1.2,
        marginBottom: spacing.md,
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    profileItemIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    profileItemContent: {
        flex: 1,
    },
    profileItemLabel: {
        fontSize: 11,
        color: colors.text.tertiary,
        fontWeight: typography.fontWeight.medium,
        marginBottom: 2,
    },
    profileItemValue: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        fontWeight: typography.fontWeight.medium,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    settingsIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    settingsItemText: {
        flex: 1,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
        fontWeight: typography.fontWeight.medium,
    },
    signOutButton: {
        marginTop: spacing.md,
        marginBottom: spacing.xl,
        borderColor: colors.border.medium,
    },
    version: {
        fontSize: typography.fontSize.sm,
        color: colors.text.tertiary,
        textAlign: 'center',
        marginBottom: spacing['2xl'],
    },
});

export default ProfileScreen;
