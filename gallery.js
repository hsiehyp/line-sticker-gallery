// 三個貼圖頁共用程式。各頁先定義 WORKS，並在 <body data-kind="static|animation|popup"> 標明貼圖類型
const KIND = document.body.dataset.kind;
const CDN = 'https://stickershop.line-scdn.net/stickershop/v1';
const mainStill = s => `${CDN}/product/${s}/LINEStorePC/main.png`;
const stickerStill = i => `${CDN}/sticker/${i}/iPhone/sticker@2x.png`;
const MOVE = {
  static:    { main: mainStill, sticker: stickerStill },
  animation: { main: s => `${CDN}/product/${s}/iPhone/main_animation@2x.png`, sticker: i => `${CDN}/sticker/${i}/iPhone/sticker_animation@2x.png` },
  popup:     { main: s => `${CDN}/product/${s}/android/main_popup.png`,       sticker: i => `${CDN}/sticker/${i}/android/sticker_popup.png` },
}[KIND];
const TIP = { static: '點選貼圖放大看。', animation: '點選貼圖播放動畫。', popup: '點選貼圖播放全螢幕動畫。' }[KIND];
const tint = i => `var(--t${i % 5})`;
const $ = id => document.getElementById(id);

$('students').textContent = new Set(WORKS.map(w => w.name)).size;
$('sets').textContent = WORKS.length;
$('grid').innerHTML = WORKS.map((w, i) => `
  <button class="tile" type="button" data-i="${i}" style="background:${tint(i)}">
    <img src="${mainStill(w.set)}" alt="" loading="lazy" width="240" height="240">
    <span class="name">${w.name}</span>
    <span class="set">${w.title}</span>
  </button>`).join('');

// 先顯示靜態圖，動畫載好才換上，避免大檔載入時畫面空白
let playing = 0;
function show(still, anim) {
  const token = ++playing;
  $('stageImg').src = still;
  if (anim === still) return;
  const a = new Image();
  a.onload = () => { if (token === playing) $('stageImg').src = anim; };
  a.src = anim;
}

function open(i) {
  const w = WORKS[i];
  $('dName').textContent = w.name;
  $('dSet').textContent = w.title;
  $('dTip').textContent = w.n ? `共 ${w.n} 張，${TIP}` : '這組的貼圖清單無法從商店頁讀取，目前只顯示主圖。';
  $('stage').style.setProperty('--stage', tint(i));
  $('stageImg').alt = `${w.name}的貼圖`;
  $('dStore').href = `https://line.me/S/sticker/${w.set}`;
  const ids = Array.from({ length: w.n }, (_, k) => w.first + k);
  $('thumbs').innerHTML = ids.map(id => `
    <button class="thumb" type="button" data-id="${id}" aria-pressed="false" aria-label="${KIND === 'static' ? '放大這張貼圖' : '播放這張貼圖'}">
      <img src="${stickerStill(id)}" alt="" loading="lazy" width="120" height="120">
    </button>`).join('');
  show(mainStill(w.set), MOVE.main(w.set));
  $('dlg').showModal();
}

$('grid').addEventListener('click', e => {
  const t = e.target.closest('.tile');
  if (t) open(+t.dataset.i);
});
$('thumbs').addEventListener('click', e => {
  const t = e.target.closest('.thumb');
  if (!t) return;
  document.querySelectorAll('.thumb').forEach(b => b.setAttribute('aria-pressed', b === t));
  show(stickerStill(t.dataset.id), MOVE.sticker(t.dataset.id));
});
$('close').addEventListener('click', () => $('dlg').close());
$('dlg').addEventListener('click', e => { if (e.target === $('dlg')) $('dlg').close(); });
$('dlg').addEventListener('close', () => { playing++; $('stageImg').removeAttribute('src'); });
