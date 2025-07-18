// Simple XOR cipher + base64 encoding
const encryptData = (data, key) => {
  const enc = [...JSON.stringify(data)]
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join('');
  return btoa(enc);
};

const decryptData = (data, key) => {
  const raw = atob(data);
  const dec = [...raw]
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join('');
  return JSON.parse(dec);
};
