/**
 * Calculate a person's age in years.
 * @param {object} p An object representing a person, implementing a birth Date parameter.
 * @returns {number} The age in years of p.
 */
function calculateAge(p) {
  let dateDiff = new Date(Date.now() - p.birthDate.getTime());
  let age = Math.abs(dateDiff.getUTCFullYear() - 1970);
  return age;
}
