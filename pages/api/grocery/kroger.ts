// TODO: begin integration with puppeteer/similar to begin the login validation process for Kroger

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  console.log(`Email: ${email}, Password: ${password}`);
  res.status(200).json({ status: 'failure' });
}