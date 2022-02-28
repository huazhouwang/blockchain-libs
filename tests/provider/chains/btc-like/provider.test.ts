import { Provider as BCHProvider } from '../../../../src/provider/chains/bch';
import { Provider as BTCProvider } from '../../../../src/provider/chains/btc';

import fixture from './fixture.json';

const getProvider = (chainCode: string) => {
  const chainInfo: any = { code: chainCode };
  const blockbook: any = {};

  if (chainCode === 'bch') {
    return new BCHProvider(chainInfo, () => Promise.resolve(blockbook));
  }
  return new BTCProvider(chainInfo, () => Promise.resolve(blockbook));
};

test('pubkeyToAddress', async () => {
  const verifier: any = {
    getPubkey: jest
      .fn()
      .mockResolvedValue(Buffer.from(fixture.pubkeyToAddress.pubkey, 'hex')),
  };

  for (const [chainCode, config] of Object.entries(
    fixture.pubkeyToAddress.chains,
  )) {
    for (const [encoding, correctAddress] of Object.entries(config)) {
      await expect(
        getProvider(chainCode).pubkeyToAddress(verifier, encoding),
      ).resolves.toBe(correctAddress);
    }
  }
});

test('verifyAddress', async () => {
  for (const [chainCode, config] of Object.entries(
    fixture.pubkeyToAddress.chains,
  )) {
    for (const [encoding, correctAddress] of Object.entries(config)) {
      await expect(
        getProvider(chainCode).verifyAddress(correctAddress),
      ).resolves.toStrictEqual({
        isValid: true,
        displayAddress: correctAddress,
        normalizedAddress: correctAddress,
        encoding,
      });
    }
  }
});
