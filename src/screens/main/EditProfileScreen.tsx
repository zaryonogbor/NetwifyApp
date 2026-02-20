import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Input, SearchableDropdown } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../config/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { RootStackParamList } from '../../types';

const JOB_TITLES = [
    { label: 'Software Engineer', value: 'Software Engineer' },
    { label: 'Product Manager', value: 'Product Manager' },
    { label: 'Project Manager', value: 'Project Manager' },
    { label: 'Data Scientist', value: 'Data Scientist' },
    { label: 'UX Designer', value: 'UX Designer' },
    { label: 'UI Designer', value: 'UI Designer' },
    { label: 'Marketing Manager', value: 'Marketing Manager' },
    { label: 'Sales Executive', value: 'Sales Executive' },
    { label: 'Financial Analyst', value: 'Financial Analyst' },
    { label: 'Human Resources', value: 'Human Resources' },
    { label: 'Business Analyst', value: 'Business Analyst' },
    { label: 'Operations Manager', value: 'Operations Manager' },
    { label: 'Content Strategist', value: 'Content Strategist' },
    { label: 'Social Media Manager', value: 'Social Media Manager' },
    { label: 'Other', value: 'Other' },
];

const GENDER_OPTIONS = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
];

type EditProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

interface Props {
    navigation: EditProfileNavigationProp;
}

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { user, userProfile, refreshUserProfile } = useAuth();

    const [firstName, setFirstName] = useState(userProfile?.firstName || '');
    const [lastName, setLastName] = useState(userProfile?.lastName || '');
    const [email, setEmail] = useState(userProfile?.email || user?.email || '');
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [customJobTitle, setCustomJobTitle] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [company, setCompany] = useState(userProfile?.company || '');
    const [phoneNumber, setPhoneNumber] = useState(userProfile?.phone || '');
    const [gender, setGender] = useState(userProfile?.gender || '');
    const [linkedIn, setLinkedIn] = useState(userProfile?.linkedIn || '');
    const [website, setWebsite] = useState(userProfile?.website || '');
    const [bio, setBio] = useState(userProfile?.bio || '');
    const [address, setAddress] = useState(userProfile?.address || '');
    const [photoUri, setPhotoUri] = useState<string | null>(userProfile?.photoURL || null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        jobTitle?: string;
        company?: string;
        gender?: string;
        bio?: string;
    }>({});

    useEffect(() => {
        if (userProfile) {
            const splitDisplayName = (userProfile.displayName || '').split(' ');
            const derivedFirstName = splitDisplayName[0] || '';
            const derivedLastName = splitDisplayName.slice(1).join(' ') || '';

            setFirstName(userProfile.firstName || derivedFirstName);
            setLastName(userProfile.lastName || derivedLastName);
            setEmail(userProfile.email || user?.email || '');
            setCompany(userProfile.company || '');
            setLinkedIn(userProfile.linkedIn || '');
            setWebsite(userProfile.website || '');
            setAddress(userProfile.address || '');
            setBio(userProfile.bio || '');
            setGender(userProfile.gender || '');
            setPhoneNumber(userProfile.phone || '');
            setPhotoUri(userProfile.photoURL || null);

            const profileJobTitle = userProfile.jobTitle || '';
            if (profileJobTitle) {
                const matchingOption = JOB_TITLES.find(opt => opt.value === profileJobTitle);
                if (matchingOption && profileJobTitle !== 'Other') {
                    setSelectedJobTitle(profileJobTitle);
                    setIsOtherSelected(false);
                    setCustomJobTitle('');
                } else {
                    setSelectedJobTitle('Other');
                    setCustomJobTitle(profileJobTitle);
                    setIsOtherSelected(true);
                }
            }
        }
    }, [userProfile, user?.email]);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Please allow access to your photos to update profile picture.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const uploadPhoto = async (uri: string): Promise<string> => {
        if (uri.startsWith('http')) return uri;

        const response = await fetch(uri);
        const blob = await response.blob();
        const photoRef = ref(storage, `profile_photos/${user!.uid}`);
        await uploadBytes(photoRef, blob);
        return await getDownloadURL(photoRef);
    };

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!firstName.trim()) newErrors.firstName = 'First Name is required';
        if (!lastName.trim()) newErrors.lastName = 'Last Name is required';
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!isOtherSelected && !selectedJobTitle) newErrors.jobTitle = 'Job Title is required';
        if (isOtherSelected && !customJobTitle.trim()) newErrors.jobTitle = 'Job Title is required';
        if (!company.trim()) newErrors.company = 'Company is required';
        if (!gender) newErrors.gender = 'Gender is required';
        if (!bio.trim()) newErrors.bio = 'About You is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdateProfile = async () => {
        if (!validateForm() || !user) return;

        setLoading(true);
        try {
            let photoURL = userProfile?.photoURL;

            if (photoUri && photoUri !== userProfile?.photoURL) {
                photoURL = await uploadPhoto(photoUri);
            }

            const finalJobTitle = isOtherSelected ? customJobTitle.trim() : selectedJobTitle;
            const displayName = `${firstName.trim()} ${lastName.trim()}`;

            await updateDoc(doc(db, 'users', user.uid), {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                displayName: displayName,
                email: email.trim().toLowerCase(),
                photoURL: photoURL || null,
                jobTitle: finalJobTitle || null,
                company: company.trim() || null,
                phone: phoneNumber.trim() || null,
                linkedIn: linkedIn.trim() || null,
                website: website.trim() || null,
                address: address.trim() || null,
                gender: gender || null,
                bio: bio.trim() || null,
                updatedAt: new Date(),
            });

            await refreshUserProfile();

            // Just go back, maybe show a toast if we had one, but Alert is fine for now on native
            if (Platform.OS !== 'web') {
                Alert.alert('Success', 'Profile updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                navigation.goBack();
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionCard}>
                {children}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={22} color={colors.neutral[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleUpdateProfile} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.blue[500]} />
                    ) : (
                        <Text style={styles.saveLink}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Photo Picker */}
                    <View style={styles.photoSection}>
                        <TouchableOpacity style={styles.photoContainer} onPress={pickImage} activeOpacity={0.8}>
                            {photoUri ? (
                                <Image source={{ uri: photoUri }} style={styles.photo} />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Feather name="user" size={40} color={colors.blue[200]} />
                                </View>
                            )}
                            <View style={styles.editBadge}>
                                <Feather name="camera" size={14} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.photoHint}>Tap to change profile photo</Text>
                    </View>

                    {/* Basic Info */}
                    <FormSection title="BASIC INFO">
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="First Name"
                                    placeholder="Jane"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    error={errors.firstName}
                                    containerStyle={styles.inputSpacing}
                                />
                            </View>
                            <View style={{ width: spacing.md }} />
                            <View style={{ flex: 1 }}>
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    error={errors.lastName}
                                    containerStyle={styles.inputSpacing}
                                />
                            </View>
                        </View>

                        <SearchableDropdown
                            label="Job Title"
                            placeholder="Select role"
                            options={JOB_TITLES}
                            value={selectedJobTitle}
                            onSelect={(val: string) => {
                                setSelectedJobTitle(val);
                                setIsOtherSelected(val === 'Other');
                            }}
                            error={errors.jobTitle}
                            containerStyle={styles.inputSpacing}
                        />

                        {isOtherSelected && (
                            <Input
                                label="Custom Job Title"
                                placeholder="Enter role"
                                value={customJobTitle}
                                onChangeText={setCustomJobTitle}
                                error={errors.jobTitle}
                                containerStyle={styles.inputSpacing}
                            />
                        )}

                        <Input
                            label="Company"
                            placeholder="Acme Inc."
                            value={company}
                            onChangeText={setCompany}
                            error={errors.company}
                            containerStyle={styles.inputSpacing}
                            leftIcon={<Feather name="briefcase" size={18} color={colors.neutral[500]} />}
                        />

                        <SearchableDropdown
                            label="Gender"
                            placeholder="Select Gender"
                            options={GENDER_OPTIONS}
                            value={gender}
                            onSelect={setGender}
                            error={errors.gender}
                        />
                    </FormSection>

                    {/* Contact Info */}
                    <FormSection title="CONTACT">
                        <Input
                            label="Email"
                            placeholder="jane@example.com"
                            value={email}
                            onChangeText={setEmail}
                            error={errors.email}
                            keyboardType="email-address"
                            containerStyle={styles.inputSpacing}
                            leftIcon={<Feather name="mail" size={18} color={colors.neutral[500]} />}
                        />
                        <Input
                            label="Phone"
                            placeholder="+1 234 567 890"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            containerStyle={styles.inputSpacing}
                            leftIcon={<Feather name="phone" size={18} color={colors.neutral[500]} />}
                        />
                        <Input
                            label="Office Address"
                            placeholder="123 Main St..."
                            value={address}
                            onChangeText={setAddress}
                            containerStyle={styles.inputSpacing}
                            leftIcon={<Feather name="map-pin" size={18} color={colors.neutral[500]} />}
                        />
                    </FormSection>

                    {/* Socials */}
                    <FormSection title="SOCIALS">
                        <Input
                            label="LinkedIn"
                            placeholder="linkedin.com/in/..."
                            value={linkedIn}
                            onChangeText={setLinkedIn}
                            containerStyle={styles.inputSpacing}
                            leftIcon={<Feather name="linkedin" size={18} color={colors.neutral[500]} />}
                        />
                        <Input
                            label="Website"
                            placeholder="https://..."
                            value={website}
                            onChangeText={setWebsite}
                            containerStyle={{ marginBottom: 0 }}
                            leftIcon={<Feather name="globe" size={18} color={colors.neutral[500]} />}
                        />
                    </FormSection>

                    {/* Bio */}
                    <FormSection title="ABOUT">
                        <Input
                            label="Bio"
                            placeholder="Share a brief intro..."
                            value={bio}
                            onChangeText={setBio}
                            error={errors.bio}
                            multiline
                            numberOfLines={4}
                            style={{ height: 100, textAlignVertical: 'top' }}
                            containerStyle={{ marginBottom: 0 }}
                        />
                    </FormSection>

                    {/* Save Button (Bottom) */}
                    <Button
                        title="Save Profile"
                        onPress={handleUpdateProfile}
                        loading={loading}
                        style={styles.bottomSaveButton}
                    />

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing['4xl'],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.background.primary,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: colors.background.secondary,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[900],
    },
    saveLink: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
        color: colors.blue[600],
    },

    // Photo
    photoSection: {
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: spacing.xs,
        ...shadows.sm,
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: colors.background.secondary,
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.blue[50],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.background.secondary,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.blue[500],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.background.secondary,
    },
    photoHint: {
        fontSize: typography.fontSize.xs,
        color: colors.neutral[500],
        marginTop: spacing.xs,
    },

    // Form Sections
    section: {
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: colors.neutral[500],
        letterSpacing: 1,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    sectionCard: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    row: {
        flexDirection: 'row',
    },
    inputSpacing: {
        marginBottom: spacing.md,
    },
    bottomSaveButton: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        backgroundColor: colors.blue[500],
        marginBottom: spacing.lg,
    },
});

export default EditProfileScreen;
