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
import { Button, Input, SearchableDropdown, CountryCodePicker } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../config/firebase';
import { colors, typography, spacing, borderRadius } from '../../theme';
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

type CreateProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateProfile'>;

interface Props {
    navigation: CreateProfileNavigationProp;
}

export const CreateProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { user, refreshUserProfile } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [customJobTitle, setCustomJobTitle] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [company, setCompany] = useState('');
    const [countryCode, setCountryCode] = useState('+234');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [linkedIn, setLinkedIn] = useState('');
    const [website, setWebsite] = useState('');
    const [bio, setBio] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        jobTitle?: string;
        company?: string;
        phone?: string;
        gender?: string;
        bio?: string;
    }>({});

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

        if (!firstName.trim()) newErrors.firstName = 'First Name is required';
        if (!lastName.trim()) newErrors.lastName = 'Last Name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        if (!isOtherSelected && !selectedJobTitle) newErrors.jobTitle = 'Job Title is required';
        if (isOtherSelected && !customJobTitle.trim()) newErrors.jobTitle = 'Job Title is required';
        if (!company.trim()) newErrors.company = 'Company is required';
        if (!phoneNumber.trim()) newErrors.phone = 'Phone Number is required';
        if (!gender) newErrors.gender = 'Gender is required';
        if (!bio.trim()) newErrors.bio = 'About You is required';

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
            const displayName = `${firstName.trim()} ${lastName.trim()}`;

            const profile: any = {
                uid: user.uid,
                email: email.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                displayName: displayName,
                photoURL: photoURL || null,
                jobTitle: finalJobTitle || null,
                company: company.trim() || null,
                phone: phoneNumber.trim() ? `${countryCode}${phoneNumber.trim()}` : null,
                linkedIn: linkedIn.trim() || null,
                website: website.trim() || null,
                bio: bio.trim() || null,
                gender: gender || null,
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
                        <Text style={styles.title}>Create Card</Text>
                    </View>

                    {/* Photo Picker */}
                    <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.photo} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Feather name="camera" size={24} color={colors.primary[600]} />
                                <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                            </View>
                        )}
                        <View style={styles.editBadge}>
                            <Feather name="edit-2" size={12} color={colors.text.inverse} />
                        </View>
                    </TouchableOpacity>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="First Name"
                            required
                            placeholder="Eg. John"
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCapitalize="words"
                            error={errors.firstName}
                            leftIcon={<Feather name="user" size={20} color={colors.text.tertiary} />}
                        />

                        <Input
                            label="Last Name"
                            required
                            placeholder="Eg. Doe"
                            value={lastName}
                            onChangeText={setLastName}
                            autoCapitalize="words"
                            error={errors.lastName}
                            leftIcon={<Feather name="user" size={20} color={colors.text.tertiary} />}
                        />

                        <Input
                            label="Email"
                            required
                            placeholder="Eg. john@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                            leftIcon={<Feather name="mail" size={20} color={colors.text.tertiary} />}
                        />

                        <SearchableDropdown
                            label="Job Title"
                            required
                            placeholder="Eg. UX Designer"
                            options={JOB_TITLES}
                            value={selectedJobTitle}
                            onSelect={(val: string) => {
                                setSelectedJobTitle(val);
                                setIsOtherSelected(val === 'Other');
                            }}
                            error={errors.jobTitle}
                            leftIcon={<Feather name="briefcase" size={20} color={colors.text.tertiary} />}
                        />

                        {isOtherSelected && (
                            <Input
                                label="Custom Job Title"
                                required
                                placeholder="Enter your job title"
                                value={customJobTitle}
                                onChangeText={setCustomJobTitle}
                                autoCapitalize="words"
                                error={errors.jobTitle}
                                leftIcon={<Feather name="briefcase" size={20} color={colors.text.tertiary} />}
                            />
                        )}


                        <Input
                            label="Company"
                            required
                            placeholder="E.g. Microsoft inc."
                            value={company}
                            onChangeText={setCompany}
                            autoCapitalize="words"
                            error={errors.company}
                            leftIcon={<Feather name="home" size={20} color={colors.text.tertiary} />}
                        />

                        <SearchableDropdown
                            label="Gender"
                            required
                            placeholder="Select Gender"
                            options={GENDER_OPTIONS}
                            value={gender}
                            onSelect={setGender}
                            error={errors.gender}
                            leftIcon={<Feather name="users" size={20} color={colors.text.tertiary} />}
                        />

                        <View style={styles.phoneFieldContainer}>
                            <CountryCodePicker
                                label="Phone Number"
                                required
                                value={countryCode}
                                onSelect={setCountryCode}
                            />
                            <View style={{ flex: 1 }}>
                                <Input
                                    label=" "
                                    placeholder="+000 000 000"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    error={errors.phone}
                                    leftIcon={<Feather name="phone" size={20} color={colors.text.tertiary} />}
                                />
                            </View>
                        </View>

                        <Input
                            label="LinkedIn URL"
                            placeholder="linkedin.com/in/yourprofilename"
                            value={linkedIn}
                            onChangeText={setLinkedIn}
                            autoCapitalize="none"
                            keyboardType="url"
                            leftIcon={<Feather name="linkedin" size={20} color={colors.text.tertiary} />}
                        />

                        <Input
                            label="Website"
                            placeholder="www.yourwebsite.com"
                            value={website}
                            onChangeText={setWebsite}
                            autoCapitalize="none"
                            keyboardType="url"
                            leftIcon={<Feather name="globe" size={20} color={colors.text.tertiary} />}
                        />

                        <Input
                            label="About You"
                            required
                            placeholder="Tell people a bit about yourself"
                            value={bio}
                            onChangeText={setBio}
                            error={errors.bio}
                            multiline
                            numberOfLines={4}
                            style={{ height: 100, textAlignVertical: 'top' }}
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
        fontSize: 24,
        fontWeight: typography.fontWeight.bold,
        color: colors.primary[600], // Dark Purple
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    photoContainer: {
        alignSelf: 'center',
        marginBottom: spacing['2xl'],
        position: 'relative',
    },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    photoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EBEBF5', // Light greyish purple
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.primary[200],
    },
    photoPlaceholderText: {
        marginTop: 4,
        fontSize: 10,
        color: colors.primary[600],
        fontWeight: '500',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary[600],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.background.primary,
    },
    form: {},
    phoneFieldContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    createButton: {
        marginTop: spacing.lg,
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.xl,
        height: 56,
    },
});

export default CreateProfileScreen;
