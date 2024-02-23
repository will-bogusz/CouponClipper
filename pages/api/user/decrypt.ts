// pages/api/user/decrypt.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { decrypt } from '../../../src/components/lib/serverUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { hash, userSpecificElement } = req.body;
    if (!hash || !userSpecificElement) {
      return res.status(400).json({ error: 'Missing hash or user specific element' });
    }

    const decryptedData = decrypt(hash, userSpecificElement);
    return res.status(200).json({ decryptedData });
  } catch (error) {
    console.error('Decryption error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
