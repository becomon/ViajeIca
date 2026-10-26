const $=s=>document.querySelector(s), dates=['2027-03-05','2027-03-06','2027-03-07','2027-03-08'], days=['Viernes','Sábado','Domingo','Lunes'], categories=['Paseo','Comida','Transporte','Descanso','Otro'];
const money=n=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let events={}, people=4, cloud=null, room=new URLSearchParams(location.hash.slice(1)).get('grupo'), ready=!room, timer;
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function valid(e){return e&&typeof e.title==='string'&&e.title.trim().length>0&&e.title.length<=100&&dates.includes(e.date)&&categories.includes(e.category)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.start)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(e.end)&&e.end>e.start&&typeof e.cost==='number'&&Number.isFinite(e.cost)&&e.cost>=0&&e.cost<=1000000&&typeof e.done==='boolean'&&['location','participants','notes'].every(k=>typeof e[k]==='string'&&e[k].length<=(k==='notes'?2000:200))}
function persist(){try{localStorage.setItem('escapada-2027-v2',JSON.stringify({events,people}))}catch{toast('No se pudo guardar en este navegador. Exporta una copia.')}}
try{const saved=JSON.parse(localStorage.getItem('escapada-v1')||'{}');if(!room){events=Object.fromEntries(Object.entries(saved.events||{}).filter(([id,e])=>/^[\w-]+$/.test(id)&&valid(e)));people=Number.isInteger(saved.people)&&saved.people>=1&&saved.people<=100?saved.people:4}}catch{}
function render(){const all=Object.entries(events),total=all.reduce((s,[,e])=>s+e.cost,0);$('#count').textContent=all.length+' planes';$('#total').textContent=money(total);$('#per').textContent=money(total/people);$('#people').value=people;const q=$('#search').value.toLocaleLowerCase(),cat=$('#filter').value;$('#calendar').innerHTML=dates.map((date,i)=>{const day=all.filter(([,e])=>e.date===date).sort((a,b)=>a[1].start.localeCompare(b[1].start)),shown=day.filter(([,e])=>(!cat||e.category===cat)&&[e.title,e.location,e.participants,e.notes].join(' ').toLocaleLowerCase().includes(q));return `<section class="day" data-date="${date}"><div class="dayhead"><span>${days[i]}<small>MARZO 2027 · ${money(day.reduce((s,[,e])=>s+e.cost,0))}</small></span><strong>0${i+5}</strong></div>${shown.length?shown.map(([id,e])=>`<button class="card ${e.done?'done':''}" draggable="true" data-id="${esc(id)}" data-category="${e.category}"><span class="cardtime">${e.start} — ${e.end} · ${duration(e)}</span><h3>${e.done?'✓ ':''}${esc(e.title)}</h3>${e.location?`<p>⌖ ${esc(e.location)}</p>`:''}${e.participants?`<p>♧ ${esc(e.participants)}</p>`:''}${e.notes?`<p>${esc(e.notes)}</p>`:''}${day.some(([other,x])=>other!==id&&e.start<x.end&&e.end>x.start)?'<div class="conflict">⚠ Coincide con otro plan</div>':''}<div class="cardbottom"><span>${e.category}</span><b>${money(e.cost)}</b></div></button>`).join(''):'<p class="empty">Un día por imaginar.<br>¿Cuál será el primer plan?</p>'}<button class="addday" data-add="${date}">＋ Agregar actividad</button></section>`}).join('')}
function duration(e){const m=s=>Number(s.slice(0,2))*60+Number(s.slice(3)),n=m(e.end)-m(e.start);return n>=60?`${Math.floor(n/60)} h${n%60?' '+n%60+' min':''}`:n+' min'}
function edit(id,date=dates[0]){if(!ready)return toast('Espera a que se conecte el grupo.');const f=$('#form');f.reset();f.elements.id.value=id||'';f.elements.date.value=date;if(id){const e=events[id];for(const [k,v]of Object.entries(e)){if(f.elements[k]){if(k==='done')f.elements[k].checked=v;else f.elements[k].value=v}}}$('#modalTitle').textContent=id?'Editar el plan':'Armar un plan';$('#remove').hidden=!id;$('#formError').textContent='';$('#editor').showModal()}
async function write(id,e){if(!ready)throw Error('El grupo todavía no está conectado.');if(cloud){await cloud.set(cloud.ref(cloud.db,`rooms/${room}/events/${id}`),e)}else{if(e)events[id]=e;else delete events[id];persist();render()}}
$('#add').onclick=()=>edit();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());$('#settings').onclick=()=>$('#connection').showModal();$('#search').oninput=render;$('#filter').onchange=render;
$('#calendar').onclick=e=>{const c=e.target.closest('[data-id]'),a=e.target.closest('[data-add]');if(c)edit(c.dataset.id);if(a)edit(null,a.dataset.add)};
$('#calendar').ondragstart=e=>{const c=e.target.closest('[data-id]');if(c)e.dataTransfer.setData('text/plain',c.dataset.id)};$('#calendar').ondragover=e=>{if(e.target.closest('.day'))e.preventDefault()};$('#calendar').ondrop=async e=>{e.preventDefault();const day=e.target.closest('.day'),id=e.dataTransfer.getData('text/plain');if(day&&events[id])try{await write(id,{...events[id],date:day.dataset.date});toast('Plan movido')}catch{toast('No se pudo mover el plan')}};
$('#form').onsubmit=async e=>{e.preventDefault();const f=e.target,v=Object.fromEntries(new FormData(f));const id=v.id||crypto.randomUUID();delete v.id;v.title=v.title.trim();v.cost=Number(v.cost);v.done=f.elements.done.checked;if(!valid(v)){ $('#formError').textContent='Revisa los campos. La hora final debe ser posterior a la inicial.';return}const submit=f.querySelector('[type="submit"]')||f.querySelector('.primary');submit.disabled=true;try{await write(id,v);$('#editor').close();toast('Plan guardado')}catch{$('#formError').textContent='No se pudo guardar. Comprueba la conexión y las reglas de Firebase.'}finally{submit.disabled=false}};
$('#remove').onclick=async()=>{if(!confirm('¿Eliminar esta actividad?'))return;try{await write($('#form').elements.id.value,null);$('#editor').close();toast('Actividad eliminada')}catch{toast('No se pudo eliminar')}};
$('#people').onchange=async()=>{const n=Number($('#people').value);if(!Number.isInteger(n)||n<1||n>100){render();return}try{if(!ready)throw Error();if(cloud)await cloud.set(cloud.ref(cloud.db,`rooms/${room}/people`),n);else{people=n;persist();render()}}catch{toast('No se pudo cambiar el número de viajeros');render()}};
$('[data-view="calendar"]').onclick=$('[data-view="list"]').onclick=e=>{document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===e.currentTarget));$('#calendar').classList.toggle('list',e.currentTarget.dataset.view==='list')};
$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,people,events},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='escapada-marzo-2027.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(!ready||file.size>2000000)throw Error();const data=JSON.parse(await file.text()),list=Object.values(data.events||{});if(!list.length||list.length>500||!list.every(valid))throw Error();if(!confirm(`¿Agregar ${list.length} actividades? Se conservarán las actuales.`))return;const additions=Object.fromEntries(list.map(v=>[crypto.randomUUID(),v]));if(cloud)await cloud.update(cloud.ref(cloud.db,`rooms/${room}/events`),additions);else{Object.assign(events,additions);persist();render()}toast('Actividades importadas')}catch{toast('No se pudo importar. Revisa el archivo y la conexión.')}finally{e.target.value=''}};
$('#share').onclick=async()=>{if(!room){$('#connection').showModal();return}if(!ready)return toast('El grupo todavía no está conectado.');try{await navigator.clipboard.writeText(location.href);toast('Enlace copiado. Envíalo a tus amigos.')}catch{prompt('Copia este enlace para tus amigos:',location.href)}};
$('#createRoom').onclick=async()=>{
 const button=$('#createRoom'),label=button.textContent;
 $('#connectionError').textContent='';
 if(!window.FIREBASE_CONFIG){$('#connectionError').textContent='Primero configura Firebase en config.js.';return}
 button.disabled=true;button.textContent='Conectando…';
 try{
  if(!room){room=crypto.randomUUID();location.hash='grupo='+room}
  await connect();
  $('#connection').close();
  toast('Grupo conectado. Usa Compartir para invitar.');
 }catch(error){$('#connectionError').textContent=authError(error)}
 finally{button.disabled=false;button.textContent=label}
};

let sdkPromise, stopRoom, stopConnection;
async function sdk(){
 if(!window.FIREBASE_CONFIG)throw Error('Primero completa config.js con Firebase.');
 if(!sdkPromise)sdkPromise=(async()=>{const base='https://www.gstatic.com/firebasejs/12.0.0/';const [app,auth,db]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-database.js')]);const instance=app.getApps()[0]||app.initializeApp(window.FIREBASE_CONFIG);const session=auth.getAuth(instance);session.languageCode='es';await session.authStateReady();return {auth,db,session,instance}})().catch(e=>{sdkPromise=null;throw e});
 return sdkPromise;
}
function authError(e){const messages={'auth/invalid-credential':'Correo o contraseña incorrectos.','auth/email-already-in-use':'Ese correo ya tiene cuenta. Intenta entrar o recupera la contraseña.','auth/weak-password':'Usa una contraseña de al menos 6 caracteres.','auth/invalid-email':'Revisa el correo.','auth/too-many-requests':'Demasiados intentos. Espera antes de reintentar.','auth/operation-not-allowed':'Habilita Correo electrónico/contraseña en Firebase Authentication.','auth/network-request-failed':'No hay conexión con Firebase.'};return messages[e.code]||e.message||'No se pudo completar la operación.'}
function renderAccount(user){
 const signed=!!user&&!user.isAnonymous,verified=signed&&user.emailVerified;
 $('#loginForm').hidden=signed;
 $('#accountSummary').hidden=!signed;
 $('#accountHelp').hidden=verified;
 $('#accountHelp').textContent=signed?'Verifica tu correo con el enlace recibido. Después pulsa Ya verifiqué.':'Entra con tu correo y contraseña. Para ver los planes debes verificar tu correo y el organizador debe autorizar tu cuenta.';
 $('#accountEmail').textContent=signed?user.email:'';
 $('#accountUid').textContent=signed?user.uid:'';
 $('#verify').hidden=!signed||verified;
 $('#refreshAccount').hidden=!signed||verified;
 $('#resetPassword').hidden=signed;
 $('#logout').hidden=!signed;
 $('#account').textContent=signed?'Mi cuenta':'Ingresar con correo';
 if(signed)$('#password').value='';
}
function message(s){$('#authMessage').textContent=s}
function disconnect(){if(stopRoom)stopRoom();if(stopConnection)stopConnection();stopRoom=stopConnection=null;cloud=null;ready=!room;if(room){events={};people=4;render()}$('#status').textContent=room?'● Sesión pendiente':'● Modo local'}
async function connect(){
 disconnect();ready=false;$('#status').textContent='● Conectando…';
 const {auth,db,session,instance}=await sdk();
 if(!/^[a-f0-9-]{36}$/.test(room))throw Error('El enlace del grupo no es válido.');
 const user=session.currentUser;
 renderAccount(user);
 if(!user||user.isAnonymous){if(!$('#login').open)$('#login').showModal();message('Entra con tu correo para abrir el grupo.');throw Error('Debes iniciar sesión con correo.')}
 await auth.reload(user);await auth.getIdToken(user,true);renderAccount(user);
 $('#account').textContent='Mi cuenta';
 if(!user.emailVerified){if(!$('#login').open)$('#login').showModal();message('Verifica tu correo con el enlace recibido y pulsa Ya verifiqué.');throw Error('Falta verificar tu correo.')}
 cloud={...db,db:db.getDatabase(instance)};
 await new Promise((resolve,reject)=>{stopRoom=db.onValue(db.ref(cloud.db,'rooms/'+room),snap=>{const data=snap.val()||{};events=Object.fromEntries(Object.entries(data.events||{}).filter(([id,e])=>/^[\w-]+$/.test(id)&&valid(e)));people=Number.isInteger(data.people)&&data.people>=1&&data.people<=100?data.people:4;ready=true;render();resolve()},()=>{ready=false;events={};render();$('#status').textContent='● Sin acceso';$('#notice').textContent='Tu cuenta no tiene acceso. Pide al organizador que autorice tu UID en Firebase.';reject(Error('Cuenta sin autorización. Pide al organizador que agregue tu UID en allowedUsers: '+user.uid))})});
 stopConnection=db.onValue(db.ref(cloud.db,'.info/connected'),snap=>{$('#status').textContent=snap.val()?'● Grupo conectado':'● Sin conexión';$('#notice').textContent=snap.val()?'Cambios compartidos en tiempo real · Solo cuentas verificadas y autorizadas.':'Sin conexión. Los cambios pendientes se enviarán al reconectar.'});
}
$('#account').onclick=async()=>{
 renderAccount(null);message('Cargando cuenta…');$('#login').showModal();
 try{const {auth,session}=await sdk();if(session.currentUser)await auth.reload(session.currentUser);renderAccount(session.currentUser);message('')}
 catch(e){message(authError(e))}
};
async function loginAction(action){const buttons=$('#login').querySelectorAll('button');buttons.forEach(b=>b.disabled=true);try{await action()}catch(e){message(authError(e))}finally{buttons.forEach(b=>b.disabled=false)}}
async function afterLogin(){const {session}=await sdk();const user=session.currentUser;renderAccount(user);$('#password').value='';$('#account').textContent='Mi cuenta';if(!user.emailVerified){message('Revisa tu correo (también spam) y verifica tu cuenta. Después pulsa Ya verifiqué.');return}if(room){await connect();$('#login').close();$('#connection').close();toast('Conectado al grupo')}else{message('');$('#notice').textContent='Sesión iniciada. Usa Conectar grupo o abre el enlace de tus amigos.'}}
$('#loginForm').onsubmit=e=>{e.preventDefault();loginAction(async()=>{const {auth,session}=await sdk();await auth.signInWithEmailAndPassword(session,$('#email').value.trim(),$('#password').value);await afterLogin()})};
$('#register').onclick=()=>loginAction(async()=>{if(!$('#loginForm').reportValidity())return;const {auth,session}=await sdk();const result=await auth.createUserWithEmailAndPassword(session,$('#email').value.trim(),$('#password').value);await auth.sendEmailVerification(result.user);await afterLogin()});
$('#verify').onclick=()=>loginAction(async()=>{const {auth,session}=await sdk();if(!session.currentUser||session.currentUser.isAnonymous)throw Error('Primero entra o crea una cuenta.');await auth.sendEmailVerification(session.currentUser);message('Correo de verificación enviado. Revisa también spam.')});
$('#refreshAccount').onclick=()=>loginAction(async()=>{const {auth,session}=await sdk();if(!session.currentUser||session.currentUser.isAnonymous)throw Error('Primero inicia sesión.');await auth.reload(session.currentUser);await auth.getIdToken(session.currentUser,true);await afterLogin()});
$('#resetPassword').onclick=()=>loginAction(async()=>{if(!$('#email').reportValidity())return;const {auth,session}=await sdk();await auth.sendPasswordResetEmail(session,$('#email').value.trim());message('Si existe una cuenta con ese correo, recibirás instrucciones para recuperar el acceso.')});
$('#logout').onclick=()=>loginAction(async()=>{const {auth,session}=await sdk();disconnect();await auth.signOut(session);renderAccount(null);$('#editor').close();$('#account').textContent='Ingresar con correo';message('Sesión cerrada.');$('#notice').textContent='Inicia sesión para volver a abrir el grupo.'});
render();if(room)connect().catch(e=>{$('#status').textContent='● Sin conectar';$('#notice').textContent=authError(e)});
