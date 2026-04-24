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
    await wait(350);

    const canvas = await html2canvas(element, {
      scale: 1.15,
      backgroundColor: "#f4f7fb",
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.78);

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 5;

    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(
      imgData,
      "JPEG",
      margin,
      position,
      usableWidth,
      imgHeight,
      undefined,
      "FAST"
    );

    heightLeft -= usableHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();

      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        position,
        usableWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      heightLeft -= usableHeight;
    }

    pdf.save(`${safeFileName(fileName)}.pdf`);
  } finally {
    restoreElements(changed);
  }
}