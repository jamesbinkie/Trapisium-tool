// -------------------------------
// INPUT SETUP
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

    const Bv = Number(B.value);
    const maxC = Math.max(20, Bv - 1);

    let val = Number(C.value);

    if (isNaN(val)) val = 20;
    if (val < 20) val = 20;
    if (val > maxC) val = maxC;

    C.value = val;

    updateDynamicLimits();
    drawTrapezium();

  });


  D.addEventListener("blur", () => {

    const Bv = Number(B.value);
    const Cv = Number(C.value);

    const maxD = Math.max(0, Bv - Cv);

    let val = Number(D.value);

    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > maxD) val = maxD;

    D.value = val;

    updateDynamicLimits();
    drawTrapezium();

  });


  type.addEventListener("change", () => {

    updateDynamicLimits();
    drawTrapezium();

  });


  document
    .querySelectorAll(
      "#bandTop,#bandRight,#bandBottom,#bandLeft"
    )
    .forEach(cb =>
      cb.addEventListener("change", drawTrapezium)
    );


  updateDynamicLimits();
  drawTrapezium();

}


window.onload = setupInputs;


// -------------------------------
// CLAMP
// -------------------------------

function clamp(value, min, max) {

  value = Number(value);

  if (isNaN(value)) return min;

  return Math.min(
    Math.max(value, min),
    max
  );

}


// -------------------------------
// LIMITS
// -------------------------------

function updateDynamicLimits() {

  const Bv =
    Number(
      document.getElementById("B").value
    );

  const C =
    document.getElementById("C");

  const D =
    document.getElementById("D");

  const maxC =
    Math.max(20, Bv - 1);

  C.max = maxC;

  if (C.value > maxC)
    C.value = maxC;

  document
    .getElementById("CmaxLabel")
    .textContent = maxC;


  const maxD =
    Math.max(
      0,
      Bv - Number(C.value)
    );

  D.max = maxD;

  if (D.value > maxD)
    D.value = maxD;

  document
    .getElementById("DmaxLabel")
    .textContent = maxD;

}


// -------------------------------
// DRAW
// -------------------------------

function drawTrapezium() {

  const type =
    document.getElementById("type").value;

  const A =
    Number(
      document.getElementById("A").value
    );

  const B =
    Number(
      document.getElementById("B").value
    );

  const C =
    Number(
      document.getElementById("C").value
    );

  const D =
    Number(
      document.getElementById("D").value
    );


  let pts;


  if (type === "regular") {

    const offset =
      (B - C) / 2;

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


  const canvas =
    document.getElementById("canvas");

  const ctx =
    canvas.getContext("2d");


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  const xs =
    pts.map(p => p[0]);

  const ys =
    pts.map(p => p[1]);


  const minX =
    Math.min(...xs);

  const maxX =
    Math.max(...xs);

  const minY =
    Math.min(...ys);

  const maxY =
    Math.max(...ys);


  const w =
    maxX - minX;

  const h =
    maxY - minY;


  const margin = 150;

  const scale =
    Math.min(
      (canvas.width - margin * 2) / w,
      (canvas.height - margin * 2) / h
    );


  const offsetX =
    (canvas.width - w * scale) / 2 -
    minX * scale;

  const offsetY =
    (canvas.height - h * scale) / 2 -
    minY * scale;


  ctx.beginPath();

  ctx.moveTo(
    pts[0][0] * scale + offsetX,
    pts[0][1] * scale + offsetY
  );

  for (let i = 1; i < pts.length; i++) {

    ctx.lineTo(
      pts[i][0] * scale + offsetX,
      pts[i][1] * scale + offsetY
    );

  }

  ctx.closePath();

  ctx.lineWidth = 3;
  ctx.stroke();


  drawDimensions(
    ctx,
    pts,
    scale,
    offsetX,
    offsetY,
    A,
    B,
    C
  );


  drawBanding(
    ctx,
    pts,
    scale,
    offsetX,
    offsetY
  );

}


// -------------------------------
// DIMENSIONS
// -------------------------------

function drawDimensions(
  ctx,
  pts,
  scale,
  offsetX,
  offsetY,
  A,
  B,
  C
) {

  ctx.font = "16px Arial";


  const TL = pts[0];
  const TR = pts[1];
  const BR = pts[2];
  const BL = pts[3];


  const topY =
    TL[1] * scale +
    offsetY -
    30;

  drawDimLine(
    ctx,
    TL[0] * scale + offsetX,
    topY,
    TR[0] * scale + offsetX,
    topY,
    C + " mm"
  );


  const bottomY =
    BL[1] * scale +
    offsetY +
    40;

  drawDimLine(
    ctx,
    BL[0] * scale + offsetX,
    bottomY,
    BR[0] * scale + offsetX,
    bottomY,
    B + " mm"
  );


  const leftX =
    BL[0] * scale +
    offsetX -
    40;

  drawDimLine(
    ctx,
    leftX,
    TL[1] * scale + offsetY,
    leftX,
    BL[1] * scale + offsetY,
    A + " mm"
  );

}


// -------------------------------
// DIM LINE (UPDATED)
// -------------------------------

function drawDimLine(
  ctx,
  x1,
  y1,
  x2,
  y2,
  label
) {

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();


  drawArrow(ctx, x1, y1, x2, y2);
  drawArrow(ctx, x2, y2, x1, y1);


  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;


  const isVertical =
    Math.abs(x1 - x2) < 1;


  const padding = 10;

  const textWidth =
    ctx.measureText(label).width;


  if (isVertical) {

    ctx.textAlign = "right";

    ctx.fillText(
      label,
      midX - padding - textWidth * 0.1,
      midY
    );

  } else {

    if (y1 > y2) {

      ctx.fillText(
        label,
        midX,
        midY + 20
      );

    } else {

      ctx.fillText(
        label,
        midX,
        midY - 20
      );

    }

  }

}


// -------------------------------
// ARROW
// -------------------------------

function drawArrow(
  ctx,
  x1,
  y1,
  x2,
  y2
) {

  const angle =
    Math.atan2(
      y2 - y1,
      x2 - x1
    );

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
// BAND OUTSIDE
// -------------------------------

function computeOffsetEdges(
  pts,
  scale,
  offsetX,
  offsetY,
  offsetPx
) {

  const edges = [];

  for (let i = 0; i < pts.length; i++) {

    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];

    const x1 =
      p1[0] * scale + offsetX;

    const y1 =
      p1[1] * scale + offsetY;

    const x2 =
      p2[0] * scale + offsetX;

    const y2 =
      p2[1] * scale + offsetY;


    const dx = x2 - x1;
    const dy = y2 - y1;

    const len =
      Math.sqrt(dx * dx + dy * dy);


    const nx = -dy / len;
    const ny = dx / len;


    edges.push({

      x1: x1 + nx * offsetPx,
      y1: y1 + ny * offsetPx,

      x2: x2 + nx * offsetPx,
      y2: y2 + ny * offsetPx

    });

  }

  return edges;

}
