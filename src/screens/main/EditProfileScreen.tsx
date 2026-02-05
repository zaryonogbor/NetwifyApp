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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Input, SearchableDropdown, CountryCodePicker } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../config/firebase';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RootStackParamList } from '../../types';

const JOB_TITLES = [
    { label: 'Software Engineer', value: 'Software Engineer' },
    { label: 'Full Stack Developer', value: 'Full Stack Developer' },
    { label: 'Backend Developer', value: 'Backend Developer' },
    { label: 'Frontend Developer', value: 'Frontend Developer' },
    { label: 'Mobile Developer', value: 'Mobile Developer' },
    { label: 'Product Manager', value: 'Product Manager' },
    { label: 'Product Designer', value: 'Product Designer' },
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

type EditProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

interface Props {
    navigation: EditProfileNavigationProp;
}

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { user, userProfile, refreshUserProfile } = useAuth();

    const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
    const [jobTitle, setJobTitle] = useState(userProfile?.jobTitle || '');
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [customJobTitle, setCustomJobTitle] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [company, setCompany] = useState(userProfile?.company || '');
    const [phone, setPhone] = useState(userProfile?.phone || '');
    const [countryCode, setCountryCode] = useState('+234');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [linkedIn, setLinkedIn] = useState(userProfile?.linkedIn || '');
    const [bio, setBio] = useState(userProfile?.bio || '');
    const [photoUri, setPhotoUri] = useState<string | null>(userProfile?.photoURL || null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ displayName?: string }>({});

    useEffect(() => {
        if (userProfile) {
            setDisplayName(userProfile.displayName);
            setCompany(userProfile.company || '');
            setPhone(userProfile.phone || '');
            setLinkedIn(userProfile.linkedIn || '');
            setBio(userProfile.bio || '');
            setPhotoUri(userProfile.photoURL || null);

            // Handle phone number and country code parsing
            const fullPhone = userProfile.phone || '';
            if (fullPhone.startsWith('+')) {
                // Try to find the longest matching country code
                const codes = ['+971', '+966', '+234', '+233', '+254', '+27', '+91', '+86', '+81', '+33', '+49', '+61', '+44', '+1', '+55', '+52', '+82'];
                let foundCode = '+234';
                let phonePart = fullPhone;

                for (const c of codes) {
                    if (fullPhone.startsWith(c)) {
                        foundCode = c;
                        phonePart = fullPhone.slice(c.length);
                        break;
                    }
                }
                setCountryCode(foundCode);
                setPhoneNumber(phonePart);
            } else {
                setPhoneNumber(fullPhone);
            }

            // Handle job title initialization
            const profileJobTitle = userProfile.jobTitle || '';
            const matchingOption = JOB_TITLES.find(opt => opt.value === profileJobTitle);

            if (matchingOption && profileJobTitle !== 'Other') {
                setSelectedJobTitle(profileJobTitle);
                setIsOtherSelected(false);
            } else if (profileJobTitle) {
                setSelectedJobTitle('Other');
                setCustomJobTitle(profileJobTitle);
                setIsOtherSelected(true);
            }
        }
    }, [userProfile]);

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
        // If it's already a firebase URL, skip upload
        if (uri.startsWith('http')) return uri;

        const response = await fetch(uri);
        const blob = await response.blob();
        const photoRef = ref(storage, `profile_photos/${user!.uid}`);
        await uploadBytes(photoRef, blob);
        return await getDownloadURL(photoRef);
    };

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!displayName.trim()) {
            newErrors.displayName = 'Name is required';
        }

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

            await updateDoc(doc(db, 'users', user.uid), {
                displayName: displayName.trim(),
                photoURL,
                jobTitle: finalJobTitle || null,
                company: company.trim() || null,
                phone: phoneNumber.trim() ? `${countryCode}${phoneNumber.trim()}` : null,
                linkedIn: linkedIn.trim() || null,
                bio: bio.trim() || null,
                updatedAt: new Date(),
            });

            await refreshUserProfile();

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Feather name="arrow-left" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Edit Profile</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {/* Photo Picker */}
                    <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.photo} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Feather name="camera" size={32} color={colors.primary[400]} />
                                <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                            </View>
                        )}
                        <View style={styles.editBadge}>
                            <Feather name="edit-2" size={14} color={colors.text.inverse} />
                        </View>
                    </TouchableOpacity>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Full Name *"
                            placeholder="Enter your name"
                            value={displayName}
                            onChangeText={setDisplayName}
                            autoCapitalize="words"
                            error={errors.displayName}
                            leftIcon={<Feather name="user" size={20} color={colors.text.tertiary} />}
                        />

                        <SearchableDropdown
                            label="Job Title"
                            placeholder="Select your job title"
                            options={JOB_TITLES}
                            value={selectedJobTitle}
                            onSelect={(val: string) => {
                                setSelectedJobTitle(val);
                                setIsOtherSelected(val === 'Other');
                            }}
                            leftIcon={<Feather name="briefcase" size={20} color={colors.text.tertiary} />}
                        />

                        {isOtherSelected && (
                            <Input
                                label="Custom Job Title"
                                placeholder="Enter your job title"
                                value={customJobTitle}
                                onChangeText={setCustomJobTitle}
                                autoCapitalize="words"
                                leftIcon={<Feather name="edit-3" size={20} color={colors.text.tertiary} />}
                            />
                        )}

                        <Input
                            label="Company"
                            placeholder="e.g., Acme Inc."
                            value={company}
                            onChangeText={setCompany}
                            autoCapitalize="words"
                            leftIcon={<Feather name="home" size={20} color={colors.text.tertiary} />}
                        />

                        <View style={styles.phoneFieldContainer}>
                            <CountryCodePicker
                                label="Phone"
                                value={countryCode}
                                onSelect={setCountryCode}
                            />
                            <View style={{ flex: 1 }}>
                                <Input
                                    label=" "
                                    placeholder="801 234 5678"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    leftIcon={<Feather name="phone" size={20} color={colors.text.tertiary} />}
                                />
                            </View>
                        </View>

                        <Input
                            label="LinkedIn URL"
                            placeholder="linkedin.com/in/yourprofile"
                            value={linkedIn}
                            onChangeText={setLinkedIn}
                            autoCapitalize="none"
                            keyboardType="url"
                            leftIcon={<Feather name="linkedin" size={20} color={colors.text.tertiary} />}
                        />

                        <Input
                            label="Short Bio"
                            placeholder="Tell people a bit about yourself..."
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={3}
                            style={{ height: 80, textAlignVertical: 'top' }}
                        />

                        <Button
                            title="Save Changes"
                            onPress={handleUpdateProfile}
                            loading={loading}
                            fullWidth
                            size="lg"
                            style={styles.saveButton}
                        />
                    </View>
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
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing['3xl'],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    backButton: {
        padding: spacing.xs,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
    },
    photoContainer: {
        alignSelf: 'center',
        marginBottom: spacing['2xl'],
        position: 'relative',
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.primary[200],
        borderStyle: 'dashed',
    },
    photoPlaceholderText: {
        marginTop: spacing.xs,
        fontSize: typography.fontSize.sm,
        color: colors.primary[600],
        fontWeight: typography.fontWeight.medium,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary[600],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.background.primary,
    },
    form: {},
    phoneFieldContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    saveButton: {
        marginTop: spacing.lg,
    },
});

export default EditProfileScreen;
