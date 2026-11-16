// Capture d'une image fixe : node scripts/shot.cjs "<paramètres d'URL>" sortie.jpg [largeur] [hauteur]
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [,, query, out, W = '1600', H = '900'] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H } });
  const logs = []; p.on('console', m => { if (m.type()==='error') logs.push(m.text().slice(0,260)) }); p.on('pageerror', e => logs.push('PAGEERR '+e.message.slice(0,300)));
  const t0 = Date.now();
  await p.goto(`http://localhost:4400/?still&${query}`);
  try { await p.waitForFunction('!!window.__png', null, { timeout: 420000 }); } catch(e) { logs.push('TIMEOUT'); }
  const data = await p.evaluate('window.__png');
  if (data) fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  console.log(out.split('/').pop(), data ? 'ok' : 'PAS D\'IMAGE', Math.round((Date.now()-t0)/1000)+'s', [...new Set(logs)].slice(0,6).join(' | ')); await b.close();
})();
