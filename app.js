const canvas=document.querySelector('#field'),ctx=canvas.getContext('2d');
const motion=document.querySelector('#motion'),preference=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
let paused=preference.matches,mode='orbit',time=0,frame=0,last=0,inView=true,w=0,h=0;
let pointer={x:-1000,y:-1000},pulse=0;
const particles=Array.from({length:260},(_,i)=>({x:0,y:0,index:i,seed:i*2.399963}));
function resize(){w=canvas.clientWidth;h=canvas.clientHeight;const dpr=Math.min(devicePixelRatio,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);render(true)}
function target(p){
 const r=Math.min(w*.39,h*.37),cx=w*.54,cy=h*.44,i=p.index;
 if(mode==='wave')return{x:w*.12+(i%26)/25*w*.8,y:cy+Math.sin(i%26*.24+time*1.5+Math.floor(i/26)*.22)*r*.5+(Math.floor(i/26)-4.5)*11};
 if(mode==='galaxy'){const distance=Math.sqrt(i/259)*r,arm=i%3*Math.PI*2/3,a=arm+distance/r*4.5+time*.18;return{x:cx+Math.cos(a)*distance,y:cy+Math.sin(a)*distance*.63}}
 const lat=1-2*i/259,ring=Math.sqrt(1-lat*lat),a=p.seed+time*.24;
 return{x:cx+Math.cos(a)*ring*r,y:cy+lat*r*.85+Math.sin(a)*ring*r*.28};
}
function render(snap=false){
 ctx.clearRect(0,0,w,h);const r=Math.min(w*.42,h*.4),cx=w*.54,cy=h*.44;
 const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.5);glow.addColorStop(0,'rgba(72,48,24,.08)');glow.addColorStop(1,'rgba(72,48,24,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 particles.forEach(p=>{let t=target(p),dx=t.x-pointer.x,dy=t.y-pointer.y,d=Math.hypot(dx,dy);if(!paused&&d<100&&d>0){t.x+=dx/d*(100-d)*.45;t.y+=dy/d*(100-d)*.45}p.x=snap?t.x:p.x+(t.x-p.x)*.08;p.y=snap?t.y:p.y+(t.y-p.y)*.08});
 ctx.lineWidth=.6;
 particles.forEach((p,i)=>{if(i%2===0){for(let j=i+1;j<Math.min(i+9,particles.length);j++){const q=particles[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<60){ctx.strokeStyle=`rgba(72,48,24,${(1-d/60)*.25})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}}}ctx.fillStyle=i%17===0?'#683f16':'#483018';ctx.globalAlpha=.45+(Math.sin(p.seed+time)+1)*.25;ctx.beginPath();ctx.arc(p.x,p.y,i%17===0?3:1.5,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;
 if(mode==='orbit'){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.4);ctx.strokeStyle='rgba(72,48,24,.4)';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(0,0,r*1.13,r*.39,0,0,Math.PI*2);ctx.stroke();const a=time*.35;ctx.fillStyle='#483018';ctx.shadowColor='#483018';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(Math.cos(a)*r*1.13,Math.sin(a)*r*.39,3,0,Math.PI*2);ctx.fill();ctx.restore()}
 if(pulse>0&&!paused){ctx.strokeStyle=`rgba(72,48,24,${pulse})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(pointer.x,pointer.y,(1-pulse)*180+5,0,Math.PI*2);ctx.stroke();pulse=Math.max(0,pulse-.018)}
}
function tick(now){frame=0;if(paused||!inView||document.hidden)return;time+=Math.min(now-(last||now),40)/1000;last=now;render();frame=requestAnimationFrame(tick)}
function start(){if(!frame&&!paused&&inView&&!document.hidden){last=0;frame=requestAnimationFrame(tick)}}
function update(){document.body.classList.toggle('paused',paused);document.documentElement.classList.toggle('motion-paused',paused);motion.textContent=paused?'Resume motion':'Pause motion';motion.setAttribute('aria-pressed',String(paused));if(paused){cancelAnimationFrame(frame);frame=0;document.querySelectorAll('.waiting').forEach(el=>el.classList.remove('waiting'));render(true)}else start()}
canvas.addEventListener('pointermove',e=>{if(paused)return;const r=canvas.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top}});
canvas.addEventListener('pointerdown',e=>{if(paused)return;const r=canvas.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top};pulse=1});canvas.addEventListener('pointerleave',()=>{pointer={x:-1000,y:-1000}});
document.querySelectorAll('.mode').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;document.querySelectorAll('.mode').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});if(paused)render(true);else start()}));
motion.addEventListener('click',()=>{paused=!paused;update()});preference.addEventListener('change',e=>{paused=e.matches;update()});addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else start()});new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)start();else{cancelAnimationFrame(frame);frame=0}},{rootMargin:'50px'}).observe(canvas);resize();update();
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('waiting');observer.unobserve(e.target)}})},{threshold:.06});document.querySelectorAll('.reveal').forEach(el=>{if(!paused){el.classList.add('waiting');observer.observe(el)}});document.addEventListener('focusin',e=>e.target.closest('.waiting')?.classList.remove('waiting'));
const aura=document.querySelector('.cursor-aura');addEventListener('pointermove',e=>{if(!fine.matches||paused)return;aura.classList.add('visible');aura.style.transform=`translate(${e.clientX-14}px,${e.clientY-14}px)`});document.documentElement.addEventListener('pointerleave',()=>aura.classList.remove('visible'));
const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
const links=[...document.querySelectorAll('nav a')],sections=links.map(a=>document.querySelector(a.getAttribute('href')));let scrollFrame=0;
function scrollState(){scrollFrame=0;const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;let active=-1;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.4)active=i});links.forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(scrollState)},{passive:true});addEventListener('resize',scrollState);document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',scrollState));scrollState();document.querySelector('#year').textContent=new Date().getFullYear();
