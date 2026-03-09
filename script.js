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

  const scale = 1; // 1 mm = 1 pixel (adjust if needed)
  const offsetX = 50;
  const offsetY = 50;

  ctx.beginPath();
  ctx.moveTo(pts[0][0] * scale + offsetX, pts[0][1] * scale + offsetY);

  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0] * scale + offsetX, pts[i][1] * scale + offsetY);
  }

  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#000";
  ctx.stroke();
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
