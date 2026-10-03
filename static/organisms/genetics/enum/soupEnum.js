/**
 * the soup specification
 * 
 * inspired from FIX. sorry.
 * 
 * 
 * 'soup' is a series of integers from range 0 to 9007199254740991.
 * 
 * values are serialized as key|value pairings, with spaces separating key value pairs. 
 * 
 * 
 * soup keys are bitwise-divided for structure.
 * 
 * the upper 12 bits are used for the 'key flag'. 
 * the lower 39 bits are used for the 'key specifier' 
 * 
 *  */

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}
const SC_KEY_FLAG_WIDTH = 19;git 

export const SKF_ORGROOT = 1;

export function compositeSoupKey(keyFlag, keySpecifier)  {
  return keyFlag << SC_KEY_FLAG_WIDTH | keySpecifier;
}

export function decompositeSoupKey(soupKey) {
  console.log(dec2bin(soupKey))
    return [soupKey >> SC_KEY_FLAG_WIDTH, soupKey & (2 ** SC_KEY_FLAG_WIDTH - 1)]
}
