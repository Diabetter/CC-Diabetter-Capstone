import { Firestore } from "@google-cloud/firestore";

class searchFeature {
  search = async (nameToFilter, res) => {
    const firestore = new Firestore({
      keyFilename: process.env.KEY_FILE,
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseId: process.env.DATABASE_NAME,
    });
    const collectionRef = firestore.collection("data-makanan");

    try {
      const snapshot = await collectionRef.get();

      if (snapshot.empty) {
        console.log("No matching documents.");
        return res.status(400).json({ status: "fail", message: "No Data" });
      }

      const filteredDocs = [];
      const searchTermNormalized = nameToFilter
        .replace(/\s+/g, "")
        .toLowerCase();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.nama
            .replace(/\s+/g, "")
            .toLowerCase()
            .includes(searchTermNormalized)
        ) {
          filteredDocs.push({ id: doc.id, ...data });
        }
      });

      return res.status(200).json({ status: "success", filteredDocs });
    } catch (error) {
      console.error("Error getting documents: ", error);
      return res.status(400).json("Error getting documents");
    }
  };
}

export default new searchFeature();
