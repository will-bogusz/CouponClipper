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
            {"storeName": "Kroger", "isLinked": false, "isActive": true},
            {"storeName": "Food Lion", "isLinked": false, "isActive": true},
            {"storeName": "Price Chopper", "isLinked": false, "isActive": false},
            {"storeName": "HyVee", "isLinked": false, "isActive": false},
            {"storeName": "Albertsons", "isLinked": false, "isActive": false},
            {"storeName": "Safeway", "isLinked": false, "isActive": false}
          ]
        });
        
        if (result) {
            const token = jwt.sign(
                { userId: result.insertedId, email: req.body.email },
                process.env.JWT_SECRET as string,
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
