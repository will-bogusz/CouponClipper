import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  
  switch (method) {
    case 'POST':
      try {
        // Clear the authData cookie directly
        res.setHeader('Set-Cookie', 'authData=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
