const fs = require('fs');
const https = require('https');
const path = require('path');

const ids = [
  8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008,
  1001, 1224, 1002, 1003, 1004, 1008, 1009, 1013,
  1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112,
  1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209, 1210, 1211, 1212, 1213, 1214, 1215, 1217, 1218, 1220, 1221, 1222, 1223, 1225,
  1005, 1006, 1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1310, 1312, 1313, 1314, 1315, 1317,
  1401, 1402, 1403, 1404, 1405, 1407, 1408, 1409, 1410,
  1014, 1015, 1321, 1406, 1412, 1413, 1414, 1415,
  1501, 1502, 1503, 1504, 1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512, 1513,
  8009, 8010
];

const targetDir = path.join(__dirname, '..', 'assets', 'avatars');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

function fetchUrl(url, dest) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        res.resume();
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function processId(id) {
  const dest = path.join(targetDir, `${id}.png`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    return { id, status: 'exists' };
  }

  // 1. Try StarRailRes CDN
  const cdnUrl = `https://cdn.jsdelivr.net/gh/Mar-7th/StarRailRes@master/icon/avatar/${id}.png`;
  let ok = await fetchUrl(cdnUrl, dest);
  if (ok) return { id, status: 'ok (cdn)' };

  // 2. Try raw github
  const rawUrl = `https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/avatar/${id}.png`;
  ok = await fetchUrl(rawUrl, dest);
  if (ok) return { id, status: 'ok (raw)' };

  // Fallbacks for special & collab variants
  if (id === 1506 && fs.existsSync(path.join(targetDir, '1006.png'))) {
    fs.copyFileSync(path.join(targetDir, '1006.png'), dest);
    return { id, status: 'fallback 1006 (Silver Wolf)' };
  }
  if (id === 1511) {
    const ahaUrl = 'https://cdn.gachabase.net/hsr/assets/2115ff73d049abc984df3ea560d469ac.png';
    ok = await fetchUrl(ahaUrl, dest);
    if (ok) return { id, status: 'ok (gachabase)' };
  }
  if ([8004, 8006, 8008, 8010].includes(id) && fs.existsSync(path.join(targetDir, '8002.png'))) {
    fs.copyFileSync(path.join(targetDir, '8002.png'), dest);
    return { id, status: 'fallback 8002' };
  }
  if ([8003, 8005, 8007, 8009].includes(id) && fs.existsSync(path.join(targetDir, '8001.png'))) {
    fs.copyFileSync(path.join(targetDir, '8001.png'), dest);
    return { id, status: 'fallback 8001' };
  }

  return { id, status: 'not found' };
}

(async () => {
  console.log(`Starting parallel download for ${ids.length} avatars...`);
  const chunkSize = 8;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(processId));
    results.forEach(r => console.log(`Avatar ${r.id}: ${r.status}`));
  }
  console.log('Finished downloading avatars.');
})();
