/* KTX Automotive — page d’accueil cinéma. window.KTXC_init(root, base, lang) -> {setLang, destroy} */

window.KTXC_init=function(root,BASE,initLang){
  var lang=initLang==='en'?'en':'fr';var $=function(id){return root.querySelector('#'+id)};var $$=function(q){return root.querySelectorAll(q)};var dead=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var MANI={
    fr:"Chaque automne, tout le monde appelle son garage la même semaine. Le *1er décembre* ne se déplace pas. Votre rendez-vous, *oui.*",
    en:"Every fall, everyone calls their garage the same week. *December 1* doesn’t move. Your appointment *does.*"
  };
  var FILM=[
    {img:0,small:{fr:"Chaque automne",en:"Every fall"},big:{fr:"La même cohue.",en:"The same rush."},cap:{fr:"Chaque automne, c’est la même course : trouver un garage avant le 1er décembre.",en:"Every fall, it’s the same race: finding a garage before December 1st."},d:7},
    {img:1,small:{fr:"KTX Automotive",en:"KTX Automotive"},big:{fr:"Votre conciergerie automobile.",en:"Your automotive concierge."},cap:{fr:"KTX Automotive, c’est votre conciergerie automobile. On s’occupe de vos pneus, toute l’année.",en:"KTX Automotive is your automotive concierge. We take care of your tires, all year long."},d:10},
    {img:1,small:{fr:"Dès l’inscription",en:"From sign-up"},big:{fr:"1 interlocuteur. 2 créneaux.",en:"1 contact. 2 slots."},cap:{fr:"Un seul interlocuteur : KTX. Dès l’inscription, vos deux créneaux de l’année sont réservés, printemps et automne.",en:"One point of contact: KTX. The day you sign up, both your slots for the year are booked, spring and fall."},d:10},
    {img:2,small:{fr:"Au garage partenaire",en:"At the partner garage"},big:{fr:"Un scan. 0 $ sur place.",en:"One scan. $0 on site."},cap:{fr:"Le jour venu, vous vous présentez chez un garage partenaire près de chez vous. Un scan de code QR, et c’est tout : rien à payer sur place.",en:"On the day, you drive to a partner garage near you. One QR code scan, and that’s it: nothing to pay on site."},d:13},
    {img:3,small:{fr:"Forfait Sérénité",en:"Sérénité plan"},big:{fr:"Vos pneus, gardés.",en:"Your tires, stored."},cap:{fr:"Avec le forfait Sérénité, KTX garde vos pneus hors saison, suivis par code QR. Après chaque visite, vous recevez un rapport avec photos.",en:"With the Sérénité plan, KTX stores your tires off-season, tracked by QR code. After every visit, you get a report with photos."},d:10},
    {img:4,small:{fr:"Forfait Fin de bail",en:"Fin de bail plan"},big:{fr:"Jusqu’à 400 $ par jante.*",en:"Up to $400 per wheel.*"},cap:{fr:"Vous êtes en location ? Au retour, une jante abîmée peut coûter jusqu’à 400 $. Le forfait Fin de bail documente l’état de vos roues, photos datées à l’appui.",en:"Leasing? At lease return, one damaged wheel can cost up to $400. The Fin de bail plan documents your wheels’ condition, with dated photos."},d:12},
    {img:0,small:{fr:"Toutes marques, tous modèles",en:"All makes, all models"},big:{fr:"De l’ouest de l’île à Vaudreuil-Soulanges.",en:"West Island to Vaudreuil-Soulanges."},cap:{fr:"Toutes marques, tous modèles, de l’ouest de l’île jusqu’à Vaudreuil-Soulanges.",en:"All makes, all models, from the West Island to Vaudreuil-Soulanges."},d:8},
    {img:1,small:{fr:"Lancement avril 2027",en:"Launching April 2027"},big:{fr:"ktxautomotive.com",en:"ktxautomotive.com"},cap:{fr:"Lancement en avril 2027. Inscrivez-vous à la liste d’attente sur ktxautomotive.com.",en:"Launching April 2027. Join the waitlist at ktxautomotive.com."},d:8}
  ];

  // Textes FR/EN
  function applyLang(){
    $$('[data-fr]').forEach(function(el){el.textContent=el.getAttribute('data-'+lang)});
    $$('img[data-alt-en]').forEach(function(el){
      if(!el.dataset.altFr)el.dataset.altFr=el.alt; el.alt=lang==='en'?el.dataset.altEn:el.dataset.altFr});
    buildManifesto(); renderFilm(true); if(typeof filmLang==='function')filmLang();
  }

  // Manifeste
  var words=[];
  function buildManifesto(){
    var p=$('mtext');p.innerHTML='';words=[];
    var hot=false;
    MANI[lang].split(' ').forEach(function(tok){
      var start=tok.charAt(0)==='*';var end=tok.slice(-1)==='*'||tok.slice(-2)==='*.';
      if(start)hot=true;
      var clean=tok.replace(/\*/g,'');
      var s=document.createElement('span');s.className='w'+(hot?' hot':'');s.textContent=clean+' ';
      p.appendChild(s);words.push(s);
      if(end)hot=false;
    });
    onScroll();
  }

  // Film
  var shots=[].slice.call($$('.film .shot'));
  shots.forEach(function(s){s.querySelector('img').src=s.getAttribute('data-img')});
  var bar=$('fbar');
  FILM.forEach(function(sc,i){var sp=document.createElement('span');sp.tabIndex=0;sp.setAttribute('role','button');sp.setAttribute('aria-label','Scène '+(i+1));sp.innerHTML='<i></i>';sp.addEventListener('click',function(){go(i)});bar.appendChild(sp)});
  var segs=[].slice.call(bar.children);
  var cur=0,t0=0,elapsed=0,playing=false,visible=false,raf=0;
  function renderFilm(keep){
    var sc=FILM[cur];
    shots.forEach(function(s,i){s.classList.toggle('on',i===sc.img)});
    var card=$('fcard');
    if(!keep){card.classList.remove('on');void card.offsetWidth}
    $('fsmall').textContent=sc.small[lang];
    $('fbig').textContent=sc.big[lang];
    $('fcap').textContent=sc.cap[lang];
    requestAnimationFrame(function(){card.classList.add('on')});
    segs.forEach(function(s,i){s.firstChild.style.width=i<cur?'100%':(i>cur?'0%':s.firstChild.style.width)});
  }
  var AUD={fr:BASE+'assets/audio/film-fr.mp3',en:BASE+'assets/audio/film-en.mp3'};
  var TS={fr:[0,6.1,12.54,20.5,28.91,38.11,48.08,52.87,62.15],en:[0,6.15,12.72,20.66,28.26,37.24,47.08,51.86,60.47]};
  var au=new Audio();au.preload='auto';var sound=false,clock=0,pend=false;
  function T(){return TS[lang]}
  function sceneAt(t){var a=T();for(var i=a.length-2;i>0;i--)if(t>=a[i])return i;return 0}
  function seek(t){if(au.readyState>=1){try{au.currentTime=t}catch(e){}}else{au.addEventListener('loadedmetadata',function f(){au.removeEventListener('loadedmetadata',f);try{au.currentTime=t}catch(e){}})}}
  function startAudio(){if(au.paused&&!pend){pend=true;au.play().then(function(){pend=false},function(){pend=false})}}
  function go(i){cur=(i+FILM.length)%FILM.length;clock=T()[cur];if(sound)seek(clock);renderFilm(false)}
  function tick(){
    cancelAnimationFrame(raf);
    var loop=function(now){
      var fr=fbox.getBoundingClientRect();visible=fr.bottom>innerHeight*0.25&&fr.top<innerHeight*0.75&&!document.hidden;
      var run=playing&&visible,a=T(),end=a[a.length-1];
      if(sound){
        if(run){startAudio();if(!au.paused)clock=au.currentTime;if(au.ended){clock=0;seek(0);startAudio()}}
        else if(!au.paused)au.pause();
      }else if(run){clock+=(now-t0)/1000;if(clock>=end)clock=0}
      t0=now;
      var k=sceneAt(clock);if(k!==cur){cur=k;renderFilm(false)}
      segs[cur].firstChild.style.width=Math.max(0,Math.min(100,(clock-a[cur])/(a[cur+1]-a[cur])*100))+'%';
      if(!dead)raf=requestAnimationFrame(loop)};
    t0=performance.now();raf=requestAnimationFrame(loop);
  }
  var pbtn=$('fplay'),sbtn=$('fsound');
  function labels(){pbtn.textContent=playing?(lang==='fr'?'PAUSE':'PAUSE'):(lang==='fr'?'LECTURE':'PLAY');sbtn.textContent=sound?(lang==='fr'?'SON ACTIVÉ':'SOUND ON'):(lang==='fr'?'ACTIVER LE SON':'TURN SOUND ON');sbtn.setAttribute('aria-pressed',sound)}
  pbtn.addEventListener('click',function(){playing=!playing;if(!playing)au.pause();else if(sound)startAudio();labels()});
  sbtn.addEventListener('click',function(){sound=!sound;if(sound){playing=true;au.src=AUD[lang];go(0);startAudio()}else{au.pause()}labels()});
  var filmLang=function(){labels();if(sound){var k=cur;au.pause();au.src=AUD[lang];go(k);startAudio()}};
  playing=!reduce;labels();
  renderFilm(false);tick();
  var fbox=$('filmbox');

  // Apparitions
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);count(e.target)}})},{rootMargin:'0px 0px -12% 0px'});
  $$('.fade').forEach(function(el){io.observe(el)});
  function count(el){
    el.querySelectorAll('[data-count]').forEach(function(b){
      var n=+b.dataset.count,suf=b.dataset.suffix||'';if(reduce||n<2){b.textContent=n+suf;return}
      var s=performance.now();(function f(now){var p=Math.min(1,(now-s)/1200);b.textContent=Math.round(n*(1-Math.pow(1-p,3)))+suf;if(p<1)requestAnimationFrame(f)})(s)})
  }

  // Défilement : manifeste + panneaux
  var reveals=[].slice.call($$('.reveal'));
  function prog(el){var r=el.getBoundingClientRect();var tot=r.height-innerHeight;return Math.max(0,Math.min(1,-r.top/(tot||1)))}
  function onScroll(){
    if(reduce)return;
    var m=$('manifesto');var p=prog(m);
    var lit=Math.floor(p*1.25*words.length);
    words.forEach(function(w,i){w.classList.toggle('on',i<lit)});
    reveals.forEach(function(sec){
      var q=prog(sec);
      var frame=sec.querySelector('.frame'),img=frame.querySelector('img');
      var k=Math.min(1,q/0.45);var e=1-Math.pow(1-k,3);
      var inset=(1-e)*14, rad=(1-e)*32;
      frame.style.clipPath='inset('+inset+'% '+inset+'% '+inset+'% '+inset+'% round '+rad+'px)';
      img.style.transform='scale('+(1.18-0.18*e+q*0.06)+')';
      sec.classList.toggle('show',q>0.38);
    });
  }
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
  if(reduce)reveals.forEach(function(s){s.classList.add('show')});
  applyLang();
  return {setLang:function(l){l=l==='en'?'en':'fr';if(l!==lang){lang=l;applyLang()}},destroy:function(){dead=true;cancelAnimationFrame(raf);au.pause();au.src='';io.disconnect();removeEventListener('scroll',onScroll);removeEventListener('resize',onScroll)}};
};
