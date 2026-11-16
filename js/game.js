(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const irand = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const TAU = Math.PI * 2;

  function hexLerp(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round((pa >> 16) + (((pb >> 16) - (pa >> 16)) * t));
    const g = Math.round(((pa >> 8) & 255) + ((((pb >> 8) & 255) - ((pa >> 8) & 255)) * t));
    const bl = Math.round((pa & 255) + (((pb & 255) - (pa & 255)) * t));
    return `rgb(${r},${g},${bl})`;
  }
  function rr(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }

  const COLS = 21, ROWS = 21;
  const CREATURES = [
    { id: 'snake',   name: 'ثعبان النيون',  emoji: '🐍', colors: ['#22e0ff', '#7c5cff', '#ff2ea6'], glow: '#22e0ff', speed: 1.00, score: 1.0, grow: 1, trait: 'متوازن وكلاسيكي', ability: 'لا قدرة خاصة — تحكم مستقر' },
    { id: 'lizard',  name: 'سحلية سريعة',   emoji: '🦎', colors: ['#3dff8e', '#a8ff3d', '#22e0ff'], glow: '#3dff8e', speed: 0.88, score: 1.1, grow: 1, trait: 'أسرع +10% نقاط', ability: 'رشاقة عالية وحركة أخف' },
    { id: 'turtle',  name: 'سلحفاة الحكمة', emoji: '🐢', colors: ['#7fd8ff', '#3dff8e', '#2fa36b'], glow: '#7fd8ff', speed: 1.12, score: 1.2, grow: 1, trait: 'أبطأ +20% نقاط', ability: 'درع: تتجاهل أول اصطدام بجسمك مرة كل جولة' },
    { id: 'penguin', name: 'بطريق القطب',   emoji: '🐧', colors: ['#e8fbff', '#7fd8ff', '#ffc233'], glow: '#7fd8ff', speed: 0.98, score: 1.15, grow: 1, trait: 'مكافآت أعلى', ability: 'المكافآت (⭐/💎) تمنح وقتًا أطول وقيمة أكبر' },
    { id: 'phoenix', name: 'عنقاء النيون',  emoji: '🔥', colors: ['#ffd23f', '#ff7a18', '#ff2e63'], glow: '#ff7a18', speed: 0.94, score: 1.25, grow: 1, trait: 'نقاط عالية', ability: 'بعث: عند الخسارة أول مرة تعود أصغر (مرة واحدة)' },
    { id: 'chameleon',name:'حرباء الألوان', emoji: '🦎', colors: ['#ff2ea6', '#ffc233', '#3dff8e', '#22e0ff'], glow: '#ff2ea6', speed: 1.00, score: 1.1, grow: 1, trait: 'ألوان متغيرة', ability: 'يتغير لونك مع التقدم ويمنح مكافأة مستوى إضافية', rainbow: true },
  ];

  const THEMES = [
    { id: 'neon', name: 'ليل النيون', emoji: '🌌', bg: ['#1c1048', '#0b0620', '#170a3a'], grid: 'rgba(140,120,255,.10)', wall: '#7c5cff', ui: ['#22e0ff', '#ff2ea6'], foodGlow: '#ff2ea6', ambient: 'dust', ambCol: 'rgba(160,140,255,.6)', css: 'linear-gradient(160deg,#1c1048 0%,#0b0620 55%,#170a3a 100%)' },
    { id: 'nokia', name: 'شاشة نوكيا', emoji: '📟', bg: ['#a3c455', '#8bb04a'], grid: 'rgba(30,45,15,.16)', wall: '#2f3f14', ui: ['#a8e04a', '#7fa32e'], foodGlow: '#2f3f14', ambient: 'none', ambCol: '', css: 'linear-gradient(180deg,#a3c455,#8bb04a)', lcd: true, scan: true, pixelSnake: '#2c3a12' },
    { id: 'sunset', name: 'غروب الصحراء', emoji: '🏜️', bg: ['#2b0f3a', '#8a2a4a', '#e8703a'], grid: 'rgba(255,200,150,.10)', wall: '#ffb020', ui: ['#ffb020', '#ff2e63'], foodGlow: '#ffd23f', ambient: 'sand', ambCol: 'rgba(255,200,130,.5)', css: 'linear-gradient(180deg,#2b0f3a 0%,#8a2a4a 55%,#e8703a 100%)' },
    { id: 'ocean', name: 'أعماق المحيط', emoji: '🌊', bg: ['#04304f', '#020d1f'], grid: 'rgba(80,200,255,.10)', wall: '#22d3ee', ui: ['#22e0ff', '#3dff8e'], foodGlow: '#7fd8ff', ambient: 'bubbles', ambCol: 'rgba(140,220,255,.5)', css: 'linear-gradient(180deg,#04304f,#020d1f)' },
    { id: 'forest', name: 'غابة الطبيعة', emoji: '🌲', bg: ['#082016', '#04110c'], grid: 'rgba(120,255,180,.08)', wall: '#3dff8e', ui: ['#3dff8e', '#ffc233'], foodGlow: '#a8ff3d', ambient: 'dust', ambCol: 'rgba(160,255,190,.5)', css: 'linear-gradient(180deg,#082016,#04110c)' },
    { id: 'galaxy', name: 'سديم المجرّة', emoji: '✨', bg: ['#1a0b38', '#05020f'], grid: 'rgba(200,160,255,.08)', wall: '#b26bff', ui: ['#b26bff', '#ff2ea6'], foodGlow: '#ff2ea6', ambient: 'stars', ambCol: 'rgba(220,200,255,.9)', css: 'linear-gradient(160deg,#1a0b38,#05020f)', nebula: true }
  ];

  const DIFFS = [
    { id: 'calm', name: 'هادئ', emoji: '🌙', tick: 170, min: 110 },
    { id: 'classic', name: 'كلاسيكي', emoji: '📱', tick: 135, min: 80 },
    { id: 'fast', name: 'سريع', emoji: '⚡', tick: 105, min: 62 },
    { id: 'insane', name: 'جنوني', emoji: '💀', tick: 80, min: 50 }
  ];

  const STAGES = [
    { id: 1, name: 'المرج الهادئ', desc: 'تعلّم الأساسيات', goal: 6, obs: 0, walls: false, speedMul: 1.05 },
    { id: 2, name: 'غابة التحدي', desc: 'عوائق خفيفة', goal: 10, obs: 4, walls: true, speedMul: 1.00 },
    { id: 3, name: 'وادي الرياح', desc: 'سرعة أعلى', goal: 14, obs: 6, walls: true, speedMul: 0.94 },
    { id: 4, name: 'كهوف النيون', desc: 'عوائق أكثر', goal: 18, obs: 10, walls: true, speedMul: 0.90 },
    { id: 5, name: 'قمة العنقاء', desc: 'تحدي أسطوري', goal: 24, obs: 14, walls: true, speedMul: 0.86 },
  ];

  const CREATURE = Object.fromEntries(CREATURES.map(c => [c.id, c]));
  const THEME = Object.fromEntries(THEMES.map(t => [t.id, t]));
  const DIFF = Object.fromEntries(DIFFS.map(d => [d.id, d]));

  const store = (() => { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return localStorage; } catch (e) { const m = {}; return { getItem: k => m[k] ?? null, setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } }; } })();
  const KEY = 'neonSnake.evo.v2';
  let settings = { creature: 'snake', theme: 'neon', diff: 'classic', walls: true, obs: false, grid: true, shake: true, sound: true, nature: true };
  let stats = { best: 0, games: 0, food: 0, xp: 0, longest: 0 };
  let profile = { name: 'لاعب محلي', unlockedStage: 1 };

  function load() {
    try {
      const raw = store.getItem(KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.s) for (const k in settings) if (k in d.s) settings[k] = d.s[k];
      if (d.st) for (const k in stats) if (typeof d.st[k] === 'number') stats[k] = d.st[k];
      if (d.p) { if (typeof d.p.name === 'string') profile.name = d.p.name.slice(0,24) || profile.name; if (typeof d.p.unlockedStage === 'number') profile.unlockedStage = clamp(d.p.unlockedStage|0,1,STAGES.length); }
      if (!CREATURE[settings.creature]) settings.creature = 'snake';
      if (!THEME[settings.theme]) settings.theme = 'neon';
      if (!DIFF[settings.diff]) settings.diff = 'classic';
    } catch (e) {}
  }
  function save() { try { store.setItem(KEY, JSON.stringify({ s: settings, st: stats, p: profile })); } catch (e) {} }

  // ===== Audio (electronic + nature-inspired) =====
  let ctx = null, master = null, sfxBus = null, musBus = null, noiseBuf = null, musicTimer = null, mStep = 0, nextT = 0;
  const STEP = 60 / 132 / 2;
  const BASS = [110,110,131,110,165,110,98,110];
  const LEAD = [0,0,440,0, 0,523,0,440, 0,0,659,0, 523,0,440,0, 0,0,440,0, 0,523,0,659, 0,880,0,659, 523,0,440,0];
  function ensureAudio() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(()=>{}); return; }
    const Ctor = window.AudioContext || window.webkitAudioContext; if (!Ctor) return;
    try {
      ctx = new Ctor();
      master = ctx.createGain(); master.gain.value = settings.sound ? 0.85 : 0; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
      musBus = ctx.createGain(); musBus.gain.value = 0.14; musBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
      nextT = ctx.currentTime + 0.1;
      if (!musicTimer) musicTimer = setInterval(() => {
        if (!ctx || ctx.state !== 'running') return;
        while (nextT < ctx.currentTime + 0.35) {
          if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05;
          if (!settings.nature) schedStep(mStep, nextT);
          nextT += STEP; mStep = (mStep + 1) % 32;
        }
      }, 120);
      if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
    } catch (e) { ctx = null; }
  }
  function mtone(f,t,d,type,v){ const o=ctx.createOscillator(),g=ctx.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(v,t+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t+d); o.connect(g); g.connect(musBus); o.start(t); o.stop(t+d+0.05); }
  function schedStep(s,t){ mtone(BASS[s%8],t,0.19,'triangle',0.5); if(LEAD[s]) mtone(LEAD[s],t,0.14,'square',0.13); }
  function tone(f,{t=0,d=0.12,type='triangle',v=0.45,slide=0,bus=sfxBus}={}){ if(!ctx||!settings.sound) return; try{ const o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime+t; o.type=type; o.frequency.setValueAtTime(f,now); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),now+d); g.gain.setValueAtTime(0.0001,now); g.gain.exponentialRampToValueAtTime(v,now+0.012); g.gain.exponentialRampToValueAtTime(0.0001,now+d); o.connect(g); g.connect(bus||sfxBus); o.start(now); o.stop(now+d+0.06);}catch(e){} }
  function noiseBurst(d=0.12,v=0.18,lp=1200,hp=200){ if(!ctx||!settings.sound||!noiseBuf) return; try{ const src=ctx.createBufferSource(), g=ctx.createGain(), lpf=ctx.createBiquadFilter(), hpf=ctx.createBiquadFilter(), now=ctx.currentTime; src.buffer=noiseBuf; lpf.type='lowpass'; lpf.frequency.value=lp; hpf.type='highpass'; hpf.frequency.value=hp; g.gain.setValueAtTime(0.0001,now); g.gain.exponentialRampToValueAtTime(v,now+0.01); g.gain.exponentialRampToValueAtTime(0.0001,now+d); src.connect(hpf); hpf.connect(lpf); lpf.connect(g); g.connect(sfxBus); src.start(now); src.stop(now+d+0.05);}catch(e){} }
  const sClick=()=> settings.nature ? noiseBurst(0.05,0.08,1800,600) : tone(1200,{d:.04,type:'square',v:.12});
  const sEat=(n)=>{ if(settings.nature){ tone(520+ (n%5)*30,{d:.08,type:'sine',v:.22}); noiseBurst(0.06,0.06,2200,900);} else { tone(440*Math.pow(1.059,n%8),{d:.1,v:.4}); tone(880*Math.pow(1.059,n%8),{t:.03,d:.08,type:'square',v:.12}); } };
  const sBonus=()=>{ if(settings.nature){ [700,930,1240].forEach((f,i)=>tone(f,{t:i*.07,d:.12,type:'sine',v:.22})); } else { tone(660,{d:.1,v:.4}); tone(990,{t:.09,d:.14,v:.4}); tone(1320,{t:.18,d:.18,type:'square',v:.15}); } };
  const sLevel=()=>{ if(settings.nature){ [523,659,784].forEach((f,i)=>tone(f,{t:i*.1,d:.18,type:'triangle',v:.28})); noiseBurst(0.18,0.08,1600,300);} else { [523,659,784].forEach((f,i)=>tone(f,{t:i*.09,d:.14,v:.35})); } };
  const sDeath=()=>{ if(settings.nature){ tone(220,{d:.45,type:'sine',v:.35,slide:90}); noiseBurst(0.35,0.22,700,80);} else { tone(180,{d:.5,type:'sawtooth',v:.5,slide:55}); noiseBurst(0.25,0.35,900,60);} };
  const sCount=(go)=> settings.nature ? tone(go?880:660,{d:go?.16:.07,type:'sine',v:.22}) : tone(go?1320:880,{d:go?.18:.07,type:'square',v:.25});
  const sRecord=()=>{ [784,988,1175,1568].forEach((f,i)=>tone(f,{t:i*.1,d:.16,type:settings.nature?'sine':'triangle',v:.32})); if(settings.nature) noiseBurst(0.25,0.08,2500,500); };
  function duckMusic(){ if(!ctx||!musBus) return; const lvl = settings.nature ? 0.0 : (G.mode==='paused'?0.05:(G.mode==='over'?0.08:0.14)); musBus.gain.setTargetAtTime(lvl, ctx.currentTime, 0.2); }

  // ===== State =====
  const cv = $('game'), c = cv.getContext('2d');
  const boardWrap = $('boardWrap'), device = $('device');
  let W=0,H=0,cell=20,dpr=1,bgGrad=null,nebulaCv=null;
  const G = {
    mode:'menu', demo:true, won:false,
    snake:[], prev:[], dir:{x:1,y:0}, queue:[], grow:0,
    food:null, bonus:null, obstacles:[],
    score:0, apples:0, stageIndex:0, stageFood:0, tick:135, acc:0, gt:0,
    nextBonusAt:8000, countStart:0, countStep:-1, fastCount:false,
    deathAt:0, recordShown:false, shield:false, revive:false,
    particles:[], floaters:[], rings:[], ambient:[]
  };
  const creature = () => CREATURE[settings.creature];
  const theme = () => THEME[settings.theme];
  const stage = () => STAGES[G.stageIndex];
  const calcTick = () => {
    const d = DIFF[settings.diff]; const st = stage(); const cr = creature();
    const base = Math.max(d.min, Math.round(d.tick * Math.pow(0.94, G.stageIndex)));
    return Math.max(d.min - 8, Math.round(base * st.speedMul * cr.speed));
  };

  function burst(cx,cy,n,colors){ for(let i=0;i<n;i++){ const a=rand(0,TAU), sp=rand(0.05,0.28)*cell/20; G.particles.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rand(350,750),max:750,s:rand(1.5,3.5)*cell/20,col:pick(colors)});} if(G.particles.length>360) G.particles.splice(0,G.particles.length-360); }
  function eatBurst(pos){ const t=theme(), cr=creature(); const cols=t.lcd?['#2f3f14','#43571f']:[t.foodGlow, cr.glow||'#fff', '#fff']; burst((pos.x+.5)*cell,(pos.y+.5)*cell,14,cols); }
  function floater(pos,text,col){ G.floaters.push({x:(pos.x+.5)*cell,y:(pos.y+.2)*cell,text,col,born:performance.now(),life:900}); }
  function ring(pos,col){ G.rings.push({x:(pos.x+.5)*cell,y:(pos.y+.5)*cell,col,born:performance.now(),life:650}); }
  function confetti(){ const cols=['#ff2ea6','#22e0ff','#ffc233','#3dff8e','#b26bff','#ff7a18']; for(let i=0;i<90;i++) G.particles.push({x:rand(0,W),y:rand(-20,H*0.3),vx:rand(-.06,.06),vy:rand(.04,.16),life:rand(900,1700),max:1700,s:rand(2,4.5),col:pick(cols)}); }
  let toastTimer=null; function toast(msg){ const el=$('toast'); if(!el) return; el.textContent=msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),1900); }

  const keyOf=(x,y)=>x+','+y;
  function freeCells(extra){ const occ=new Set(); G.snake.forEach(p=>occ.add(keyOf(p.x,p.y))); G.obstacles.forEach(p=>occ.add(keyOf(p.x,p.y))); if(G.food) occ.add(keyOf(G.food.x,G.food.y)); if(G.bonus) occ.add(keyOf(G.bonus.x,G.bonus.y)); if(extra) occ.add(keyOf(extra.x,extra.y)); const out=[]; for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(!occ.has(keyOf(x,y))) out.push({x,y}); return out; }
  function spawnFood(){ const f=freeCells(); if(!f.length){ G.food=null; return false; } G.food=pick(f); return true; }
  function spawnBonus(){ const f=freeCells(); if(!f.length) return; const p=pick(f); const star=Math.random()<0.55; const cr=creature(); const extra=cr.id==='penguin'?1500:0; G.bonus={x:p.x,y:p.y,star,emoji:star?'⭐':'💎',worth:Math.round((star?50:30)*(cr.id==='penguin'?1.5:1)),grow:star?2:1,life:(star?6500:8000)+extra,born:G.gt}; }
  function spawnObstacles(count){ const head=G.snake[0]||{x:10,y:10}; let f=freeCells().filter(p=>Math.max(Math.abs(p.x-head.x),Math.abs(p.y-head.y))>3); for(let i=0;i<count&&f.length;i++){ const idx=irand(0,f.length-1), p=f.splice(idx,1)[0]; G.obstacles.push(p); f=f.filter(q=>Math.abs(q.x-p.x)+Math.abs(q.y-p.y)>1); } }
  function hitsBody(nx,ny,ignoreTail){ const lim=G.snake.length-(ignoreTail?1:0); for(let i=0;i<lim;i++) if(G.snake[i].x===nx&&G.snake[i].y===ny) return true; return false; }
  const hitsObs=(nx,ny)=>G.obstacles.some(p=>p.x===nx&&p.y===ny);
  function cellSafe(nx,ny){ if(!settings.walls){ nx=(nx+COLS)%COLS; ny=(ny+ROWS)%ROWS; } else if(nx<0||ny<0||nx>=COLS||ny>=ROWS) return false; return !hitsBody(nx,ny,true) && !hitsObs(nx,ny); }
  function autopilot(){ const target=G.bonus||G.food; if(!target) return; const d=G.dir; const opts=[d,{x:-d.y,y:d.x},{x:d.y,y:-d.x}]; let best=null,bestCost=Infinity; for(const o of opts){ let nx=G.snake[0].x+o.x, ny=G.snake[0].y+o.y; if(!cellSafe(nx,ny)) continue; if(!settings.walls){ nx=(nx+COLS)%COLS; ny=(ny+ROWS)%ROWS; } let dx=Math.abs(nx-target.x), dy=Math.abs(ny-target.y); if(!settings.walls){ dx=Math.min(dx,COLS-dx); dy=Math.min(dy,ROWS-dy);} let open=0; for(const q of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]) if(cellSafe(nx+q.x,ny+q.y)) open++; const cost=dx+dy-open*0.75+Math.random()*0.35; if(cost<bestCost){bestCost=cost; best=o;} } G.queue=best?[best]:[]; }
  function enqueue(d){ const last=G.queue.length?G.queue[G.queue.length-1]:G.dir; if(d.x===-last.x && d.y===-last.y) return; if(d.x===last.x && d.y===last.y) return; if(G.queue.length<3) G.queue.push(d); }

  function updateStageUI(){ const st=stage(); $('stageName').textContent = `مرحلة ${st.id}: ${st.name}`; $('stageDesc').textContent = st.desc; const goal=st.goal; const prog=clamp(G.stageFood/goal,0,1); $('stageProg').style.width = (prog*100)+'%'; $('stageTarget').textContent = `اجمع ${goal} طعام لإكمال المرحلة • العوائق: ${st.obs || (settings.obs? 'نشطة':'—')} • الجدران: ${st.walls? 'مفعّلة':'اختياري'}`; $('hudGoal').textContent = `${Math.min(G.stageFood,goal)}/${goal}`; $('hudLevel').textContent = String(st.id); }

  function newRun(demo){ G.demo=demo; G.won=false; G.snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10},{x:7,y:10}]; G.prev=G.snake.map(p=>({...p})); G.dir={x:1,y:0}; G.queue=[]; G.grow=0; G.score=0; G.apples=0; G.stageFood=0; G.acc=0; G.gt=0; G.obstacles=[]; G.bonus=null; G.nextBonusAt=rand(6000,10000); G.particles=[]; G.floaters=[]; G.rings=[]; G.recordShown=false; const cr=creature(); G.shield = (cr.id==='turtle'); G.revive = (cr.id==='phoenix'); if(!demo){ const st=stage(); if(st.walls) settings.walls = true; syncToggle('tgWalls', settings.walls); if(st.obs>0) spawnObstacles(st.obs); else if(settings.obs) spawnObstacles(4); } G.tick = demo?140:calcTick(); spawnFood(); $('hudBestBox').classList.remove('record'); updateStageUI(); updateHUD(); }

  function die(now, reason='hit'){ if(G.demo){ burst((G.snake[0].x+.5)*cell,(G.snake[0].y+.5)*cell,10,[creature().glow||'#9bbc0f','#fff']); newRun(true); return; }
    // turtle shield
    if(G.shield && (reason==='self')){ G.shield=false; toast('🛡️ درع السلحفاة حماك!'); sBonus(); // trim a bit to recover
      const keep=Math.max(4, Math.floor(G.snake.length*0.7)); G.snake=G.snake.slice(0,keep); G.prev=G.snake.map(p=>({...p})); G.queue=[]; return; }
    // phoenix revive
    if(G.revive){ G.revive=false; toast('🔥 عنقاء النيون بعثت من جديد!'); sBonus(); confetti(); const head=G.snake[0]||{x:10,y:10}; G.snake=[{x:head.x,y:head.y},{x:clamp(head.x-1,0,COLS-1),y:head.y},{x:clamp(head.x-2,0,COLS-1),y:head.y},{x:clamp(head.x-3,0,COLS-1),y:head.y}]; G.prev=G.snake.map(p=>({...p})); G.dir={x:1,y:0}; G.queue=[]; G.grow=0; G.obstacles=[]; const st=stage(); if(st.obs>0) spawnObstacles(st.obs); return; }
    G.mode='dying'; G.deathAt=now; sDeath(); const t=theme(); burst((G.snake[0].x+.5)*cell,(G.snake[0].y+.5)*cell,26,[t.lcd?'#2f3f14':'#ff3b5c', creature().glow||'#fff', '#ffb020']); if(settings.shake){ device.classList.remove('shake'); void device.offsetWidth; device.classList.add('shake'); } syncPause(); duckMusic(); }

  function advanceStage(){ const st=stage(); const finished = G.stageFood >= st.goal; if(!finished) return; if(G.stageIndex < STAGES.length-1){ G.stageIndex++; profile.unlockedStage = Math.max(profile.unlockedStage, G.stageIndex+1); save(); toast(`🗺️ مرحلة جديدة: ${stage().name}`); sLevel(); ring(G.snake[0], theme().wall); if(stage().obs>0) spawnObstacles(Math.max(0, stage().obs - G.obstacles.length)); G.tick = calcTick(); updateStageUI(); } else { G.won = true; G.score += 1000; stats.xp += 200; finishOver(true); } }

  function step(now){ if(G.demo) autopilot(); if(G.queue.length) G.dir = G.queue.shift(); let nx=G.snake[0].x+G.dir.x, ny=G.snake[0].y+G.dir.y; if(settings.walls){ if(nx<0||ny<0||nx>=COLS||ny>=ROWS){ die(now,'wall'); return; } } else { nx=(nx+COLS)%COLS; ny=(ny+ROWS)%ROWS; } const selfHit = hitsBody(nx,ny,G.grow===0); const obsHit = hitsObs(nx,ny); if(selfHit || obsHit){ die(now, selfHit?'self':'obs'); return; } G.prev=G.snake.map(p=>({...p})); G.snake.unshift({x:nx,y:ny}); if(G.grow>0) G.grow--; else G.snake.pop();
    const cr=creature();
    if(G.food && nx===G.food.x && ny===G.food.y){ const at={x:nx,y:ny}; eatBurst(at); if(!G.demo){ const gain=Math.round(10*cr.score); G.score+=gain; G.apples++; G.stageFood++; stats.food++; stats.xp += Math.round(2*cr.score); G.grow += cr.grow; floater(at,'+'+gain, theme().lcd?'#2f3f14':'#fff'); sEat(G.apples); if(G.stageFood>=stage().goal){ advanceStage(); } if(stats.best>0 && G.score>stats.best && !G.recordShown){ G.recordShown=true; toast('👑 تجاوزت رقمك القياسي!'); $('hudBestBox').classList.add('record'); } } else if(G.snake.length<14) G.grow+=1; const ok=spawnFood(); if(!ok){ if(G.demo){ newRun(true); return; } G.won=true; G.score+=1000; finishOver(true); return; } if(!G.demo){ updateHUD(); updateStageUI(); } }
    if(G.bonus && nx===G.bonus.x && ny===G.bonus.y){ const b=G.bonus, at={x:nx,y:ny}; eatBurst(at); ring(at,b.star?'#ffc233':'#5aa2ff'); if(!G.demo){ G.score+=b.worth; stats.xp += Math.round(b.worth/5); G.grow += b.grow; floater(at,'+'+b.worth,b.star?'#ffc233':'#5aa2ff'); sBonus(); toast(b.star?'⭐ نجمة! +' + b.worth:'💎 جوهرة! +' + b.worth); if(stats.best>0 && G.score>stats.best && !G.recordShown){ G.recordShown=true; toast('👑 تجاوزت رقمك القياسي!'); $('hudBestBox').classList.add('record'); } updateHUD(); } else if(G.snake.length<14) G.grow+=1; G.bonus=null; G.nextBonusAt=G.gt+rand(9000,16000); }
  }

  function finishOver(won=false){ if(G.mode==='over') return; const newRec = G.score>stats.best && G.score>0; stats.best=Math.max(stats.best,G.score); stats.games++; stats.longest=Math.max(stats.longest,G.snake.length); if(won) stats.xp += 50; save(); updateStatsUI(); updateHUD(); $('ovOverEmoji').textContent = won?'🏆':'💀'; $('ovOverTitle').textContent = won?'أحسنت! أكملت التحدي':'انتهت الجولة!'; $('ovOverScore').textContent = G.score; $('ovOverBest').textContent = `👑 أفضل نتيجة: ${stats.best}`; $('ovOverStats').innerHTML = `<span class="chip-mini">🦎 ${creature().name}</span><span class="chip-mini">🗺️ مرحلة ${stage().id}</span><span class="chip-mini">📏 الطول ${G.snake.length}</span><span class="chip-mini">🍎 ${G.apples}</span>`; $('recordBanner').hidden = !newRec; if(newRec){ confetti(); sRecord(); } G.mode='over'; show('ovOver'); syncPause(); duckMusic(); }

  function show(id){ ['ovMenu','ovCount','ovPause','ovOver','ovAccount'].forEach(o=>{ const el=$(o); if(el) el.classList.toggle('hidden', o!==id); }); }
  function hideAll(){ ['ovMenu','ovCount','ovPause','ovOver','ovAccount'].forEach(o=>$(o)?.classList.add('hidden')); }
  function syncPause(){ const playing=G.mode==='playing'; if($('btnPause')) $('btnPause').textContent=playing?'⏸':'▶'; if($('dpMid')) $('dpMid').textContent=playing?'⏸':'▶'; }
  function startGame(){ ensureAudio(); newRun(false); G.mode='countdown'; G.countStart=performance.now(); G.countStep=-1; G.fastCount=false; show('ovCount'); syncPause(); duckMusic(); }
  function pauseGame(){ if(G.mode!=='playing') return; G.mode='paused'; show('ovPause'); syncPause(); duckMusic(); sClick(); }
  function resumeGame(){ if(G.mode!=='paused') return; G.mode='countdown'; G.countStart=performance.now(); G.countStep=-1; G.fastCount=true; show('ovCount'); syncPause(); duckMusic(); }
  function backToMenu(){ newRun(true); G.mode='menu'; show('ovMenu'); updateMenuChips(); syncPause(); duckMusic(); }
  function pauseBtnAction(){ ensureAudio(); if(G.mode==='playing') pauseGame(); else if(G.mode==='paused') resumeGame(); else if(G.mode==='menu'||G.mode==='over') startGame(); }

  function resize(){ const r=boardWrap.getBoundingClientRect(); if(r.width<10) return; W=r.width; H=r.height; dpr=Math.min(2,window.devicePixelRatio||1); cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); c.setTransform(dpr,0,0,dpr,0,0); cell=W/COLS; buildThemeAssets(); }
  function buildThemeAssets(){ if(!W) return; const t=theme(); bgGrad=c.createLinearGradient(0,0,W*0.4,H); const stops=t.bg; stops.forEach((col,i)=>bgGrad.addColorStop(stops.length===1?0:i/(stops.length-1),col)); nebulaCv=null; if(t.nebula){ nebulaCv=document.createElement('canvas'); nebulaCv.width=W+48; nebulaCv.height=H+28; const n=nebulaCv.getContext('2d'); [[0.25,0.3,'#ff2ea6'],[0.75,0.6,'#3a86ff'],[0.55,0.15,'#b26bff']].forEach(([bx,by,col])=>{ const g=n.createRadialGradient(bx*(W+48),by*(H+28),0,bx*(W+48),by*(H+28),W*0.38); g.addColorStop(0,col+'2e'); g.addColorStop(1,col+'00'); n.fillStyle=g; n.fillRect(0,0,W+48,H+28); }); } initAmbient(); }
  function initAmbient(){ const t=theme(); G.ambient=[]; const n={dust:34,sand:30,bubbles:26,stars:60,none:0}[t.ambient]||0; for(let i=0;i<n;i++) G.ambient.push({x:Math.random(),y:Math.random(),s:rand(0.7,2.6),ph:rand(0,TAU),tw:rand(0.001,0.004),vx:rand(-0.008,0.008),vy:rand(-0.008,0.008),sp:rand(0.02,0.07)}); }
  function drawAmbient(dt,now){ const t=theme(); if(t.ambient==='none') return; const ds=dt/1000; c.save(); for(const p of G.ambient){ if(t.ambient==='dust'){p.x+=p.vx*ds;p.y+=p.vy*ds;} else if(t.ambient==='sand'){p.x-=p.sp*ds*2;p.y+=Math.sin(now*0.001+p.ph)*0.0004;} else if(t.ambient==='bubbles'){p.y-=p.sp*ds;p.x+=Math.sin(now*0.0015+p.ph)*0.0006;} if(p.x<0)p.x+=1;if(p.x>1)p.x-=1;if(p.y<0)p.y+=1;if(p.y>1)p.y-=1; const X=p.x*W,Y=p.y*H; if(t.ambient==='stars'){ c.globalAlpha=0.2+0.8*Math.abs(Math.sin(now*p.tw+p.ph)); c.fillStyle=t.ambCol; c.fillRect(X,Y,p.s,p.s);} else if(t.ambient==='bubbles'){ c.globalAlpha=0.35; c.strokeStyle=t.ambCol; c.lineWidth=1; c.beginPath(); c.arc(X,Y,p.s*1.6,0,TAU); c.stroke(); } else if(t.ambient==='sand'){ c.globalAlpha=0.4; c.strokeStyle=t.ambCol; c.lineWidth=1; c.beginPath(); c.moveTo(X,Y); c.lineTo(X+4+p.s*2,Y); c.stroke(); } else { c.globalAlpha=0.25+0.5*Math.abs(Math.sin(now*p.tw+p.ph)); c.fillStyle=t.ambCol; c.beginPath(); c.arc(X,Y,p.s,0,TAU); c.fill(); } } c.restore(); }
  function drawGridWalls(){ const t=theme(); if(settings.grid){ c.save(); c.strokeStyle=t.grid; c.lineWidth=1; c.beginPath(); for(let i=1;i<COLS;i++){c.moveTo(i*cell,0);c.lineTo(i*cell,H);} for(let i=1;i<ROWS;i++){c.moveTo(0,i*cell);c.lineTo(W,i*cell);} c.stroke(); c.restore(); } c.save(); if(settings.walls){ c.strokeStyle=t.wall; c.lineWidth=3; c.shadowColor=t.wall; c.shadowBlur=t.lcd?0:14; c.globalAlpha=0.9; rr(c,2,2,W-4,H-4,10); c.stroke(); } else { c.strokeStyle=t.wall; c.lineWidth=2; c.globalAlpha=0.45; c.setLineDash([5,9]); rr(c,2,2,W-4,H-4,10); c.stroke(); c.setLineDash([]);} c.restore(); }
  function drawObstacles(){ const t=theme(); for(const o of G.obstacles){ const x=o.x*cell,y=o.y*cell; c.save(); if(t.lcd){ c.fillStyle='#2f3f14'; c.fillRect(x+1.5,y+1.5,cell-3,cell-3);} else { c.globalAlpha=0.18; c.fillStyle=t.wall; rr(c,x+2,y+2,cell-4,cell-4,5); c.fill(); c.globalAlpha=0.9; c.strokeStyle=t.wall; c.lineWidth=2; rr(c,x+2,y+2,cell-4,cell-4,5); c.stroke(); c.globalAlpha=0.5; c.beginPath(); c.moveTo(x+5,y+5); c.lineTo(x+cell-5,y+cell-5); c.moveTo(x+cell-5,y+5); c.lineTo(x+5,y+cell-5); c.stroke(); } c.restore(); } }
  function drawEmoji(ch,x,y,size){ c.font=`${Math.round(size)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(ch,x,y+size*0.04); }
  function drawFood(now){ if(!G.food) return; const t=theme(), x=(G.food.x+.5)*cell, y=(G.food.y+.5)*cell; if(t.lcd){ const s=cell*0.62; c.fillStyle='#2f3f14'; c.fillRect(x-s/2,y-s/2+cell*0.05,s,s*0.85); c.fillRect(x-cell*0.05,y-s/2-cell*0.1,cell*0.1,cell*0.16); return; } const pulse=1+0.07*Math.sin(now/240), bob=Math.sin(now/280)*cell*0.05; c.save(); const g=c.createRadialGradient(x,y+bob,0,x,y+bob,cell*0.95); g.addColorStop(0,t.foodGlow+'80'); g.addColorStop(1,t.foodGlow+'00'); c.fillStyle=g; c.beginPath(); c.arc(x,y+bob,cell*0.95,0,TAU); c.fill(); drawEmoji('🍎',x,y+bob,cell*0.7*pulse); c.restore(); }
  function drawBonus(now){ const b=G.bonus; if(!b) return; const t=theme(), x=(b.x+.5)*cell, y=(b.y+.5)*cell; const frac=clamp(1-(G.gt-b.born)/b.life,0,1); const col=b.star?'#ffc233':'#5aa2ff'; c.save(); if(t.lcd){ c.fillStyle='#2f3f14'; c.font=`900 ${Math.round(cell*0.7)}px Cairo,sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(b.star?'★':'◆',x,y+cell*0.04);} else { const g=c.createRadialGradient(x,y,0,x,y,cell); g.addColorStop(0,col+'88'); g.addColorStop(1,col+'00'); c.fillStyle=g; c.beginPath(); c.arc(x,y,cell,0,TAU); c.fill(); c.save(); c.translate(x,y); c.rotate(Math.sin(now/300)*0.15); drawEmoji(b.emoji,0,0,cell*0.66*(1+0.08*Math.sin(now/200))); c.restore(); } c.strokeStyle=t.lcd?'#2f3f14':col; c.lineWidth=3; c.globalAlpha=0.9; c.beginPath(); c.arc(x,y,cell*0.62,-Math.PI/2,-Math.PI/2+frac*TAU); c.stroke(); c.restore(); }
  function slidePos(i,t){ const a=G.prev[Math.min(i,G.prev.length-1)], b=G.snake[i]; let dx=b.x-a.x, dy=b.y-a.y; if(!settings.walls){ if(dx>1)dx-=COLS; else if(dx<-1)dx+=COLS; if(dy>1)dy-=ROWS; else if(dy<-1)dy+=ROWS; } else { if(Math.abs(dx)>1)dx=0; if(Math.abs(dy)>1)dy=0; } return {x:a.x+dx*t, y:a.y+dy*t}; }
  function wrapAdj(a,b){ let dx=b.x-a.x, dy=b.y-a.y; if(!settings.walls){ if(dx>1)dx-=COLS; else if(dx<-1)dx+=COLS; if(dy>1)dy-=ROWS; else if(dy<-1)dy+=ROWS; } return {x:a.x+dx,y:a.y+dy}; }
  function segColor(i,n,now){ const cr=creature(); if(cr.rainbow || cr.id==='chameleon') return `hsl(${(now*0.06+i*16)%360},95%,62%)`; const cs=cr.colors; if(cs.length===1) return cs[0]; const t=n<=1?0:i/(n-1), f=t*(cs.length-1), k=Math.min(cs.length-2,Math.floor(f)); return hexLerp(cs[k],cs[k+1],f-k); }
  function headDetails(p,now){ const X=(p.x+.5)*cell, Y=(p.y+.5)*cell, d=G.dir, px=-d.y, py=d.x; const dying=G.mode==='dying'; if(!dying && now%2400<180){ const ph=(now%2400)/180, len=cell*(0.25+0.16*Math.sin(ph*Math.PI)); const mx=X+d.x*cell*0.38, my=Y+d.y*cell*0.38; c.save(); c.strokeStyle='#ff3b5c'; c.lineWidth=2; c.lineCap='round'; c.beginPath(); c.moveTo(mx,my); c.lineTo(mx+d.x*len,my+d.y*len); c.stroke(); c.restore(); } for(const s of [-1,1]){ const ex=X+(d.x*0.16+px*0.17*s)*cell, ey=Y+(d.y*0.16+py*0.17*s)*cell; c.fillStyle='#ffffff'; c.beginPath(); c.arc(ex,ey,cell*0.125,0,TAU); c.fill(); c.fillStyle='#0b0620'; c.beginPath(); c.arc(ex+d.x*cell*0.05,ey+d.y*cell*0.05,cell*0.06,0,TAU); c.fill(); } }
  function drawSnake(now,t){ const cr=creature(), n=G.snake.length; const dying=G.mode==='dying', dp=dying?clamp((now-G.deathAt)/750,0,1):0; const pts=[]; for(let i=0;i<n;i++) pts.push(slidePos(i,t)); const w=cell*0.66, r=w/2; c.save(); if(dying) c.globalAlpha=1-dp*0.8; if(cr.glow){ c.save(); c.beginPath(); for(let i=0;i<n;i++){ const q=i?wrapAdj(pts[i-1],pts[i]):pts[0]; const X=(q.x+.5)*cell,Y=(q.y+.5)*cell; i?c.lineTo(X,Y):c.moveTo(X,Y);} c.strokeStyle=cr.glow; c.globalAlpha=(dying?1-dp:1)*0.28; c.lineWidth=w*1.25; c.lineJoin='round'; c.lineCap='round'; c.shadowColor=cr.glow; c.shadowBlur=cell*0.8; c.stroke(); c.restore(); } c.lineCap='round'; c.lineJoin='round'; for(let i=n-1;i>=0;i--){ const p=pts[i], X=(p.x+.5)*cell, Y=(p.y+.5)*cell, col=segColor(i,n,now); if(i<n-1){ const q=wrapAdj(p,pts[i+1]); c.strokeStyle=col; c.lineWidth=w; c.beginPath(); c.moveTo(X,Y); c.lineTo((q.x+.5)*cell,(q.y+.5)*cell); c.stroke(); } c.fillStyle=col; c.beginPath(); c.arc(X,Y,i===0?cell*0.42:r,0,TAU); c.fill(); } // head emblem
    if(cr.id!=='snake'){ drawEmoji(cr.emoji,(pts[0].x+.5)*cell,(pts[0].y+.5)*cell,cell*0.55); } else { headDetails(pts[0],now); }
    c.restore(); }
  function drawFx(now){ const t=theme(); c.save(); for(const rg of G.rings){ const p=clamp((now-rg.born)/rg.life,0,1); c.globalAlpha=(1-p)*0.8; c.strokeStyle=rg.col; c.lineWidth=3; c.beginPath(); c.arc(rg.x,rg.y,p*cell*4+cell*0.4,0,TAU); c.stroke(); } c.globalAlpha=1; if(!t.lcd) c.globalCompositeOperation='lighter'; for(const p of G.particles){ c.globalAlpha=clamp(p.life/p.max,0,1); c.fillStyle=p.col; c.beginPath(); c.arc(p.x,p.y,p.s,0,TAU); c.fill(); } c.globalCompositeOperation='source-over'; c.globalAlpha=1; for(const f of G.floaters){ const p=clamp((now-f.born)/f.life,0,1); c.globalAlpha=1-p; c.fillStyle=f.col; c.font=`800 ${Math.round(cell*0.5)}px Cairo,sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(f.text,f.x,f.y-p*cell*0.9); } c.restore(); }
  function updateFx(dt,now){ let w=0; for(const p of G.particles){ p.life-=dt; if(p.life<=0) continue; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=0.995; p.vy*=0.995; p.vy+=0.00012*dt; G.particles[w++]=p; } G.particles.length=w; G.floaters=G.floaters.filter(f=>now-f.born<f.life); G.rings=G.rings.filter(r=>now-r.born<r.life); if(G.mode==='playing'||G.mode==='menu'){ if(G.bonus && G.gt-G.bonus.born>G.bonus.life){ G.bonus=null; G.nextBonusAt=G.gt+rand(9000,16000); } if(!G.bonus && G.gt>=G.nextBonusAt){ spawnBonus(); if(!G.bonus) G.nextBonusAt=G.gt+5000; } } }
  function render(now,dt){ if(!W) return; c.fillStyle=bgGrad||'#0b0620'; c.fillRect(0,0,W,H); if(nebulaCv){ c.save(); c.drawImage(nebulaCv,-24+Math.sin(now*0.00008)*22,-14+Math.cos(now*0.0001)*12); c.restore(); } drawAmbient(dt,now); drawGridWalls(); drawObstacles(); drawFood(now); drawBonus(now); const t=(G.mode==='playing'||G.mode==='menu'||G.mode==='paused'||G.mode==='countdown')?clamp(G.acc/G.tick,0,1):1; drawSnake(now,t); drawFx(now); if(G.mode==='dying'){ const p=clamp((now-G.deathAt)/750,0,1); c.save(); c.globalAlpha=0.32*(1-p)*(0.5+0.5*Math.sin(now/40)); c.fillStyle=theme().lcd?'#2f3f14':'#ff3b5c'; c.fillRect(0,0,W,H); c.restore(); } }

  let last=0;
  function loop(now){ requestAnimationFrame(loop); const dt=Math.min(50, now-(last||now)); last=now; if(G.mode==='countdown'){ const el=now-G.countStart, stepDur=G.fastCount?450:600; const idx=Math.floor(el/stepDur); if(idx!==G.countStep){ G.countStep=idx; const num=$('countNum'); if(idx<3){ num.textContent=3-idx; sCount(false);} else if(idx===3){ num.textContent='انطلق!'; sCount(true);} else { $('ovCount').classList.add('hidden'); G.mode='playing'; G.acc=0; syncPause(); duckMusic(); } } } if(G.mode==='playing'||G.mode==='menu'){ G.gt+=dt; G.acc+=dt; let n=0; while(G.acc>=G.tick && n<4){ G.acc-=G.tick; step(now); n++; if(G.mode!=='playing'&&G.mode!=='menu') break; } if(n===4) G.acc=0; } if(G.mode==='dying' && now-G.deathAt>750) finishOver(false); updateFx(dt,now); render(now,dt); }

  function updateHUD(){ $('hudScore').textContent = G.demo?0:G.score; $('hudBest').textContent = stats.best; $('hudLevel').textContent = String(stage().id); }
  function updateStatsUI(){ $('stBest').textContent=stats.best; $('stGames').textContent=stats.games; $('stApples').textContent=stats.food; $('stXP').textContent=stats.xp; $('hudBest').textContent=stats.best; }
  function updateMenuChips(){ const cr=creature(), t=theme(), d=DIFF[settings.diff]; $('menuChips').innerHTML = `<span class="chip-mini">${cr.emoji} ${cr.name}</span><span class="chip-mini">${t.emoji} ${t.name}</span><span class="chip-mini">${d.emoji} ${d.name}</span><span class="chip-mini">🗺️ مرحلة ${profile.unlockedStage}</span>`; $('menuCreatureEmoji').textContent = cr.emoji; }
  function updateCreatureTips(){ $('creatureTips').innerHTML = CREATURES.map(c=>`<li>${c.emoji} <b>${c.name}</b> — ${c.ability}</li>`).join(''); }

  function applyCreature(id,silent){ settings.creature=id; save(); document.querySelectorAll('.creature-card').forEach(el=>el.classList.toggle('sel', el.dataset.id===id)); updateMenuChips(); if(!silent) sClick(); }
  function applyTheme(id,silent){ settings.theme=id; save(); const t=theme(), root=document.documentElement; root.style.setProperty('--acc1',t.ui[0]); root.style.setProperty('--acc2',t.ui[1]); root.style.setProperty('--arena-css',t.css); boardWrap.style.background=t.css; $('scanlines').style.opacity=t.scan?0.28:0; document.querySelectorAll('.theme-card').forEach(el=>el.classList.toggle('sel', el.dataset.id===id)); buildThemeAssets(); updateMenuChips(); if(!silent) sClick(); }
  function applyDiff(id,silent){ settings.diff=id; save(); document.querySelectorAll('#diffRow .chip').forEach(el=>el.classList.toggle('sel', el.dataset.id===id)); if(!G.demo) G.tick=calcTick(); updateMenuChips(); if(!silent) sClick(); }
  function syncToggle(id,val){ const el=$(id); if(el) el.setAttribute('aria-checked', String(val)); }

  function buildUI(){
    const cg=$('creatureGrid'); cg.innerHTML=''; CREATURES.forEach(cr=>{ const b=document.createElement('button'); b.className='creature-card'; b.type='button'; b.dataset.id=cr.id; const grad=`linear-gradient(90deg,${cr.colors.join(',')})`; b.innerHTML=`<span class="creature-top"><span class="em">${cr.emoji}</span><span class="creature-name">${cr.name}</span></span><div class="creature-trait">${cr.trait}</div><span class="skin-bar" style="background:${grad}"></span>`; b.addEventListener('click',()=>{ ensureAudio(); applyCreature(cr.id); b.blur(); }); cg.appendChild(b); });
    const tg=$('themeGrid'); tg.innerHTML=''; THEMES.forEach(t=>{ const b=document.createElement('button'); b.className='theme-card'; b.type='button'; b.dataset.id=t.id; b.innerHTML=`<span class="theme-prev" style="display:block;background:${t.css}"></span><span class="theme-name">${t.emoji} ${t.name}</span>`; b.addEventListener('click',()=>{ ensureAudio(); applyTheme(t.id); b.blur(); }); tg.appendChild(b); });
    const dr=$('diffRow'); dr.innerHTML=''; DIFFS.forEach(d=>{ const b=document.createElement('button'); b.className='chip'; b.type='button'; b.dataset.id=d.id; b.textContent=`${d.emoji} ${d.name}`; b.addEventListener('click',()=>{ ensureAudio(); applyDiff(d.id); b.blur(); }); dr.appendChild(b); });
    const toggles=[['tgWalls','walls'],['tgObs','obs'],['tgGrid','grid'],['tgNature','nature'],['tgShake','shake']];
    toggles.forEach(([id,key])=>{ const el=$(id); if(!el) return; syncToggle(id, settings[key]); el.addEventListener('click',()=>{ ensureAudio(); settings[key]=!settings[key]; syncToggle(id, settings[key]); save(); sClick(); if(key==='obs' && !G.demo){ if(settings.obs && !stage().obs) spawnObstacles(4); else if(!settings.obs && !stage().obs) G.obstacles=[]; } if(key==='nature'){ duckMusic(); } el.blur(); }); });
    updateCreatureTips();
  }

  function syncSound(){ const b=$('btnSound'); b.textContent=settings.sound?'🔊':'🔇'; b.setAttribute('aria-label', settings.sound?'كتم الصوت':'تشغيل الصوت'); }
  function toggleSound(){ settings.sound=!settings.sound; save(); syncSound(); if(settings.sound){ ensureAudio(); if(master) master.gain.setTargetAtTime(0.85, ctx.currentTime, 0.02); sClick(); } else if(master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.02); }

  const DIRS={ArrowUp:{x:0,y:-1},KeyW:{x:0,y:-1},ArrowDown:{x:0,y:1},KeyS:{x:0,y:1},ArrowLeft:{x:-1,y:0},KeyA:{x:-1,y:0},ArrowRight:{x:1,y:0},KeyD:{x:1,y:0}};
  function dirInput(d){ ensureAudio(); if(G.mode==='menu'||G.mode==='over'){ startGame(); enqueue(d);} else if(G.mode==='paused'){ resumeGame(); enqueue(d);} else if(G.mode==='playing'||G.mode==='countdown'){ enqueue(d);} }

  function openAccount(){ $('profileName').value = profile.name || ''; $('profileHint').textContent = `اللاعب: ${profile.name} • مراحل مفتوحة: ${profile.unlockedStage}/${STAGES.length} • (تسجيل الدخول السحابي سيُضاف لاحقًا)`; show('ovAccount'); }
  function closeAccount(){ if(G.mode==='menu') show('ovMenu'); else hideAll(); }

  function bindEvents(){
    document.addEventListener('keydown',e=>{ if(e.ctrlKey||e.metaKey||e.altKey) return; const code=e.code; if(code==='Space'){ if(e.target && e.target.closest && e.target.closest('button,input')) return; e.preventDefault(); if(e.repeat) return; pauseBtnAction(); return; } if(code==='KeyM'){ if(!e.repeat) toggleSound(); return; } if(code==='KeyR'){ if(!e.repeat){ e.preventDefault(); startGame(); } return; } const d=DIRS[code]; if(d){ e.preventDefault(); dirInput(d); } });
    document.addEventListener('pointerdown',()=>ensureAudio(),{once:true});
    $('btnStart').addEventListener('click',startGame); $('btnAgain').addEventListener('click',startGame); $('btnResume').addEventListener('click',resumeGame); $('btnRestartP').addEventListener('click',startGame); $('btnMenu').addEventListener('click',()=>{ ensureAudio(); sClick(); backToMenu(); });
    $('btnPause').addEventListener('click',e=>{ pauseBtnAction(); e.currentTarget.blur(); }); $('btnRestart').addEventListener('click',e=>{ startGame(); e.currentTarget.blur(); }); $('btnSound').addEventListener('click',e=>{ toggleSound(); e.currentTarget.blur(); });
    $('btnAccount').addEventListener('click',e=>{ ensureAudio(); sClick(); if(G.mode==='playing') pauseGame(); openAccount(); e.currentTarget.blur(); });
    $('btnCloseAccount').addEventListener('click',()=>{ sClick(); closeAccount(); });
    $('btnSaveProfile').addEventListener('click',()=>{ const v=$('profileName').value.trim(); profile.name = v || 'لاعب محلي'; save(); $('footerProfile').textContent = profile.name; $('profileHint').textContent='تم الحفظ محليًا ✅'; toast('تم حفظ الملف الشخصي'); sClick(); });
    $('btnLoginSoon').addEventListener('click',()=>{ toast('🔐 تسجيل الدخول السحابي سيُضاف عند الربط بالموقع'); $('profileHint').textContent='قريبًا: تسجيل الدخول، مزامنة النقاط، ولوحة صدارة عالمية عبر موقعك.'; sClick(); });

    const full=$('btnFull'); if(!document.documentElement.requestFullscreen) full.hidden=true; full.addEventListener('click',e=>{ ensureAudio(); sClick(); try{ if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{}); else document.exitFullscreen().catch(()=>{});}catch(err){} e.currentTarget.blur(); });
    [['dpUp',{x:0,y:-1}],['dpDown',{x:0,y:1}],['dpLeft',{x:-1,y:0}],['dpRight',{x:1,y:0}]].forEach(([id,d])=>$(id).addEventListener('pointerdown',e=>{ e.preventDefault(); dirInput(d); }));
    $('dpMid').addEventListener('pointerdown',e=>{ e.preventDefault(); pauseBtnAction(); });

    let px=0,py=0,pid=null; boardWrap.addEventListener('pointerdown',e=>{ if(e.target.closest('button,input')) return; pid=e.pointerId; px=e.clientX; py=e.clientY; try{boardWrap.setPointerCapture(pid);}catch(err){} });
    boardWrap.addEventListener('pointerup',e=>{ if(pid===null||e.pointerId!==pid) return; pid=null; if(e.target.closest('button,input')) return; const dx=e.clientX-px, dy=e.clientY-py; if(Math.max(Math.abs(dx),Math.abs(dy))>24){ dirInput(Math.abs(dx)>Math.abs(dy)?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)}); } else { if(G.mode==='menu') startGame(); else if(G.mode==='paused') resumeGame(); } });
    boardWrap.addEventListener('pointercancel',()=>{pid=null;});

    document.addEventListener('visibilitychange',()=>{ if(document.hidden){ if(G.mode==='playing') pauseGame(); if(ctx) ctx.suspend().catch(()=>{});} else if(ctx && settings.sound) ctx.resume().catch(()=>{}); });

    let armTimer=null; $('btnResetStats').addEventListener('click',e=>{ const b=e.currentTarget; ensureAudio(); if(b.classList.contains('arm')){ stats={best:0,games:0,food:0,xp:0,longest:0}; save(); updateStatsUI(); b.classList.remove('arm'); b.textContent='🗑️ تصفير السجل'; clearTimeout(armTimer); toast('تم تصفير السجل'); sClick(); } else { b.classList.add('arm'); b.textContent='⚠️ متأكد؟ اضغط مجددًا'; sClick(); clearTimeout(armTimer); armTimer=setTimeout(()=>{ b.classList.remove('arm'); b.textContent='🗑️ تصفير السجل'; },3000);} b.blur(); });
    device.addEventListener('animationend',()=>device.classList.remove('shake'));
    if('ResizeObserver' in window) new ResizeObserver(()=>resize()).observe(boardWrap); window.addEventListener('resize',resize);
  }

  load(); buildUI(); syncSound(); resize(); applyCreature(settings.creature,true); applyTheme(settings.theme,true); applyDiff(settings.diff,true); $('footerProfile').textContent = profile.name; updateStatsUI(); updateStageUI(); newRun(true); updateMenuChips(); syncPause(); bindEvents(); show('ovMenu'); requestAnimationFrame(loop);
})();