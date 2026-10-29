export function removeItemOnce(arr, value) {
    if (arr == null) {
        return;
    }
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

export function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value))
}