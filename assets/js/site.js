/* Biswas Geosystems Research Group — site behavior.
   Each feature only runs on pages that contain it. Content comes from the _data folder. */
(function(){
"use strict";
var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
var root = document.documentElement;
if (RM) root.classList.add("static");
function $(s){return document.querySelector(s)}
function $$(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function sstep(a,b,v){var x=clamp((v-a)/(b-a),0,1);return x*x*(3-2*x)}
var seed=11;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

/* ---------------- toast, theme, menu ---------------- */
var toastEl=$("#toast"),tt;
function say(m){toastEl.textContent=m;toastEl.hidden=false;clearTimeout(tt);tt=setTimeout(function(){toastEl.hidden=true},2800)}

try{var saved=localStorage.getItem("bg-theme");if(saved)root.setAttribute("data-theme",saved)}catch(e){}
$("#theme-btn").addEventListener("click",function(){
  var t=root.getAttribute("data-theme"),dark=t?t==="dark":(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches);
  var next=dark?"light":"dark";root.setAttribute("data-theme",next);try{localStorage.setItem("bg-theme",next)}catch(e){}
  if($("#chart")&&window.__drawChart)window.__drawChart();
});

var overlay=$("#overlay"),menuBtn=$("#menu-btn");
function openMenu(){overlay.hidden=false;menuBtn.setAttribute("aria-expanded","true");document.body.style.overflow="hidden";$("#menu-close").focus()}
function closeMenu(){if(overlay.hidden)return;overlay.hidden=true;menuBtn.setAttribute("aria-expanded","false");document.body.style.overflow="";menuBtn.focus()}
menuBtn.addEventListener("click",openMenu);
$("#menu-close").addEventListener("click",closeMenu);
overlay.addEventListener("click",function(e){if(e.target.closest("a"))closeMenu()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeMenu()});

/* ---------------- HERO: live cross-section + descent (home page only) ---------------- */
var heroScroll=null;
if($("#sea")){
var cv=$("#sea"),ctx=cv.getContext("2d"),descent=$("#top"),stage=$("#stage");
var W,H,WH,DPR,toeX,crestX,topY,seaY,beachX,off,surfA=[],STEP=4,pts=[],edges=[],parts=[];
var p=0,camY=0,storm=.4,stormT=.4,lastPointer=-1e9,t=0,heroOn=true,last=performance.now(),mobile=false;
var STRATA=["#D2B48A","#B79A70","#987B57","#765E45","#524235","#33291F"];

function surf(x){
  if(x<beachX){var u=x/beachX;return seaY+H*.2*Math.pow(1-u,1.5)+10}
  if(x<toeX){var v=(x-beachX)/(toeX-beachX);return seaY+10-v*16}
  if(x<crestX){var w=(x-toeX)/(crestX-toeX);return (seaY-6)+(topY-(seaY-6))*(1-Math.pow(1-w,2.4))}
  return topY-(x-crestX)*.012;
}
function base(i,x){return topY+H*(.2+.38*i)+Math.sin(x*.0032+i*1.7)*H*.03-(x/W)*H*.06}
function bound(i,x){return Math.max(surf(x)+(i===0?H*.025:H*.05*i),base(i,x))}

function build(){
  var r=cv.getBoundingClientRect();W=Math.max(320,r.width);H=Math.max(480,r.height);
  DPR=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  mobile=W<760;WH=RM?H:H*2.7;
  seaY=H*(mobile?.76:.78);topY=H*(mobile?.6:.5);
  toeX=W*(mobile?.44:.60);crestX=toeX+W*(mobile?.14:.075);beachX=toeX-W*.1;
  surfA=[];for(var x=0;x<=W+STEP;x+=STEP)surfA.push(surf(x));
  seed=11;
  var od=Math.min(DPR,1.5);if(W*WH*od*od>9e6)od=Math.sqrt(9e6/(W*WH));
  off=document.createElement("canvas");off.width=Math.round(W*od);off.height=Math.round(WH*od);
  var o=off.getContext("2d");o.scale(od,od);
  o.save();o.beginPath();o.moveTo(0,WH);for(var i=0;i<surfA.length;i++)o.lineTo(i*STEP,surfA[i]);o.lineTo(W,WH);o.closePath();o.clip();
  o.fillStyle=STRATA[0];o.fillRect(0,0,W,WH);
  for(var L=0;L<5;L++){
    o.beginPath();o.moveTo(0,WH);for(var x2=0;x2<=W+STEP;x2+=STEP)o.lineTo(x2,bound(L,x2));o.lineTo(W,WH);o.closePath();o.fillStyle=STRATA[L+1];o.fill();
    o.beginPath();for(var x3=0;x3<=W+STEP;x3+=STEP){var yy=bound(L,x3);if(x3)o.lineTo(x3,yy);else o.moveTo(x3,yy)}
    o.strokeStyle="rgba(20,14,8,.25)";o.lineWidth=1;o.stroke();
  }
  var n=Math.round(W*WH/80);
  for(var k=0;k<n;k++){var gx=rnd()*W,gy=rnd()*WH,a=rnd(),s=.6+rnd()*1.5;
    o.fillStyle=a>.5?"rgba(255,240,215,"+(.04+rnd()*.08).toFixed(3)+")":"rgba(25,15,5,"+(.05+rnd()*.1).toFixed(3)+")";o.fillRect(gx,gy,s,s)}
  for(var q=0;q<W*.22;q++){var px=rnd()*W,y1=bound(1,px),y2=bound(2,px),py=y1+rnd()*(y2-y1),pr=2+rnd()*5;
    o.beginPath();o.ellipse(px,py,pr*1.4,pr,rnd()*3,0,7);o.fillStyle="rgba(60,45,30,"+(.25+rnd()*.3).toFixed(2)+")";o.fill()}
  if(!RM){var g=o.createLinearGradient(0,WH-H*1.15,0,WH);g.addColorStop(0,"rgba(5,13,20,0)");g.addColorStop(.5,"rgba(5,13,20,.8)");g.addColorStop(1,"rgba(5,13,20,1)");o.fillStyle=g;o.fillRect(0,WH-H*1.15,W,H*1.15)}
  o.restore();
  var st=Math.floor(beachX/STEP);o.beginPath();for(var i2=st;i2<surfA.length;i2++){if(i2===st)o.moveTo(i2*STEP,surfA[i2]);else o.lineTo(i2*STEP,surfA[i2])}
  o.strokeStyle="rgba(235,203,159,.6)";o.lineWidth=1.4;o.stroke();
  pts=[];edges=[];var sp=mobile?34:44,y0=WH-H*.95,yb=WH-H*.1,cols=Math.ceil(W/sp)+1,rows=Math.ceil((yb-y0)/sp)+1,idx={};
  for(var rr=0;rr<rows;rr++)for(var cc=0;cc<cols;cc++){idx[rr+","+cc]=pts.length;pts.push([cc*sp+(rr%2?sp/2:0)+(rnd()-.5)*sp*.5,y0+rr*sp+(rnd()-.5)*sp*.5,rnd()])}
  for(var r2=0;r2<rows;r2++)for(var c2=0;c2<cols;c2++){var a1=idx[r2+","+c2];
    if(idx[r2+","+(c2+1)]!=null)edges.push([a1,idx[r2+","+(c2+1)]]);
    if(idx[(r2+1)+","+c2]!=null)edges.push([a1,idx[(r2+1)+","+c2]]);
    if(r2%2===0&&idx[(r2+1)+","+(c2-1)]!=null)edges.push([a1,idx[(r2+1)+","+(c2-1)]]);
    if(r2%2===1&&idx[(r2+1)+","+(c2+1)]!=null)edges.push([a1,idx[(r2+1)+","+(c2+1)]]);}
}
function wy(x){var A=3+storm*16;return seaY-storm*H*.028+A*(.6*Math.sin(x*.011-t*1.2)+.3*Math.sin(x*.026+t*1.8)+.14*Math.sin(x*.053-t*2.7))}
function shoreX(){for(var x=beachX-W*.06;x<crestX;x+=2){if(surf(x)<=wy(x))return x}return toeX}
function label(c,txt,x,y,dark){c.font="500 11px 'JetBrains Mono', ui-monospace, monospace";c.fillStyle=dark?"rgba(32,22,12,.78)":"rgba(234,240,242,.72)";c.fillText(txt.toUpperCase(),x,y)}

function drawSat(c){
  var sx=W*(mobile?.84:.8)+Math.sin(t*.07)*W*.04,sy=H*(mobile?.1:.13);
  var tx1=crestX+W*.03,tx2=crestX+W*(mobile?.12:.2);
  c.save();c.setLineDash([5,8]);c.lineDashOffset=-t*30;c.strokeStyle="rgba(235,203,159,.55)";c.lineWidth=1.2;
  c.beginPath();c.moveTo(sx,sy);c.lineTo(tx1,surf(tx1));c.moveTo(sx,sy);c.lineTo(tx2,surf(tx2));c.stroke();c.restore();
  c.save();c.translate(sx,sy);c.rotate(-.32);c.fillStyle="#EAF0F2";c.fillRect(-8,-6,16,12);c.strokeStyle="#EAF0F2";c.lineWidth=1.3;
  c.strokeRect(-38,-4,26,8);c.strokeRect(12,-4,26,8);c.restore();
  if(!mobile)label(c,"InSAR line of sight",sx-200,sy+8);
}

function frame(){
  var c=ctx;c.setTransform(DPR,0,0,DPR,0,0);c.fillStyle="#050D14";c.fillRect(0,0,W,H);
  c.setTransform(DPR,0,0,DPR,0,-camY*DPR);
  if(camY<seaY+40){
    var sg=c.createLinearGradient(0,0,0,seaY);sg.addColorStop(0,"#081521");sg.addColorStop(1,"#1B4058");c.fillStyle=sg;c.fillRect(0,0,W,seaY+60);
    var gl=c.createRadialGradient(W*.78,H*.08,0,W*.78,H*.08,W*.5);gl.addColorStop(0,"rgba(127,209,195,.17)");gl.addColorStop(1,"rgba(127,209,195,0)");c.fillStyle=gl;c.fillRect(0,0,W,seaY);
    drawSat(c);
  }
  c.drawImage(off,0,0,W,WH);
  var sx=shoreX(),water=new Path2D();water.moveTo(0,wy(0));
  for(var x=6;x<=sx;x+=6)water.lineTo(x,wy(x));water.lineTo(sx,surf(sx));
  for(var x2=Math.floor(sx/STEP)*STEP;x2>=0;x2-=STEP)water.lineTo(x2,surf(x2));water.closePath();
  var wg=c.createLinearGradient(0,seaY-30,0,seaY+H*.3);wg.addColorStop(0,"rgba(46,115,131,.94)");wg.addColorStop(1,"rgba(10,34,50,.97)");
  c.fillStyle=wg;c.fill(water);
  c.save();c.clip(water);
  for(var k=1;k<=4;k++){c.beginPath();for(var x3=0;x3<=sx;x3+=8){var y3=wy(x3+k*40)+k*16+Math.sin(x3*.02+t+k)*2;if(x3)c.lineTo(x3,y3);else c.moveTo(x3,y3)}
    c.strokeStyle="rgba(127,209,195,"+(.22/k).toFixed(3)+")";c.lineWidth=1;c.stroke()}
  c.restore();
  c.beginPath();for(var x4=0;x4<=sx;x4+=5){if(x4)c.lineTo(x4,wy(x4));else c.moveTo(0,wy(0))}
  c.strokeStyle="rgba(160,226,214,.85)";c.lineWidth=1.6;c.stroke();
  c.strokeStyle="rgba(240,248,248,"+(.45+storm*.45).toFixed(2)+")";c.lineWidth=2;
  for(var f=0;f<3;f++){var fx=sx-8-f*14-Math.sin(t*2+f)*4;c.beginPath();c.arc(fx,wy(fx)+2,5+f*2+storm*6,Math.PI*1.1,Math.PI*1.9);c.stroke()}
  if(!RM&&storm>.22&&rnd()<storm*storm*1.6){
    for(var s=0;s<2;s++){var ex=sx+rnd()*(crestX-toeX)*.3;parts.push({x:ex,y:surf(ex)+1,vx:-(.3+rnd()*1.5),vy:-rnd()*.8,l:1,r:.9+rnd()*1.6})}
  }
  for(var pi=parts.length-1;pi>=0;pi--){var q=parts[pi];q.vy+=.05;q.x+=q.vx;q.y+=q.vy;
    if(q.y>wy(q.x)){q.vx*=.95;q.vy*=.35}q.l-=.011;if(q.l<=0||q.x<0){parts.splice(pi,1);continue}
    c.fillStyle="rgba(222,196,150,"+q.l.toFixed(2)+")";c.fillRect(q.x,q.y,q.r,q.r)}
  if(parts.length>220)parts.splice(0,parts.length-220);
  var gy0=topY+H*.17-storm*H*.045,ex2=sx+6,ey2=Math.max(wy(sx)+3,surf(ex2)+3);
  c.save();c.setLineDash([9,7]);c.lineDashOffset=t*26;c.strokeStyle="rgba(127,209,195,.9)";c.lineWidth=1.8;
  c.beginPath();c.moveTo(W,gy0);c.quadraticCurveTo(crestX+W*.08,gy0+H*.03,ex2,ey2);c.stroke();c.restore();
  if(!mobile){
    c.strokeStyle="rgba(234,240,242,.45)";c.lineWidth=1;c.beginPath();c.moveTo(sx-6,wy(sx)-12);c.lineTo(sx-6,seaY-H*.12);c.lineTo(sx-120,seaY-H*.12);c.stroke();
    label(c,"wave run-up",sx-212,seaY-H*.12+4);
    label(c,"toe erosion",toeX+W*.035,seaY-H*.02,true);
    label(c,"groundwater table",W-200,gy0-10,true);
  }
  var pa=RM?0:sstep(.68,.92,p);
  if(pa>.01){
    c.strokeStyle="rgba(127,209,195,"+(.16*pa).toFixed(3)+")";c.lineWidth=1;c.beginPath();
    for(var e=0;e<edges.length;e++){var A=pts[edges[e][0]],B=pts[edges[e][1]];c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1])}c.stroke();
    for(var j=0;j<pts.length;j++){var P=pts[j],b=.5+.5*Math.sin(P[0]*.011+P[1]*.009-t*1.7+P[2]*6);
      c.fillStyle="rgba(127,209,195,"+(pa*(.25+.7*b)).toFixed(3)+")";c.beginPath();c.arc(P[0],P[1],1.2+b*1.9,0,7);c.fill()}
    c.globalAlpha=pa;label(c,"PINN collocation points · physics residual",mobile?18:W*.5,WH-H*.06);c.globalAlpha=1;
  }
}

var chaps=$$(".chap"),c0=$("#c0"),hint=$("#hint"),stormBox=$("#storm"),gDot=$("#gauge-dot"),gLis=$$("#gauge-l li");
var sBar=$("#storm-bar"),sVal=$("#storm-val"),lastLabel="";
function onScrollHero(){
  if(RM)return;
  var r=descent.getBoundingClientRect(),tot=r.height-innerHeight;
  p=tot>0?clamp(-r.top/tot,0,1):0;camY=p*(WH-H);
  var o0=1-sstep(.05,.16,p);c0.style.opacity=o0;c0.style.transform="translateY("+(-p*140)+"px)";c0.style.visibility=o0<.01?"hidden":"visible";
  hint.style.opacity=1-sstep(0,.05,p);stormBox.style.opacity=1-sstep(.38,.5,p);stormBox.style.visibility=p>.5?"hidden":"visible";
  chaps.forEach(function(ch){var a=+ch.dataset.a,b=+ch.dataset.b,o=sstep(a,a+.07,p)*(1-sstep(b-.07,b,p));
    ch.style.opacity=o;ch.style.transform="translateY("+((1-o)*30)+"px)";ch.style.visibility=o<.01?"hidden":"visible"});
  var track=gDot.parentNode.clientHeight;gDot.style.transform="translateY("+(p*(track-11))+"px)";
  var gi=p<.2?0:p<.48?1:p<.74?2:3;gLis.forEach(function(li,i){li.classList.toggle("on",i===gi)});
}
stage.addEventListener("pointermove",function(e){if(e.pointerType==="mouse"){stormT=clamp(e.clientX/W,0,1);lastPointer=performance.now()}});
function tick(now){
  var dt=Math.min(.05,(now-last)/1000);last=now;
  if(heroOn){
    t+=dt;
    if(now-lastPointer>4000)stormT=.45+.32*Math.sin(t*.32);
    storm+=(stormT-storm)*.04;
    sBar.style.width=(storm*100).toFixed(1)+"%";
    var lb=storm<.33?"Calm":storm<.66?"Moderate":"Severe";if(lb!==lastLabel){sVal.textContent=lb;lastLabel=lb}
    frame();
  }
  requestAnimationFrame(tick);
}
build();
if(RM){t=1;storm=.45;frame();$("#storm").hidden=true}
else{
  onScrollHero();
  if("IntersectionObserver" in window)new IntersectionObserver(function(es){heroOn=es[0].isIntersecting},{rootMargin:"40px"}).observe(descent);
  requestAnimationFrame(tick);
}
var rz;window.addEventListener("resize",function(){clearTimeout(rz);rz=setTimeout(function(){build();onScrollHero();if(RM)frame();},120)});

heroScroll=onScrollHero;
}

/* ---------------- nav state ---------------- */
var nav=$("#nav");
window.addEventListener("scroll",function(){if(heroScroll)heroScroll();nav.classList.toggle("solid",scrollY>innerHeight*.4)},{passive:true});
nav.classList.toggle("solid",scrollY>innerHeight*.4);
(function(){var path=location.pathname.replace(/index\.html$/,"");
  $$("#links a, #overlay a").forEach(function(a){var h=a.getAttribute("href");if(h&&h!=="/"&&h.indexOf("#")<0&&path.indexOf(h)===0)a.classList.add("on")})})();
/* old single-page links (e.g. /#teaching) now live on their own pages */
(function(){var map={"#teaching":"/about/#teaching","#service":"/about/#service","#contact":"/about/#contact","#funding":"/research/#funding","#sites":"/research/#field"};
  function go(){if((location.pathname==="/"||/\/index\.html$/.test(location.pathname))&&map[location.hash])location.replace(map[location.hash])}
  go();window.addEventListener("hashchange",go)})();

/* ---------------- themes: generated art + scrollytelling ---------------- */
(function(){
  var m=document.getElementById("twinmesh");
  if(m){var h="",sp=30,nodes=[];seed=5;
    for(var y=210;y<=590;y+=sp)for(var x=306;x<=600;x+=sp){var jx=x+(rnd()-.5)*10,jy=y+(rnd()-.5)*10;nodes.push([jx,jy]);}
    var cols=Math.floor((600-306)/sp)+1;
    nodes.forEach(function(n,i){var r=nodes[i+1],d=nodes[i+cols],dd=nodes[i+cols+1];
      if(r&&(i+1)%cols)h+='<path d="M'+n[0].toFixed(1)+','+n[1].toFixed(1)+'L'+r[0].toFixed(1)+','+r[1].toFixed(1)+'" stroke="rgba(127,209,195,.3)" stroke-width="1"/>';
      if(d)h+='<path d="M'+n[0].toFixed(1)+','+n[1].toFixed(1)+'L'+d[0].toFixed(1)+','+d[1].toFixed(1)+'" stroke="rgba(127,209,195,.22)" stroke-width="1"/>';
      if(dd&&(i+1)%cols)h+='<path d="M'+n[0].toFixed(1)+','+n[1].toFixed(1)+'L'+dd[0].toFixed(1)+','+dd[1].toFixed(1)+'" stroke="rgba(127,209,195,.12)" stroke-width="1"/>';
      h+='<circle cx="'+n[0].toFixed(1)+'" cy="'+n[1].toFixed(1)+'" r="2.2" fill="#7FD1C3"'+(i%7===0?' class="pulse" style="animation-delay:'+(i%5)*.4+'s"':' opacity=".7"')+'/>'});
    m.innerHTML=h}
  var g=document.getElementById("grains3");
  if(g){var s="";seed=9;for(var k=0;k<160;k++){var r=2.5+rnd()*7;s+='<circle cx="'+(rnd()*600).toFixed(1)+'" cy="'+(320+rnd()*280).toFixed(1)+'" r="'+r.toFixed(1)+'" fill="rgba(80,58,36,'+(.18+rnd()*.3).toFixed(2)+')"/>'}g.innerHTML=s}
  var b=document.getElementById("base3");
  if(b){var s2="";seed=3;for(var k2=0;k2<90;k2++){var cx=rnd()*600,cy=214+rnd()*88,rr=4+rnd()*8,pts="";for(var v=0;v<5;v++){var an=v/5*6.283+rnd()*.6,rd=rr*(.7+rnd()*.5);pts+=(cx+Math.cos(an)*rd).toFixed(1)+","+(cy+Math.sin(an)*rd).toFixed(1)+" "}
    s2+='<polygon points="'+pts+'" fill="rgba(48,36,24,'+(.25+rnd()*.35).toFixed(2)+')"/>'}b.innerHTML=s2}
  if(!$("#th-stage"))return;
  var scenes=$$(".scn"),arts=$$(".th");
  arts.forEach(function(a,i){var slot=a.querySelector(".th-art");if(slot&&scenes[i])slot.innerHTML=scenes[i].innerHTML});
  var bars=$$("#th-bars i"),num=$("#th-n");
  function setActive(i){scenes.forEach(function(s,k){s.classList.toggle("on",k===i)});arts.forEach(function(a,k){a.classList.toggle("on",k===i)});
    bars.forEach(function(b,k){b.classList.toggle("on",k<=i)});num.textContent=i+1}
  if("IntersectionObserver" in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)setActive(+e.target.dataset.i)})},{rootMargin:"-46% 0px -46% 0px"});
    arts.forEach(function(a){io.observe(a)});
  }
})();

/* ---------------- field map ---------------- */
(function(){
  var pinsG=$("#pins");if(!pinsG||!window.SITE||!SITE.sites)return;
  var NS="http://www.w3.org/2000/svg",grat=$("#grat"),gh="",SITES={},order=[];
  SITE.sites.forEach(function(s){SITES[s.id]=s;order.push(s.id)});
  for(var x=0;x<=960;x+=60)gh+='<path class="grat" d="M'+x+',0V600"/>';for(var y=0;y<=600;y+=60)gh+='<path class="grat" d="M0,'+y+'H960"/>';grat.innerHTML=gh;
  var list=$("#siteidx"),cur=null,det=$("#detail");
  order.forEach(function(id){var s=SITES[id];
    var g=document.createElementNS(NS,"g");g.setAttribute("class","pin t-"+s.group);g.setAttribute("tabindex","0");g.setAttribute("role","button");g.dataset.id=id;
    g.setAttribute("aria-label",s.place+": "+s.title);
    g.innerHTML='<circle class="halo" cx="'+s.x+'" cy="'+s.y+'" r="10"/><circle class="core" cx="'+s.x+'" cy="'+s.y+'" r="8"/><text x="'+s.label_x+'" y="'+s.label_y+'" text-anchor="'+s.label_anchor+'">'+esc(s.short)+'</text>';
    g.addEventListener("click",function(){select(id)});g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();select(id)}});
    pinsG.appendChild(g);
    var li=document.createElement("li");li.className="t-"+s.group;li.dataset.t=s.group;
    li.innerHTML='<button type="button" data-id="'+id+'"><i></i>'+esc(s.title)+'<span>'+esc(s.short)+'</span></button>';
    li.firstChild.addEventListener("click",function(){select(id)});list.appendChild(li)});
  function select(id){var s=SITES[id];cur=id;det.className="detail t-"+s.group;
    $("#d-k").textContent=s.group_label;$("#d-t").textContent=s.title;$("#d-l").textContent=s.place;$("#d-x").textContent=s.text;
    $$(".pin").forEach(function(p){p.classList.toggle("on",p.dataset.id===id)});$$("#siteidx button").forEach(function(b){b.classList.toggle("on",b.dataset.id===id)})}
  $$("#chips button").forEach(function(b){b.addEventListener("click",function(){var f=b.dataset.f;
    $$("#chips button").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))});
    $$(".pin").forEach(function(p){p.classList.toggle("dim",f!=="all"&&SITES[p.dataset.id].group!==f)});
    $$("#siteidx li").forEach(function(li){li.classList.toggle("dim",f!=="all"&&li.dataset.t!==f)});
    if(f!=="all"&&SITES[cur].group!==f){var first=order.filter(function(id){return SITES[id].group===f})[0];if(first)select(first)}})});
  select(order[0]);
})();

/* ---------------- publications explorer (publications page) ---------------- */
var TYPES=[
 {k:"journal",s:"Journal articles",v:"--c-jour"},
 {k:"gsp",s:"GSPs",v:"--c-gsp"},
 {k:"conference",s:"Conference proceedings",v:"--c-conf"},
 {k:"chapter",s:"Chapters & magazine",v:"--c-chap"},
 {k:"report",s:"Technical reports",v:"--c-rep"},
 {k:"review",s:"Under review",v:"--c-rev"}];
var tIndex={};TYPES.forEach(function(t,i){tIndex[t.k]=i});
var PUBS=(window.SITE&&SITE.pubs)||[];
PUBS.forEach(function(p,i){p.i=i;p.ti=tIndex[p.type]!=null?tIndex[p.type]:0;p.sel=p.featured?i:-1;if(p.year==="")p.year=null;
  p.cite=p.authors+(p.year?" ("+p.year+"). ":(/\.$/.test(p.authors)?" ":". "))+p.title+"."+(p.venue?" "+p.venue+".":"")});
var COLS=[];for(var yy=2018;yy<=2027;yy++)COLS.push(yy);COLS.push("Review");
var state={mode:"all",year:null,types:TYPES.map(function(){return true}),q:"",limit:12};
var legend=$("#legend");
if(legend){
TYPES.forEach(function(t,i){var b=document.createElement("button");b.type="button";b.setAttribute("aria-pressed","true");b.style.setProperty("--sw","var("+t.v+")");
  b.innerHTML="<i></i>"+esc(t.s);b.addEventListener("click",function(){state.types[i]=!state.types[i];if(!state.types.some(Boolean))state.types[i]=true;
  b.setAttribute("aria-pressed",String(state.types[i]));toAll();drawChart();renderList()});legend.appendChild(b)});
function colKey(p){return p.year==null?"Review":p.year}
window.__drawChart=function(){drawChart()};
function drawChart(){
  var svg=$("#chart"),Wc=1000,Hc=340,ml=44,mr=8,mt=26,mb=46,pw=Wc-ml-mr,ph=Hc-mt-mb,band=pw/COLS.length,bw=band*.58,ymax=20;
  function Y(v){return mt+ph-v/ymax*ph}
  var h="";
  for(var tk=0;tk<=ymax;tk+=5)h+='<path class="grid" d="M'+ml+','+Y(tk).toFixed(1)+'H'+(Wc-mr)+'"'+(tk?' stroke-dasharray="2 5"':'')+'/><text class="axis" x="'+(ml-10)+'" y="'+(Y(tk)+4).toFixed(1)+'" text-anchor="end">'+tk+'</text>';
  COLS.forEach(function(c,ci){
    var x=ml+ci*band+(band-bw)/2,acc=0,segs="",total=0;
    TYPES.forEach(function(t,ti){var n=PUBS.filter(function(p){return colKey(p)===c&&p.ti===ti}).length;total+=n;if(!state.types[ti]||!n)return;
      var y=Y(acc+n),hh=Y(acc)-Y(acc+n);acc+=n;
      segs+='<rect class="seg" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(0,hh-1.5).toFixed(1)+'" rx="2" style="fill:var('+t.v+')'+(ti===5?';opacity:.55':'')+'"><title>'+c+': '+n+' '+t.s.toLowerCase()+'</title></rect>'});
    var sel=state.year===c;
    h+='<g class="col'+(sel?' sel':'')+'" data-c="'+c+'" tabindex="0" role="button" aria-pressed="'+sel+'" aria-label="'+c+': '+total+' entries. Filter the list to this '+(c==="Review"?"group":"year")+'">'+
       '<rect class="hit" x="'+(ml+ci*band+2).toFixed(1)+'" y="'+mt+'" width="'+(band-4).toFixed(1)+'" height="'+(ph+mb-6)+'" rx="8"/>'+segs+
       (acc?'<text class="tot" x="'+(x+bw/2).toFixed(1)+'" y="'+(Y(acc)-8).toFixed(1)+'" text-anchor="middle">'+acc+'</text>':'')+
       '<text class="yr" x="'+(x+bw/2).toFixed(1)+'" y="'+(Hc-mb+24)+'" text-anchor="middle">'+(c==="Review"?"In review":c)+'</text></g>'});
  svg.innerHTML=h;
  $$("#chart .col").forEach(function(g){function go(){var c=g.dataset.c;c=c==="Review"?"Review":+c;state.year=state.year===c?null:c;toAll();drawChart();renderList()}
    g.addEventListener("click",go);g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}})});
}
function toAll(){if(state.mode==="sel"){state.mode="all";syncTabs()}state.limit=12}
function syncTabs(){$("#tab-sel").setAttribute("aria-selected",String(state.mode==="sel"));$("#tab-all").setAttribute("aria-selected",String(state.mode==="all"))}
$("#tab-sel").addEventListener("click",function(){state.mode="sel";state.year=null;state.q="";$("#q").value="";state.types=state.types.map(function(){return true});
  $$("#legend button").forEach(function(b){b.setAttribute("aria-pressed","true")});syncTabs();drawChart();renderList()});
$("#tab-all").addEventListener("click",function(){state.mode="all";state.limit=12;syncTabs();renderList()});
var qT;$("#q").addEventListener("input",function(e){clearTimeout(qT);qT=setTimeout(function(){state.q=e.target.value.trim();if(state.q)toAll();renderList()},120)});
$("#pmore").addEventListener("click",function(){state.limit+=12;renderList()});
function fmt(p,q){var s=esc(p.cite).replace(/Biswas, N\./g,"<b>Biswas, N.</b>");
  if(q){var re=new RegExp("("+q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig");s=s.replace(/(<[^>]+>)|([^<]+)/g,function(m,tag,txt){return tag||txt.replace(re,"<mark>$1</mark>")})}
  return s}
function renderList(){
  var q=state.q.toLowerCase(),items;
  if(state.mode==="sel"){items=PUBS.filter(function(p){return p.sel>=0}).sort(function(a,b){return a.sel-b.sel})}
  else{items=PUBS.filter(function(p){return state.types[p.ti]&&(state.year==null||colKey(p)===state.year)&&(!q||p.cite.toLowerCase().indexOf(q)>=0||p.type.toLowerCase().indexOf(q)>=0)})
    .sort(function(a,b){var ay=a.year==null?9999:a.year,by=b.year==null?9999:b.year;return by-ay||a.i-b.i})}
  var shown=state.mode==="sel"?items:items.slice(0,state.limit);
  $("#plist").innerHTML=shown.map(function(p,n){var t=TYPES[p.ti];
    return '<li style="animation-delay:'+Math.min(n,10)*30+'ms"><span class="y">'+(p.year||"—")+'</span><div><p class="t" style="--sw:var('+t.v+')"><i></i>'+esc(t.s)+(p.status&&p.type!=="review"?'<em>'+esc(p.status)+'</em>':'')+'</p><p class="c">'+fmt(p,state.q)+'</p></div>'+
      (p.doi?'<a class="doi" href="'+esc(p.doi)+'" target="_blank" rel="noopener">DOI ↗</a>':'<span></span>')+'</li>'}).join("")||'<li><span></span><p class="c" style="color:var(--muted)">No entries match. Try a different search or clear the filters.</p></li>';
  var parts=[];if(state.mode==="sel")parts.push("Featured on the home page: one paper for each research direction");
  else{parts.push("Showing "+shown.length+" of "+items.length);if(state.year!=null)parts.push(state.year==="Review"?"Under review":String(state.year));if(state.q)parts.push('“'+esc(state.q)+'”');}
  var filtered=state.mode==="all"&&(state.year!=null||state.q||state.types.some(function(x){return!x}));
  $("#pstatus").innerHTML=parts.join(" · ")+(filtered?' <button type="button" id="pclear">Clear filters</button>':'');
  var pc=$("#pclear");if(pc)pc.addEventListener("click",function(){state.year=null;state.q="";$("#q").value="";state.types=state.types.map(function(){return true});$$("#legend button").forEach(function(b){b.setAttribute("aria-pressed","true")});drawChart();renderList()});
  $("#pmore").hidden=!(state.mode==="all"&&items.length>shown.length);
}
drawChart();renderList();
}

/* ---------------- news rail (home page) ---------------- */
(function(){var rail=$("#rail");if(!rail)return;
  var rbar=$("#rail-bar");
  function railBar(){var w=rail.clientWidth/rail.scrollWidth;rbar.style.width=(w*100)+"%";rbar.style.transform="translateX("+(rail.scrollLeft/rail.clientWidth*100)+"%)"}
  rail.addEventListener("scroll",railBar,{passive:true});railBar();window.addEventListener("resize",railBar);
  function step(d){var c=rail.querySelector(".ncard");rail.scrollBy({left:d*(c?c.offsetWidth+18:320),behavior:RM?"auto":"smooth"})}
  $("#prev").addEventListener("click",function(){step(-1)});$("#next").addEventListener("click",function(){step(1)});
  var down=false,sx=0,sl=0;
  rail.addEventListener("pointerdown",function(e){if(e.pointerType!=="mouse")return;down=true;sx=e.clientX;sl=rail.scrollLeft;rail.style.scrollSnapType="none"});
  window.addEventListener("pointermove",function(e){if(down)rail.scrollLeft=sl-(e.clientX-sx)});
  window.addEventListener("pointerup",function(){if(!down)return;down=false;rail.style.scrollSnapType=""});
})();

/* ---------------- join: live contour field ---------------- */
var contour=(function(){
  var cvs=$("#contour");if(!cvs)return null;var c=cvs.getContext("2d"),w,h,d,on=false,mx=-999,my=-999,tmx=-999,tmy=-999,tc=0,lastC=0,CELL=18;
  var sec=$("#join");
  function size(){var r=sec.getBoundingClientRect();w=r.width;h=r.height;d=Math.min(devicePixelRatio||1,2);cvs.width=Math.round(w*d);cvs.height=Math.round(h*d);if(RM)draw()}
  function field(x,y){var v=Math.sin(x*.006+tc*.15)+.8*Math.sin(y*.009-tc*.12)+.9*Math.sin((x*.7+y)*.005+tc*.08)+.5*Math.sin((x-y)*.004-tc*.1);
    if(mx>-900){var dx=x-mx,dy=y-my;v+=1.7*Math.exp(-(dx*dx+dy*dy)/(2*150*150))}return v}
  function draw(){
    c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);
    var cols=Math.ceil(w/CELL)+1,rows=Math.ceil(h/CELL)+1,V=new Float32Array(cols*rows);
    for(var j=0;j<rows;j++)for(var i=0;i<cols;i++)V[j*cols+i]=field(i*CELL,j*CELL);
    for(var L=-2.6,li=0;L<=3.4;L+=.36,li++){
      c.beginPath();
      for(var j2=0;j2<rows-1;j2++)for(var i2=0;i2<cols-1;i2++){
        var a=V[j2*cols+i2],b=V[j2*cols+i2+1],cc=V[(j2+1)*cols+i2+1],dd=V[(j2+1)*cols+i2];
        var k=(a>L?1:0)|(b>L?2:0)|(cc>L?4:0)|(dd>L?8:0);if(k===0||k===15)continue;
        var x0=i2*CELL,y0=j2*CELL;
        var T=[x0+CELL*(L-a)/(b-a),y0],R=[x0+CELL,y0+CELL*(L-b)/(cc-b)],B=[x0+CELL*(L-dd)/(cc-dd),y0+CELL],Lf=[x0,y0+CELL*(L-a)/(dd-a)];
        function seg(P,Q){c.moveTo(P[0],P[1]);c.lineTo(Q[0],Q[1])}
        switch(k){case 1:case 14:seg(Lf,T);break;case 2:case 13:seg(T,R);break;case 3:case 12:seg(Lf,R);break;case 4:case 11:seg(R,B);break;
          case 6:case 9:seg(T,B);break;case 7:case 8:seg(Lf,B);break;case 5:seg(Lf,T);seg(R,B);break;case 10:seg(T,R);seg(Lf,B);break}
      }
      var hi=L>2.2;c.strokeStyle=hi?"rgba(235,203,159,.42)":"rgba(127,209,195,"+(.07+(li%4===0?.12:0)).toFixed(2)+")";c.lineWidth=li%4===0?1.3:1;c.stroke();
    }
  }
  function loop(now){if(on&&now-lastC>33){tc+=.033*1.2;mx+=(tmx-mx)*.12;my+=(tmy-my)*.12;if(tmx<-900){mx=-999;my=-999}draw();lastC=now}requestAnimationFrame(loop)}
  sec.addEventListener("pointermove",function(e){var r=sec.getBoundingClientRect();tmx=e.clientX-r.left;tmy=e.clientY-r.top;if(mx<-900){mx=tmx;my=tmy}});
  sec.addEventListener("pointerleave",function(){tmx=-999;tmy=-999});
  size();
  if(RM){tc=3;draw()}else{if("IntersectionObserver" in window)new IntersectionObserver(function(es){on=es[0].isIntersecting},{rootMargin:"60px"}).observe(sec);else on=true;requestAnimationFrame(loop)}
  window.addEventListener("resize",function(){clearTimeout(size.t);size.t=setTimeout(size,150)});
  return {size:size};
})();

/* ---------------- copy email ---------------- */
if($("#copy"))$("#copy").addEventListener("click",function(){var el=$("#addr");
  function fb(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);say("Email selected. Press Ctrl+C or ⌘C to copy.")}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(el.textContent).then(function(){say("Email address copied.")},fb);else fb()});
})();
