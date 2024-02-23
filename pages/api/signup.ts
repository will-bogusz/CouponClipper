import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/components/mongo/mongodb';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  
  switch (method) {
    case 'POST':
      try {
        const client = await clientPromise;
        const db = client.db();
        
        const user = await db.collection('users').findOne({ email: req.body.email });
        if (user) {
          return res.status(400).json({ error: 'User already exists' });
        }
        
        const hashedPassword = await hash(req.body.password, 10);
        const result = await db.collection('users').insertOne({
          email: req.body.email,
          password: hashedPassword,
          linkedStores: [
            {"storeName": "Kroger", "isLinked": false, "isActive": true, "credentials": {"email": "", "encryptedCredentials": {"iv": "", "content": ""}}},
            {"storeName": "Food Lion", "isLinked": false, "isActive": true, "credentials": {"email": "", "encryptedCredentials": {"iv": "", "content": ""}}},
            {"storeName": "Price Chopper", "isLinked": false, "isActive": false, "credentials": {"email": "", "encryptedCredentials": {"iv": "", "content": ""}}},
            {"storeName": "HyVee", "isLinked": false, "isActive": false, "credentials": {"email": "", "encryptedCredentials": {"iv": "", "content": ""}}},
            {"storeName": "Albertsons", "isLinked": false, "isActive": false, "credentials": {"email": "", "encryptedCredentials": {"iv": "", "content": ""}}},
            {"storeName": "Safeway", "isLinked": false, "isActive": false, "credentials": {"email": "", "encryptedCredentials": {"iv": "", "content": ""}}}
          ]
        });
        
        if (result) {
            if (!process.env.JWT_SECRET) {
              console.error('JWT_SECRET is not defined in the environment variables.');
              return res.status(500).json({ error: 'Internal Server Error due to misconfiguration.' });
            }
            // Adjusting the way to access the inserted document's ID based on MongoDB driver's behavior
            const userId = result.insertedId.toString(); // Ensuring compatibility across different versions
            const token = jwt.sign(
                { userId: userId, email: req.body.email },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
              );
              
              return res.status(201).json({ success: true, token });
        } else {
          return res.status(500).json({ error: 'Failed to create user' });
        }
      } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    default:
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
