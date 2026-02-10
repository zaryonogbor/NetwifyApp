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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card, Avatar, Button } from '../../components/ui';
import { colors, typography, spacing, borderRadius } from '../../theme';

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
            // On web, Alert.alert doesn't always show up or behave well depending on the environment
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
            <Feather name={icon as any} size={20} color={colors.text.tertiary} />
            <View style={styles.profileItemContent}>
                <Text style={styles.profileItemLabel}>{label}</Text>
                <Text style={[
                    styles.profileItemValue,
                    onPress && value && { color: colors.primary[600] }
                ]}>
                    {value || 'Not set'}
                </Text>
            </View>
            {onPress && value && (
                <Feather name="external-link" size={16} color={colors.text.tertiary} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <TouchableOpacity onPress={handleEditProfile}>
                        <Feather name="edit-2" size={20} color={colors.primary[600]} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <Card variant="elevated" style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Avatar
                            source={userProfile?.photoURL}
                            name={userProfile?.displayName}
                            size="xl"
                        />
                        <TouchableOpacity
                            style={styles.editAvatarButton}
                            onPress={handleEditProfile}
                        >
                            <Feather name="camera" size={14} color={colors.text.inverse} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.profileName}>{userProfile?.displayName}</Text>
                    <Text style={styles.profileRole}>
                        {userProfile?.jobTitle}
                        {userProfile?.company && ` at ${userProfile?.company}`}
                    </Text>

                    {userProfile?.bio && (
                        <Text style={styles.profileBio}>{userProfile.bio}</Text>
                    )}
                </Card>

                {/* Contact Info */}
                <Card style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

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
                </Card>

                {/* Settings */}
                <Card style={styles.settingsCard}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <TouchableOpacity style={styles.settingsItem}>
                        <Feather name="bell" size={20} color={colors.text.tertiary} />
                        <Text style={styles.settingsItemText}>Notifications</Text>
                        <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsItem}>
                        <Feather name="shield" size={20} color={colors.text.tertiary} />
                        <Text style={styles.settingsItemText}>Privacy</Text>
                        <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsItem}>
                        <Feather name="help-circle" size={20} color={colors.text.tertiary} />
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
        backgroundColor: colors.background.secondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing['3xl'],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
    },
    profileCard: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
        marginBottom: spacing.lg,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary[600],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.background.primary,
    },
    profileName: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    profileRole: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    profileBio: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    infoCard: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    profileItemContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    profileItemLabel: {
        fontSize: typography.fontSize.xs,
        color: colors.text.tertiary,
        marginBottom: 2,
    },
    profileItemValue: {
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    settingsCard: {
        marginBottom: spacing.xl,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    settingsItemText: {
        flex: 1,
        marginLeft: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    signOutButton: {
        marginBottom: spacing.lg,
    },
    version: {
        fontSize: typography.fontSize.sm,
        color: colors.text.tertiary,
        textAlign: 'center',
    },
});

export default ProfileScreen;
