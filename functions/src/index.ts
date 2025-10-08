
import * as logger from "firebase-functions/logger";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * Deletes all data associated with the calling user.
 *
 * This function is callable from the client-side. It retrieves the user's UID
 * from the authentication context and proceeds to delete all their documents
 * and subcollections from Firestore.
 *
 * @throws {HttpsError} Throws 'unauthenticated' if the user is not logged in.
 * @throws {HttpsError} Throws 'internal' if any part of the deletion process fails.
 */
export const deleteUserData = onCall(async (request) => {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  logger.info(`Starting data deletion for user: ${uid}`);

  try {
    // This is the path to the user's document in the top-level 'users' collection.
    // While we don't have one in this app's structure, it's good practice.
    // Let's adapt to delete the subcollections directly.
    const userPath = `users/${uid}`;

    // Delete subcollections first.
    // It's crucial to delete contents of subcollections before deleting the parent doc.
    await deleteCollection(db, `${userPath}/journal_lists`, 100);
    logger.info(`Deleted journal_lists for user: ${uid}`);

    await deleteCollection(db, `${userPath}/favorite_journals`, 100);
    logger.info(`Deleted favorite_journals for user: ${uid}`);
    
    // Now, delete the main user document if it exists.
    const userDocRef = db.doc(userPath);
    await userDocRef.delete();
    logger.info(`Deleted user document for: ${uid}`);

    // Finally, delete the user from Firebase Authentication.
    await admin.auth().deleteUser(uid);
    logger.info(`Successfully deleted user: ${uid} from Firebase Auth.`);

    return {success: true, message: "User data deleted successfully."};
  } catch (error) {
    logger.error(`Error deleting user data for ${uid}:`, error);
    throw new HttpsError(
      "internal",
      "An error occurred while deleting user data.",
      error
    );
  }
});


/**
 * Deletes a collection and all its documents in batches.
 * @param {admin.firestore.Firestore} db The Firestore database instance.
 * @param {string} collectionPath The path to the collection to delete.
 * @param {number} batchSize The number of documents to delete in each batch.
 */
async function deleteCollection(
  db: admin.firestore.Firestore,
  collectionPath: string,
  batchSize: number
) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy("__name__").limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

/**
 * Recursively deletes documents from a query in batches.
 * @param {admin.firestore.Firestore} db The Firestore database instance.
 * @param {admin.firestore.Query} query The query to fetch documents from.
 * @param {Function} resolve The promise resolve function.
 */
async function deleteQueryBatch(
  db: admin.firestore.Firestore,
  query: admin.firestore.Query,
  resolve: (value: unknown) => void
) {
  const snapshot = await query.get();

  if (snapshot.size === 0) {
    // When there are no more documents to delete, we're done.
    resolve(0);
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid hitting stack limits.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}
