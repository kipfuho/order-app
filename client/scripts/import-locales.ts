import fs from "fs";
import path from "path";
import { google } from "googleapis";
import _ from "lodash";
import dotenv from "dotenv";

dotenv.config();

const sheetName = "Localization";
const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

const auth = new google.auth.GoogleAuth({
  keyFile: `${__dirname}/credentials.json`,
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

async function importLocales() {
  // Create  client instance for auth
  const client = await auth.getClient();
  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client as any });

  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: sheetName,
  });

  if (!getRows.data.values) {
    throw new Error("No data found in the spreadsheet.");
  }
  const lang = getRows.data.values?.[0];
  const data = getRows.data.values.slice(1);
  const localization: Record<string, any> = {};

  // Iterate over the data array
  data.forEach((row) => {
    const key = row[0]; // Get the key from index 0
    if (row.length < lang.length) {
      // eslint-disable-next-line
      row = _.concat(row, _.fill(Array(lang.length - row.length), ""));
    }
    row.forEach((value, index) => {
      if (index > 0) {
        const language = lang[index]; // Get the language key from the keys array
        if (!localization[language]) {
          localization[language] = {}; // Create an object for the language if it doesn't exist
        }
        localization[language][key] = _.trim(value); // Assign the value to the corresponding language key and key
      }
    });
  });

  _.forOwn(localization, (objectData, country) => {
    const filePath = path.join(__dirname, "..", "locales", `${country}.json`);

    // Convert object data to JSON string
    const jsonString = JSON.stringify(objectData, null, 2);

    // Write the JSON string to the corresponding JSON file
    // eslint-disable-next-line
    fs.writeFile(filePath, jsonString, (err) => {
      if (err) {
        console.error(`Error writing JSON file for ${country}: ${err}`);
      } else {
        console.info(`JSON file for ${country} has been successfully updated.`);
      }
    });
  });
}

importLocales().catch(console.error);
