const decisions=[
 {id:1,seq:1,title:'Choose creator-led launch strategy',topic:'Campaign strategy',status:'COMMITTED',parents:[]},
 {id:2,seq:2,title:'Prioritise first-time founders',topic:'Audience',status:'REVIEWED',parents:[1]},
 {id:3,seq:3,title:'Start with TikTok and Instagram',topic:'Channel mix',status:'AWAITING_APPROVAL',parents:[1]},
 {id:4,seq:4,title:'Build three reusable story angles',topic:'Creative system',status:'COMMITTED',parents:[2,3]},
 {id:5,seq:5,title:'Optimise for qualified trials',topic:'Measurement',status:'DRAFT',parents:[3]},
 {id:6,seq:6,title:'Run a 14-day creative sprint',topic:'Experiment',status:'REVIEWED',parents:[4,5]}
];
const basePositions={1:[105,310],2:[545,105],3:[545,505],4:[1005,105],5:[1005,505],6:[1445,310]};
let positions=JSON.parse(JSON.stringify(basePositions));let zoom=.7,pan={x:20,y:-30},selected=null,canvasDrag=null,nodeDrag=null,locked=false,pinned=false;
const flow=document.querySelector('#flow'),stage=document.querySelector('#stage'),zoomValue=document.querySelector('#zoomValue'),minimap=document.querySelector('#minimap');
const statusInfo={COMMITTED:['Committed','committed'],REVIEWED:['Reviewed','reviewed'],AWAITING_APPROVAL:['Awaiting Approval','approval'],DRAFT:['Draft','draft']};
function edge(from,to){const a=positions[from],b=positions[to],sx=a[0]+320,sy=a[1]+64,ex=b[0],ey=b[1]+64,mx=sx+Math.max(45,(ex-sx)/2);return `<span class="edge-h" style="left:${sx}px;top:${sy}px;width:${mx-sx}px"></span><span class="edge-v" style="left:${mx}px;top:${Math.min(sy,ey)}px;height:${Math.abs(ey-sy)}px"></span><span class="edge-h edge-end" style="left:${mx}px;top:${ey}px;width:${ex-mx}px"></span>`}
function render(){
 let html='';decisions.forEach(d=>d.parents.forEach(p=>html+=edge(p,d.id)));
 decisions.forEach(d=>{const [label,klass]=statusInfo[d.status],p=positions[d.id];html+=`<button class="decision-node ${selected===d.id?'selected':''}" data-id="${d.id}" style="left:${p[0]}px;top:${p[1]}px"><i class="handle left"></i><i class="handle right"></i><span class="node-top"><span class="status ${klass}">${label}</span><span class="meta">#${d.seq}</span></span><span class="node-title">${d.title}</span><span class="node-topic">${d.topic}</span></button>`});
 stage.innerHTML=html;applyTransform();stage.querySelectorAll('.decision-node').forEach(node=>{node.onclick=e=>{e.stopPropagation();selected=Number(node.dataset.id);render()};node.onpointerdown=e=>startNodeDrag(e,node)});renderMiniMap();
}
function applyTransform(){stage.style.transform=`translate(${pan.x}px,${pan.y}px) scale(${zoom})`;zoomValue.textContent=`${Math.round(zoom*100)}%`}
function setZoom(next){zoom=Math.max(.1,Math.min(1.9,Math.round(next*100)/100));applyTransform()}
function fit(){zoom=.7;pan={x:20,y:-30};applyTransform()}
function tidy(){positions=JSON.parse(JSON.stringify(basePositions));selected=null;fit();render()}
function startNodeDrag(e,node){if(locked)return;e.stopPropagation();node.setPointerCapture(e.pointerId);const id=Number(node.dataset.id),start={x:e.clientX,y:e.clientY,px:positions[id][0],py:positions[id][1]};node.classList.add('drag-node');node.onpointermove=ev=>{positions[id]=[start.px+(ev.clientX-start.x)/zoom,start.py+(ev.clientY-start.y)/zoom];render()};node.onpointerup=()=>{nodeDrag=null;render()}}
function renderMiniMap(){minimap.querySelectorAll('span').forEach(x=>x.remove());decisions.forEach(d=>{const [,,klass]=[...statusInfo[d.status],statusInfo[d.status][1]],s=document.createElement('span');s.className=`${klass} ${selected===d.id?'selected':''}`;s.style.left=10+positions[d.id][0]/9.5+'px';s.style.top=10+positions[d.id][1]/8+'px';s.style.width='34px';minimap.appendChild(s)})}
flow.onpointerdown=e=>{if(locked||e.target.closest('button'))return;canvasDrag={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};flow.setPointerCapture(e.pointerId);flow.classList.add('dragging')};flow.onpointermove=e=>{if(!canvasDrag)return;pan={x:canvasDrag.px+e.clientX-canvasDrag.x,y:canvasDrag.py+e.clientY-canvasDrag.y};applyTransform()};flow.onpointerup=()=>{canvasDrag=null;flow.classList.remove('dragging')};flow.onwheel=e=>{if(locked)return;e.preventDefault();setZoom(zoom-e.deltaY*.001)},{passive:false};
document.querySelector('#zoomIn').onclick=()=>setZoom(zoom+.05);document.querySelector('#zoomOut').onclick=()=>setZoom(zoom-.05);document.querySelector('#controlIn').onclick=()=>setZoom(zoom+.1);document.querySelector('#controlOut').onclick=()=>setZoom(zoom-.1);document.querySelector('#fit').onclick=fit;document.querySelector('#fitHeader').onclick=fit;document.querySelector('#tidy').onclick=tidy;
document.querySelector('#lock').onclick=e=>{locked=!locked;e.currentTarget.textContent=locked?'▣':'⌑';e.currentTarget.title=locked?'Unlock view':'Lock view'};
const trigger=document.querySelector('#toolTrigger'),menu=document.querySelector('#toolsMenu');trigger.onclick=e=>{e.stopPropagation();menu.hidden=!menu.hidden;trigger.setAttribute('aria-expanded',String(!menu.hidden))};document.addEventListener('click',e=>{if(!e.target.closest('.tools-wrap')){menu.hidden=true;trigger.setAttribute('aria-expanded','false')}});
document.querySelector('#pin').onclick=e=>{pinned=!pinned;e.currentTarget.classList.toggle('pinned',pinned);e.currentTarget.lastChild.textContent=pinned?' View pinned':' Pin view'};
document.querySelector('#mapToggle').onclick=e=>{const open=e.currentTarget.getAttribute('aria-expanded')==='true';e.currentTarget.setAttribute('aria-expanded',String(!open));minimap.hidden=open;e.currentTarget.querySelector('span').textContent=open?'Map':'Hide'};render();
