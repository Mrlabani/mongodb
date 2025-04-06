import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  const MONGODB_URI = "mongodb+srv://mrnoobx:DAZCdTczVWyECi04@cluster0.sedgwxy.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "mrnoobx";
const COLLECTION = "Files";

  const BOT_TOKEN = "your_telegram_bot_token";
  const CHAT_ID = "your_chat_id";

  try {
    const client = await MongoClient.connect(MONGO_URI);
    const db = client.db(DB_NAME);
    const file = await db.collection(COLLECTION).findOne({ name });

    if (!file) {
      return res.status(404).json({ message: "Name not found in DB" });
    }

    const fileUrl = file.file_url;
    const tgResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          document: fileUrl
        })
      }
    );

    const tgData = await tgResponse.json();

    if (!tgData.ok) {
      return res.status(500).json({ message: "Telegram Error", error: tgData });
    }

    return res.status(200).json({ message: "File sent successfully!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
