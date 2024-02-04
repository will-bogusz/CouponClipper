// pages/api/user/data.ts

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

    // Determine which fields to return based on request body
    const requestedFields = req.body.fields;
    const defaultFields = ['email'];
    const optionalFields = ['storeLogins', 'linkedStores'];
    const fieldsToReturn = requestedFields ? requestedFields.filter((field: string) => defaultFields.includes(field) || optionalFields.includes(field)) : defaultFields;
    
    const dataToReturn = fieldsToReturn.reduce((acc: any, field: string) => {
      acc[field] = user[field];
      return acc;
    }, {});

    res.status(200).json(dataToReturn);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
