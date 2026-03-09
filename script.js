// -------------------------------
// INPUT VALIDATION + LIVE LOGIC
// -------------------------------

function setupInputs() {
  const A = document.getElementById("A");
  const B = document.getElementById("B");
  const C = document.getElementById("C");
  const D = document.getElementById("D");
  const type = document.getElementById("type");

  // Height A: 100–2440
  A.addEventListener("input", () => {
    A.value = clamp(A.value, 100, 2440);
  });

  // Bottom width B: 50–1220
  B.addEventListener("input", () => {
    B.value = clamp(B.value, 50, 1220);

    // Update C max
    const maxC = Math.max(1, B.value - 1);
    C.max = maxC;

    // Clamp C
    C.value = clamp(C.value, 1, maxC);

    // Update D max
    updateDlimit();
  });

  // Top width C: 1–(B−1)
  C.addEventListener("input", () => {
    const maxC = Math.max(1, B.value - 1);
    C.value = clamp(C.value, 1, maxC);

    updateDlimit();
  });

  // Offset D: 0–(B−C)
  D.addEventListener("input", () => {
    updateDlimit();
  });

  // Show/hide D based on type
  type.addEventListener("change", () => {
    const Dlabel = document.getElementById("Dlabel");
    Dlabel.style.display = type.value === "irregular" ? "inline-block" : "none";
    updateDlimit();
  });
}

function updateDlimit() {
  const B = Number(document.getElementById("B").value);
  const C = Number(document.getElementById("C").value);
  const D = document.getElementById("D");

  const maxD = Math.max(0, B - C);
  D.max = maxD;
  D.value = clamp(D.value, 0, maxD);
}

function clamp(value, min, max) {
  value = Number(value);
  if (isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

// Run setup on load
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
      [offset, 0],
      [offset + C, 0],
      [B, A],
      [0, A]
    ];
  }

  if (type === "right") {
    const offset = Math.max(0, B - C);
    pts = [
      [offset, 0],
      [offset + C, 0],
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

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Auto-scale
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

  // Draw shape
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

  // Top width (C)
  const topY = Math.min(TL[1], TR[1]) * scale + offsetY - 30;
  drawDimLine(ctx,
    TL[0] * scale + offsetX,
    topY,
    TR[0] * scale + offsetX,
    topY,
    `${C} mm`
  );

  // Bottom width (B)
  const bottomY = Math.max(BL[1], BR[1]) * scale + offsetY + 40;
  drawDimLine(ctx,
    BL[0] * scale + offsetX,
    bottomY,
    BR[0] * scale + offsetX,
    bottomY,
    `${B} mm`
  );

  // Height (A)
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
