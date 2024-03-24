// pages/api/user/data.ts

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import clientPromise from '@/components/mongo/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  if (req.method !== 'POST') {
    console.log("[user/data] method not allowed");
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]; // assuming token is sent in the format "Bearer <token>"
    console.log("[user/data] token received:", token ? "Yes" : "No");
  
    if (!token) {
      console.log("[user/data] authentication token missing");
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    // verifying the JWT token
    console.log("[user/data] verifying token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    const client = await clientPromise;
    const db = client.db();

    // retrieve user from database
    console.log("[user/data] retrieving user from database");
    const user = await db.collection('users').findOne({ _id: new ObjectId((decoded as jwt.JwtPayload).userId) });
    if (!user) {
      console.log("[user/data] user not found");
      return res.status(404).json({ error: 'User not found' });
    }

    // determine which fields to return based on request body
    console.log("[user/data] determining fields to return");
    const requestedFields = Array.isArray(req.body.fields) ? req.body.fields : [req.body.fields];
    const defaultFields = ['email'];
    const optionalFields = ['storeLogins', 'linkedStores', 'lastSynced'];
    const fieldsToReturn = requestedFields.length > 0 ? requestedFields.filter((field: string) => defaultFields.includes(field) || optionalFields.includes(field)) : defaultFields;
    
    const dataToReturn = fieldsToReturn.reduce((acc: any, field: string) => {
      acc[field] = user[field];
      return acc;
    }, {});

    console.log("[user/data] returning data");
    res.status(200).json(dataToReturn);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log("[user/data] invalid token");
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('[user/data] internal server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
