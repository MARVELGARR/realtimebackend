import crypto from 'crypto';

export const generateSignature = (params: Record<string, any>, apiSecret: string) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(sortedParams + apiSecret).digest('hex');
};