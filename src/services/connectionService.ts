import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    deleteDoc,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ConnectionRequest, Contact, UserProfile } from '../types';

// Accept a connection request
export const acceptConnectionRequest = async (
    request: ConnectionRequest,
    currentUserId: string
): Promise<void> => {
    // Get the requester's full profile
    const requesterDoc = await getDoc(doc(db, 'users', request.fromUserId));
    const requesterProfile = requesterDoc.data() as UserProfile;

    // Get current user's profile
    const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
    const currentUserProfile = currentUserDoc.data() as UserProfile;

    // Create contact entry for current user (the accepter)
    const contactForCurrentUser: Omit<Contact, 'id'> = {
        userId: currentUserId,
        contactUserId: request.fromUserId,
        displayName: requesterProfile.displayName,
        photoURL: requesterProfile.photoURL,
        jobTitle: requesterProfile.jobTitle,
        company: requesterProfile.company,
        email: requesterProfile.email,
        phone: requesterProfile.phone,
        linkedIn: requesterProfile.linkedIn,
        bio: requesterProfile.bio,
        connectedAt: new Date(),
    };

    // Create contact entry for the requester
    const contactForRequester: Omit<Contact, 'id'> = {
        userId: request.fromUserId,
        contactUserId: currentUserId,
        displayName: currentUserProfile.displayName,
        photoURL: currentUserProfile.photoURL,
        jobTitle: currentUserProfile.jobTitle,
        company: currentUserProfile.company,
        email: currentUserProfile.email,
        phone: currentUserProfile.phone,
        linkedIn: currentUserProfile.linkedIn,
        bio: currentUserProfile.bio,
        connectedAt: new Date(),
    };

    // Add both contacts
    await addDoc(collection(db, 'contacts'), contactForCurrentUser);
    await addDoc(collection(db, 'contacts'), contactForRequester);

    // Update request status
    await updateDoc(doc(db, 'connectionRequests', request.id), {
        status: 'accepted',
        respondedAt: new Date(),
    });
};

// Decline a connection request
export const declineConnectionRequest = async (requestId: string): Promise<void> => {
    await updateDoc(doc(db, 'connectionRequests', requestId), {
        status: 'declined',
        respondedAt: new Date(),
    });
};

// Delete a contact
export const deleteContact = async (contactId: string): Promise<void> => {
    await deleteDoc(doc(db, 'contacts', contactId));
};

// Check if already connected
export const isAlreadyConnected = async (
    userId: string,
    otherUserId: string
): Promise<boolean> => {
    const contactsQuery = query(
        collection(db, 'contacts'),
        where('userId', '==', userId),
        where('contactUserId', '==', otherUserId)
    );
    const snapshot = await getDocs(contactsQuery);
    return !snapshot.empty;
};

// Check if request already exists
export const hasExistingRequest = async (
    fromUserId: string,
    toUserId: string
): Promise<boolean> => {
    const requestsQuery = query(
        collection(db, 'connectionRequests'),
        where('fromUserId', '==', fromUserId),
        where('toUserId', '==', toUserId),
        where('status', '==', 'pending')
    );
    const snapshot = await getDocs(requestsQuery);
    return !snapshot.empty;
};
