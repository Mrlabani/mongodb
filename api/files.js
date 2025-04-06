import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb+srv://mrnoobx:DAZCdTczVWyECi04@cluster0.sedgwxy.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = 'mrnoobx';
const COLLECTION = 'Files';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET allowed' });
  }

  try {
    const client = await MongoClient.connect(MONGO_URI, { useUnifiedTopology: true });
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    const files = await collection.find({}).toArray();

    await client.close();
    return res.status(200).json(files);

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
