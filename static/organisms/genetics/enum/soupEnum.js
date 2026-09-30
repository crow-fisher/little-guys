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
 * the upper bits are used for the 'key flag'. 
 * the lower bits are used for the 'key specifier' 
 * 
 *  */

// 'SR_KEY_FLAG' - representing the bitwise area 
export const SR_KEY_FLAG
