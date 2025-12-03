import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

interface FirebaseAdminApp extends admin.app.App {}

declare global {
  var _firebaseAdminApp: FirebaseAdminApp | undefined;
}

// Use global._firebaseAdminApp directly

const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH;

// Check if Firebase Admin app is already initialized
if (!global._firebaseAdminApp) {
  if (!serviceAccountPath) {
    console.error("Firebase Admin SDK path is missing. Admin SDK will not be initialized.");
    console.error("Please set FIREBASE_ADMIN_SDK_PATH in your .env.local file");
  } else {
    try {
      const absolutePath = path.join(process.cwd(), serviceAccountPath);

      if (!fs.existsSync(absolutePath)) {
        console.error(`Firebase service account file not found at: ${absolutePath}`);
        console.error("Please ensure the file exists and the path is correct.");
      } else {
        const rawFileContent = fs.readFileSync(absolutePath, 'utf8');
        const serviceAccountConfig = JSON.parse(rawFileContent);

        // Validate required fields
        const requiredFields = ['project_id', 'private_key', 'client_email'];
        const missingFields = requiredFields.filter(field => !serviceAccountConfig[field]);

        if (missingFields.length > 0) {
          console.error(`Service account JSON missing required fields: ${missingFields.join(', ')}`);
        } else {
          global._firebaseAdminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountConfig),
          });
          console.log("Firebase Admin SDK initialized successfully (via globalThis). Once.");
          console.log("Initialized Firebase App instance:", global._firebaseAdminApp.name);
          console.log("Project ID:", serviceAccountConfig.project_id);
        }
      }
    } catch (error) {
      console.error("Firebase admin initialization error:", error);
      console.error("Please check:");
      console.error("1. The service account JSON file is valid");
      console.error("2. The service account has proper permissions");
      console.error("3. The FIREBASE_ADMIN_SDK_PATH is correct");
      throw new Error("Failed to initialize Firebase Admin SDK. Check FIREBASE_ADMIN_SDK_PATH and file content.");
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