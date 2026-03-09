function drawTrapezium() {
  const type = document.getElementById("type").value;
  const A = Number(document.getElementById("A").value);
  const B = Number(document.getElementById("B").value);
  const C = Number(document.getElementById("C").value);
  const D = Number(document.getElementById("D").value);

  let pts;

  if (type === "regular") {
    const offset = (B - A) / 2;
    pts = [
      [offset, 0],
      [offset + A, 0],
      [B, C],
      [0, C]
    ];
  }

  if (type === "right") {
    const offset = Math.max(0, B - A);
    pts = [
      [offset, 0],
      [offset + A, 0],
      [B, C],
      [0, C]
    ];
  }

  if (type === "irregular") {
    pts = [
      [D, 0],
      [D + A, 0],
      [B, C],
      [0, C]
    ];
  }

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = 1; // 1 mm = 1 pixel
  const offsetX = 100;
  const offsetY = 100;

  // Draw trapezium outline
  ctx.beginPath();
  ctx.moveTo(pts[0][0] * scale + offsetX, pts[0][1] * scale + offsetY);

  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0] * scale + offsetX, pts[i][1] * scale + offsetY);
  }

  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000";
  ctx.stroke();

  // Draw dimensions
  drawDimensions(ctx, pts, scale, offsetX, offsetY, A, B, C);
}

function drawDimensions(ctx, pts, scale, offsetX, offsetY, A, B, C) {
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.font = "16px Arial";

  // Extract points
  const TL = pts[0];
  const TR = pts[1];
  const BR = pts[2];
  const BL = pts[3];

  // --- TOP WIDTH (A) ---
  const topY = TL[1] * scale + offsetY - 20;

  drawDimLine(ctx,
    TL[0] * scale + offsetX,
    topY,
    TR[0] * scale + offsetX,
    topY,
    `${A} mm`
  );

  // --- BOTTOM WIDTH (B) ---
  const bottomY = BL[1] * scale + offsetY + 40;

  drawDimLine(ctx,
    BL[0] * scale + offsetX,
    bottomY,
    BR[0] * scale + offsetX,
    bottomY,
    `${B} mm`
  );

  // --- HEIGHT (C) ---
  const leftX = BL[0] * scale + offsetX - 40;

  drawDimLine(ctx,
    leftX,
    TL[1] * scale + offsetY,
    leftX,
    BL[1] * scale + offsetY,
    `${C} mm`
  );
}

function drawDimLine(ctx, x1, y1, x2, y2, label) {
  // Draw main dimension line
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Draw arrowheads
  drawArrow(ctx, x1, y1, x2, y2);
  drawArrow(ctx, x2, y2, x1, y1);

  // Draw label at midpoint
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
    const offset = (B - A) / 2;
    pts = [
      [offset, 0],
      [offset + A, 0],
      [B, C],
      [0, C]
    ];
  }

  if (type === "right") {
    const offset = Math.max(0, B - A);
    pts = [
      [offset, 0],
      [offset + A, 0],
      [B, C],
      [0, C]
    ];
  }

  if (type === "irregular") {
    pts = [
      [D, 0],
      [D + A, 0],
      [B, C],
      [0, C]
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
