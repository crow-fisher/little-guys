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

// wow it's even more unreadable
export function multiplyMatrixAndPointInplace(matrix, point, dest) {
    dest[0] = point[0] * matrix[0][0] + point[1] * matrix[1][0] + point[2] * matrix[2][0];
    dest[1] = point[0] * matrix[0][1] + point[1] * matrix[1][1] + point[2] * matrix[2][1];
    dest[2] = point[0] * matrix[0][2] + point[1] * matrix[1][2] + point[2] * matrix[2][2];
    dest[3] = point[0] * matrix[0][3] + point[1] * matrix[1][3] + point[2] * matrix[2][3];
}

// this method is equivalent to the lower method. but runs faster and is unreadable. yay.
export function multiplyMatrixAndPoint(matrix, point) {
  return [
      point[0] * matrix[0][0] + point[1] * matrix[1][0] + point[2] * matrix[2][0] + matrix[3][0],
      point[0] * matrix[0][1] + point[1] * matrix[1][1] + point[2] * matrix[2][1] + matrix[3][1], 
      point[0] * matrix[0][2] + point[1] * matrix[1][2] + point[2] * matrix[2][2] + matrix[3][2], 
      point[0] * matrix[0][3] + point[1] * matrix[1][3] + point[2] * matrix[2][3] + matrix[3][3]
  ];
}
export function _multiplyMatrixAndPoint(matrix, point) {
  // Give a simple variable name to each part of the matrix, a column and row number
  const r0c0 = matrix[0][0],
    r0c1 = matrix[0][1],
    r0c2 = matrix[0][2],
    r0c3 = matrix[0][3];
  const r1c0 = matrix[1][0],
    r1c1 = matrix[1][1],
    r1c2 = matrix[1][2],
    r1c3 = matrix[1][3];
  const r2c0 = matrix[2][0],
    r2c1 = matrix[2][1],
    r2c2 = matrix[2][2],
    r2c3 = matrix[2][3];
  const r3c0 = matrix[3][0],
    r3c1 = matrix[3][1],
    r3c2 = matrix[3][2],
    r3c3 = matrix[3][3];

  // Now set some simple names for the point
  const x = point[0];
  const y = point[1];
  const z = point[2];
  const w = point[3];

  // Multiply the point against each part of the 1st column, then add together
  const resultX = x * r0c0 + y * r1c0 + z * r2c0 + w * r3c0;

  // Multiply the point against each part of the 2nd column, then add together
  const resultY = x * r0c1 + y * r1c1 + z * r2c1 + w * r3c1;

  // Multiply the point against each part of the 3rd column, then add together
  const resultZ = x * r0c2 + y * r1c2 + z * r2c2 + w * r3c2;

  // Multiply the point against each part of the 4th column, then add together
  const resultW = x * r0c3 + y * r1c3 + z * r2c3 + w * r3c3;

  return [resultX, resultY, resultZ, resultW];
}

export function normalizeVec3Real(vector) {
  let len = (vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2) ** 0.5
  vector[0] /= len;
  vector[1] /= len;
  vector[2] /= len;
  return vector;
}

export function normalizeVec3(vector, toLength=1) {
  vector = structuredClone(vector);
  let length = toLength * getVec3Length(vector);
  vector[0] /= length;
  vector[1] /= length;
  vector[2] /= length;
  return vector;
}

export function getVec3Length(vector) {
  return (vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2) ** 0.5;
}

export function addVectorsCopy(v1, v2) {
  return addVectors(structuredClone(v1), v2);
}

export function addVectors(v1, v2) {
  let l = Math.min(v1.length, v2.length);
  for (let i = 0; i < l; i++) {
    v1[i] += v2[i];
  }
  return v1.slice(0, l);
}

export function subtractVectors(v1, v2) {
  for (let i = 0; i < v1.length; i++) {
    v1[i] -= v2[i];
  }
  return v1;
}
export function subtractVectorsCopy(v1, v2) {
  return subtractVectors(structuredClone(v1), v2)
}

export function multiplyVectorByScalar(vec, scalar) {
  for (let i = 0; i < vec.length; i++) {
    vec[i] *= scalar;
  }
  return vec;
} 

export function dotVec3Copy(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

export function crossVec3(v1, v2) {
  let out = [0, 0, 0];
  out[0] = v1[1] * v2[2] - v1[2] * v2[1]; 
  out[1] = v1[2] * v2[0] - v1[0] * v2[2]; 
  out[2] = v1[0] * v2[1] - v1[1] * v2[0];
  return out;
}

export function transposeMat4(a) {
  let out = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      out[i][j] = a[j][i];
    }
  }
  return out;
}
export function invertMat4(a)
{
    var s0 = a[0][0] * a[1][1] - a[1][0] * a[0][1];
    var s1 = a[0][0] * a[1][2] - a[1][0] * a[0][2];
    var s2 = a[0][0] * a[1][3] - a[1][0] * a[0][3];
    var s3 = a[0][1] * a[1][2] - a[1][1] * a[0][2];
    var s4 = a[0][1] * a[1][3] - a[1][1] * a[0][3];
    var s5 = a[0][2] * a[1][3] - a[1][2] * a[0][3];

    var c5 = a[2][2] * a[3][3] - a[3][2] * a[2][3];
    var c4 = a[2][1] * a[3][3] - a[3][1] * a[2][3];
    var c3 = a[2][1] * a[3][2] - a[3][1] * a[2][2];
    var c2 = a[2][0] * a[3][3] - a[3][0] * a[2][3];
    var c1 = a[2][0] * a[3][2] - a[3][0] * a[2][2];
    var c0 = a[2][0] * a[3][1] - a[3][0] * a[2][1];

    // Should check for 0 determinant
    var invdet = 1.0 / (s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0);

    var b = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]

    b[0][0] = ( a[1][1] * c5 - a[1][2] * c4 + a[1][3] * c3) * invdet;
    b[0][1] = (-a[0][1] * c5 + a[0][2] * c4 - a[0][3] * c3) * invdet;
    b[0][2] = ( a[3][1] * s5 - a[3][2] * s4 + a[3][3] * s3) * invdet;
    b[0][3] = (-a[2][1] * s5 + a[2][2] * s4 - a[2][3] * s3) * invdet;

    b[1][0] = (-a[1][0] * c5 + a[1][2] * c2 - a[1][3] * c1) * invdet;
    b[1][1] = ( a[0][0] * c5 - a[0][2] * c2 + a[0][3] * c1) * invdet;
    b[1][2] = (-a[3][0] * s5 + a[3][2] * s2 - a[3][3] * s1) * invdet;
    b[1][3] = ( a[2][0] * s5 - a[2][2] * s2 + a[2][3] * s1) * invdet;

    b[2][0] = ( a[1][0] * c4 - a[1][1] * c2 + a[1][3] * c0) * invdet;
    b[2][1] = (-a[0][0] * c4 + a[0][1] * c2 - a[0][3] * c0) * invdet;
    b[2][2] = ( a[3][0] * s4 - a[3][1] * s2 + a[3][3] * s0) * invdet;
    b[2][3] = (-a[2][0] * s4 + a[2][1] * s2 - a[2][3] * s0) * invdet;

    b[3][0] = (-a[1][0] * c3 + a[1][1] * c1 - a[1][2] * c0) * invdet;
    b[3][1] = ( a[0][0] * c3 - a[0][1] * c1 + a[0][2] * c0) * invdet;
    b[3][2] = (-a[3][0] * s3 + a[3][1] * s1 - a[3][2] * s0) * invdet;
    b[3][3] = ( a[2][0] * s3 - a[2][1] * s1 + a[2][2] * s0) * invdet;

    return b;
}