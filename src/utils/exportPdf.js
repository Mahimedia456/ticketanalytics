import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function wait(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeFileName(name = "dashboard") {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function saveAndExpandScrollableAreas(root) {
  const changed = [];

  const scrollAreas = root.querySelectorAll(
    ".overflow-auto, .overflow-x-auto, .overflow-y-auto, .pdf-expand"
  );

  scrollAreas.forEach((el) => {
    changed.push({
      el,
      style: {
        maxHeight: el.style.maxHeight,
        height: el.style.height,
        overflow: el.style.overflow,
        overflowX: el.style.overflowX,
        overflowY: el.style.overflowY,
      },
    });

    el.style.maxHeight = "none";
    el.style.height = "auto";
    el.style.overflow = "visible";
    el.style.overflowX = "visible";
    el.style.overflowY = "visible";
  });

  return changed;
}

function restoreElements(changed = []) {
  changed.reverse().forEach(({ el, style }) => {
    el.style.maxHeight = style.maxHeight || "";
    el.style.height = style.height || "";
    el.style.overflow = style.overflow || "";
    el.style.overflowX = style.overflowX || "";
    el.style.overflowY = style.overflowY || "";
  });
}

export async function exportDashboardPDF(elementId, fileName = "dashboard") {
  const element = document.getElementById(elementId);
  if (!element) return;

  const changed = saveAndExpandScrollableAreas(element);

  try {
    await wait(700);

    const canvas = await html2canvas(element, {
      scale: 1.4,
      backgroundColor: "#000000",
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (doc) => {
        doc.body.style.background = "#000000";

        const cloned = doc.getElementById(elementId);
        if (cloned) {
          cloned.style.background = "#000000";
          cloned.style.color = "#ffffff";
          cloned.style.width = `${element.scrollWidth}px`;
        }
      },
    });

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const marginMm = 5;
    const usableWidthMm = pageWidthMm - marginMm * 2;
    const usableHeightMm = pageHeightMm - marginMm * 2;

    const pageHeightPx = Math.floor(
      (canvas.width * usableHeightMm) / usableWidthMm
    );

    let sourceY = 0;
    let pageIndex = 0;

    while (sourceY < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const ctx = pageCanvas.getContext("2d");

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      ctx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
      const imgHeightMm = (sliceHeight * usableWidthMm) / canvas.width;

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pageWidthMm, pageHeightMm, "F");

      pdf.addImage(
        imgData,
        "JPEG",
        marginMm,
        marginMm,
        usableWidthMm,
        imgHeightMm,
        undefined,
        "FAST"
      );

      sourceY += sliceHeight;
      pageIndex += 1;
    }

    pdf.save(`${safeFileName(fileName)}.pdf`);
  } finally {
    restoreElements(changed);
  }
}