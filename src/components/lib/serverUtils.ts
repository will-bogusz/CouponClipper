import crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const baseKey = process.env.ENCRYPTION_KEY; // Base key stored securely

// Function to create a unique encryption key for each user
const createUserSpecificKey = (baseKey: string | undefined, userSpecificElement: any) => {
  if (typeof baseKey === 'undefined') {
    throw new Error('Base encryption key is undefined. Please set the ENCRYPTION_KEY environment variable.');
  }
  // Use a hash function to combine the base key with the user-specific element
  const hash = crypto.createHash('sha256');
  hash.update(`${baseKey}${userSpecificElement}`);
  // Convert the hash digest to a buffer and then use Buffer.alloc to ensure the key length is 32 bytes
  const digest = hash.digest();
  const keyBuffer = Buffer.alloc(32);
  digest.copy(keyBuffer, 0, 0, 32);
  return keyBuffer;
};

export const encrypt = (text: crypto.BinaryLike, userSpecificElement: any) => {
  if (typeof baseKey === 'undefined') {
    throw new Error('Encryption base key is undefined. Please set the ENCRYPTION_KEY environment variable.');
  }
  const key = createUserSpecificKey(baseKey, userSpecificElement);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  };
};

const decrypt = (hash: { iv: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; content: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; }, userSpecificElement: any) => {
  try {
    const key = createUserSpecificKey(baseKey, userSpecificElement);
    const iv = Buffer.from(hash.iv, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data. The data may be corrupted or the decryption key may be incorrect.');
  }
};
