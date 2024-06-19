import StoreDataPredict from "./storeData.js";
import crypto from "crypto";
import { exec } from "child_process";
import { Firestore } from "@google-cloud/firestore";

class predictController {
  async getRating(x, y, z) {
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
      const docRef1 = collectionRef.doc(x);
      const docRef2 = collectionRef.doc(y);
      const docRef3 = collectionRef.doc(z);

      // Use `get` to retrieve the document
      const docSnapshot1 = await docRef1.get();
      const docSnapshot2 = await docRef2.get();
      const docSnapshot3 = await docRef3.get();

      if (
        !docSnapshot1.exists ||
        !docSnapshot2.exists ||
        !docSnapshot3.exists
      ) {
        console.log(`Document "${(x, y, z)}" not found.`);
        return null;
      }

      const data1 = docSnapshot1.data();
      const data2 = docSnapshot2.data();
      const data3 = docSnapshot3.data();

      if (data1 && data2 && data3) {
        const rating =
          (parseFloat(data1.rating) +
            parseFloat(data2.rating) +
            parseFloat(data3.rating)) /
          3;
        return rating;
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        "Internal server error. Please check server logs for details."
      );
    }
  }

  predictHandler = async (uid, profile, rating, res) => {
    try {
      const command = `./modelv2 --berat-badan=${profile.weight} --tinggi=${profile.height} --usia=${profile.age} --jenis-kelamin=${profile.gender} --aktivitas=${profile.activities} --filter=${rating}`;

      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return res.status(500).send(`Error: ${error.message}`);
        }

        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return res.status(500).send(`Stderr: ${stderr}`);
        }

        const foodRegex = /([A-Za-z\- ]+) - Kalori:/g;

        let match;

        let id = crypto.randomUUID();
        let foodData = {
          id,
          date: new Date().toISOString(),
          food1: null,
          food2: null,
          food3: null,
          kebutuhanKalori: null,
          totalKalori: null,
          rating: null,
          uid: uid,
        };

        let foodIndex = 1; // Variable to track which food property to fill

        while ((match = foodRegex.exec(stdout)) !== null) {
          // Determine which food property to fill
          if (foodIndex === 1) {
            foodData.food1 = match[1];
          } else if (foodIndex === 2) {
            foodData.food2 = match[1];
          } else if (foodIndex === 3) {
            foodData.food3 = match[1];
            foodData.rating = await this.getRating(
              foodData.food1,
              foodData.food2,
              foodData.food3
            );
            break; // Exit the loop after filling food3
          }
          foodIndex++; // Move to the next food property
        }

        const totalKalori = stdout.match(
          /Total Kalori dari makanan yang direkomendasikan: ([\d.]+)/
        );

        if (totalKalori) {
          foodData.totalKalori = parseFloat(totalKalori[1]);
        }

        const totalCaloriesMatch = stdout.match(
          /Total Kalori: (\d+\.\d+) kalori per hari/
        );

        if (totalCaloriesMatch) {
          foodData.kebutuhanKalori = parseFloat(totalCaloriesMatch[1]);
        }

        await StoreDataPredict.storeData(id, foodData);
        const message = "Model prediction successful";
        return res.status(201).json({ status: "success", message, foodData });
      });
    } catch (error) {
      return res.status(400).json({
        status: "fail",
        message: "Terjadi kesalahan dalam melakukan prediksi",
      });
    }
  };
}

export default new predictController();
