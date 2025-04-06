import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = "mongodb+srv://mrnoobx:DAZCdTczVWyECi04@cluster0.sedgwxy.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "mrnoobx";
const COLLECTION = "Files";

const BOT_TOKEN = "8022651374:AAEk16h1v4S1w-TEtRodO4sDmw0N4U-C2Zc";
const CHAT_ID = "7442532306";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name } = req.body;

    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION);

      const data = await collection.findOne({ name: name });
      if (!data) {
        return res.status(404).json({ message: "Name not found." });
      }

      const fileUrl = data.file_url; // File must be accessible via URL
      const telegramApi = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;

      const telegramRes = await fetch(telegramApi, {
        method: 'POST',
        body: new URLSearchParams({
          chat_id: CHAT_ID,
          document: fileUrl
        })
      });

      const result = await telegramRes.json();
      if (!result.ok) {
        return res.status(500).json({ message: "Telegram error", detail: result });
      }

      return res.status(200).json({ message: `File sent to Telegram for ${name}` });

    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err.message });
    } finally {
      await client.close();
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
