import PDFDocument from "pdfkit";

export const generatePrescriptionPDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20).text("EDOCHUB DIGITAL PRESCRIPTION", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
      doc.moveDown();

      // Doctor Info
      doc.fontSize(14).text("Doctor Details:", { underline: true });
      doc.fontSize(12).text(`Name: ${data.doctorName}`);
      doc.text(`Specialization: ${data.specialization || "N/A"}`);
      doc.moveDown();

      // Patient Info
      doc.fontSize(14).text("Patient Details:", { underline: true });
      doc.fontSize(12).text(`Name: ${data.patientName}`);
      doc.text(`Age: ${data.patientAge || "N/A"}`);
      doc.text(`Gender: ${data.patientGender || "N/A"}`);
      doc.moveDown();

      // Medications
      doc.fontSize(14).text("Medications:", { underline: true });
      data.medications.forEach((med, index) => {
        doc.fontSize(12).text(`${index + 1}. ${med.name} (${med.dosage})`);
        doc.fontSize(10).text(`   Frequency: ${med.frequency} | Duration: ${med.duration}`);
        if (med.instructions) {
          doc.text(`   Instructions: ${med.instructions}`);
        }
        doc.moveDown(0.5);
      });

      doc.moveDown();
      if (data.advice) {
        doc.fontSize(14).text("Advice:", { underline: true });
        doc.fontSize(12).text(data.advice);
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).text("This is a digitally generated prescription.", { align: "center", color: "grey" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateVisitReportPDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(20).text("PATIENT VISIT REPORT", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
      doc.moveDown();

      doc.fontSize(14).text("Patient Details:", { underline: true });
      doc.fontSize(12).text(`Name: ${data.patientName}`);
      doc.moveDown();

      doc.fontSize(14).text("Vitals:", { underline: true });
      doc.fontSize(12).text(`Temperature: ${data.vitals.temperature || "N/A"}`);
      doc.text(`Blood Pressure: ${data.vitals.bloodPressure || "N/A"}`);
      doc.text(`Pulse Rate: ${data.vitals.pulseRate || "N/A"}`);
      doc.text(`SpO2: ${data.vitals.spO2 || "N/A"}`);
      doc.text(`Weight: ${data.vitals.weight || "N/A"}`);
      doc.moveDown();

      if (data.chiefComplaints) {
        doc.fontSize(14).text("Chief Complaints:", { underline: true });
        doc.fontSize(12).text(data.chiefComplaints);
        doc.moveDown();
      }

      if (data.diagnosis) {
        doc.fontSize(14).text("Diagnosis:", { underline: true });
        doc.fontSize(12).text(data.diagnosis);
        doc.moveDown();
      }

      if (data.observations) {
        doc.fontSize(14).text("Observations:", { underline: true });
        doc.fontSize(12).text(data.observations);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
