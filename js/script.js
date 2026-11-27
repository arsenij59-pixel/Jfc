/* ================= ДАННЫЕ ================= */
const IMG = id => `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`;

const PRODUCTS = [
  {id:1, cat:'shawarma', name:'Шаурма Классическая', desc:'Сочная куриная грудка на гриле, хрустящие свежие овощи, фирменный чесночный соус и тонкий лаваш.', weight:'350 г', price:290, emoji:'🌯', img:IMG('1529006557810-274b9b2fc783'), tags:['hit'], custom:true},
  {id:2, cat:'shawarma', name:'Шаурма Огненная', desc:'Курица, острый соус чили, халапеньо, лук и специи. Для тех, кто любит поострее.', weight:'360 г', price:320, emoji:'🔥', img:IMG('1561651823-34feb02250e4'), tags:['spicy'], custom:true},
  {id:3, cat:'shawarma', name:'Шаурма с говядиной', desc:'Мраморная говядина, обжаренная на вертеле, овощи, соус тахини и зелень.', weight:'380 г', price:390, emoji:'🥩', img:IMG('1603360946369-dc9bb6258143'), tags:[], custom:true},
  {id:4, cat:'shawarma', name:'Шаурма Люля-кебаб', desc:'Люля из баранины, помидоры, свежая зелень и луковый соус.', weight:'370 г', price:370, emoji:'🍖', img:IMG('1615937657715-bc7b4b7962c1'), tags:['new'], custom:true},
  {id:5, cat:'snacks', name:'Картофель фри', desc:'Хрустящий, с морской солью. Идеален с фирменным соусом.', weight:'150 г', price:150, emoji:'🍟', img:IMG('1573080496219-bb080dd4f877'), tags:[], custom:false},
  {id:6, cat:'snacks', name:'Наггетсы', desc:'Куриные наггетсы, 6 шт, с соусом на выбор.', weight:'180 г', price:190, emoji:'🍗', img:IMG('1562967914-608f82629710'), tags:[], custom:false},
  {id:7, cat:'sauces', name:'Чесночный соус', desc:'Фирменный, на основе натурального йогурта.', weight:'50 г', price:40, emoji:'🧄', img:IMG('1472476443507-c7a5948772fc'), tags:[], custom:false},
  {id:8, cat:'sauces', name:'Соус Чили', desc:'Острый, с перцем чили и специями.', weight:'50 г', price:40, emoji:'🌶️', img:IMG('1583119022894-919a68a3d0e3'), tags:['spicy'], custom:false},
  {id:9, cat:'drinks', name:'Кола', desc:'Классическая, охлаждённая.', weight:'500 мл', price:100, emoji:'🥤', img:IMG('1554866585-cd94860890b7'), tags:[], custom:false},
  {id:10, cat:'drinks', name:'Айран', desc:'Освежающий кисломолочный напиток.', weight:'300 мл', price:80, emoji:'🥛', img:IMG('1571212515416-fc8a4c1e5f19'), tags:[], custom:false}
];

const CTOR_OPTS = {
  spicy: [
    {label:'Не острая', extra:0},
    {label:'Средняя', extra:0},
    {label:'Острая 🌶️', extra:0}
  ],
  sauce: [
    {label:'Чесночный', extra:0},
    {label:'Чили', extra:0},
    {label:'Тахини', extra:0},
    {label:'Сырный', extra:30}
  ],
  extras: [
    {label:'Двойное мясо', extra:120},
    {label:'Сыр', extra:40},
    {label:'Халапеньо', extra:30},
    {label:'Без лука', extra:0}
  ]
};

const PROMO_CODE = 'ШАУРМА';
const DELIVERY_FEE = 150;
const FREE_FROM = 500;
const PHONE_WA = '79991234567';

/* ================= СОСТОЯНИЕ ================= */
let cart = [];
let discountOn = false;
let activeCat = 'all';
let checkoutMethod = 'delivery';

try { cart = JSON.parse(localStorage.getItem('sb_cart') || '[]'); } catch(e){ cart = []; }

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmt = n => n.toLocaleString('ru-RU') + ' ₽';

/* ================= ТОСТ ================= */
let toastTimer;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ================= МЕНЮ ================= */
function tagHtml(t){
  if(t==='hit') return '<span class="tag tag-hit">Хит</span>';
  if(t==='spicy') return '<span class="tag tag-spicy">Острое</span>';
  if(t==='new') return '<span class="tag tag-new">Новинка</span>';
  return '';
}

function renderMenu(){
  const grid = $('#menuGrid');
  const list = activeCat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === activeCat);
  grid.innerHTML = list.map((p,i) => `
    <article class="card" style="animation-delay:${i*40}ms">
      <div class="card-media">
        <span class="emoji">${p.emoji}</span>
        ${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">` : ''}
        ${p.tags.length ? `<div class="card-tags">${p.tags.map(tagHtml).join('')}</div>` : ''}
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="card-desc">${p.desc}</p>
        <div class="card-meta">${p.weight}</div>
        <div class="card-foot">
          <div class="price">${p.price}<small>₽</small></div>
          <div class="card-actions">
            ${p.custom ? `<button class="btn-construct" data-ctor="${p.id}">Собрать</button>` : ''}
            <button class="btn-add" data-add="${p.id}" aria-label="Добавить ${p.name}">+</button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

$('#tabs').addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if(!btn) return;
  $$('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  activeCat = btn.dataset.cat;
  renderMenu();
});

$('#menuGrid').addEventListener('click', e => {
  const addBtn = e.target.closest('[data-add]');
  if(addBtn){
    const p = PRODUCTS.find(x => x.id === +addBtn.dataset.add);
    if(p) addToCart(p, null);
    return;
  }
  const ctorBtn = e.target.closest('[data-ctor]');
  if(ctorBtn){
    openConstructor(+ctorBtn.dataset.ctor);
  }
});

/* ================= КОРЗИНА ================= */
function saveCart(){
  try { localStorage.setItem('sb_cart', JSON.stringify(cart)); } catch(e){}
}

function cartKey(id, opts){
  return id + (opts ? '_' + opts.label : '');
}

function addToCart(product, opts){
  const key = cartKey(product.id, opts);
  const found = cart.find(i => i.key === key);
  if(found){
    found.qty++;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      emoji: product.emoji,
      img: product.img || '',
      price: opts ? opts.price : product.price,
      label: opts ? opts.label : '',
      qty: 1
    });
  }
  saveCart();
  renderCart();
  toast(`«${product.name}» в корзине 🌯`);
}

function changeQty(key, delta){
  const item = cart.find(i => i.key === key);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCart();
}

function removeItem(key){
  cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCart();
}

function subtotal(){
  return cart.reduce((s,i) => s + i.price * i.qty, 0);
}

function discountAmount(){
  return discountOn ? Math.round(subtotal() * 0.1) : 0;
}

function renderCart(){
  const box = $('#cartItems');
  const count = cart.reduce((s,i) => s + i.qty, 0);

  ['#cartCount','#floatCartCount'].forEach(sel => {
    const el = $(sel);
    el.textContent = count;
    el.classList.toggle('show', count > 0);
  });

  if(!cart.length){
    box.innerHTML = `<div class="cart-empty"><span class="big">🛒</span>Корзина пока пуста.<br>Добавьте шаурму из меню!</div>`;
  } else {
    box.innerHTML = cart.map(i => `
      <div class="cart-item">
        <div class="ci-thumb">
          <span>${i.emoji}</span>
          ${i.img ? `<img src="${i.img}" alt="" onerror="this.style.display='none'">` : ''}
        </div>
        <div class="ci-info">
          <b>${i.name}</b>
          ${i.label ? `<small>${i.label}</small>` : ''}
          <div class="ci-price">${fmt(i.price * i.qty)}</div>
        </div>
        <div class="qty">
          <button data-minus="${i.key}" aria-label="Убрать">−</button>
          <b>${i.qty}</b>
          <button data-plus="${i.key}" aria-label="Добавить">+</button>
        </div>
        <button class="ci-remove" data-remove="${i.key}" aria-label="Удалить">✕</button>
      </div>
    `).join('');
  }

  const sub = subtotal();
  const disc = discountAmount();
  $('#cartSubtotal').textContent = fmt(sub);
  $('#cartTotal').textContent = fmt(sub - disc);
  const dRow = $('#cartDiscountRow');
  dRow.style.display = disc ? 'flex' : 'none';
  $('#cartDiscount').textContent = '−' + fmt(disc);
  $('#promoOk').style.display = discountOn ? 'block' : 'none';
}

$('#cartItems').addEventListener('click', e => {
  const plus = e.target.closest('[data-plus]');
  if(plus) return changeQty(plus.dataset.plus, 1);
  const minus = e.target.closest('[data-minus]');
  if(minus) return changeQty(minus.dataset.minus, -1);
  const rm = e.target.closest('[data-remove]');
  if(rm) return removeItem(rm.dataset.remove);
});

$('#promoApply').addEventListener('click', () => {
  const val = $('#promoInput').value.trim().toUpperCase();
  if(val === PROMO_CODE){
    discountOn = true;
    renderCart();
    toast('Промокод применён — скидка 10% 🎉');
  } else {
    toast('Такого промокода нет 🤔');
  }
});

/* ================= ОТКРЫТИЕ/ЗАКРЫТИЕ ================= */
function openCart(){
  $('#cart').classList.add('open');
  $('#overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeAll(){
  $('#cart').classList.remove('open');
  $('#overlay').classList.remove('active');
  $$('.modal').forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}

$('#cartBtn').addEventListener('click', openCart);
$('#floatCart').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeAll);
$('#overlay').addEventListener('click', closeAll);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeAll(); });

/* ================= КОНСТРУКТОР ================= */
let ctor = { product:null };

function openConstructor(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;
  ctor = { product:p };
  $('#ctorTitle').textContent = p.name;
  $('#ctorBase').textContent = `${p.weight} · базовая цена ${p.price} ₽`;

  $('#ctorOptions').innerHTML = `
    <div class="opt-group">
      <label>Острота</label>
      <div class="chips">
        ${CTOR_OPTS.spicy.map((o,i) => `
          <label class="chip">
            <input type="radio" name="spicy" value="${i}" ${i===0?'checked':''}>
            <span>${o.label}</span>
          </label>`).join('')}
      </div>
    </div>
    <div class="opt-group">
      <label>Соус</label>
      <div class="chips">
        ${CTOR_OPTS.sauce.map((o,i) => `
          <label class="chip">
            <input type="radio" name="sauce" value="${i}" ${i===0?'checked':''}>
            <span>${o.label}${o.extra ? ` <em>+${o.extra} ₽</em>` : ''}</span>
          </label>`).join('')}
      </div>
    </div>
    <div class="opt-group">
      <label>Дополнительно</label>
      <div class="chips">
        ${CTOR_OPTS.extras.map((o,i) => `
          <label class="chip">
            <input type="checkbox" name="extra" value="${i}">
            <span>${o.label}${o.extra ? ` <em>+${o.extra} ₽</em>` : ''}</span>
          </label>`).join('')}
      </div>
    </div>
  `;

  $('#ctorOptions').onchange = updateCtorPrice;
  updateCtorPrice();
  $('#ctorModal').classList.add('open');
  $('#overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function ctorTotal(){
  let sum = ctor.product.price;
  const s = CTOR_OPTS.sauce[+($('input[name="sauce"]:checked')?.value || 0)];
  sum += s ? s.extra : 0;
  $$('input[name="extra"]:checked').forEach(cb => {
    sum += CTOR_OPTS.extras[+cb.value].extra;
  });
  return sum;
}

function updateCtorPrice(){
  $('#ctorPrice').textContent = fmt(ctorTotal());
}

function buildLabel(){
  const spicy = CTOR_OPTS.spicy[+($('input[name="spicy"]:checked')?.value || 0)].label;
  const sauce = CTOR_OPTS.sauce[+($('input[name="sauce"]:checked')?.value || 0)].label;
  const extras = $$('input[name="extra"]:checked').map(cb => CTOR_OPTS.extras[+cb.value].label);
  return [spicy + ' острота', sauce + ' соус', ...extras].join(' · ');
}

$('#ctorAdd').addEventListener('click', () => {
  const opts = { label: buildLabel(), price: ctorTotal() };
  addToCart(ctor.product, opts);
  $('#ctorModal').classList.remove('open');
  openCart();
});

/* ================= ОФОРМЛЕНИЕ ================= */
function deliveryFee(){
  if(checkoutMethod === 'pickup') return 0;
  return (subtotal() - discountAmount()) >= FREE_FROM ? 0 : DELIVERY_FEE;
}

function renderSummary(){
  const sub = subtotal();
  const disc = discountAmount();
  const fee = deliveryFee();

  $('#sumSubtotal').textContent = fmt(sub);
  const dRow = $('#sumDiscountRow');
  dRow.style.display = disc ? 'flex' : 'none';
  $('#sumDiscount').textContent = '−' + fmt(disc);
  $('#sumDelivery').textContent = fee ? fmt(fee) : 'Бесплатно';
  $('#sumTotal').textContent = fmt(sub - disc + fee);

  $('#addressField').style.display = checkoutMethod === 'delivery' ? 'block' : 'none';
  $('#fAddress').required = checkoutMethod === 'delivery';
}

$('.segmented').addEventListener('click', e => {
  const btn = e.target.closest('[data-method]');
  if(!btn) return;
  $$('.segmented button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  checkoutMethod = btn.dataset.method;
  renderSummary();
});

$('#checkoutBtn').addEventListener('click', () => {
  if(!cart.length){ toast('Сначала добавьте что-нибудь из меню'); return; }
  $('#cart').classList.remove('open');
  $('#checkoutModal').classList.add('open');
  renderSummary();
});

$('#checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#fName').value.trim();
  const phone = $('#fPhone').value.trim();
  const address = $('#fAddress').value.trim();

  if(!name){ toast('Укажите имя'); return; }
  if(phone.replace(/\D/g,'').length < 10){ toast('Проверьте номер телефона'); return; }
  if(checkoutMethod === 'delivery' && !address){ toast('Укажите адрес доставки'); return; }

  const orderNum = Math.floor(1000 + Math.random() * 9000);
  const sub = subtotal();
  const disc = discountAmount();
  const fee = deliveryFee();
  const total = sub - disc + fee;

  const lines = cart.map(i => `• ${i.name}${i.label ? ' (' + i.label + ')' : ''} × ${i.qty} — ${i.price * i.qty} ₽`).join('\n');
  const msg =
    `Заказ №${orderNum}\n${lines}\n\n` +
    `Товары: ${sub} ₽\n` +
    (disc ? `Скидка: −${disc} ₽\n` : '') +
    `Доставка: ${fee ? fee + ' ₽' : 'бесплатно'}\n` +
    `Итого: ${total} ₽\n\n` +
    `Способ: ${checkoutMethod === 'delivery' ? 'доставка' : 'самовывоз'}\n` +
    `Имя: ${name}\nТелефон: ${phone}\n` +
    (address ? `Адрес: ${address}\n` : '') +
    ($('#fComment').value.trim() ? `Комментарий: ${$('#fComment').value.trim()}\n` : '');

  const waLink = `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(msg)}`;

  $('#checkoutBox').innerHTML = `
    <div class="success">
      <span class="check">✅</span>
      <h3>Заказ принят!</h3>
      <div class="order-num">Заказ №${orderNum}</div>
      <p>Спасибо, ${name}! Мы уже начали готовить.<br>Сумма к оплате: <b>${fmt(total)}</b>.<br>${checkoutMethod === 'delivery' ? 'Курьер приедет в течение 30 минут.' : 'Заберите заказ через 10 минут.'}</p>
      <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-green" style="margin-bottom:12px">Отправить в WhatsApp</a>
      <button class="btn btn-ghost" data-close>Готово</button>
    </div>
  `;

  cart = [];
  discountOn = false;
  saveCart();
  renderCart();
  toast('Заказ оформлен 🎉');
});

/* ================= ПРОМО-ПОПАП ================= */
function showPromo(){
  if(sessionStorage.getItem('sb_promo_shown')) return;
  sessionStorage.setItem('sb_promo_shown', '1');
  setTimeout(() => {
    $('#promoModal').classList.add('open');
    $('#overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }, 7000);
}

$('#promoCopy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(PROMO_CODE);
    $('#promoCopy').textContent = '✓ Скопировано!';
  } catch(e){
    $('#promoCopy').textContent = 'Промокод: ' + PROMO_CODE;
  }
});

/* ================= ЗАКРЫТИЕ ================= */
document.addEventListener('click', e => {
  if(e.target.closest('[data-close]')) closeAll();
  if(e.target.classList.contains('modal')) closeAll();
});

/* ================= МОБИЛЬНОЕ МЕНЮ ================= */
$('#burger').addEventListener('click', () => {
  $('#nav').classList.toggle('mobile-open');
});
$('#nav').addEventListener('click', e => {
  if(e.target.tagName === 'A') $('#nav').classList.remove('mobile-open');
});

/* ================= СКРОЛЛ ================= */
window.addEventListener('scroll', () => {
  $('#header').classList.toggle('scrolled', window.scrollY > 20);
}, {passive:true});

/* ================= REVEAL ================= */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if(en.isIntersecting){
      en.target.classList.add('visible');
      io.unobserve(en.target);
    }
  });
}, {threshold:.12});
$$('.reveal').forEach(el => io.observe(el));

/* ================= СТАРТ ================= */
renderMenu();
renderCart();
showPromo();
