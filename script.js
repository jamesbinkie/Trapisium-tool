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
    });
  }

  clampOnBlur(A, 100, 2440);
  clampOnBlur(B, 50, 1220);

  C.addEventListener("blur", () => {
    const maxC = Math.max(1, Number(B.value) - 1);
    if (C.value === "") C.value = 1;
    C.value = clamp(C.value, 1, maxC);
    updateDynamicLimits();
  });

  D.addEventListener("blur", () => {
    const maxD = Math.max(0, Number(B.value) - Number(C.value));
    if (D.value === "") D.value = 0;
    D.value = clamp(D.value, 0, maxD);
    updateDynamicLimits();
  });

  type.addEventListener("change", () => {
    const Dlabel = document.getElementById("Dlabel");
    Dlabel.style.display = type.value === "irregular" ? "inline-block" : "none";
    updateDynamicLimits();
  });

  B.addEventListener("input", updateDynamicLimits);
  C.addEventListener("input", updateDynamicLimits);

  ["bandTop", "bandRight", "bandBottom", "bandLeft"].forEach(id => {
    document.getElementById(id).addEventListener("change", () => {
      drawTrapezium();
    });
  });

  updateDynamicLimits();
}

function updateDynamicLimits() {
  const Bv = Number(document.getElementById("B").value);
  const Cv = Number(document.getElementById("C").value);
  const C = document.getElementById("C");
  const D = document.getElementById("D");

  const maxC = Math.max(1, Bv - 1);
  C.max = maxC;
  if (Cv > maxC) C.value = maxC;
  document.getElementById("CmaxLabel").textContent = maxC;

  const maxD = Math.max(0, Bv - Number(C.value || 0));
  D.max = maxD;
  if (Number(D.value) > maxD) D.value = maxD;
  document.getElementById("DmaxLabel").textContent = maxD;
}

function clamp(value, min, max) {
  value = Number(value);
  if (isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

window.onload = setupInputs;


// -------------------------------
// DRAWING + SCALING + DIMENSIONS
// -------------------------------

function drawTrapezium() {
  const type = document.getElementById("type").value;
  const A = Number(document.getElementById("A").value);
  const B = Number(document.getElementById("B").value);
  const C = Number(document.getElementById("C").value);
  const D = Number(document.getElementById("D").value);

  let pts;

  if (type === "regular") {
    const offset = (B - C) / 2;
    pts = [
      [offset, 0],      // TL
      [offset + C, 0],  // TR
      [B, A],           // BR
      [0, A]            // BL
    ];
  }

  if (type === "right") {
    // Slope on the RIGHT side
    pts = [
      [0, 0],   // TL
      [C, 0],   // TR
      [B, A],   // BR
      [0, A]    // BL
    ];
  }

  if (type === "irregular") {
    pts = [
      [D, 0],      // TL
      [D + C, 0],  // TR
      [B, A],      // BR
      [0, A]       // BL
    ];
  }

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const xs = pts.map(p => p[0]);
  const ys = pts.map(p => p[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const shapeWidth = maxX - minX;
  const shapeHeight = maxY - minY;

  const margin = 150;
  const scaleX = (canvas.width - margin * 2) / shapeWidth;
  const scaleY = (canvas.height - margin * 2) / shapeHeight;

  const scale = Math.min(scaleX, scaleY);

  const offsetX = (canvas.width - shapeWidth * scale) / 2 - minX * scale;
  const offsetY = (canvas.height - shapeHeight * scale) / 2 - minY * scale;

  ctx.beginPath();
  ctx.moveTo(pts[0][0] * scale + offsetX, pts[0][1] * scale + offsetY);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0] * scale + offsetX, pts[i][1] * scale + offsetY);
  }
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  drawDimensions(ctx, pts, scale, offsetX, offsetY, A, B, C);
  drawBanding(ctx, pts, scale, offsetX, offsetY);
}

function drawDimensions(ctx, pts, scale, offsetX, offsetY, A, B, C) {
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.font = "16px Arial";

  const TL = pts[0];
  const TR = pts[1];
  const BR = pts[2];
  const BL = pts[3];

  const topY = Math.min(TL[1], TR[1]) * scale + offsetY - 30;
  drawDimLine(ctx,
    TL[0] * scale + offsetX,
    topY,
    TR[0] * scale + offsetX,
    topY,
    `${C} mm`
  );

  const bottomY = Math.max(BL[1], BR[1]) * scale + offsetY + 40;
  drawDimLine(ctx,
    BL[0] * scale + offsetX,
    bottomY,
    BR[0] * scale + offsetX,
    bottomY,
    `${B} mm`
  );

  const leftX = Math.min(TL[0], BL[0]) * scale + offsetX - 40;
  drawDimLine(ctx,
    leftX,
    TL[1] * scale + offsetY,
    leftX,
    BL[1] * scale + offsetY,
    `${A} mm`
  );
}

function drawDimLine(ctx, x1, y1, x2, y2, label) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  drawArrow(ctx, x1, y1, x2, y2);
  drawArrow(ctx, x2, y2, x1, y1);

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  ctx.fillText(label, midX + 5, midY - 5);
}

function drawArrow(ctx, x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 8;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(
    x1 + size * Math.cos(angle + Math.PI / 6),
    y1 + size * Math.sin(angle + Math.PI / 6)
  );
  ctx.lineTo(
    x1 + size * Math.cos(angle - Math.PI / 6),
    y1 + size * Math.sin(angle - Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}


// -------------------------------
// EDGE BANDING (joined corners)
// -------------------------------

// Compute a full outward offset polygon for a clockwise shape
function computeOffsetPolygon(pts, scale, offsetX, offsetY, offsetPx) {
  const out = [];

  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];

    const x1 = p1[0] * scale + offsetX;
    const y1 = p1[1] * scale + offsetY;
    const x2 = p2[0] * scale + offsetX;
    const y2 = p2[1] * scale + offsetY;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);

    const nx = dy / len;      // outward normal for clockwise polygon
    const ny = -dx / len;

    out.push({
      x1: x1 + nx * offsetPx,
      y1: y1 + ny * offsetPx,
      x2: x2 + nx * offsetPx,
      y2: y2 + ny * offsetPx
    });
  }

  return out;
}

// Draw only the selected edges of the offset polygon
function drawBanding(ctx, pts, scale, offsetX, offsetY) {
  const offsetPx = 12;

  const edges = computeOffsetPolygon(pts, scale, offsetX, offsetY, offsetPx);

  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;

  // Top edge = edge 0
  if (document.getElementById("bandTop").checked) {
    ctx.beginPath();
    ctx.moveTo(edges[0].x1, edges[0].y1);
    ctx.lineTo(edges[0].x2, edges[0].y2);
    ctx.stroke();
  }

  // Right edge = edge 1
  if (document.getElementById("bandRight").checked) {
    ctx.beginPath();
    ctx.moveTo(edges[1].x1, edges[1].y1);
    ctx.lineTo(edges[1].x2, edges[1].y2);
    ctx.stroke();
  }

  // Bottom edge = edge 2
  if (document.getElementById("bandBottom").checked) {
    ctx.beginPath();
    ctx.moveTo(edges[2].x1, edges[2].y1);
    ctx.lineTo(edges[2].x2, edges[2].y2);
    ctx.stroke();
  }

  // Left edge = edge 3
  if (document.getElementById("bandLeft").checked) {
    ctx.beginPath();
    ctx.moveTo(edges[3].x1, edges[3].y1);
    ctx.lineTo(edges[3].x2, edges[3].y2);
    ctx.stroke();
  }
}


// -------------------------------
// EXPORT FUNCTIONS
// -------------------------------

function downloadPNG() {
  const canvas = document.getElementById("canvas");
  const link = document.createElement("a");
  link.download = "trapezium.png";
  link.href = canvas.toDataURL();
  link.click();
}

function downloadDXF() {
  const type = document.getElementById("type").value;
  const A = Number(document.getElementById("A").value);
  const B = Number(document.getElementById("B").value);
  const C = Number(document.getElementById("C").value);
  const D = Number(document.getElementById("D").value);

  let pts;

  if (type === "regular") {
    const offset = (B - C) / 2;
    pts = [
      [offset, 0],
      [offset + C, 0],
      [B, A],
      [0, A]
    ];
  }

  if (type === "right") {
    pts = [
      [0, 0],
      [C, 0],
      [B, A],
      [0, A]
    ];
  }

  if (type === "irregular") {
    pts = [
      [D, 0],
      [D + C, 0],
      [B, A],
      [0, A]
    ];
  }

  let dxf = "0\nSECTION\n2\nENTITIES\n0\nLWPOLYLINE\n100\nAcDbPolyline\n90\n4\n70\n1\n";

  pts.forEach(p => {
    dxf += `10\n${p[0]}\n20\n${p[1]}\n`;
  });

  dxf += "0\nENDSEC\n0\nEOF";

  const blob = new Blob([dxf], { type: "application/dxf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "trapezium.dxf";
  link.click();
}
