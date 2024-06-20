import { Firestore } from "@google-cloud/firestore";

class HistoryFeature {
  constructor() {
    this.firestore = new Firestore({
      keyFilename: process.env.KEY_FILE,
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseId: process.env.DATABASE_NAME,
    });
    this.collectionRef = this.firestore.collection("predictions");
  }

  getAllHistory = async () => {
    try {
      const snapshot = await this.collectionRef.get();

      if (snapshot.empty) {
        console.log("No matching documents.");
        return { status: "fail", message: "No Data" }; // Return an object with status and message
      }

      const docs = [];
      snapshot.forEach((doc) => {
        if (docs.length < 10) {
          docs.push({ id: doc.id, ...doc.data() });
        }
      });

      return { status: "success", docs }; // Return an object with status and data
    } catch (error) {
      console.error("Error getting documents: ", error);
      return { status: "error", message: "Error getting documents" }; // Return an object with error message
    }
  };

  getHistory = async (uid, res) => {
    try {
      const snapshot = await this.collectionRef.get();

      if (snapshot.empty) {
        console.log("No matching documents.");
        return res.status(400).json({ status: "fail", message: "No Data" });
      }

      const filteredDocs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid.includes(uid)) {
          filteredDocs.push({ id: doc.id, ...data });
        }
      });

      return res.status(200).json({ status: "success", filteredDocs });
    } catch (error) {
      console.error("Error getting documents: ", error);
      return res.status(400).json("Error getting documents");
    }
  };

  deleteHistory = async (id, res) => {
    try {
      const docRef = this.collectionRef.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        console.log("No such document.");
        return res
          .status(400)
          .json({ status: "fail", message: "No such document" });
      }

      await docRef.delete();
      return res
        .status(200)
        .json({ status: "success", message: "Deleted successfully" });
    } catch (error) {
      console.error("Error deleting document: ", error);
      return res.status(400).json("Error deleting document");
    }
  };
}

export default new HistoryFeature();
