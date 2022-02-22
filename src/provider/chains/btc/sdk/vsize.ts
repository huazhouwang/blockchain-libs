// See https://bitcoinops.org/en/tools/calc-size/
const HEADER_VSIZE = 10; // nVersion(4) + InputCount(1) + OutputCount(1) + nLockTime(4)
const SEGWIT_HEADER_EXTENSION_VSIZE = 0.5; // SegwitMarker(0.25) + SegwitFlag(0.25)
const INPUT_VSIZE_LOOKUP: Record<string, number> = {
  P2PKH: 148, // OutPoint(36) + ScriptSigLength(1) + ScriptSig(107) + nSequence(4)
  P2WPKH: 68, // OutPoint(36) + ScriptSigLength(1) + nSequence(4) + WitnessItem(27)
  'P2SH-P2WPKH': 91, // OutPoint(36) + ScriptSigLength(1) + ScriptSig(23) + nSequence(4) + WitnessItem(27)
};
const SEGWIT_INPUT_WITNESS_ITEM_COUNT_VSIZE = 0.25;
const OUTPUT_VSIZE_LOOKUP: Record<string, number> = {
  P2PKH: 34, // nValue(8) + ScriptPubKeyLength(1) + ScriptPubKey(25)
  P2WPKH: 31, // nValue(8) + ScriptPubKeyLength(1) + ScriptPubKey(22)
  'P2SH-P2WPKH': 32, // nValue(8) + ScriptPubKeyLength(1) + ScriptPubKey(23)
};
const OP_RETURN_OUTPUT_PREFIX_VSIZE = 12; // nValue(8) + ScriptPubKeyLength(1) + OP_RETURN(1) + OP_PUSHDATA1(1) ReturnDataLength(1)

const PLACEHOLDER_VSIZE = 79; // calculate_vsize(["P2WPKH"], [])
const TX_OP_RETURN_SIZE_LIMIT = 80;

const loadOPReturn = (
  opReturn: string,
  opReturnSizeLimit: number = TX_OP_RETURN_SIZE_LIMIT,
) => {
  const buffer = Buffer.from(opReturn);
  return buffer.slice(0, opReturnSizeLimit);
};

const estimateVsize = (
  inputEncodings: string[],
  outputEncodings: string[],
  opReturn?: string,
  opReturnSizeLimit: number = TX_OP_RETURN_SIZE_LIMIT,
) => {
  let vsize = HEADER_VSIZE;

  const hasSegwit =
    inputEncodings.filter((encoding) => encoding.includes('P2WPKH')).length >=
    1;

  hasSegwit && (vsize += SEGWIT_HEADER_EXTENSION_VSIZE);

  vsize += inputEncodings
    .map((encoding) => INPUT_VSIZE_LOOKUP[encoding] || 0)
    .reduce((acc, cur) => acc + cur, 0);
  hasSegwit && (vsize += SEGWIT_INPUT_WITNESS_ITEM_COUNT_VSIZE);

  vsize += outputEncodings
    .map((encoding) => OUTPUT_VSIZE_LOOKUP[encoding] || 0)
    .reduce((acc, cur) => acc + cur, 0);

  if (typeof opReturn === 'string') {
    const opReturnLength = loadOPReturn(opReturn, opReturnSizeLimit).length;
    vsize +=
      OP_RETURN_OUTPUT_PREFIX_VSIZE *
      Math.ceil(opReturnLength / opReturnSizeLimit);
    vsize += opReturnLength;
  }

  return Math.ceil(vsize);
};

export { estimateVsize, loadOPReturn, PLACEHOLDER_VSIZE };
