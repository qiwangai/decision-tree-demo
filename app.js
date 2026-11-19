let decisions=[
 {id:1,seq:1,title:'Define the product launch objective',topic:'Campaign strategy',status:'COMMITTED',createdAt:'2026-09-03',parents:[]},
 {id:2,seq:2,title:'Prioritise first-time founders',topic:'Audience',status:'REVIEWED',createdAt:'2026-09-08',parents:[1]},
 {id:3,seq:3,title:'Lead with the time-saving promise',topic:'Positioning',status:'COMMITTED',createdAt:'2026-09-14',parents:[1]},
 {id:4,seq:4,title:'Use a creator-led launch strategy',topic:'Campaign strategy',status:'COMMITTED',createdAt:'2026-09-22',parents:[1]},
 {id:5,seq:5,title:'Set qualified trials as the north-star metric',topic:'Measurement',status:'REVIEWED',createdAt:'2026-09-29',parents:[1]},
 {id:6,seq:6,title:'Focus the message on lean marketing teams',topic:'Audience',status:'AWAITING_APPROVAL',createdAt:'2026-10-02',parents:[2,3]},
 {id:7,seq:7,title:'Build three reusable story angles',topic:'Creative system',status:'COMMITTED',createdAt:'2026-10-07',parents:[3,4]},
 {id:8,seq:8,title:'Start with TikTok and Instagram',topic:'Channel mix',status:'REVIEWED',createdAt:'2026-10-12',parents:[4]},
 {id:9,seq:9,title:'Pair creator content with founder proof',topic:'Content strategy',status:'DRAFT',createdAt:'2026-10-16',parents:[4,6]},
 {id:10,seq:10,title:'Create a product-led landing page',topic:'Conversion',status:'COMMITTED',createdAt:'2026-10-22',parents:[3,5]},
 {id:11,seq:11,title:'Track activation within the first session',topic:'Measurement',status:'AWAITING_APPROVAL',createdAt:'2026-10-28',parents:[5]},
 {id:12,seq:12,title:'Run a 14-day creative sprint',topic:'Experiment',status:'REVIEWED',createdAt:'2026-11-02',parents:[7,8]},
 {id:13,seq:13,title:'Test founder and customer narratives',topic:'Creative system',status:'DRAFT',createdAt:'2026-11-05',parents:[7,9]},
 {id:14,seq:14,title:'Retarget high-intent site visitors',topic:'Paid distribution',status:'AWAITING_APPROVAL',createdAt:'2026-11-09',parents:[8,10]},
 {id:15,seq:15,title:'Optimise onboarding for qualified trials',topic:'Conversion',status:'COMMITTED',createdAt:'2026-11-12',parents:[10,11]},
 {id:16,seq:16,title:'Review channel quality every Friday',topic:'Measurement',status:'REVIEWED',createdAt:'2026-11-14',parents:[11]},
 {id:17,seq:17,title:'Scale the winning creator narrative',topic:'Growth',status:'AWAITING_APPROVAL',createdAt:'2026-11-17',parents:[12,13,14]},
 {id:18,seq:18,title:'Shift budget toward retained accounts',topic:'Growth',status:'DRAFT',createdAt:'2026-11-18',parents:[14,15,16]}
];
const initialGraphPositions={1:[80,425],2:[520,0],3:[520,260],4:[520,520],5:[520,780],6:[960,0],7:[960,170],8:[960,340],9:[960,510],10:[960,680],11:[960,850],12:[1400,50],13:[1400,250],14:[1400,450],15:[1400,650],16:[1400,850],17:[1840,280],18:[1840,650]};
let graphPositions=JSON.parse(JSON.stringify(initialGraphPositions)),positions={},layoutHeaders=[];
let mode='topics',zoom=.82,pan={x:20,y:10},selected=null,canvasDrag=null,locked=false,pinned=false,minimapDrag=false,toastTimer=null;
let miniDomain={minX:0,minY:0,maxX:2200,maxY:1000,scaleX:1,scaleY:1,padX:8,padY:8};
const flow=document.getElementById('flow'),stage=document.getElementById('stage'),zoomValue=document.getElementById('zoomValue'),navZoomValue=document.getElementById('navZoomValue'),minimap=document.getElementById('minimap'),stats=document.getElementById('graphStats');
const statusInfo={COMMITTED:['Committed','committed'],REVIEWED:['Reviewed','reviewed'],AWAITING_APPROVAL:['Awaiting Approval','approval'],DRAFT:['Draft','draft']};

function weekKey(value){const d=new Date(`${value}T00:00:00`),day=d.getDay(),diff=day===0?-6:1-day;d.setDate(d.getDate()+diff);return d.toISOString().slice(0,10)}
function monthKey(value){return value.slice(0,7)}
function bucketFor(d){return mode==='week'?weekKey(d.createdAt):mode==='month'?monthKey(d.createdAt):d.createdAt}
function bucketLabel(key){
 if(mode==='month'){const [y,m]=key.split('-');return new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric'}).format(new Date(Number(y),Number(m)-1,1))}
 const start=new Date(`${key}T00:00:00`);if(mode==='week'){const end=new Date(start);end.setDate(end.getDate()+6);const f=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'});return `${f.format(start)} – ${f.format(end)}`}
 return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(start)
}
function buildLayout(){
 layoutHeaders=[];
 if(mode==='graph'){positions=graphPositions;return}
 const groups=new Map();
 decisions.forEach(d=>{const key=mode==='topics'?d.topic:bucketFor(d);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(d)});
 const keys=[...groups.keys()].sort((a,b)=>mode==='topics'?a.localeCompare(b):a.localeCompare(b));positions={};
 keys.forEach((key,i)=>{const x=60+i*380,items=groups.get(key).sort((a,b)=>a.seq-b.seq);layoutHeaders.push({key,x,label:mode==='topics'?key:bucketLabel(key),count:items.length});items.forEach((d,j)=>positions[d.id]=[x+8,112+j*154])});
}
function edge(from,to){const a=positions[from],b=positions[to];if(!a||!b)return '';const sx=a[0]+320,sy=a[1]+64,ex=b[0],ey=b[1]+64,mx=sx+Math.max(45,(ex-sx)/2);return `<span class="edge-h" style="left:${sx}px;top:${sy}px;width:${Math.max(0,mx-sx)}px"></span><span class="edge-v" style="left:${mx}px;top:${Math.min(sy,ey)}px;height:${Math.abs(ey-sy)}px"></span><span class="edge-h edge-end" style="left:${mx}px;top:${ey}px;width:${Math.max(0,ex-mx)}px"></span>`}
function render(){
 buildLayout();flow.classList.toggle('non-graph',mode!=='graph');document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
 const links=decisions.reduce((n,d)=>n+d.parents.length,0);stats.textContent=mode==='graph'?`${decisions.length} decisions · ${links} links · ${decisions.filter(d=>d.parents.length===0).length} root · 0 standalone`:`${decisions.length} decisions · ${mode==='topics'?'Topics':mode[0].toUpperCase()+mode.slice(1)} view`;
 let html='';layoutHeaders.forEach(h=>{html+=`<div class="layout-band" style="left:${h.x}px"></div><div class="layout-column" data-key="${h.key}" style="left:${h.x+7}px"><b>${h.label}</b><small>${h.count} decision${h.count===1?'':'s'}</small></div>`});
 if(mode==='graph')decisions.forEach(d=>d.parents.forEach(p=>html+=edge(p,d.id)));
 decisions.forEach(d=>{const [label,klass]=statusInfo[d.status],p=positions[d.id];if(!p)return;html+=`<button class="decision-node ${selected===d.id?'selected':''}" data-id="${d.id}" style="left:${p[0]}px;top:${p[1]}px"><i class="handle left"></i><i class="handle right"></i><span class="node-top"><span class="status ${klass}">${label}</span><span class="meta">#${d.seq}</span></span><span class="node-title">${d.title}</span><span class="node-topic">${mode==='topics'?d.createdAt:d.topic}</span></button>`});
 const b=graphBounds();stage.style.width=`${Math.max(2400,b.maxX+400)}px`;stage.style.height=`${Math.max(1100,b.maxY+300)}px`;stage.innerHTML=html;applyTransform();
 stage.querySelectorAll('.decision-node').forEach(node=>{node.onclick=e=>{e.stopPropagation();selected=Number(node.dataset.id);render()};node.onpointerdown=e=>startNodeDrag(e,node)});renderMiniMap();updateTopicSelect();
}
function applyTransform(){stage.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;const value=`${Math.round(zoom*100)}%`;zoomValue.textContent=value;navZoomValue.textContent=value;updateMiniViewport()}
function setZoom(next,anchorX=flow.clientWidth/2,anchorY=flow.clientHeight/2){const old=zoom;zoom=Math.max(.2,Math.min(1.6,Math.round(next*100)/100));const gx=(anchorX-pan.x)/old,gy=(anchorY-pan.y)/old;pan={x:anchorX-gx*zoom,y:anchorY-gy*zoom};applyTransform()}
function graphBounds(){const vals=Object.values(positions);if(!vals.length)return {minX:0,minY:0,maxX:1000,maxY:600};const xs=vals.map(p=>p[0]),ys=vals.map(p=>p[1]);return {minX:Math.min(...xs),minY:Math.min(...ys),maxX:Math.max(...xs)+320,maxY:Math.max(...ys)+128}}
function fit(){const b=graphBounds(),margin=70,w=Math.max(1,flow.clientWidth-margin*2),h=Math.max(1,flow.clientHeight-margin*2);zoom=Math.max(.2,Math.min(1,Math.min(w/(b.maxX-b.minX),h/(b.maxY-b.minY))));pan={x:(flow.clientWidth-(b.maxX+b.minX)*zoom)/2,y:(flow.clientHeight-(b.maxY+b.minY)*zoom)/2};applyTransform()}
function resetView(){if(mode==='graph')fit();else{zoom=.82;pan={x:18,y:8};applyTransform()}}
function setMode(next){mode=next;selected=null;render();resetView();showToast(`${next==='topics'?'Topics':next[0].toUpperCase()+next.slice(1)} view`)}
function centerOnNode(id){const p=positions[id];if(!p)return;pan={x:flow.clientWidth/2-(p[0]+160)*zoom,y:flow.clientHeight/2-(p[1]+64)*zoom};applyTransform()}
function centerOnHeader(key){const h=layoutHeaders.find(x=>x.key===key);if(!h)return;pan.x=flow.clientWidth/2-(h.x+168)*zoom;applyTransform()}
function tidy(){if(mode!=='graph'){render();resetView();showToast('Layout refreshed');return}const depth=new Map();const getDepth=d=>{if(depth.has(d.id))return depth.get(d.id);const parents=d.parents.map(id=>decisions.find(x=>x.id===id)).filter(Boolean);const value=parents.length?1+Math.max(...parents.map(getDepth)):0;depth.set(d.id,value);return value};decisions.forEach(getDepth);const groups=new Map();decisions.forEach(d=>{const k=depth.get(d.id);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(d)});groups.forEach((items,k)=>items.forEach((d,i)=>graphPositions[d.id]=[80+k*440,40+i*180]));selected=null;render();fit();showToast('Layout tidied')}
function startNodeDrag(e,node){if(locked||mode!=='graph')return;e.stopPropagation();node.setPointerCapture(e.pointerId);const id=Number(node.dataset.id),start={x:e.clientX,y:e.clientY,px:graphPositions[id][0],py:graphPositions[id][1]};node.classList.add('drag-node');node.onpointermove=ev=>{graphPositions[id]=[start.px+(ev.clientX-start.x)/zoom,start.py+(ev.clientY-start.y)/zoom];node.style.left=`${graphPositions[id][0]}px`;node.style.top=`${graphPositions[id][1]}px`;renderMiniMap()};node.onpointerup=()=>{node.onpointermove=null;render()}}

function renderMiniMap(){
 if(mode!=='graph')return;minimap.querySelectorAll('span').forEach(x=>x.remove());const b=graphBounds(),pad=8;miniDomain={...b,padX:pad,padY:pad,scaleX:(minimap.clientWidth-pad*2)/(b.maxX-b.minX),scaleY:(minimap.clientHeight-pad*2)/(b.maxY-b.minY)};
 decisions.forEach(d=>{const s=document.createElement('span'),p=positions[d.id],klass=statusInfo[d.status][1];s.className=`${klass} ${selected===d.id?'selected':''}`;s.style.left=`${pad+(p[0]-b.minX)*miniDomain.scaleX}px`;s.style.top=`${pad+(p[1]-b.minY)*miniDomain.scaleY}px`;s.style.width=`${Math.max(8,320*miniDomain.scaleX)}px`;s.style.height=`${Math.max(5,128*miniDomain.scaleY)}px`;minimap.appendChild(s)});updateMiniViewport();
}
function updateMiniViewport(){if(mode!=='graph')return;const view=minimap.querySelector('i');if(!view||!flow.clientWidth)return;const d=miniDomain,gx=-pan.x/zoom,gy=-pan.y/zoom,gr=gx+flow.clientWidth/zoom,gb=gy+flow.clientHeight/zoom;const cl=Math.max(d.minX,gx),ct=Math.max(d.minY,gy),cr=Math.min(d.maxX,gr),cb=Math.min(d.maxY,gb);view.style.left=`${d.padX+(cl-d.minX)*d.scaleX}px`;view.style.top=`${d.padY+(ct-d.minY)*d.scaleY}px`;view.style.width=`${Math.max(6,(cr-cl)*d.scaleX)}px`;view.style.height=`${Math.max(6,(cb-ct)*d.scaleY)}px`}
function panFromMiniEvent(e){const r=minimap.getBoundingClientRect(),d=miniDomain,gx=d.minX+(e.clientX-r.left-d.padX)/d.scaleX,gy=d.minY+(e.clientY-r.top-d.padY)/d.scaleY;pan={x:flow.clientWidth/2-gx*zoom,y:flow.clientHeight/2-gy*zoom};applyTransform()}
function updateTopicSelect(){const select=document.getElementById('topicSelect'),value=select.value,topics=[...new Set(decisions.map(d=>d.topic))].sort();select.innerHTML='<option value="">Topics</option>'+topics.map(t=>`<option value="${t}">${t} (${decisions.filter(d=>d.topic===t).length})</option>`).join('');if(topics.includes(value))select.value=value}
function showToast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1500)}
function selectedDecision(){return decisions.find(d=>d.id===selected)}
function createDecision(parent=null){const title=window.prompt(parent?'Follow-up decision title':'New decision title',parent?'New follow-up':'Untitled decision');if(title===null)return;const id=Math.max(0,...decisions.map(d=>d.id))+1,seq=Math.max(0,...decisions.map(d=>d.seq))+1,topic=parent?.topic||'Campaign strategy';decisions.push({id,seq,title:title.trim()||'Untitled decision',topic,status:'DRAFT',createdAt:new Date().toISOString().slice(0,10),parents:parent?[parent.id]:[]});const anchor=parent?graphPositions[parent.id]:[80,80];graphPositions[id]=[anchor[0]+440,anchor[1]+140];selected=id;render();if(mode==='graph')centerOnNode(id);showToast(parent?'Follow-up added':'Decision created')}

flow.onpointerdown=e=>{if(locked||e.target.closest('button')||e.target.closest('.layout-column'))return;canvasDrag={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};flow.setPointerCapture(e.pointerId);flow.classList.add('dragging')};flow.onpointermove=e=>{if(!canvasDrag)return;pan={x:canvasDrag.px+e.clientX-canvasDrag.x,y:canvasDrag.py+e.clientY-canvasDrag.y};applyTransform()};flow.onpointerup=()=>{canvasDrag=null;flow.classList.remove('dragging')};flow.onwheel=e=>{if(locked)return;e.preventDefault();const r=flow.getBoundingClientRect();setZoom(zoom-e.deltaY*.001,e.clientX-r.left,e.clientY-r.top)},{passive:false};
minimap.onpointerdown=e=>{if(mode!=='graph')return;e.stopPropagation();minimapDrag=true;minimap.setPointerCapture(e.pointerId);minimap.classList.add('dragging');panFromMiniEvent(e)};minimap.onpointermove=e=>{if(minimapDrag)panFromMiniEvent(e)};minimap.onpointerup=e=>{minimapDrag=false;minimap.classList.remove('dragging');minimap.releasePointerCapture(e.pointerId)};
function bind(id,handler){const element=document.getElementById(id);if(element)element.onclick=handler}
bind('zoomIn',()=>setZoom(zoom+.05));bind('zoomOut',()=>setZoom(zoom-.05));bind('controlIn',()=>setZoom(zoom+.1));bind('controlOut',()=>setZoom(zoom-.1));bind('navZoomIn',()=>setZoom(zoom+.1));bind('navZoomOut',()=>setZoom(zoom-.1));bind('fit',resetView);bind('fitHeader',resetView);bind('tidy',tidy);
bind('lock',e=>{locked=!locked;e.currentTarget.textContent=locked?'▣':'⌑';showToast(locked?'View locked':'View unlocked')});
bind('pin',e=>{pinned=!pinned;locked=pinned;e.currentTarget.classList.toggle('pinned',pinned);e.currentTarget.lastChild.textContent=pinned?' View pinned':' Pin view';showToast(pinned?'View pinned':'View unpinned')});
bind('newDecision',()=>createDecision());bind('addFollowup',()=>{const d=selectedDecision();if(!d){showToast('Select a decision first');return}createDecision(d)});
bind('editDecision',()=>{const d=selectedDecision();if(!d){showToast('Select a decision first');return}const title=window.prompt('Edit decision title',d.title);if(title!==null&&title.trim()){d.title=title.trim();render();showToast('Decision updated')}});
bind('deleteDecision',()=>{const d=selectedDecision();if(!d){showToast('Select a decision first');return}if(!window.confirm(`Delete “${d.title}”?`))return;decisions=decisions.filter(x=>x.id!==d.id);decisions.forEach(x=>x.parents=x.parents.filter(id=>id!==d.id));delete graphPositions[d.id];selected=null;render();showToast('Decision deleted')});
const trigger=document.getElementById('toolTrigger'),menu=document.getElementById('toolsMenu');trigger.onclick=e=>{e.stopPropagation();menu.hidden=!menu.hidden;trigger.setAttribute('aria-expanded',String(!menu.hidden))};document.addEventListener('click',e=>{if(!e.target.closest('.tools-wrap')){menu.hidden=true;trigger.setAttribute('aria-expanded','false')}});
bind('mapToggle',e=>{const open=e.currentTarget.getAttribute('aria-expanded')==='true';e.currentTarget.setAttribute('aria-expanded',String(!open));minimap.hidden=open;e.currentTarget.querySelector('span').textContent=open?'Map':'Hide'});
document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>setMode(button.dataset.mode));
const dateInput=document.getElementById('dateInput'),dates=decisions.map(d=>d.createdAt).sort();dateInput.min=dates[0];dateInput.max=new Date().toISOString().slice(0,10);
bind('dateGo',()=>{if(!dateInput.value)return;setMode('day');centerOnHeader(dateInput.value)});bind('today',()=>{dateInput.value=new Date().toISOString().slice(0,10);setMode('day');centerOnHeader(dateInput.value)});
document.getElementById('topicSelect').onchange=e=>{if(!e.target.value)return;setMode('topics');document.getElementById('topicSelect').value=e.target.value;centerOnHeader(e.target.value)};
const search=document.getElementById('titleSearch'),results=document.getElementById('searchResults');function runSearch(){const q=search.value.trim().toLowerCase();if(!q){results.hidden=true;return}const matches=decisions.filter(d=>d.title.toLowerCase().includes(q)||`#${d.seq}`.includes(q)).slice(0,8);results.innerHTML=matches.length?matches.map(d=>`<button data-result="${d.id}"><b>${d.title}</b><small>#${d.seq} · ${d.createdAt}</small></button>`).join(''):'<button><small>No matching decisions</small></button>';results.hidden=false;results.querySelectorAll('[data-result]').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.result);results.hidden=true;render();centerOnNode(selected)})}search.oninput=runSearch;search.onkeydown=e=>{if(e.key==='Enter'){const first=results.querySelector('[data-result]');if(first)first.click()}};
window.addEventListener('resize',()=>{renderMiniMap();resetView()});render();resetView();
