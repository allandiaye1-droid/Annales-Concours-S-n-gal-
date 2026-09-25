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

const port = process.env.PORT || 3000;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const rootDirectory = path.resolve(__dirname, '..');
const users = new Map();
const passwordResetRequests = new Map();
const orders = [];
const products = [
  { title: 'Concours ENA', category: 'Administration', price: 2000 },
  { title: 'Concours Police', category: 'Defense & securite', price: 2000 },
  { title: 'Concours Douane', category: 'Administration', price: 2000 },
  { title: 'Concours BT Comptabilite', category: 'Technique & gestion', price: 2000 }
];

async function supabaseRequest(endpoint, options = {}) {
  const apiKey = supabaseServiceKey || supabaseAnonKey;
  if (!supabaseUrl || !apiKey) throw new Error('Supabase non configure');
  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}`);
  return response.status === 204 ? null : response.json();
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); }
    });
    request.on('error', reject);
  });
}

function serveFile(request, response) {
  const rawPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  let requestedPath;
  try {
    requestedPath = decodeURIComponent(rawPath);
  } catch {
    response.writeHead(400); response.end('Invalid path'); return;
  }
  const safePath = path.normalize(requestedPath).replace(/^([.][.][\\/])+/, '');
  const filePath = path.join(rootDirectory, safePath);
  if (!filePath.startsWith(rootDirectory) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404); response.end('Not found'); return;
  }
  const extension = path.extname(filePath).toLowerCase();
  const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
  response.writeHead(200, { 'Content-Type': contentTypes[extension] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') { response.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' }); response.end(); return; }
  try {
    if (request.url === '/api/health' && request.method === 'GET') return sendJson(response, 200, { status: 'ok', service: 'annales-concours' });
    if (request.url === '/api/db-test' && request.method === 'GET') {
      try {
        const data = await supabaseRequest('annales?select=id&limit=1');
        return sendJson(response, 200, { connected: true, rows_available: data.length });
      } catch (error) {
        return sendJson(response, 503, { connected: false, error: 'Supabase non configure ou inaccessible. Ajoutez SUPABASE_SERVICE_ROLE_KEY dans backend/.env.' });
      }
    }
    if (request.url === '/api/products' && request.method === 'GET') {
      try {
        const data = await supabaseRequest('annales?select=id,title,category,exercise_count,price_xof,cover_path,pdf_path&is_active=eq.true&order=title.asc');
        return sendJson(response, 200, data);
      } catch {
        return sendJson(response, 200, products);
      }
    }
    if (request.url === '/api/auth/register' && request.method === 'POST') {
      const body = await readBody(request);
      if (!body.firstName || !body.lastName || !body.email || !body.password || body.password.length < 8) return sendJson(response, 400, { error: 'Prenom, nom, email et mot de passe de 8 caracteres minimum requis.' });
      if (users.has(body.email)) return sendJson(response, 409, { error: 'Ce compte existe deja.' });
      users.set(body.email, { firstName: body.firstName, lastName: body.lastName, password: crypto.createHash('sha256').update(body.password).digest('hex') });
      return sendJson(response, 201, { message: 'Compte cree', firstName: body.firstName, lastName: body.lastName, email: body.email });
    }
    if (request.url === '/api/auth/login' && request.method === 'POST') {
      const body = await readBody(request);
      const user = users.get(body.email);
      const passwordHash = user && crypto.createHash('sha256').update(body.password || '').digest('hex');
      if (!user || user.password !== passwordHash) return sendJson(response, 401, { error: 'Identifiants invalides.' });
      return sendJson(response, 200, { message: 'Connexion reussie', email: body.email });
    }
    if (request.url === '/api/auth/forgot-password' && request.method === 'POST') {
      const body = await readBody(request);
      if (!body.email) return sendJson(response, 400, { error: 'Adresse e-mail requise.' });
      const token = crypto.randomBytes(24).toString('hex');
      passwordResetRequests.set(body.email, { token, createdAt: Date.now() });
      return sendJson(response, 200, { message: 'Si ce compte existe, les instructions seront envoyees par e-mail.' });
    }
    if (request.url === '/api/orders' && request.method === 'POST') {
      const body = await readBody(request);
      if (!Array.isArray(body.items) || body.items.length === 0) return sendJson(response, 400, { error: 'Le panier est vide.' });
      const order = { id: `AC-${Date.now()}`, items: body.items, total: body.total, currency: body.currency || 'XOF', status: 'pending' };
      orders.push(order);
      return sendJson(response, 201, order);
    }
    serveFile(request, response);
  } catch (error) {
    sendJson(response, 500, { error: 'Erreur serveur.' });
  }
});

server.listen(port, () => console.log(`AnnalesConcours backend running on http://localhost:${port}`));
