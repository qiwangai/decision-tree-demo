const decisions=[
 {id:1,seq:1,title:'Define the product launch objective',topic:'Campaign strategy',status:'COMMITTED',parents:[]},
 {id:2,seq:2,title:'Prioritise first-time founders',topic:'Audience',status:'REVIEWED',parents:[1]},
 {id:3,seq:3,title:'Lead with the time-saving promise',topic:'Positioning',status:'COMMITTED',parents:[1]},
 {id:4,seq:4,title:'Use a creator-led launch strategy',topic:'Campaign strategy',status:'COMMITTED',parents:[1]},
 {id:5,seq:5,title:'Set qualified trials as the north-star metric',topic:'Measurement',status:'REVIEWED',parents:[1]},
 {id:6,seq:6,title:'Focus the message on lean marketing teams',topic:'Audience',status:'AWAITING_APPROVAL',parents:[2,3]},
 {id:7,seq:7,title:'Build three reusable story angles',topic:'Creative system',status:'COMMITTED',parents:[3,4]},
 {id:8,seq:8,title:'Start with TikTok and Instagram',topic:'Channel mix',status:'REVIEWED',parents:[4]},
 {id:9,seq:9,title:'Pair creator content with founder proof',topic:'Content strategy',status:'DRAFT',parents:[4,6]},
 {id:10,seq:10,title:'Create a product-led landing page',topic:'Conversion',status:'COMMITTED',parents:[3,5]},
 {id:11,seq:11,title:'Track activation within the first session',topic:'Measurement',status:'AWAITING_APPROVAL',parents:[5]},
 {id:12,seq:12,title:'Run a 14-day creative sprint',topic:'Experiment',status:'REVIEWED',parents:[7,8]},
 {id:13,seq:13,title:'Test founder and customer narratives',topic:'Creative system',status:'DRAFT',parents:[7,9]},
 {id:14,seq:14,title:'Retarget high-intent site visitors',topic:'Paid distribution',status:'AWAITING_APPROVAL',parents:[8,10]},
 {id:15,seq:15,title:'Optimise onboarding for qualified trials',topic:'Conversion',status:'COMMITTED',parents:[10,11]},
 {id:16,seq:16,title:'Review channel quality every Friday',topic:'Measurement',status:'REVIEWED',parents:[11]},
 {id:17,seq:17,title:'Scale the winning creator narrative',topic:'Growth',status:'AWAITING_APPROVAL',parents:[12,13,14]},
 {id:18,seq:18,title:'Shift budget toward retained accounts',topic:'Growth',status:'DRAFT',parents:[14,15,16]}
];
const basePositions={1:[80,425],2:[520,0],3:[520,260],4:[520,520],5:[520,780],6:[960,0],7:[960,170],8:[960,340],9:[960,510],10:[960,680],11:[960,850],12:[1400,50],13:[1400,250],14:[1400,450],15:[1400,650],16:[1400,850],17:[1840,280],18:[1840,650]};
let positions=JSON.parse(JSON.stringify(basePositions));
let zoom=.45,pan={x:20,y:20},selected=null,canvasDrag=null,locked=false,pinned=false,minimapDrag=false;
let miniDomain={minX:0,minY:0,maxX:2200,maxY:1550,scaleX:1,scaleY:1,padX:8,padY:8};
const flow=document.getElementById('flow'),stage=document.getElementById('stage'),zoomValue=document.getElementById('zoomValue'),minimap=document.getElementById('minimap');
const statusInfo={COMMITTED:['Committed','committed'],REVIEWED:['Reviewed','reviewed'],AWAITING_APPROVAL:['Awaiting Approval','approval'],DRAFT:['Draft','draft']};

function edge(from,to){
 const a=positions[from],b=positions[to],sx=a[0]+320,sy=a[1]+64,ex=b[0],ey=b[1]+64,mx=sx+Math.max(45,(ex-sx)/2);
 return `<span class="edge-h" style="left:${sx}px;top:${sy}px;width:${Math.max(0,mx-sx)}px"></span><span class="edge-v" style="left:${mx}px;top:${Math.min(sy,ey)}px;height:${Math.abs(ey-sy)}px"></span><span class="edge-h edge-end" style="left:${mx}px;top:${ey}px;width:${Math.max(0,ex-mx)}px"></span>`;
}
function render(){
 let html='';decisions.forEach(d=>d.parents.forEach(p=>html+=edge(p,d.id)));
 decisions.forEach(d=>{const [label,klass]=statusInfo[d.status],p=positions[d.id];html+=`<button class="decision-node ${selected===d.id?'selected':''}" data-id="${d.id}" style="left:${p[0]}px;top:${p[1]}px"><i class="handle left"></i><i class="handle right"></i><span class="node-top"><span class="status ${klass}">${label}</span><span class="meta">#${d.seq}</span></span><span class="node-title">${d.title}</span><span class="node-topic">${d.topic}</span></button>`});
 stage.innerHTML=html;applyTransform();stage.querySelectorAll('.decision-node').forEach(node=>{node.onclick=e=>{e.stopPropagation();selected=Number(node.dataset.id);render()};node.onpointerdown=e=>startNodeDrag(e,node)});renderMiniMap();
}
function applyTransform(){stage.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;zoomValue.textContent=`${Math.round(zoom*100)}%`;updateMiniViewport()}
function setZoom(next,anchorX=flow.clientWidth/2,anchorY=flow.clientHeight/2){
 const old=zoom;zoom=Math.max(.1,Math.min(1.9,Math.round(next*100)/100));
 const graphX=(anchorX-pan.x)/old,graphY=(anchorY-pan.y)/old;pan={x:anchorX-graphX*zoom,y:anchorY-graphY*zoom};applyTransform();
}
function graphBounds(){const xs=Object.values(positions).map(p=>p[0]),ys=Object.values(positions).map(p=>p[1]);return {minX:Math.min(...xs),minY:Math.min(...ys),maxX:Math.max(...xs)+320,maxY:Math.max(...ys)+128}}
function fit(){
 const b=graphBounds(),margin=70,w=Math.max(1,flow.clientWidth-margin*2),h=Math.max(1,flow.clientHeight-margin*2);
 zoom=Math.max(.1,Math.min(1,Math.min(w/(b.maxX-b.minX),h/(b.maxY-b.minY))));
 pan={x:(flow.clientWidth-(b.maxX+b.minX)*zoom)/2,y:(flow.clientHeight-(b.maxY+b.minY)*zoom)/2};applyTransform();
}
function tidy(){positions=JSON.parse(JSON.stringify(basePositions));selected=null;fit();render()}
function startNodeDrag(e,node){if(locked)return;e.stopPropagation();node.setPointerCapture(e.pointerId);const id=Number(node.dataset.id),start={x:e.clientX,y:e.clientY,px:positions[id][0],py:positions[id][1]};node.classList.add('drag-node');node.onpointermove=ev=>{positions[id]=[start.px+(ev.clientX-start.x)/zoom,start.py+(ev.clientY-start.y)/zoom];render()};node.onpointerup=()=>{node.onpointermove=null;render()}}

function renderMiniMap(){
 minimap.querySelectorAll('span').forEach(x=>x.remove());const b=graphBounds(),pad=8;
 miniDomain={...b,padX:pad,padY:pad,scaleX:(minimap.clientWidth-pad*2)/(b.maxX-b.minX),scaleY:(minimap.clientHeight-pad*2)/(b.maxY-b.minY)};
 decisions.forEach(d=>{const s=document.createElement('span'),p=positions[d.id],klass=statusInfo[d.status][1];s.className=`${klass} ${selected===d.id?'selected':''}`;s.style.left=`${pad+(p[0]-b.minX)*miniDomain.scaleX}px`;s.style.top=`${pad+(p[1]-b.minY)*miniDomain.scaleY}px`;s.style.width=`${Math.max(8,320*miniDomain.scaleX)}px`;s.style.height=`${Math.max(5,128*miniDomain.scaleY)}px`;minimap.appendChild(s)});updateMiniViewport();
}
function updateMiniViewport(){
 const view=minimap.querySelector('i');if(!view||!flow.clientWidth)return;const d=miniDomain;
 const gx=-pan.x/zoom,gy=-pan.y/zoom,gw=flow.clientWidth/zoom,gh=flow.clientHeight/zoom;
 const left=d.padX+(gx-d.minX)*d.scaleX,top=d.padY+(gy-d.minY)*d.scaleY;
 view.style.left=`${Math.max(0,Math.min(minimap.clientWidth-6,left))}px`;view.style.top=`${Math.max(0,Math.min(minimap.clientHeight-6,top))}px`;
 view.style.width=`${Math.max(8,Math.min(minimap.clientWidth-Math.max(0,left),gw*d.scaleX))}px`;view.style.height=`${Math.max(8,Math.min(minimap.clientHeight-Math.max(0,top),gh*d.scaleY))}px`;
}
function panFromMiniEvent(e){
 const r=minimap.getBoundingClientRect(),d=miniDomain;
 const gx=d.minX+(e.clientX-r.left-d.padX)/d.scaleX,gy=d.minY+(e.clientY-r.top-d.padY)/d.scaleY;
 pan={x:flow.clientWidth/2-gx*zoom,y:flow.clientHeight/2-gy*zoom};applyTransform();
}

render();
flow.onpointerdown=e=>{if(locked||e.target.closest('button'))return;canvasDrag={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};flow.setPointerCapture(e.pointerId);flow.classList.add('dragging')};
flow.onpointermove=e=>{if(!canvasDrag)return;pan={x:canvasDrag.px+e.clientX-canvasDrag.x,y:canvasDrag.py+e.clientY-canvasDrag.y};applyTransform()};
flow.onpointerup=()=>{canvasDrag=null;flow.classList.remove('dragging')};
flow.onwheel=e=>{if(locked)return;e.preventDefault();const r=flow.getBoundingClientRect();setZoom(zoom-e.deltaY*.001,e.clientX-r.left,e.clientY-r.top)},{passive:false};
minimap.onpointerdown=e=>{e.stopPropagation();minimapDrag=true;minimap.setPointerCapture(e.pointerId);minimap.classList.add('dragging');panFromMiniEvent(e)};
minimap.onpointermove=e=>{if(minimapDrag)panFromMiniEvent(e)};
minimap.onpointerup=e=>{minimapDrag=false;minimap.classList.remove('dragging');minimap.releasePointerCapture(e.pointerId)};
function bind(id,handler){const element=document.getElementById(id);if(element)element.onclick=handler}
bind('zoomIn',()=>setZoom(zoom+.05));bind('zoomOut',()=>setZoom(zoom-.05));bind('controlIn',()=>setZoom(zoom+.1));bind('controlOut',()=>setZoom(zoom-.1));bind('fit',fit);bind('fitHeader',fit);bind('tidy',tidy);
bind('lock',e=>{locked=!locked;e.currentTarget.textContent=locked?'▣':'⌑';e.currentTarget.title=locked?'Unlock view':'Lock view'});
const trigger=document.getElementById('toolTrigger'),menu=document.getElementById('toolsMenu');if(trigger&&menu)trigger.onclick=e=>{e.stopPropagation();menu.hidden=!menu.hidden;trigger.setAttribute('aria-expanded',String(!menu.hidden))};document.addEventListener('click',e=>{if(trigger&&menu&&!e.target.closest('.tools-wrap')){menu.hidden=true;trigger.setAttribute('aria-expanded','false')}});
bind('pin',e=>{pinned=!pinned;e.currentTarget.classList.toggle('pinned',pinned);e.currentTarget.lastChild.textContent=pinned?' View pinned':' Pin view'});
bind('mapToggle',e=>{const open=e.currentTarget.getAttribute('aria-expanded')==='true';e.currentTarget.setAttribute('aria-expanded',String(!open));minimap.hidden=open;e.currentTarget.querySelector('span').textContent=open?'Map':'Hide'});
window.addEventListener('resize',()=>{renderMiniMap();fit()});requestAnimationFrame(fit);
