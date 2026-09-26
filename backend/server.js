const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const port = Number(process.env.PORT || 3000);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const saspayApiKey = process.env.SASPAY_API_KEY;
const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
const rootDirectory = path.resolve(__dirname, '..');
const privatePdfDirectory = path.join(rootDirectory, 'private-pdf');
const dataFile = path.join(__dirname, 'data.json');
const sessions = new Map();
const products = [
  ['Concours ENA','Administration',320],['Concours Police','Défense & sécurité',300],['Concours Douane','Administration',320],['Concours BT Comptabilité','Technique & gestion',320],
  ['Concours Gendarmerie','Défense & sécurité',300],['Concours Eaux & Forêts','Défense & sécurité',320],['Concours BTS Génie civil','Technique & gestion',320],['Concours FASTEF','Administration',320],
  ['Concours ESP','Technique & gestion',320],['Concours Magistrature','Administration',320],['Concours Greffe','Administration',320],['Concours EAA','Administration',320],
  ['Concours CREM','Administration',320],['Concours ENSOA','Défense & sécurité',320],['Concours ESOGN','Défense & sécurité',320],['Concours BTS Comptabilité','Technique & gestion',320],
  ['Concours BTS Transit','Technique & gestion',320],['Concours BTS Secrétariat','Technique & gestion',320],['Concours BTS Logistique','Technique & gestion',320],['Concours BT Secrétariat','Technique & gestion',320],
  ['Concours ENDSS','Administration',320],['Concours IFACE','Technique & gestion',320],['Probatoire Sénégal','Administration',320]
].map(([title, category, exercise_count]) => ({ title, category, exercise_count, price_xof: 2000 }));

function loadData() {
  try { return JSON.parse(fs.readFileSync(dataFile, 'utf8')); }
  catch { return { users: [], orders: [], resetRequests: [] }; }
}
async function sasPayRequest(pathname, options = {}) {
  if (!saspayApiKey) throw new Error('SASPAY_API_KEY non configure');
  const response = await fetch(`https://api.saspay.me/api/v1${pathname}`, { ...options, headers: { Authorization: `Bearer ${saspayApiKey}`, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(payload.message || payload.error || `SasPay ${response.status}`); error.status = response.status; error.payload = payload; throw error; }
  return payload;
}
function saveData(data) {
  const temp = `${dataFile}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2));
  fs.renameSync(temp, dataFile);
}
const data = loadData();

function sendJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', ...headers });
  response.end(JSON.stringify(payload));
}
function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; if (body.length > 1_000_000) request.destroy(); });
    request.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('JSON invalide')); } });
    request.on('error', reject);
  });
}
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (err, derived) => err ? reject(err) : resolve(`${salt}:${derived.toString('hex')}`)));
}
async function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const candidate = await hashPassword(password, salt);
  const a = Buffer.from(candidate.split(':')[1], 'hex');
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return token;
}
function getUser(request) {
  const auth = request.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  const session = sessions.get(auth.slice(7));
  if (!session || session.expiresAt < Date.now()) return null;
  return data.users.find(user => user.id === session.userId) || null;
}
async function supabaseRequest(endpoint, options = {}) {
  const apiKey = supabaseServiceKey || supabaseAnonKey;
  if (!supabaseUrl || !apiKey) throw new Error('Supabase non configure');
  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, { ...options, headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (!response.ok) throw new Error(`Supabase ${response.status}`);
  return response.status === 204 ? null : response.json();
}
function pdfNameForTitle(title) {
  const mapping = {
    'Concours ENA':'Concours_ENA_Senegal_Tome_1_320_exercices.pdf','Concours Police':'Concours_Police_Senegal_Tome_1_300_exercices.pdf','Concours Douane':'Concours_Douane_Senegal_Tome_1_320_exercices.pdf','Concours BT Comptabilité':'Concours_BT_Comptabilite_Senegal_Tome_1_320_exercices.pdf','Concours Gendarmerie':'Concours_Gendarmerie_Senegal_Tome_1_300_exercices.pdf','Concours Eaux & Forêts':'Concours_Eaux_Forets_Senegal_Tome_1_320_exercices.pdf','Concours BTS Génie civil':'Concours_BTS_Genie_Civil_Senegal_Tome_1_320_exercices.pdf','Concours FASTEF':'Concours_FASTEF_Senegal_Tome_1_320_exercices.pdf','Concours ESP':'Concours_ESP_Senegal_Tome_1_320_exercices.pdf','Concours Magistrature':'Concours_Magistrature_Senegal_Tome_1_320_exercices.pdf','Concours Greffe':'Concours_Greffe_Senegal_Tome_1_320_exercices.pdf','Concours EAA':'Concours_EAA_Senegal_Tome_1_320_exercices.pdf','Concours CREM':'Concours_CREM_Senegal_Tome_1_320_exercices.pdf','Concours ENSOA':'Concours_ENSOA_Senegal_Tome_1_320_exercices.pdf','Concours ESOGN':'Concours_ESOGN_Senegal_Tome_1_320_exercices.pdf','Concours BTS Comptabilité':'Concours_BTS_Comptabilite_Gestion_Senegal_Tome_1_320_exercices.pdf','Concours BTS Transit':'Concours_BTS_Transit_Senegal_Tome_1_320_exercices.pdf','Concours BTS Secrétariat':'Concours_BTS_Secretariat_Bureautique_Senegal_Tome_1_320_exercices.pdf','Concours BTS Logistique':'Concours_BTS_Gestion_Chaine_Approvisionnement_Logistique_Senegal_Tome_1_320_exercices.pdf','Concours BT Secrétariat':'Concours_BT_Secretariat_Bureautique_Senegal_Tome_1_320_exercices.pdf','Concours ENDSS':'Concours_ENDSS_Senegal_Tome_1_320_exercices.pdf','Concours IFACE':'Concours_IFACE_Senegal_Tome_1_320_exercices.pdf','Probatoire Sénégal':'Probatoire_Senegal_Tome_1_320_exercices.pdf'
  };
  return mapping[title];
}
function servePublicFile(request, response) {
  const rawPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  if (rawPath.startsWith('/pdf/') || rawPath.startsWith('/private-pdf/')) return sendJson(response, 404, { error: 'Fichier non disponible publiquement.' });
  let requestedPath;
  try { requestedPath = decodeURIComponent(rawPath); } catch { response.writeHead(400); return response.end('Invalid path'); }
  const safePath = path.normalize(requestedPath).replace(/^([.][.][\\/])+/, '');
  const filePath = path.join(rootDirectory, safePath);
  if (!filePath.startsWith(rootDirectory) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { response.writeHead(404); return response.end('Not found'); }
  const extension = path.extname(filePath).toLowerCase();
  const contentTypes = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpeg':'image/jpeg','.jpg':'image/jpeg','.svg':'image/svg+xml' };
  response.writeHead(200, { 'Content-Type': contentTypes[extension] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff' });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {});
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/api/health' && request.method === 'GET') return sendJson(response, 200, { status:'ok', service:'annales-concours', products:products.length, payments:saspayApiKey ? 'saspay-configured' : 'saspay-not-configured' });
    if (url.pathname === '/api/db-test' && request.method === 'GET') {
      try { const rows = await supabaseRequest('annales?select=id'); return sendJson(response, 200, { connected:true, rows_available:rows.length }); }
      catch { return sendJson(response, 503, { connected:false, error:'Supabase non configure ou inaccessible.' }); }
    }
    if (url.pathname === '/api/products' && request.method === 'GET') {
      try {
        const remote = await supabaseRequest('annales?select=id,title,category,exercise_count,price_xof,cover_path,is_active&is_active=eq.true&order=title.asc');
        return sendJson(response, 200, remote.map(item => ({ ...item, price_xof:Number(item.price_xof) || 2000 })));
      } catch {
        return sendJson(response, 200, products);
      }
    }
    if (url.pathname === '/api/auth/register' && request.method === 'POST') {
      const body = await readBody(request); const email = String(body.email || '').trim().toLowerCase();
      if (!body.firstName || !body.lastName || !/^\S+@\S+\.\S+$/.test(email) || String(body.password || '').length < 8) return sendJson(response, 400, { error:'Prénom, nom, e-mail valide et mot de passe de 8 caractères minimum requis.' });
      if (data.users.some(user => user.email === email)) return sendJson(response, 409, { error:'Ce compte existe déjà.' });
      const user = { id:crypto.randomUUID(), firstName:String(body.firstName).trim(), lastName:String(body.lastName).trim(), email, password:await hashPassword(body.password), createdAt:new Date().toISOString() };
      data.users.push(user); saveData(data); const token=createSession(user);
      return sendJson(response, 201, { message:'Compte créé', token, user:{ id:user.id, firstName:user.firstName, lastName:user.lastName, email:user.email } });
    }
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      const body = await readBody(request); const email=String(body.email||'').trim().toLowerCase(); const user=data.users.find(item=>item.email===email);
      if (!user || !(await verifyPassword(String(body.password||''), user.password))) return sendJson(response, 401, { error:'Identifiants invalides.' });
      const token=createSession(user); return sendJson(response, 200, { message:'Connexion réussie', token, user:{ id:user.id, firstName:user.firstName, lastName:user.lastName, email:user.email } });
    }
    if (url.pathname === '/api/auth/forgot-password' && request.method === 'POST') {
      const body=await readBody(request); const email=String(body.email||'').trim().toLowerCase(); if (!email) return sendJson(response,400,{error:'Adresse e-mail requise.'});
      const user=data.users.find(item=>item.email===email); if (user) { user.resetToken=crypto.randomBytes(32).toString('hex'); user.resetExpires=Date.now()+30*60*1000; saveData(data); }
      return sendJson(response,200,{message:'Si ce compte existe, les instructions seront envoyées par e-mail.'});
    }
    if (url.pathname === '/api/orders' && request.method === 'POST') {
      const body=await readBody(request); const items=Array.isArray(body.items)?[...new Set(body.items.map(String))]:[];
      if (!items.length) return sendJson(response,400,{error:'Le panier est vide.'});
      const invalid=items.filter(title=>!products.some(product=>product.title===title)); if (invalid.length) return sendJson(response,400,{error:'Un ou plusieurs produits sont invalides.'});
      if (!saspayApiKey) return sendJson(response,503,{error:'Le paiement SasPay n’est pas encore configuré sur le serveur.'});
      const user=getUser(request);
      const customerEmail=String(body.customer_email || user?.email || '').trim().toLowerCase();
      const customerName=String(body.customer_name || [user?.firstName,user?.lastName].filter(Boolean).join(' ') || '').trim();
      if (!/^\S+@\S+\.\S+$/.test(customerEmail) || !customerName) return sendJson(response,400,{error:'Nom et adresse e-mail valides requis pour le paiement.'});
      const total=items.reduce((sum,title)=>sum+(products.find(product=>product.title===title)?.price_xof||2000),0);
      const order={id:`AC-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,userId:user?.id||null,items,total,currency:'XOF',status:'pending_payment',createdAt:new Date().toISOString(),customerEmail,customerName};
      data.orders.push(order); saveData(data);
      try {
        const baseUrl=siteUrl || `http://${request.headers.host || 'localhost:3000'}`;
        const session=await sasPayRequest('/checkout-sessions/', {method:'POST', body:JSON.stringify({amount:total.toFixed(2),currency:'XOF',description:`Annales concours - ${order.id}`,country:'SN',customer_email:customerEmail,customer_name:customerName,return_url:`${baseUrl}/?payment=1`,metadata:{order_id:order.id,items}})});
        order.saspaySessionId=session.id; order.checkoutUrl=session.checkout_url; order.status='pending_payment'; saveData(data);
        return sendJson(response,201,{id:order.id,status:order.status,total,currency:'XOF',checkout_url:session.checkout_url,session_id:session.id});
      } catch (error) {
        order.status='payment_setup_failed'; order.paymentError=error.payload || error.message; saveData(data);
        return sendJson(response,502,{error:'Impossible de créer la session de paiement SasPay.',details:error.payload || undefined});
      }
    }
    if (url.pathname === '/api/payments/status' && request.method === 'GET') {
      const sessionId=String(url.searchParams.get('session_id')||'').trim(); const orderId=String(url.searchParams.get('order_id')||'').trim();
      if (!sessionId || !orderId) return sendJson(response,400,{error:'session_id et order_id requis.'});
      const order=data.orders.find(item=>item.id===orderId && item.saspaySessionId===sessionId);
      if (!order) return sendJson(response,404,{error:'Commande introuvable.'});
      try {
        const status=await sasPayRequest(`/checkout-sessions/${encodeURIComponent(sessionId)}/status/`);
        if (status.status==='PAID' && status.transaction_status==='SUCCESS') { order.status='paid'; order.paidAt=new Date().toISOString(); order.transactionId=status.transaction_id || null; order.transactionReference=status.transaction_reference || null; saveData(data); }
        return sendJson(response,200,{order_id:order.id,status:order.status,saspay_status:status.status,transaction_status:status.transaction_status||null,items:order.status==='paid'?order.items:[],total:order.total,currency:order.currency});
      } catch (error) { return sendJson(response,502,{error:'Impossible de vérifier le paiement SasPay.',details:error.payload || undefined}); }
    }
    if (url.pathname.startsWith('/api/download/') && request.method === 'GET') {
      const parts=url.pathname.split('/').filter(Boolean); const orderId=parts[2]; const title=decodeURIComponent(parts.slice(3).join('/'));
      const order=data.orders.find(item=>item.id===orderId);
      if (!order || order.status!=='paid') return sendJson(response,403,{error:'Téléchargement indisponible tant que le paiement n’est pas confirmé.'});
      if (!order.items.includes(title)) return sendJson(response,403,{error:'Cette annale ne fait pas partie de la commande.'});
      const filename=pdfNameForTitle(title); const filePath=filename ? path.join(privatePdfDirectory,filename) : null;
      if (!filePath || !filePath.startsWith(privatePdfDirectory) || !fs.existsSync(filePath)) return sendJson(response,404,{error:'PDF introuvable.'});
      response.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});
      return fs.createReadStream(filePath).pipe(response);
    }
    return servePublicFile(request,response);
  } catch (error) { console.error(error); return sendJson(response,500,{error:'Erreur serveur.'}); }
});
async function requestHandler(request, response) {
  // Reuse the same server logic in local Node and Vercel serverless mode.
}

// Keep the existing HTTP server for local development. Vercel imports the handler below.
module.exports = { server };
if (!process.env.VERCEL) server.listen(port,()=>console.log(`AnnalesConcours backend running on http://localhost:${port}`));
