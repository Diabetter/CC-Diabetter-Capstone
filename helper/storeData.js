import { Firestore } from "@google-cloud/firestore";

class StoreDataPredict {
  storeData = async (id, data, res) => {
    try {
      const firestore = new Firestore({
        keyFilename: process.env.KEY_FILE,
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseId: process.env.DATABASE_NAME,
      });
      const predictCollection = firestore.collection("predictions");
      await predictCollection.doc(id).set(data);
      return { success: true, id };
    } catch (error) {
      console.error("Unable to storing the data:", error);
      throw res.send("Failed to store the data");
    }
  };
}

export default new StoreDataPredict();
