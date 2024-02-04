import crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const baseKey = process.env.ENCRYPTION_KEY; // Base key stored securely

// Function to create a unique encryption key for each user
const createUserSpecificKey = (baseKey: string | undefined, userSpecificElement: any) => {
  // Use a hash function to combine the base key with the user-specific element
  const hash = crypto.createHash('sha256');
  hash.update(baseKey + userSpecificElement);
  return hash.digest('base64').substring(0, 32);
};

const encrypt = (text: crypto.BinaryLike, userSpecificElement: any) => {
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
  const key = createUserSpecificKey(baseKey, userSpecificElement);
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));

  const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

  return decrypted.toString();
};
