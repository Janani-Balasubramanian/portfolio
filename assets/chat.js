(() => {
  const endpoint = 'https://janani-portfolio-assistant.lastblanket64.chatgpt.site/api/chat';
  const panel = document.querySelector('#ask-panel');
  if (!panel) return;
  const form = panel.querySelector('form'), input = panel.querySelector('input');
  const log = panel.querySelector('#ask-log'), status = panel.querySelector('#ask-status');
  const history = []; let busy = false;
  function message(text, role) { const item=document.createElement('div'); item.className='ask-message '+role; const label=document.createElement('strong');label.textContent=role==='user'?'You':'Ask Janani · AI';item.append(label,document.createTextNode(text));log.append(item);log.scrollTop=log.scrollHeight; }
  message('Hi! I’m Janani’s AI portfolio guide. Ask about her skills, projects, education, or experience. I’m an assistant, not Janani herself.','model');
  async function ask(text) {
    text=text.trim(); if(!text || busy)return; busy=true;message(text,'user');input.value='';
    panel.querySelectorAll('form button,.ask-suggestions button').forEach(b=>b.disabled=true);
    status.textContent='Thinking…';
    try {
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:history.slice(-6)}),signal:AbortSignal.timeout(30000)});
      const data=await response.json();if(!response.ok || !data.answer)throw new Error(data.error || 'Chat is temporarily unavailable.');
      message(data.answer,'model');history.push({role:'user',text},{role:'model',text:data.answer});if(history.length>6)history.splice(0,history.length-6);
      status.textContent='';
    } catch {message('I can’t connect to live AI right now. Please try again later. You can still read Janani’s projects, download her résumé, or contact her through the portfolio.','model');status.textContent='Live chat unavailable.';}
    finally {busy=false;panel.querySelectorAll('form button,.ask-suggestions button').forEach(b=>b.disabled=false);}
  }
  form.addEventListener('submit',e=>{e.preventDefault();ask(input.value);});
  panel.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.question)));
})();
