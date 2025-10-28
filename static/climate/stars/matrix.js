// matrixB • matrixA
export function multiplyMatrices(matrixA, matrixB) {
  // Slice the second matrix up into rows
  const row0 = [matrixB[0][0], matrixB[0][1], matrixB[0][2], matrixB[0][3]];
  const row1 = [matrixB[1][0], matrixB[1][1], matrixB[1][2], matrixB[1][3]];
  const row2 = [matrixB[2][0], matrixB[2][1], matrixB[2][2], matrixB[2][3]];
  const row3 = [matrixB[3][0], matrixB[3][1], matrixB[3][2], matrixB[3][3]];

  // Multiply each row by matrixA
  const result0 = multiplyMatrixAndPoint(matrixA, row0);
  const result1 = multiplyMatrixAndPoint(matrixA, row1);
  const result2 = multiplyMatrixAndPoint(matrixA, row2);
  const result3 = multiplyMatrixAndPoint(matrixA, row3);

  // Turn the result rows back into a single matrix
  // prettier-ignore
  return [
    [result0[0], result0[1], result0[2], result0[3]],
    [result1[0], result1[1], result1[2], result1[3]],
    [result2[0], result2[1], result2[2], result2[3]],
    [result3[0], result3[1], result3[2], result3[3]],
  ];
}

export function multiplyMatrixAndPoint(matrix, point) {
  // Give a simple variable name to each part of the matrix, a column and row number
  const c0r0 = matrix[0][0],
    c1r0 = matrix[0][1],
    c2r0 = matrix[0][2],
    c3r0 = matrix[0][3];
  const c0r1 = matrix[1][0],
    c1r1 = matrix[1][1],
    c2r1 = matrix[1][2],
    c3r1 = matrix[1][3];
  const c0r2 = matrix[2][0],
    c1r2 = matrix[2][1],
    c2r2 = matrix[2][2],
    c3r2 = matrix[2][3];
  const c0r3 = matrix[3][0],
    c1r3 = matrix[3][1],
    c2r3 = matrix[3][2],
    c3r3 = matrix[3][3];

  // Now set some simple names for the point
  const x = point[0];
  const y = point[1];
  const z = point[2];
  const w = point[3];

  // Multiply the point against each part of the 1st column, then add together
  const resultX = x * c0r0 + y * c0r1 + z * c0r2 + w * c0r3;

  // Multiply the point against each part of the 2nd column, then add together
  const resultY = x * c1r0 + y * c1r1 + z * c1r2 + w * c1r3;

  // Multiply the point against each part of the 3rd column, then add together
  const resultZ = x * c2r0 + y * c2r1 + z * c2r2 + w * c2r3;

  // Multiply the point against each part of the 4th column, then add together
  const resultW = x * c3r0 + y * c3r1 + z * c3r2 + w * c3r3;

  return [resultX, resultY, resultZ, resultW];
}

export function normalizeXYZVector(vector, toLength) {
    vector = structuredClone(vector);
    let length = toLength * (vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2) ** 0.5;
    vector[0] /= length;
    vector[1] /= length;
    vector[2] /= length;
    return vector;
}
