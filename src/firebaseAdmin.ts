import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

interface FirebaseAdminApp extends admin.app.App { }

declare global {
    var _firebaseAdminApp: FirebaseAdminApp | undefined;
}

// Use global._firebaseAdminApp directly

const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

// Check if Firebase Admin app is already initialized
if (!global._firebaseAdminApp) {
    let serviceAccountConfig: any = null;

    // Try to get service account from environment variable first (for production)
    if (serviceAccountJson) {
        try {
            serviceAccountConfig = JSON.parse(serviceAccountJson);
            console.log("Firebase Admin: Using service account from environment variable");
        } catch (e) {
            console.error("Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", e);
        }
    }
    
    // Fall back to file path (for local development)
    if (!serviceAccountConfig && serviceAccountPath) {
        try {
            const absolutePath = path.join(process.cwd(), serviceAccountPath);

            if (!fs.existsSync(absolutePath)) {
                console.error(`Firebase service account file not found at: ${absolutePath}`);
                console.error("Please ensure the file exists and the path is correct.");
            } else {
                const rawFileContent = fs.readFileSync(absolutePath, 'utf8');
                serviceAccountConfig = JSON.parse(rawFileContent);
                console.log("Firebase Admin: Using service account from file");
            }
        } catch (error) {
            console.error("Firebase admin file read error:", error);
        }
    }

    if (!serviceAccountConfig) {
        console.error("Firebase Admin SDK: No service account configuration found.");
        console.error("For local dev: Set FIREBASE_ADMIN_SDK_PATH in .env.local");
        console.error("For production: Set FIREBASE_SERVICE_ACCOUNT_JSON in environment variables");
    } else {
        try {
            // Validate required fields
            const requiredFields = ['project_id', 'private_key', 'client_email'];
            const missingFields = requiredFields.filter(field => !serviceAccountConfig[field]);

            if (missingFields.length > 0) {
                console.error(`Service account JSON missing required fields: ${missingFields.join(', ')}`);
            } else {
                global._firebaseAdminApp = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccountConfig),
                });
                console.log("Firebase Admin SDK initialized successfully.");
                console.log("Project ID:", serviceAccountConfig.project_id);
            }
        } catch (error) {
            console.error("Firebase admin initialization error:", error);
        }
    }
}

const initializedAdminApp = global._firebaseAdminApp; // Assign to a local const for exports

if (!initializedAdminApp) {
    console.error("Admin SDK failed to initialize. Exported functions will not work.");
    // You might want to handle this more gracefully, e.g., throw in getAdminFirestore/Auth
    // but for now, we'll proceed with throwing in the exported functions if used.
}

const adminDb = initializedAdminApp ? initializedAdminApp.firestore() : null;
const adminAuth = initializedAdminApp ? initializedAdminApp.auth() : null;

if (adminDb) {
    console.log("adminDb initialized. Project ID:", initializedAdminApp?.options.projectId);
}
if (adminAuth) {
    console.log("adminAuth initialized.");
}

export { adminDb, adminAuth };