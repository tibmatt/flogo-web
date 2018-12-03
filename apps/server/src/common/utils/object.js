import pick from 'lodash/pick';
import without from 'lodash/without';

/**
 * Ensures the order of the keys of an object.
 * Mainly for JSON export purposes.
 * Keys present in the object but not specified in the key order will be appended at the end ot the object in the
 * original order they appeared on.
 * Keys specified in the keyOrder but not present in the object will be ignored.
 * @param {object} obj - object to sort
 * @param {string[]} keyOrder - wanted key order
 */
export function ensureKeyOrder(object, keyOrder) {
  const objectKeys = Object.keys(object);
  const newKeyOrder = [...keyOrder, ...without(objectKeys, keyOrder)];
  return pick(object, newKeyOrder);
}
