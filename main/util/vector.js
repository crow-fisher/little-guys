
export function normalizeVec3Real(vector) {
  let len = (vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2) ** 0.5
  vector[0] /= len;
  vector[1] /= len;
  vector[2] /= len;
  return vector;
}

export function normalizeVec3(vector, toLength = 1) {
  let length = toLength * getVec3Length(vector);
  vector[0] /= length;
  vector[1] /= length;
  vector[2] /= length;
  return vector;
}

export function normalizeVec3Dest(vector, dest, toLength = 1) {
  toLength *= getVec3Length(vector);
  dest[0] = vector[0] / toLength;
  dest[1] = vector[1] / toLength;
  dest[2] = vector[2] / toLength;
}

export function getVec3Length(vector) {
  return (vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2) ** 0.5;
}

export function addVectorsCopy(v1, v2) {
  return addVectors(structuredClone(v1), v2);
}

export function addVectorsCopyMult(v1, v2, m) {
  return addVectorsMult(structuredClone(v1), v2, m);
}

export function addVectors(v1, v2) {
  let l = Math.min(v1.length, v2.length);
  for (let i = 0; i < l; i++) {
    v1[i] += v2[i];
  }
  return v1.slice(0, l);
}

export function addVectorsMult(v1, v2, m) {
  v1[0] += v2[0] * m;
  v1[1] += v2[1] * m;
  v1[2] += v2[2] * m;
}

export function addVec3Mult(v1, v2, m) {
  v1[0] += v2[0] * m;
  v1[1] += v2[1] * m;
  v1[2] += v2[2] * m;
}

export function addVec3MultFloor(v1, v2, m) {
  v1[0] = Math.floor(v1[0] + v2[0] * m);
  v1[1] = Math.floor(v1[1] + v2[1] * m);
  v1[2] = Math.floor(v1[2] + v2[2] * m);
}

export function addVec3Dest(v1, v2, dest) {
  dest[0] = (v1[0] + v2[0]);
  dest[1] = (v1[1] + v2[1]);
  dest[2] = (v1[2] + v2[2]);
}

export function addVec3MultDest(v1, v2, m, dest) {
  dest[0] = v1[0] + (m * v2[0]);
  dest[1] = v1[1] + (m * v2[1]);
  dest[2] = v1[2] + (m * v2[2]);
}
export function addVec3MultDestAdd(v1, v2, m, dest) {
  dest[0] = m * (v1[0] + v2[0]);
  dest[1] = m * (v1[1] + v2[1]);
  dest[2] = m * (v1[2] + v2[2]);
}

export function addScalarMultToVec3(v1, s, m) {
  let out = structuredClone(v1);
  out[0] += s * m;
  out[1] += s * m;
  out[2] += s * m;
  return out;
}
export function subtractVectors(v1, v2) {
  for (let i = 0; i < v1.length; i++) {
    v1[i] -= v2[i];
  }
  return v1;
}

export function subtractVectorsMult(v1, v2, m) {
  for (let i = 0; i < v1.length; i++) {
    v1[i] -= m * v2[i];
  }
  return v1;
}

export function subtractVectorsDest(v1, v2, dest) {
  dest[0] = (v1[0] - v2[0]);
  dest[1] = (v1[1] - v2[1]);
  dest[2] = (v1[2] - (v2[2] ?? 0));
}


export function subtractVectorsMultDest(v1, v2, m, dest) {
  dest[0] = m * (v1[0] - v2[0]);
  dest[1] = m * (v1[1] - v2[1]);
  dest[2] = m * (v1[2] - (v2[2] ?? 0));
}

export function calculateDistance(v1, v2) {
  return (
    (v1[0] - v2[0]) ** 2 +
    (v1[1] - v2[1]) ** 2 +
    (v1[2] - v2[2]) ** 2
  ) ** 0.5;
}
export function subtractVectorsCopy(v1, v2) {
  return subtractVectors(structuredClone(v1), v2)
}

export function copyVecValue(src, dest) {
  for (let i = 0; i < src.length; i++) {
    dest[i] = src[i];
  }
}

export function multiplyVectorByScalar(vec, scalar) {
  for (let i = 0; i < vec.length; i++) {
    vec[i] *= scalar;
  }
  return vec;
}
export function multiplyVectorByScalarDest(vec, scalar, dest) {
  for (let i = 0; i < vec.length; i++) {
    dest[i] = vec[i] * scalar;
  }
}
export function multiplyVectorByScalarDestAdd(vec, scalar, dest) {
  for (let i = 0; i < vec.length; i++) {
    dest[i] += vec[i] * scalar;
  }
}

export function multiplyVectorsDest(v1, v2, dest) {
  for (let i = 0; i < v1.length; i++)
    dest[i] = v1[i] * v2[i];
}

export function vec3Dot(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

export function crossVec3(v1, v2) {
  let out = [0, 0, 0];
  out[0] = v1[1] * v2[2] - v1[2] * v2[1];
  out[1] = v1[2] * v2[0] - v1[0] * v2[2];
  out[2] = v1[0] * v2[1] - v1[1] * v2[0];
  return out;
}

export function crossVec3Dest(v1, v2, dest) {
  dest[0] = v1[1] * v2[2] - v1[2] * v2[1];
  dest[1] = v1[2] * v2[0] - v1[0] * v2[2];
  dest[2] = v1[0] * v2[1] - v1[1] * v2[0];
}