import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import clientPromise from '@/components/mongo/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming token is sent in the format "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    // Verifying the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    const client = await clientPromise;
    const db = client.db();

    // Retrieve user from database
    const user = await db.collection('users').findOne({ _id: new ObjectId((decoded as jwt.JwtPayload).userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extracting field and value from request body
    const { field, value } = req.body;
    if (!field || value === undefined) {
      return res.status(400).json({ error: 'Field or value missing' });
    }

    // Update the requested data in the database
    const updateResult = await db.collection('users').updateOne(
      { _id: new ObjectId((decoded as jwt.JwtPayload).userId) },
      { $set: { [field]: value } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to update user data' });
    }

    res.status(200).json({ success: true, message: 'User data updated successfully' });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
