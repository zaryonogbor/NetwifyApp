const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

const db = admin.firestore();

// Helper to call Groq API
async function callGroq(prompt, systemPrompt = "You are a professional networking assistant.") {
    const apiKey = process.env.GROQ_API_KEY || functions.config().groq?.key;

    if (!apiKey) {
        console.error("GROQ_API_KEY is not set");
        return "Could not generate AI insight at this time.";
    }

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error calling Groq API:", error.response?.data || error.message);
        return "AI insight generation failed.";
    }
}

/**
 * Triggered when a connection request is accepted.
 * Generates a summary for both contact records.
 */
exports.onConnectionAccepted = functions.firestore
    .document('connectionRequests/{requestId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();

        // Only run when status changes to 'accepted'
        if (newValue.status === 'accepted' && previousValue.status !== 'accepted') {
            const { fromUserId, toUserId } = newValue;

            // Fetch profiles to get bio and job info for better summaries
            const fromProfileSnap = await db.collection('users').doc(fromUserId).get();
            const toProfileSnap = await db.collection('users').doc(toUserId).get();

            const fromProfile = fromProfileSnap.data() || {};
            const toProfile = toProfileSnap.data() || {};

            const prompt = `
                Summarize who this person is and why they matter professionally based on the meeting context.
                Person A: ${fromProfile.displayName} (${fromProfile.jobTitle} at ${fromProfile.company}). Bio: ${fromProfile.bio}
                Person B: ${toProfile.displayName} (${toProfile.jobTitle} at ${toProfile.company}). Bio: ${toProfile.bio}
                Keep it to 2 sentences.
            `;

            const summary = await callGroq(prompt, "You are an expert at professional networking and identifying professional synergies between people.");

            // Update both contact documents with the same AI summary
            const contactsQuery = db.collection('contacts')
                .where('userId', 'in', [fromUserId, toUserId])
                .where('contactUserId', 'in', [fromUserId, toUserId]);

            const contactsSnap = await contactsQuery.get();

            const batch = db.batch();
            contactsSnap.docs.forEach(doc => {
                batch.update(doc.ref, { aiSummary: summary });
            });

            await batch.commit();
            console.log(`Generated AI summary for connection between ${fromUserId} and ${toUserId}`);
        }
    });

/**
 * Callable function to generate a follow-up message.
 */
exports.generateFollowUp = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { contactId, tone = 'professional', channel = 'Email' } = data;

    const contactSnap = await db.collection('contacts').doc(contactId).get();
    if (!contactSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Contact not found.');
    }

    const contact = contactSnap.data();
    const userProfileSnap = await db.collection('users').doc(context.auth.uid).get();
    const userProfile = userProfileSnap.data();

    const prompt = `
        Write a ${tone} follow-up message suitable for ${channel}. Keep it natural and professional.
        From: ${userProfile.displayName} (${userProfile.jobTitle} at ${userProfile.company})
        To: ${contact.displayName} (${contact.jobTitle} at ${contact.company})
        Context/Summary: ${contact.aiSummary || 'Recently connected on Netwify.'}
    `;

    const message = await callGroq(prompt, `You are a helpful assistant drafting a ${tone} networking message for ${channel}.`);

    return { message };
});

/**
 * Callable function to manually generate/regenerate a summary for a contact.
 */
exports.generateSummaryManual = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const { contactId } = data;

    const contactSnap = await db.collection('contacts').doc(contactId).get();
    if (!contactSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Contact not found.');
    }

    const contact = contactSnap.data();

    // Check if we are authorized (must be the owner of the contact document)
    if (contact.userId !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'You do not own this contact.');
    }

    // Fetch both profiles
    const fromProfileSnap = await db.collection('users').doc(contact.userId).get();
    const toProfileSnap = await db.collection('users').doc(contact.contactUserId).get();

    const fromProfile = fromProfileSnap.data() || {};
    const toProfile = toProfileSnap.data() || {};

    const prompt = `
        Summarize who this person is and why they matter professionally based on the meeting context.
        Person A: ${fromProfile.displayName} (${fromProfile.jobTitle} at ${fromProfile.company}). Bio: ${fromProfile.bio}
        Person B: ${toProfile.displayName} (${toProfile.jobTitle} at ${toProfile.company}). Bio: ${toProfile.bio}
        Keep it to 2 sentences.
    `;

    const summary = await callGroq(prompt, "You are an expert at professional networking and identifying professional synergies between people.");

    await db.collection('contacts').doc(contactId).update({ aiSummary: summary });

    return { summary };
});
