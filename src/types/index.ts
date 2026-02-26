// User types
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string;
    jobTitle?: string;
    company?: string;
    phone?: string;
    linkedIn?: string;
    website?: string;
    address?: string;
    bio?: string;
    gender?: 'Male' | 'Female' | 'Other';
    createdAt: Date;
    updatedAt: Date;
}

// Contact types
export interface Contact {
    id: string;
    userId: string; // Owner of this contact
    contactUserId: string; // The connected user's ID
    displayName: string;
    photoURL?: string;
    jobTitle?: string;
    company?: string;
    email?: string;
    phone?: string;
    linkedIn?: string;
    website?: string;
    address?: string;
    bio?: string;
    notes?: string; // Personal notes about this contact
    tags?: string[];
    aiSummary?: string;
    metAt?: string; // Event or location where they met
    connectedAt: Date;
    lastInteractionAt?: Date;
}

// Connection Request types
export interface ConnectionRequest {
    id: string;
    fromUserId: string;
    toUserId: string;
    fromUserProfile: {
        displayName: string;
        photoURL?: string;
        jobTitle?: string;
        company?: string;
    };
    status: 'pending' | 'accepted' | 'declined';
    message?: string;
    createdAt: Date;
    respondedAt?: Date;
}

// AI Feature types
export interface AIFollowUpMessage {
    id: string;
    contactId: string;
    userId: string;
    generatedMessage: string;
    tone: 'professional' | 'friendly' | 'casual';
    purpose: 'follow_up' | 'thank_you' | 'meeting_request' | 'custom';
    createdAt: Date;
    isSent: boolean;
}

// QR Code data structure
export interface QRCodeData {
    type: 'netwify_connect';
    userId: string;
    timestamp: number;
    displayName?: string;
    jobTitle?: string;
    company?: string;
    photoURL?: string;
}

// Navigation types
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    Login: undefined;
    SignUp: undefined;
    Splash: undefined;
    Onboarding: undefined;
    CreateProfile: undefined;
    ContactDetail: { contactId: string };
    AIFollowUp: { contactId: string };
    EditProfile: undefined;
    QRScanner: undefined;
    Notifications: undefined;
    Settings: undefined;
    PrivacySecurity: undefined;
    ChangePassword: undefined;
    Language: undefined;
    Appearance: undefined;
    HelpSupport: undefined;
    TermsOfService: undefined;
    PrivacyPolicy: undefined;
    About: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Contacts: undefined;
    MyQR: undefined;
    Profile: undefined;
    Notifications: undefined;
};
