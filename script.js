// -------------------------------
// INPUT VALIDATION + LIVE LOGIC
// -------------------------------

function setupInputs() {
  const A = document.getElementById("A");
  const B = document.getElementById("B");
  const C = document.getElementById("C");
  const D = document.getElementById("D");
  const type = document.getElementById("type");

  function clampOnBlur(input, min, max) {
    input.addEventListener("blur", () => {
      if (input.value === "") input.value = min;
      input.value = clamp(input.value, min, max);
      updateDynamicLimits();
      drawTrapezium();
    });
  }

  clampOnBlur(A, 100, 2440);
  clampOnBlur(B, 50, 1220);

  C.addEventListener("blur", () => {
    const maxC = Math.max(20, Number(B.value) - 1);
    let val = Number(C.value);
    if (isNaN(val) || val === "") val = 20;
    val = Math.max(20, Math.min(val, maxC));
    C.value = val;
    updateDynamicLimits();
    drawTrapezium();
  });

  D.addEventListener("blur", () => {
    const maxD = Math.max(0, Number(B.value) - Number(C.value));
    let val = Number(D.value);
    if (isNaN(val) || val === "") val = 0;
    val = Math.max(0, Math.min(val, maxD));
    D.value = val;
    updateDynamicLimits();
    drawTrapezium();
  });

  type.addEventListener("change", () => {
    const Dlabel = document.getElementById("Dlabel");
    Dlabel.style.display = type.value === "irregular" ? "flex" : "none";
    updateDynamicLimits();
    drawTrapezium();
  });

  document.querySelectorAll("#bandTop,#bandRight,#bandBottom,#bandLeft")
    .forEach(cb => cb.addEventListener("change", drawTrapezium));

  B.addEventListener("input", () => {
    updateDynamicLimits();
    drawTrapezium();
  });

  updateDynamicLimits();
  drawTrapezium();
}

function clamp(value, min, max) {
  value = Number(value);
  if (isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function updateDynamicLimits() {
  const Bv = Number(document.getElementById("B").value);
  const C = document.getElementById("C");
  const D = document.getElementById("D");

  const maxC = Math.max(20, Bv - 1);
  let Cv = Number(C.value);
  if (isNaN(Cv) || Cv === "") Cv = 20;
  Cv = Math.max(20, Math.min(Cv, maxC));
  C.value = Cv;
  document.getElementById("CmaxLabel").textContent = maxC;

  const maxD = Math.max(0, Bv - Cv);
  let Dv = Number(D.value);
  if (isNaN(Dv) || D.value === "") Dv = 0;
  Dv = Math.max(0, Math.min(Dv, maxD));
  D.value = Dv;
  document.getElementById("DmaxLabel").textContent = maxD;
}

window.onload = setupInputs;

// -------------------------------
// DRAWING

function drawTrapezium() {
  const type = document.getElementById("type").value;
  const A = Number(document.getElementById("A").value);
  const B = Number(document.getElementById("B").value);
  const C = Number(document.getElementById("C").value);
  const D = Number(document.getElementById("D").value);

  let pts;
  if (type === "regular") {
    const offset = (B - C) / 2;
    pts = [[offset,0],[offset+C,0],[B,A],[0,A]];
  } else if (type === "right") {
    pts = [[0,0],[C,0],[B,A],[0,A]];
  } else {
    pts = [[D,0],[D+C,0],[B,A],[0,A]];
  }

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const xs = pts.map(p=>p[0]);
  const ys = pts.map(p=>p[1]);
  const minX = Math.min(...xs), maxX=Math.max(...xs);
  const minY = Math.min(...ys), maxY=Math.max(...ys);
  const shapeWidth = maxX-minX, shapeHeight = maxY-minY;

  const margin = 150;
  const scaleX = (canvas.width-margin*2)/shapeWidth;
  const scaleY = (canvas.height-margin*2)/shapeHeight;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = (canvas.width-shapeWidth*scale)/2 - minX*scale;
  const offsetY = (canvas.height-shapeHeight*scale)/2 - minY*scale;

  // Draw trapezium
  ctx.beginPath();
  ctx.moveTo(pts[0][0]*scale+offsetX, pts[0][1]*scale+offsetY);
  for (let i=1;i<pts.length;i++){
    ctx.lineTo(pts[i][0]*scale+offsetX, pts[i][1]*scale+offsetY);
  }
  ctx.closePath();
  ctx.lineWidth=3;
  ctx.strokeStyle="#000";
  ctx.stroke();

  drawDimensions(ctx, pts, scale, offsetX, offsetY, A, B, C);
  drawBanding(ctx, pts, scale, offsetX, offsetY);
}

// -------------------------------
// DIMENSIONS

function drawDimensions(ctx, pts, scale, offsetX, offsetY) {
  const TL = pts[0], TR = pts[1], BR = pts[2], BL = pts[3];

  drawDimLine(ctx, TL[0]*scale+offsetX, TL[1]*scale+offsetY, TR[0]*scale+offsetX, TR[1]*scale+offsetY, `${Number(TR[0]-TL[0])} mm`, "above");
  drawDimLine(ctx, BL[0]*scale+offsetX, BL[1]*scale+offsetY, BR[0]*scale+offsetX, BR[1]*scale+offsetY, `${Number(BR[0]-BL[0])} mm`, "below");
  drawDimLine(ctx, TL[0]*scale+offsetX, TL[1]*scale+offsetY, BL[0]*scale+offsetX, BL[1]*scale+offsetY, `${Number(BL[1]-TL[1])} mm`, "left");
}

function drawDimLine(ctx, x1, y1, x2, y2, label, position) {
  const offset = 30; // pushed dimension lines further away from shape
  const textOffset = 15; // distance of text from line
  ctx.font = "18px Arial";

  let lineX1 = x1, lineY1 = y1;
  let lineX2 = x2, lineY2 = y2;

  if (position === "above") { lineY1 -= offset; lineY2 -= offset; }
  else if (position === "below") { lineY1 += offset; lineY2 += offset; }
  else if (position === "left") { lineX1 -= offset; lineX2 -= offset; }

  ctx.beginPath();
  ctx.moveTo(lineX1, lineY1);
  ctx.lineTo(lineX2, lineY2);
  ctx.stroke();

  drawArrow(ctx, lineX1, lineY1, lineX2, lineY2);
  drawArrow(ctx, lineX2, lineY2, lineX1, lineY1);

  const midX = (lineX1 + lineX2) / 2;
  const midY = (lineY1 + lineY2) / 2;

  ctx.textAlign = position === "left" ? "right" : "center";
  ctx.textBaseline = position === "below" ? "top" : "middle";

  let textX = midX;
  let textY = midY;

  if (position === "above") textY -= textOffset;
  else if (position === "below") textY += textOffset;
  else if (position === "left") textX -= textOffset;

  ctx.fillText(label, textX, textY);
}

function drawArrow(ctx, x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 8;
  const arrowOffset = 6;

  const tipX = x2 + arrowOffset * Math.cos(angle);
  const tipY = y2 + arrowOffset * Math.sin(angle);

  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - size * Math.cos(angle - Math.PI/6), tipY - size * Math.sin(angle - Math.PI/6));
  ctx.lineTo(tipX - size * Math.cos(angle + Math.PI/6), tipY - size * Math.sin(angle + Math.PI/6));
  ctx.closePath();
  ctx.fill();
}

// -------------------------------
// EDGE BANDING (clean, consistent)
function drawBanding(ctx, pts, scale, offsetX, offsetY){
  // Offset amount proportional to canvas, but min 12px
  const offsetPx = Math.max(12, Math.min(ctx.canvas.width, ctx.canvas.height)/100);

  // Compute offset polygon
  const poly = computeOffsetPolygonEdges(pts, scale, offsetX, offsetY, offsetPx);
  if(!poly || poly.length!==4) return;

  const bandTop = document.getElementById("bandTop").checked;
  const bandRight = document.getElementById("bandRight").checked;
  const bandBottom = document.getElementById("bandBottom").checked;
  const bandLeft = document.getElementById("bandLeft").checked;

  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;

// Correct side mapping

// draw sides with corrected index rotation

  // Top
  if (bandTop) {
    ctx.beginPath();
    ctx.moveTo(poly[3].x, poly[3].y);
    ctx.lineTo(poly[0].x, poly[0].y);
    ctx.stroke();
  }
  
  // Right
  if (bandRight) {
    ctx.beginPath();
    ctx.moveTo(poly[0].x, poly[0].y);
    ctx.lineTo(poly[1].x, poly[1].y);
    ctx.stroke();
  }
  
  // Bottom
  if (bandBottom) {
    ctx.beginPath();
    ctx.moveTo(poly[1].x, poly[1].y);
    ctx.lineTo(poly[2].x, poly[2].y);
    ctx.stroke();
  }
  
  // Left
  if (bandLeft) {
    ctx.beginPath();
    ctx.moveTo(poly[2].x, poly[2].y);
    ctx.lineTo(poly[3].x, poly[3].y);
    ctx.stroke();
  }


}

// Compute offset polygon by offsetting edges along normals and intersecting
function computeOffsetPolygonEdges(pts, scale, offsetX, offsetY, offsetPx){
  const n = pts.length;
  const edges = [];

  for(let i=0;i<n;i++){
    const p1 = pts[i];
    const p2 = pts[(i+1)%n];

    const x1 = p1[0]*scale + offsetX;
    const y1 = p1[1]*scale + offsetY;
    const x2 = p2[0]*scale + offsetX;
    const y2 = p2[1]*scale + offsetY;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    let nx = -dy/len;
    let ny = dx/len;

    // Determine outward normal by testing against centroid
    const midX = (x1+x2)/2;
    const midY = (y1+y2)/2;
    const cx = pts.reduce((sum,p)=>sum+p[0],0)/n*scale + offsetX;
    const cy = pts.reduce((sum,p)=>sum+p[1],0)/n*scale + offsetY;
    const testX = midX + nx*10;
    const testY = midY + ny*10;
    if(Math.hypot(testX-cx,testY-cy) < Math.hypot(midX-cx,midY-cy)){ nx=-nx; ny=-ny; }

    edges.push({x1:x1+nx*offsetPx, y1:y1+ny*offsetPx, x2:x2+nx*offsetPx, y2:y2+ny*offsetPx});
  }

  // Intersect adjacent edges to get polygon corners
  const poly = [];
  for(let i=0;i<n;i++){
    poly.push(intersectLines(edges[i], edges[(i+1)%n]));
  }
  return poly;
}

// Line intersection utility
function intersectLines(e1,e2){
  const {x1,y1,x2,y2}=e1;
  const {x1:x3,y1:y3,x2:x4,y2:y4}=e2;
  const denom=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
  if(denom===0) return {x:x2,y:y2};
  const px=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/denom;
  const py=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/denom;
  return {x:px,y:py};
}


// -------------------------------
// EXPORT FUNCTIONS

function downloadPNG(){
  const canvas=document.getElementById("canvas");
  const name=document.getElementById("fileName").value||"trapezium";
  const link=document.createElement("a");
  link.download=name+".png";
  link.href=canvas.toDataURL();
  link.click();
}

function downloadDXF(){
  const name=document.getElementById("fileName").value||"trapezium";
  const type=document.getElementById("type").value;
  const A=Number(document.getElementById("A").value);
  const B=Number(document.getElementById("B").value);
  const C=Number(document.getElementById("C").value);
  const D=Number(document.getElementById("D").value);

  let pts;
  if(type==="regular"){const offset=(B-C)/2; pts=[[offset,0],[offset+C,0],[B,A],[0,A]];}
  else if(type==="right"){pts=[[0,0],[C,0],[B,A],[0,A]];}
  else{pts=[[D,0],[D+C,0],[B,A],[0,A]];}

  const maxY=Math.max(...pts.map(p=>p[1]));

  let dxf="";
  dxf+="0\nSECTION\n2\nHEADER\n0\nENDSEC\n";
  dxf+="0\nSECTION\n2\nTABLES\n";
  dxf+="0\nTABLE\n2\nLAYER\n70\n1\n";
  dxf+="0\nLAYER\n2\n0\n70\n0\n62\n7\n6\nCONTINUOUS\n";
  dxf+="0\nENDTAB\n0\nENDSEC\n";
  dxf+="0\nSECTION\n2\nENTITIES\n";
  dxf+="0\nLWPOLYLINE\n100\nAcDbPolyline\n90\n4\n70\n1\n8\n0\n";

  pts.forEach(p=>{
    const x=p[0], y=maxY-p[1];
    dxf+=`10\n${x}\n20\n${y}\n`;
  });

  dxf+="0\nENDSEC\n0\nEOF";

  const blob=new Blob([dxf], {type:"application/dxf"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download=name+".dxf";
  link.click();
}
