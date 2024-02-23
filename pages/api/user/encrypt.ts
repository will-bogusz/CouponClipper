import { NextApiRequest, NextApiResponse } from 'next';
import { encrypt } from '../../../src/components/lib/serverUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, userSpecificElement } = req.body;
    if (!text || !userSpecificElement) {
      return res.status(400).json({ error: 'Missing text or user specific element' });
    }

    const encryptedData = encrypt(text, userSpecificElement);
    return res.status(200).json(encryptedData);
  } catch (error) {
    console.error('Encryption error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}