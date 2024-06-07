import fs from "node:fs";

export function	createLogDirectory() {
	try {
		const folderName  = "./logs";
		if (!fs.existsSync(folderName )) {
			fs.mkdirSync(folderName);
			console.log("Directory for storing logs created successfully");
		}
	} catch (error) {
		console.error("Error creating directory:", error);
		process.exit();
	}
}
