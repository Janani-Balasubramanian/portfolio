(() => {
  if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
  const ids = ['work','about','experience','recognition','ask-janani','contact'];
  const titles = ['Selected work','About me','My journey','Milestones','Ask Janani','Let’s connect'];
  const pages = ids.map(id => document.getElementById(id));
  if (pages.some(page => !page)) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'portal-window';
  dialog.setAttribute('aria-labelledby','portal-title');
  dialog.innerHTML = '<div class="portal-bar"><button type="button" class="portal-back">Back to home</button><span id="portal-title"></span><button type="button" class="portal-next">Next chapter</button></div><div class="portal-body"></div>';
  document.body.append(dialog);
  const body = dialog.querySelector('.portal-body');
  pages.forEach(page => { body.append(page); page.hidden = true; page.classList.remove('waiting'); page.querySelectorAll('.waiting').forEach(el=>el.classList.remove('waiting')); });
  document.body.classList.add('portal-ready');
  let active = -1, opener = null, animation;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('paused');
  function show(id, animate = true) {
    const index = ids.indexOf(id);
    if(index < 0) { if(dialog.open) dialog.close(); return; }
    animation?.cancel();
    pages.forEach((page,i) => { page.hidden = i !== index; });
    active = index;
    dialog.querySelector('#portal-title').textContent = titles[index];
    dialog.querySelector('.portal-next').textContent = index === ids.length-1 ? 'Back to home' : 'Next chapter';
    if(!dialog.open) dialog.showModal();
    document.body.classList.add('portal-open');
    body.scrollTop = 0;
    if(animate && !reduced()) animation = body.animate([{opacity:0,transform:'scale(.88) translateY(24px)'},{opacity:1,transform:'scale(1) translateY(0)'}],{duration:550,easing:'cubic-bezier(.16,1,.3,1)'});
    const heading = pages[index].querySelector('h2');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  }
  function navigate(id) { history.pushState(null,'','#'+id); show(id); }
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if(!link || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const id=link.getAttribute('href').slice(1);
    if(!ids.includes(id) && id!=='home') return;
    e.preventDefault(); if(!dialog.open) opener=link; navigate(id);
  });
  dialog.querySelector('.portal-back').addEventListener('click',()=>navigate('home'));
  dialog.querySelector('.portal-next').addEventListener('click',()=>navigate(ids[active+1] || 'home'));
  dialog.addEventListener('cancel',e=>{e.preventDefault();navigate('home');});
  dialog.addEventListener('close',()=>{document.body.classList.remove('portal-open');opener?.focus({preventScroll:true});});
  window.addEventListener('popstate',()=>show(location.hash.slice(1)));
  window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
  show(location.hash.slice(1),false);
})();
