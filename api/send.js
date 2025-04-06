import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

const MONGO_URI = 'mongodb+srv://mrnoobx:DAZCdTczVWyECi04@cluster0.sedgwxy.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = 'mrnoobx';
const COLLECTION = 'Files';

const BOT_TOKEN = '8022651374:AAEk16h1v4S1w-TEtRodO4sDmw0N4U-C2Zc';
const CHAT_ID = '7442532306';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    const client = await MongoClient.connect(MONGO_URI, { useUnifiedTopology: true });
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const file = await collection.findOne({ name });
    if (!file || !file.file_url) {
      await client.close();
      return res.status(404).json({ message: 'No file found for this name' });
    }

    const fileUrl = file.file_url;
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;

    const tgResp = await fetch(telegramUrl, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        document: fileUrl,
        caption: `Here is the file for "${name}"`
      })
    });

    const tgData = await tgResp.json();
    await client.close();

    if (!tgData.ok) {
      console.error('Telegram Error:', tgData);
      return res.status(500).json({ message: 'Telegram error', error: tgData.description });
    }

    return res.status(200).json({ message: 'File sent successfully' });

  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
