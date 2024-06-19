import { Firestore } from "@google-cloud/firestore";
import dotenv from "dotenv";
dotenv.config();

class getDataMakanan {
  getMakananByName = async (makananName, res) => {
    try {
      // Initialize Firestore client
      const firestore = new Firestore({
        keyFilename: process.env.KEY_FILE,
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseId: process.env.DATABASE_NAME,
      });

      // Define the Firestore collection
      const collectionRef = firestore.collection("data-makanan");

      // Use `doc` to reference the document based on the passed variable
      const docRef = collectionRef.doc(makananName);

      // Use `get` to retrieve the document
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        console.log(`Document "${makananName}" not found.`);
        return res.status(404).send(`Document "${makananName}" not found.`);
      }

      const data = docSnapshot.data();
      return res.status(200).json({ status: "success", data }); // Assuming success status code is 200
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .send("Internal server error. Please check server logs for details.");
    }
  };
}

export default new getDataMakanan();
