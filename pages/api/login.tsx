// api route to handle connecting to mongodb
import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/components/mongo/mongodb';
import { compare } from 'bcryptjs';
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
        if (!user) {
          return res.status(400).json({ error: 'Username/password incorrect!' });
        }
        
        const match = await compare(req.body.password, user.password);
        if (!match) {
          return res.status(400).json({ error: 'Username/password incorrect!' });
        }
        
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '8h' } // Token expires in 8 hours
          );
        
        return res.status(200).json({ success: true, token });
      } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
