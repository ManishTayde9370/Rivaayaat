const isUrl = (s) => {
  try {
    const u = new URL(s);
    return ['http:', 'https:'].includes(u.protocol);
  } catch (err) { return false; }
};

const parseLine = (line) => {
  const parts = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++; } else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts.map(p => p.trim().replace(/(^\")|(\"$)/g, ''));
};

const buildRowObject = (header, cols) => {
  const obj = {};
  header.forEach((h, idx) => { obj[h] = cols[idx] !== undefined ? cols[idx] : ''; });
  return obj;
};

const validateProductData = (data) => {
  // data: { name, price, stock, category, images, description, artisanName }
  const errors = [];
  if (!data.name || String(data.name).trim() === '') {
    errors.push({ code: 'missing_name', message: 'name is required' });
  }
  if (data.price !== undefined && data.price !== null && data.price !== '') {
    const n = Number(data.price);
    if (Number.isNaN(n)) errors.push({ code: 'invalid_price', message: 'price must be a number' });
    else if (n < 0) errors.push({ code: 'invalid_price_negative', message: 'price must be non-negative' });
  }
  if (data.stock !== undefined && data.stock !== null && data.stock !== '') {
    const s = parseInt(data.stock);
    if (Number.isNaN(s)) errors.push({ code: 'invalid_stock', message: 'stock must be an integer' });
    else if (s < 0) errors.push({ code: 'invalid_stock_negative', message: 'stock must be non-negative' });
  }
  if (data.images) {
    const imgs = Array.isArray(data.images) ? data.images : String(data.images).split('|').filter(Boolean);
    const bad = imgs.filter(u => u && !isUrl(u));
    if (bad.length) errors.push({ code: 'invalid_image_url', message: `invalid image urls: ${bad.join(',')}` });
  }
  // simple category length rule
  if (data.category && String(data.category).length > 100) errors.push({ code: 'category_too_long', message: 'category too long' });
  return errors;
};

module.exports = { parseLine, buildRowObject, validateProductData, isUrl };
