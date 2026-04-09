/**
 * IndexedDB wrapper for storing large image blobs (base64).
 * Replaces localStorage for image data — no quota issues.
 */
const DB_NAME = "isb_images_v1";
const STORE   = "images";
let _db = null;

async function getDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
    req.onsuccess  = e => { _db = e.target.result; resolve(_db); };
    req.onerror    = e => reject(e.target.error);
  });
}

export async function imgSave(key, b64) {
  try {
    const db = await getDB();
    await new Promise((res, rej) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(b64, key);
      tx.oncomplete = res;
      tx.onerror    = e => rej(e.target.error);
    });
  } catch(e) { console.warn("imgSave failed", key, e?.message); }
}

export async function imgLoad(key) {
  try {
    const db = await getDB();
    return await new Promise(res => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
      req.onsuccess = e => res(e.target.result || null);
      req.onerror   = () => res(null);
    });
  } catch { return null; }
}

export async function imgDelete(key) {
  try {
    const db = await getDB();
    await new Promise(res => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = res;
      tx.onerror    = res;
    });
  } catch {}
}
