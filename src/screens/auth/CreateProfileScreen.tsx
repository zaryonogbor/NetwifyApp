import React, { useState } from 'react';
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
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Input, Avatar, SearchableDropdown, CountryCodePicker } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../config/firebase';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { RootStackParamList, UserProfile } from '../../types';

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

type CreateProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateProfile'>;

interface Props {
    navigation: CreateProfileNavigationProp;
}

export const CreateProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { user, refreshUserProfile } = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [customJobTitle, setCustomJobTitle] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [company, setCompany] = useState('');
    const [countryCode, setCountryCode] = useState('+234');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [linkedIn, setLinkedIn] = useState('');
    const [bio, setBio] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ displayName?: string }>({});

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Please allow access to your photos to add a profile picture.');
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

    const handleCreateProfile = async () => {
        if (!validateForm() || !user) return;

        setLoading(true);
        try {
            let photoURL: string | undefined;

            if (photoUri) {
                photoURL = await uploadPhoto(photoUri);
            }

            const finalJobTitle = isOtherSelected ? customJobTitle.trim() : selectedJobTitle;

            const profile: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: displayName.trim(),
                photoURL,
                jobTitle: finalJobTitle || undefined,
                company: company.trim() || undefined,
                phone: phoneNumber.trim() ? `${countryCode}${phoneNumber.trim()}` : undefined,
                linkedIn: linkedIn.trim() || undefined,
                bio: bio.trim() || undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await setDoc(doc(db, 'users', user.uid), profile);
            await refreshUserProfile();

            // Navigation will happen automatically via AuthContext
        } catch (error) {
            console.error('Error creating profile:', error);
            Alert.alert('Error', 'Failed to create profile. Please try again.');
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
                        <Text style={styles.title}>Edit Profile</Text>
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
                            title="Create My Card"
                            onPress={handleCreateProfile}
                            loading={loading}
                            fullWidth
                            size="lg"
                            style={styles.createButton}
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
        paddingTop: spacing.xl,
        paddingBottom: spacing['3xl'],
    },
    header: {
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        lineHeight: 22,
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
    createButton: {
        marginTop: spacing.lg,
    },
});

export default CreateProfileScreen;
