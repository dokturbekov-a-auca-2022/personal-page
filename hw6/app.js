'use strict';
(async () => {
  const routes = ['home', 'services', 'about', 'international', 'partnerships', 'contact'];
  const app = document.getElementById('app');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let language = 'en';
  let page = 'home';
  let text;
  const url = target => `#/${language}/${target}`;
  const link = (label, target, style = 'text-link') => `<a class="${style}" href="${url(target)}">${escape(label)}<span class="arrow" aria-hidden="true">↗</span></a>`;
  const eyebrow = value => `<div class="eyebrow">${escape(value)}</div>`;
  const title = index => `<section class="page-hero"><div class="wrap">${eyebrow(`MERCYMED / ${text.nav[index]}`)}<h1>${escape(text.titles[index])}</h1><p>${escape(text.intros[index])}</p></div></section>`;
  const faq = questions => `<div class="faq">${questions.map(item => `<details><summary>${escape(item[0])}</summary><p>${escape(item[1])}</p></details>`).join('')}</div>`;
  const serviceCards = items => `<div class="service-grid">${items.map(item => `<article class="service-card" data-category="${item[2]}"><span class="service-number" aria-hidden="true">${String(text.services.indexOf(item) + 1).padStart(2, '0')} /</span><h3>${escape(item[0])}</h3><p>${escape(item[1])}</p>${item[3] ? `<p class="service-price">${escape(item[3])}</p>` : ''}</article>`).join('')}</div>`;
  const data = () => window.MERCYMED_DATA;
  const external = (href,label) => /^https:\/\//.test(href||'') ? '<a class="button" href="'+escape(href)+'" target="_blank" rel="noopener noreferrer">'+escape(label)+' ↗</a>' : '';
  const ui = (en,ru,ky) => ({en,ru,ky})[language];
  function person(p,mini=false) { return '<article class="person">'+(p.photo?'<img class="staff-photo" src="'+escape(p.photo)+'" alt="'+escape(p.alt)+'" loading="lazy">':'<span class="initials" aria-hidden="true">'+escape(p.name.split(' ').map(x=>x[0]).join(''))+'</span>')+'<h3>'+escape(p.name)+'</h3><p>'+escape(p.role[language])+'</p>'+(!mini&&p.bio[language]?'<p class="staff-bio">'+escape(p.bio[language])+'</p>':'')+'</article>'; }
  function social(){const d=data();if(!d.settings.instagram&&!d.posts.length)return '';return '<section class="section"><div class="wrap"><div class="section-heading"><div><div class="eyebrow">INSTAGRAM</div><h2>'+ui('Life at MercyMed','Жизнь MercyMed','MercyMed жашоосу')+'</h2><p class="section-intro">'+ui('News and updates from the clinic.','Новости клиники.','Клиниканын жаңылыктары.')+'</p></div>'+external(d.settings.instagram,'Instagram')+'</div><div class="two-cards">'+d.posts.map(p=>'<article class="editorial-card">'+external(p.url,p.caption[language]||ui('View post','Посмотреть публикацию','Постту көрүү'))+'</article>').join('')+'</div></div></section>';}
  function gallery(){return data().gallery.length?'<section class="section"><div class="wrap"><h2>'+ui('Inside MercyMed','В клинике MercyMed','MercyMed клиникасында')+'</h2><div class="clinic-gallery">'+data().gallery.map(p=>'<figure><img src="'+escape(p.photo)+'" alt="'+escape(p.alt)+'" loading="lazy"><figcaption>'+escape(p.caption[language])+'</figcaption></figure>').join('')+'</div></div></section>':'';}
  function contactLinks(){const s=data().settings;return '<div class="actions contact-actions">'+(s.phone?'<a class="button" href="tel:'+escape(s.phone.replace(/[^+0-9]/g,''))+'">'+ui('Call reception','Позвонить','Каттоо бөлүмүнө чалуу')+'</a>':'')+(s.whatsapp?external('https://wa.me/'+encodeURIComponent(s.whatsapp),'WhatsApp'):'')+(s.email?'<a class="button" href="mailto:'+escape(s.email)+'">'+ui('Email','Эл. почта','Эл. почта')+'</a>':'')+external(s.map,ui('Open map','Открыть карту','Картаны ачуу'))+'</div>';}
  function cta() {
    return `<div class="wrap"><section class="cta-band"><div><h2>${escape(text.ctaTitle)}</h2><p>${escape(text.ctaText)}</p></div>${link(text.request, 'contact', 'button')}</section></div>`;
  }
  function header() {
    return `${window.MERCYMED_OFFLINE ? `<div class="notice">${ui('Showing a saved copy. Recent updates may be unavailable.','Показана сохранённая копия. Последние изменения могут быть недоступны.','Сакталган көчүрмө көрсөтүлдү. Акыркы өзгөртүүлөр жеткиликсиз болушу мүмкүн.')}</div>` : ''}<div class="notice">${escape(text.notice)}</div><header class="site-header"><div class="wrap header-inner"><a class="brand" href="${url('home')}" aria-label="MercyMed — ${escape(text.nav[0])}"><img src="assets/mercymed-logo.jpeg" alt="MercyMed" width="1080" height="953"></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation">${escape(text.menu)} <span aria-hidden="true">☰</span></button><nav class="nav" id="site-navigation" aria-label="${escape(text.menu)}">${routes.map((route, i) => `<a href="${url(route)}"${page === route ? ' aria-current="page"' : ''}>${escape(text.nav[i])}</a>`).join('')}</nav><label class="language-label"><span class="sr-only">${escape(text.language)}</span><select id="language">${[['en','English'],['ky','Кыргызча'],['ru','Русский']].map(([key,label]) => `<option value="${key}"${key === language ? ' selected' : ''}>${label}</option>`).join('')}</select></label></div></header><div class="translation-note">${escape(text.translation)}</div>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="wrap"><div class="footer-main"><div><div class="footer-title">MERCYMED<span aria-hidden="true" style="color:var(--gold)"> +</span></div><p class="footer-tagline">${escape(text.footerLine)}</p></div><nav class="footer-links" aria-label="${escape(text.menu)}">${routes.slice(1).map((route,i) => `<a href="${url(route)}">${escape(text.nav[i+1])}</a>`).join('')}</nav></div><div class="footer-bottom"><span>${escape(text.footerNote)}</span><span>${escape(text.footerSafety)}</span><a href="admin/">${ui('Staff sign in','Вход для сотрудников','Кызматкерлер үчүн кирүү')}</a></div></div></footer>`;
  }
  function home() {
    return `<div class="wrap"><section class="hero"><div>${eyebrow(text.heroLabel)}<h1>${escape(text.heroTitle[0])}<em>${escape(text.heroTitle[1])}</em></h1><p class="intro">${escape(text.heroIntro)}</p><div class="actions">${link(text.request,'contact','button')}${link(text.explore,'services')}</div></div><div class="hero-art">${data().settings.heroPhoto ? `<img class="hero-photo" src="${escape(data().settings.heroPhoto)}" alt="${escape(data().settings.heroAlt)}">` : `<div class="logo-mat"><img src="assets/mercymed-logo.jpeg" alt="" width="1080" height="953"></div>`}<p>${escape(text.artTitle)}</p><div class="art-meta"><span>${escape(text.artMeta[0])}</span><span>${escape(text.artMeta[1])}</span></div></div></section><div class="trust-strip">${text.trust.map(item => `<div class="trust-item"><span class="cross" aria-hidden="true">＋</span>${escape(item)}</div>`).join('')}</div></div>
    <section class="section"><div class="wrap"><div class="section-heading"><div>${eyebrow(text.servicesLabel)}<h2>${escape(text.servicesTitle)}</h2><p class="section-intro">${escape(text.servicesIntro)}</p></div>${link(text.allServices,'services')}</div>${serviceCards(text.services.slice(0,3))}</div></section>
    <section class="section wash"><div class="wrap split"><div>${eyebrow(text.aboutLabel)}<h2>${escape(text.aboutTitle)}</h2><p class="section-intro lead">${escape(text.aboutLead)}</p></div><ol class="feature-list">${text.values.map((item,i) => `<li><span class="number" aria-hidden="true">0${i+1}</span><div><strong>${escape(item[0])}</strong><p>${escape(item[1])}</p></div></li>`).join('')}</ol></div></section>
    <section class="section"><div class="wrap"><div class="section-heading"><div>${eyebrow(text.teamLabel)}<h2>${escape(text.teamTitle)}</h2><p class="section-intro">${escape(text.teamIntro)}</p></div>${link(text.teamLink,'about')}</div><div class="home-mini-team">${data().staff.slice(0,3).map(p=>person(p,true)).join('')}</div></div></section>
    <div class="wrap"><section class="story-band"><div><div class="story-year">${escape(text.storyYear)}</div><p class="story-caption">${escape(text.storyCaption)}</p></div><div><h2>${escape(text.storyTitle)}</h2><p>${escape(text.storyText)}</p>${link(text.storyLink,'about')}</div></section></div>
    <section class="section"><div class="wrap two-cards">${text.partnersHome.map((item,i) => `<article class="editorial-card"><h2>${escape(item[0])}</h2><p>${escape(item[1])}</p>${link(item[2], i === 0 ? 'international' : 'partnerships')}</article>`).join('')}</div></section>${social()}${cta()}`;
  }
  function services() {
    return `${title(1)}<section class="section"><div class="wrap"><div class="filter-bar" role="group" aria-label="${escape(text.nav[1])}">${['all','consultation','support'].map((category,i) => `<button type="button" class="filter-button" data-filter="${category}" aria-pressed="${i === 0}">${escape(text.filters[i])}</button>`).join('')}</div><p class="sr-only" id="service-count" role="status">${text.services.length} ${escape(text.results)}</p>${serviceCards(text.services)}<p class="small-note">${escape(text.serviceNote)}</p></div></section><section class="section wash"><div class="wrap"><h2>${escape(text.faqTitle)}</h2>${faq(text.faq)}</div></section>${cta()}`;
  }
  function about() {
    return `${title(2)}<section class="section"><div class="wrap split"><div>${eyebrow(text.aboutLabel)}<h2>${escape(text.historyTitle)}</h2><p class="section-intro">${escape(text.aboutLead)}</p></div><div class="timeline">${text.history.map(item => `<article><h3>${escape(item[0])}</h3><p>${escape(item[1])}</p></article>`).join('')}</div></div></section><section class="section wash"><div class="wrap">${eyebrow(text.teamLabel)}<h2>${escape(text.teamTitle)}</h2><p class="section-intro">${escape(text.teamIntro)}</p><div class="team-grid" style="margin-top:35px">${data().staff.map(p=>person(p)).join('')}</div><p class="small-note">${escape(text.teamNote)}</p></div></section><section class="section"><div class="wrap story-band"><div><div class="story-year">${escape(text.storyYear)}</div><p class="story-caption">${escape(text.storyCaption)}</p></div><div><h2>${escape(text.outreachTitle)}</h2><p>${escape(text.outreachText)}</p></div></div></section>${gallery()}${cta()}`;
  }
  function international() {
    return `${title(3)}<section class="section"><div class="wrap split"><div><h2>${escape(text.languagesTitle)}</h2><p class="section-intro">${escape(text.languagesText)}</p><div class="language-chips">${text.spokenLanguages.map(label=>`<span class="language-chip">${escape(label)}</span>`).join('')}</div><p class="small-note">${escape(text.internationalNote)}</p></div><div>${text.internationalBlocks.map(item=>`<article class="editorial-card"><h3>${escape(item[0])}</h3><p>${escape(item[1])}</p></article>`).join('')}</div></div></section><section class="section wash"><div class="wrap"><h2>${escape(text.faqTitle)}</h2>${faq(text.internationalFaq)}</div></section>${cta()}`;
  }
  function partnerships() {
    return `${title(4)}<section class="section"><div class="wrap two-cards">${text.partnershipBlocks.map(item=>`<article class="editorial-card"><div class="eyebrow">${escape(item[0])}</div><h2>${escape(item[1])}</h2><p>${escape(item[2])}</p></article>`).join('')}</div></section><section class="section wash"><div class="wrap split"><div><h2>${escape(text.partnershipNext)}</h2><p class="section-intro">${escape(text.partnershipNextText)}</p><div class="actions">${link(text.partnershipButton,'contact','button')}</div></div><aside class="info-box"><h3>${escape(text.outreachTitle)}</h3><p>${escape(text.outreachText)}</p></aside></div></section>`;
  }
  function contact() {
    return `${title(5)}<section class="section"><div class="wrap contact-grid"><div><h2>${escape(text.contactTitle)}</h2><p class="section-intro">${escape(text.contactIntro)}</p><dl class="contact-facts">${text.contactLabels.map((label,i)=>`<div><dt>${escape(label)}</dt><dd>${escape(text.contactValues[i])}</dd></div>`).join('')}</dl>${contactLinks()}<h3 style="margin-top:35px">${escape(text.processTitle)}</h3><ol class="steps">${text.process.map(step=>`<li><p>${escape(step)}</p></li>`).join('')}</ol></div><section class="demo-panel" aria-labelledby="demo-title"><div class="demo-label">${escape(text.demoLabel)}</div><h2 id="demo-title">${escape(text.demoTitle)}</h2><p id="demo-description">${escape(text.demoText)}</p><div class="form-grid" role="group" aria-labelledby="demo-title" aria-describedby="demo-description">${[text.sampleName,text.sampleSurname,text.sampleDate,text.samplePhone].map((value,i)=>`<label class="field">${escape(text.fields[i])}<input type="text" readonly value="${escape(value)}" autocomplete="off" aria-readonly="true"></label>`).join('')}<label class="field full">${escape(text.fields[4])}<select id="consultation">${text.consultations.map((label,i)=>`<option value="${i}">${escape(label)}</option>`).join('')}</select></label></div><button class="button" id="preview-request" type="button">${escape(text.demoButton)} <span class="arrow" aria-hidden="true">→</span></button><div id="demo-result" class="demo-result" role="status" hidden></div></section></div></section>`;
  }
  function render({focusMain = false, focusLanguage = false} = {}) {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    language = Object.hasOwn(window.MERCYMED, parts[0]) ? parts[0] : 'en';
    page = parts[1] || (parts[0] && !Object.hasOwn(window.MERCYMED, parts[0]) ? 'not-found' : 'home');
    text = window.MERCYMED[language];
    document.documentElement.lang = language;
    const pageIndex = routes.indexOf(page);
    document.title = `MercyMed — ${pageIndex >= 0 ? text.titles[pageIndex] : text.notFoundTitle}`;
    document.getElementById('skip-link').textContent = text.skip;
    const pages = {home,services,about,international,partnerships,contact};
    const body = Object.hasOwn(pages,page) ? pages[page]() : `<section class="section wrap"><h1>${escape(text.notFoundTitle)}</h1><p class="section-intro">${escape(text.notFoundText)}</p><div class="actions">${link(text.backHome,'home','button')}</div></section>`;
    app.innerHTML = `${header()}<main id="main" tabindex="-1">${body}</main>${footer()}`;
    bindEvents();
    if (focusLanguage) document.getElementById('language').focus({preventScroll:true});
    else if (focusMain) document.getElementById('main').focus({preventScroll:true});
  }
  function bindEvents() {
    document.getElementById('language').addEventListener('change',event=> {
      history.replaceState(null,'',`#/${event.target.value}/${page}`);
      render({focusLanguage:true});
    });
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.getElementById('site-navigation');
    toggle.addEventListener('click',()=>{
      const opened = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded',String(opened));
      toggle.innerHTML = `${escape(opened ? text.close : text.menu)} <span aria-hidden="true">${opened ? '×' : '☰'}</span>`;
      nav.classList.toggle('open',opened);
    });
    document.querySelector('.site-header').addEventListener('keydown',event=>{
      if(event.key === 'Escape' && nav.classList.contains('open')){toggle.click();toggle.focus();}
    });
    document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
      document.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item === button)));
      let count = 0;
      document.querySelectorAll('[data-category]').forEach(card=>{
        const visible = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
        card.hidden = !visible;
        if(visible) count++;
      });
      document.getElementById('service-count').textContent = `${count} ${text.results}`;
    }));
    document.getElementById('preview-request')?.addEventListener('click',()=>{
      const selectedIndex = Number(document.getElementById('consultation').value);
      const result = document.getElementById('demo-result');
      result.hidden = false;
      result.innerHTML = `<strong>${escape(text.demoResultTitle)}</strong><p>${escape(text.demoResultText)}</p><ul><li>${escape(text.demoResultLabels[0])}: ${escape(text.sampleName)} ${escape(text.sampleSurname)}</li><li>${escape(text.demoResultLabels[1])}: ${escape(text.consultations[selectedIndex])}</li><li>${escape(text.demoResultLabels[2])}: ${escape(text.demoStatus)}</li></ul><button type="button" class="filter-button" id="reset-demo">${escape(text.resetDemo)}</button>`;
      document.getElementById('reset-demo').addEventListener('click',()=>{
        result.hidden = true; result.replaceChildren();
        document.getElementById('consultation').value = '0';
        document.getElementById('preview-request').focus();
      });
    });
  }
  document.getElementById('skip-link').addEventListener('click',event=>{
    event.preventDefault();document.getElementById('main').focus();
  });
  window.addEventListener('hashchange',()=>{render({focusMain:true});window.scrollTo(0,0);});
  window.addEventListener('mercymed-content',()=>render());
  await window.mercymedReady;
  render();
})();
