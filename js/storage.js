/* ==========================================================
   Kaviyarasan V — Portfolio local data layer
   ----------------------------------------------------------
   No backend, no login. Everything the admin panel adds is
   saved in THIS BROWSER's localStorage and read back by the
   front end (index.html). There's no server, so:

     - Admin-added items are only visible on the SAME browser
       you used admin.html on (e.g. only on your own laptop).
     - To make new work/videos/photo visible to every visitor,
       use "Export data" in the admin panel, then paste that
       JSON into js/site-data.js and re-upload the site. That
       file ships with the site, so it's what every visitor
       sees by default — no browser storage involved for them.

   Keys used:
     kv_work_items      -> array of work/poster items
     kv_videos          -> array of video/reel items
     kv_profile_photo   -> data URL string, or absent
   ========================================================== */

const KV_KEYS = {
  work: 'kv_work_items',
  videos: 'kv_videos',
  photo: 'kv_profile_photo'
};

const KVStore = {
  getWork(){ return readArray(KV_KEYS.work); },
  setWork(arr){ writeJSON(KV_KEYS.work, arr); },
  hasWork(){ return localStorage.getItem(KV_KEYS.work) !== null; },

  getVideos(){ return readArray(KV_KEYS.videos); },
  setVideos(arr){ writeJSON(KV_KEYS.videos, arr); },
  hasVideos(){ return localStorage.getItem(KV_KEYS.videos) !== null; },

  getProfilePhoto(){ return localStorage.getItem(KV_KEYS.photo) || null; },
  setProfilePhoto(dataUrl){
    if (dataUrl) localStorage.setItem(KV_KEYS.photo, dataUrl);
    else localStorage.removeItem(KV_KEYS.photo);
  },

  usageBytes(){
    let total = 0;
    Object.values(KV_KEYS).forEach(k => {
      const v = localStorage.getItem(k);
      if (v) total += v.length;
    });
    return total;
  },

  exportAll(){
    return JSON.stringify({
      work: this.getWork(),
      videos: this.getVideos(),
      profilePhoto: this.getProfilePhoto(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  },

  importAll(json){
    const data = JSON.parse(json);
    if (Array.isArray(data.work)) this.setWork(data.work);
    if (Array.isArray(data.videos)) this.setVideos(data.videos);
    if (typeof data.profilePhoto === 'string') this.setProfilePhoto(data.profilePhoto);
    else if (data.profilePhoto === null) this.setProfilePhoto(null);
  },

  resetAll(){
    Object.values(KV_KEYS).forEach(k => localStorage.removeItem(k));
  }
};

function readArray(key){
  try{
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  }catch(e){ return []; }
}
function writeJSON(key, val){
  try{
    localStorage.setItem(key, JSON.stringify(val));
  }catch(e){
    throw new Error('Browser storage is full. Try a smaller file, or use the path field instead of uploading.');
  }
}

function kvUid(){
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* Resize + compress an image file down to a data URL so a single photo
   doesn't eat the whole storage quota. */
function fileToResizedDataURL(file, maxDim = 1280, quality = 0.82){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read that image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim){
          if (width >= height){ height = Math.round(height * (maxDim / width)); width = maxDim; }
          else { width = Math.round(width * (maxDim / height)); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* Videos aren't resized (can't shrink a codec in-browser) — just read as-is. */
function fileToDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function formatBytes(n){
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(2) + ' MB';
}

/* ==========================================================
   Large video storage (IndexedDB)
   ----------------------------------------------------------
   localStorage caps out around 5–10MB total, nowhere near
   enough for real video files. Uploaded videos are instead
   stored as Blobs in IndexedDB, keyed by the video item's id.
   The metadata array (kv_videos, in localStorage) just holds
   a reference string "idb:<id>" in video_url for these.
   ========================================================== */

const KV_DB_NAME = 'kv_portfolio_media';
const KV_DB_VERSION = 1;
const KV_STORE = 'videoBlobs';

function openMediaDB(){
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)){ reject(new Error('This browser does not support IndexedDB.')); return; }
    const req = indexedDB.open(KV_DB_NAME, KV_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Could not open storage.'));
  });
}

const KVMedia = {
  async putVideo(id, blob){
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(KV_STORE, 'readwrite');
      tx.objectStore(KV_STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Could not save the video (storage may be full).'));
    });
  },
  async getVideo(id){
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(KV_STORE, 'readonly');
      const req = tx.objectStore(KV_STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error || new Error('Could not read the video.'));
    });
  },
  async deleteVideo(id){
    try{
      const db = await openMediaDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(KV_STORE, 'readwrite');
        tx.objectStore(KV_STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }catch(e){ /* best-effort cleanup */ }
  }
};

function isIdbRef(url){ return typeof url === 'string' && url.startsWith('idb:'); }
function makeIdbRef(id){ return 'idb:' + id; }
function idbRefId(url){ return url.slice(4); }

function guessExtFromType(type){
  if (!type) return '.mp4';
  if (type.includes('webm')) return '.webm';
  if (type.includes('quicktime')) return '.mov';
  return '.mp4';
}

/* Rough "how much room is left" reading, for the admin UI. Not supported
   in every browser — callers should handle a null result. */
async function storageEstimate(){
  try{
    if (navigator.storage && navigator.storage.estimate){
      return await navigator.storage.estimate(); // { usage, quota } in bytes
    }
  }catch(e){}
  return null;
}
