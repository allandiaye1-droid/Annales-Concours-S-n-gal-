const products = [
  { title: 'Concours ENA', category: 'Administration', meta: 'Administration · 320 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.00.30 (1).jpeg' },
  { title: 'Concours Police', category: 'Défense & sécurité', meta: 'Défense & sécurité · 300 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.00.30.jpeg' },
  { title: 'Concours Douane', category: 'Administration', meta: 'Administration · 320 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.00.31.jpeg' },
  { title: 'Concours BT Comptabilité', category: 'Technique & gestion', meta: 'Gestion · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 13.40.05.jpeg' },
  { title: 'Concours Gendarmerie', category: 'Défense & sécurité', meta: 'Défense & sécurité · 300 exercices', image: 'image/WhatsApp Image 2026-09-24 at 13.40.06 (1).jpeg' },
  { title: 'Concours Eaux & Forêts', category: 'Défense & sécurité', meta: 'Environnement · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 13.40.06 (3).jpeg' },
  { title: 'Concours BTS Génie civil', category: 'Technique & gestion', meta: 'Technique · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 13.40.06.jpeg' },
  { title: 'Concours FASTEF', category: 'Administration', meta: 'Éducation · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 13.40.07 (1).jpeg' },
  { title: 'Concours ESP', category: 'Technique & gestion', meta: 'Technique · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 13.40.07.jpeg' },
  { title: 'Concours Magistrature', category: 'Administration', meta: 'Justice · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 13.40.08.jpeg' },
  { title: 'Concours Greffe', category: 'Administration', meta: 'Justice · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 13.48.46.jpeg' },
  { title: 'Concours EAA', category: 'Administration', meta: 'Administration · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 13.59.00.jpeg' },
  { title: 'Concours CREM', category: 'Administration', meta: 'Éducation · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 14.45.35 (1).jpeg' },
  { title: 'Concours ENSOA', category: 'Défense & sécurité', meta: 'Défense & sécurité · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 14.45.35.jpeg' },
  { title: 'Concours ESOGN', category: 'Défense & sécurité', meta: 'Défense & sécurité · 320 exercices', image: 'image/WhatsApp Image 2026-09-24 at 14.45.36.jpeg' },
  { title: 'Concours BTS Comptabilité', category: 'Technique & gestion', meta: 'Gestion · 320 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.26.36 (1).jpeg' },
  { title: 'Concours BTS Transit', category: 'Technique & gestion', meta: 'Logistique · 320 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.26.36.jpeg' },
  { title: 'Concours BTS Secrétariat', category: 'Technique & gestion', meta: 'Gestion · 320 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.26.37.jpeg' },
  { title: 'Concours BTS Logistique', category: 'Technique & gestion', meta: 'Logistique · 320 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.26.38.jpeg' },
  { title: 'Concours BT Secrétariat', category: 'Technique & gestion', meta: 'Gestion · 320 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.26.39 (1).jpeg' },
  { title: 'Concours ENDSS', category: 'Administration', meta: 'Santé · 320 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.02.42.jpeg' },
  { title: 'Concours IFACE', category: 'Technique & gestion', meta: 'Gestion · 320 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.04.49.jpeg' },
  { title: 'Probatoire Sénégal', category: 'Administration', meta: 'Enseignement · 320 exercices', image: 'image/WhatsApp Image 2026-09-23 at 21.14.07.jpeg' }
];
const pdfFiles = {
  'Concours ENA': 'Concours_ENA_Senegal_Tome_1_320_exercices.pdf',
  'Concours Police': 'Concours_Police_Senegal_Tome_1_300_exercices.pdf',
  'Concours Douane': 'Concours_Douane_Senegal_Tome_1_320_exercices.pdf',
  'Concours BT Comptabilité': 'Concours_BT_Comptabilite_Senegal_Tome_1_320_exercices.pdf',
  'Concours Gendarmerie': 'Concours_Gendarmerie_Senegal_Tome_1_300_exercices.pdf',
  'Concours Eaux & Forêts': 'Concours_Eaux_Forets_Senegal_Tome_1_320_exercices.pdf',
  'Concours BTS Génie civil': 'Concours_BTS_Genie_Civil_Senegal_Tome_1_320_exercices.pdf',
  'Concours FASTEF': 'Concours_FASTEF_Senegal_Tome_1_320_exercices.pdf',
  'Concours ESP': 'Concours_ESP_Senegal_Tome_1_320_exercices.pdf',
  'Concours Magistrature': 'Concours_Magistrature_Senegal_Tome_1_320_exercices.pdf',
  'Concours Greffe': 'Concours_Greffe_Senegal_Tome_1_320_exercices.pdf',
  'Concours EAA': 'Concours_EAA_Senegal_Tome_1_320_exercices.pdf',
  'Concours CREM': 'Concours_CREM_Senegal_Tome_1_320_exercices.pdf',
  'Concours ENSOA': 'Concours_ENSOA_Senegal_Tome_1_320_exercices.pdf',
  'Concours ESOGN': 'Concours_ESOGN_Senegal_Tome_1_320_exercices.pdf',
  'Concours BTS Comptabilité': 'Concours_BTS_Comptabilite_Gestion_Senegal_Tome_1_320_exercices.pdf',
  'Concours BTS Transit': 'Concours_BTS_Transit_Senegal_Tome_1_320_exercices.pdf',
  'Concours BTS Secrétariat': 'Concours_BTS_Secretariat_Bureautique_Senegal_Tome_1_320_exercices.pdf',
  'Concours BTS Logistique': 'Concours_BTS_Gestion_Chaine_Approvisionnement_Logistique_Senegal_Tome_1_320_exercices.pdf',
  'Concours BT Secrétariat': 'Concours_BT_Secretariat_Bureautique_Senegal_Tome_1_320_exercices.pdf',
  'Concours ENDSS': 'Concours_ENDSS_Senegal_Tome_1_320_exercices.pdf',
  'Concours IFACE': 'Concours_IFACE_Senegal_Tome_1_320_exercices.pdf',
  'Probatoire Sénégal': 'Probatoire_Senegal_Tome_1_320_exercices.pdf'
};

const savedCart = JSON.parse(localStorage.getItem('annales-cart') || '[]');
const state = { category: 'Tous', query: '', cart: savedCart, favorites: new Set(JSON.parse(localStorage.getItem('annales-favorites') || '[]')), authMode: 'register', language: 'FR' };
const grid = document.querySelector('#productGrid');
const emptyState = document.querySelector('#emptyState');
const cartDrawer = document.querySelector('#cartDrawer');
const overlay = document.querySelector('#overlay');
const toast = document.querySelector('#toast');

function renderProducts() {
  const query = state.query.trim().toLowerCase();
  const filtered = products.filter(product => {
    const matchesCategory = state.category === 'Tous' || product.category === state.category;
    const matchesQuery = !query || `${product.title} ${product.meta} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
  grid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-cover">
        <img src="${product.image}" alt="Couverture ${product.title}" loading="lazy">
        <span class="product-tag">PDF · DIGITAL</span>
        <button class="favorite-button ${state.favorites.has(product.title) ? 'active' : ''}" data-favorite="${product.title}" aria-label="Ajouter ${product.title} aux favoris">${state.favorites.has(product.title) ? '♥' : '♡'}</button>
      </div>
      <div class="product-info">
        <h3>${product.title}</h3>
        <div class="product-meta">${product.meta}</div>
        <div class="product-bottom"><span class="price">2 000 <small>F CFA</small></span><button class="add-button" data-add="${product.title}" aria-label="Ajouter ${product.title} au panier">+</button></div>
      </div>
    </article>`).join('');
  emptyState.hidden = filtered.length > 0;
}

function getProduct(title) { return products.find(product => product.title === title); }
function renderCart() {
  const total = state.cart.length * 2000;
  localStorage.setItem('annales-cart', JSON.stringify(state.cart));
  document.querySelector('#cartCount').textContent = state.cart.length;
  document.querySelector('#cartTotal').textContent = `${total.toLocaleString('fr-FR')} F CFA`;
  document.querySelector('#checkoutButton').disabled = state.cart.length === 0;
  const items = document.querySelector('#cartItems');
  if (!state.cart.length) {
    items.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon flag-medallion"><span class="senegal-flag"><i></i></span></div><h3>Votre panier est vide</h3><p>Ajoutez une annale pour commencer votre préparation.</p></div>';
    return;
  }
  items.innerHTML = state.cart.map(title => { const product = getProduct(title); return `<div class="cart-item"><img src="${product.image}" alt=""><div class="cart-item-main"><h3>${product.title}</h3><p>Annale numérique · PDF</p><p class="price">2 000 F CFA</p></div><button class="remove-item" data-remove="${product.title}" aria-label="Retirer ${product.title}">×</button></div>`; }).join('');
}
function showToast(message) { toast.textContent = message; toast.classList.add('show'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2400); }
function openCart() { cartDrawer.classList.add('open'); overlay.classList.add('open'); cartDrawer.setAttribute('aria-hidden', 'false'); }
function closeCart() { cartDrawer.classList.remove('open'); overlay.classList.remove('open'); cartDrawer.setAttribute('aria-hidden', 'true'); }
function addToCart(title) { if (!state.cart.includes(title)) { state.cart.push(title); renderCart(); showToast(`${title} ajouté au panier`); } else { showToast('Cette annale est déjà dans votre panier'); } }
function openAuth(mode = 'register') { state.authMode = mode; const modal = document.querySelector('#authModal'); const nameFields = document.querySelector('.name-fields'); const password = document.querySelector('#authPassword'); modal.hidden = false; modal.classList.toggle('login-mode', mode === 'login'); document.querySelector('#authTitle').textContent = mode === 'register' ? 'Créer un compte' : 'Se connecter'; document.querySelector('#authCopy').textContent = mode === 'register' ? 'Retrouvez vos annales et vos achats sur tous vos appareils.' : 'Entrez votre adresse e-mail et votre mot de passe.'; document.querySelector('#authSubmit').innerHTML = mode === 'register' ? 'Créer mon compte <span>→</span>' : 'Me connecter <span>→</span>'; document.querySelector('#authSwitch').textContent = mode === 'register' ? "J'ai déjà un compte" : "Je n'ai pas encore de compte"; nameFields.hidden = mode !== 'register'; document.querySelector('#authFirstName').required = mode === 'register'; document.querySelector('#authLastName').required = mode === 'register'; password.minLength = mode === 'register' ? 8 : 1; password.placeholder = mode === 'register' ? '8 caractères minimum' : 'Votre mot de passe'; }
function closeAuth() { document.querySelector('#authModal').hidden = true; }
function openReset() { document.querySelector('#authModal').hidden = true; document.querySelector('#resetModal').hidden = false; }
function closeReset() { document.querySelector('#resetModal').hidden = true; }
function saveFavorites() { localStorage.setItem('annales-favorites', JSON.stringify([...state.favorites])); }

document.addEventListener('click', event => {
  const addButton = event.target.closest('[data-add]');
  const favoriteButton = event.target.closest('[data-favorite]');
  const removeButton = event.target.closest('[data-remove]');
  if (addButton) addToCart(addButton.dataset.add);
  if (favoriteButton) { const { favorite } = favoriteButton.dataset; state.favorites.has(favorite) ? state.favorites.delete(favorite) : state.favorites.add(favorite); saveFavorites(); renderProducts(); showToast(state.favorites.has(favorite) ? 'Ajouté à vos favoris' : 'Retiré de vos favoris'); }
  if (removeButton) { state.cart = state.cart.filter(title => title !== removeButton.dataset.remove); renderCart(); }
});
document.querySelector('#searchInput').addEventListener('input', event => { state.query = event.target.value; renderProducts(); });
document.querySelector('#categoryFilters').addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (!button) return; state.category = button.dataset.category; document.querySelectorAll('.filter-pill').forEach(item => item.classList.toggle('active', item === button)); renderProducts(); });
document.querySelector('#openCart').addEventListener('click', openCart);
document.querySelector('#closeCart').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.querySelector('#focusSearch').addEventListener('click', () => { document.querySelector('#searchInput').focus(); document.querySelector('#bibliotheque').scrollIntoView({ behavior: 'smooth' }); showToast('Choisissez une annale à 2 000 F CFA'); });
document.querySelector('#registerButton').addEventListener('click', () => openAuth('register'));
document.querySelector('#loginButton').addEventListener('click', () => openAuth('login'));
document.querySelector('#closeAuth').addEventListener('click', closeAuth);
document.querySelector('#forgotPassword').addEventListener('click', openReset);
document.querySelector('#closeReset').addEventListener('click', closeReset);
document.querySelector('#backToLogin').addEventListener('click', () => { closeReset(); openAuth('login'); });
document.querySelector('#resetModal').addEventListener('click', event => { if (event.target.id === 'resetModal') closeReset(); });
document.querySelector('#resetForm').addEventListener('submit', async event => { event.preventDefault(); const email = document.querySelector('#resetEmail').value.trim(); try { const response = await fetch('/api/auth/forgot-password', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ email }) }); const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result.error || 'Demande impossible'); showToast('Instructions envoyées si ce compte existe'); closeReset(); } catch (error) { showToast(error.message || 'Demande impossible'); } });
document.querySelector('#authModal').addEventListener('click', event => { if (event.target.id === 'authModal') closeAuth(); });
document.querySelector('#authSwitch').addEventListener('click', () => openAuth(state.authMode === 'register' ? 'login' : 'register'));
document.querySelector('#authForm').addEventListener('submit', async event => { event.preventDefault(); const firstName = document.querySelector('#authFirstName').value.trim(); const lastName = document.querySelector('#authLastName').value.trim(); const email = document.querySelector('#authEmail').value.trim(); const password = document.querySelector('#authPassword').value; if (state.authMode === 'register' && password.length < 8) { showToast('Le mot de passe doit contenir au moins 8 caractères'); return; } const endpoint = state.authMode === 'register' ? '/api/auth/register' : '/api/auth/login'; try { const response = await fetch(endpoint, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ firstName, lastName, email, password }) }); if (!response.ok) throw new Error('API indisponible'); showToast(state.authMode === 'register' ? 'Compte créé avec succès' : 'Connexion réussie'); closeAuth(); } catch { localStorage.setItem('candidate-profile', JSON.stringify({ firstName, lastName, email })); showToast(state.authMode === 'register' ? 'Compte enregistré sur cet appareil' : 'Connexion locale réussie'); closeAuth(); } });
document.querySelector('#languageButton').addEventListener('click', event => { state.language = state.language === 'FR' ? 'WO' : 'FR'; event.currentTarget.innerHTML = `<span class="senegal-flag tiny-flag"><i></i></span> ${state.language} <small>⌄</small>`; showToast(state.language === 'WO' ? 'Mode wolof bientôt disponible' : 'Français activé'); });
document.querySelector('#mobileMenu').addEventListener('click', () => { const nav = document.querySelector('#desktopNav'); nav.classList.toggle('open'); showToast(nav.classList.contains('open') ? 'Menu ouvert' : 'Menu fermé'); });
document.querySelector('#featurePrev').addEventListener('click', () => { document.querySelector('.featured-scroll a:last-of-type').after(document.querySelector('.featured-scroll a:first-of-type')); showToast('Concours précédent'); });
document.querySelector('#featureNext').addEventListener('click', () => { const links = document.querySelectorAll('.featured-scroll a'); document.querySelector('.featured-scroll').insertBefore(links[links.length - 1], links[0]); showToast('Concours suivant'); });
document.querySelector('#checkoutButton').addEventListener('click', async () => { if (!state.cart.length) return; const purchasedItems = [...state.cart]; try { const response = await fetch('/api/orders', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ items:purchasedItems, total:purchasedItems.length * 2000, currency:'XOF' }) }); if (!response.ok) throw new Error('API indisponible'); } catch { /* Le mode local permet de tester le téléchargement avant le branchement du paiement. */ } state.cart = []; renderCart(); closeCart(); const downloadLinks = purchasedItems.map(title => { const product = getProduct(title); return `<a class="download-link" href="pdf/${encodeURIComponent(pdfFiles[title])}" download>↓ Télécharger ${product.title}</a>`; }).join(''); document.querySelector('#cartItems').innerHTML = `<div class="purchase-success"><div class="success-flag"><span class="senegal-flag"><i></i></span></div><h3>Achat confirmé</h3><p>Vos annales sont prêtes à télécharger.</p><div class="download-list">${downloadLinks}</div></div>`; openCart(); showToast('Achat confirmé : vos PDF sont disponibles'); });
document.querySelector('#showAll').addEventListener('click', () => { state.category = 'Tous'; state.query = ''; document.querySelector('#searchInput').value = ''; document.querySelectorAll('.filter-pill').forEach(item => item.classList.toggle('active', item.dataset.category === 'Tous')); renderProducts(); document.querySelector('#bibliotheque').scrollIntoView({ behavior: 'smooth' }); });
renderProducts();
renderCart();
