const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BASE_API_URL = "http://localhost:8080/grade/class"; // Modify as needed

const generateRubricPDF = async (req, res) => {
  try {
    const { classId } = req.params;

    // **Step 1: Fetch class grades from API**
    const response = await axios.get(`${BASE_API_URL}/${classId}`, {
      headers: { Authorization: `Bearer ${req.cookies.token}` }, // Token already verified in middleware
    });

    const data = response.data;
    if (!data || !data.classDetails || !data.grades) {
      return res.status(404).json({ message: "Class data not found" });
    }

    // Create a temporary directory if it doesn't exist
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Sanitize classId to prevent path issues
    const sanitizedClassId = classId.toString().trim();
    const filePath = path.join(tempDir, `rubric_${sanitizedClassId}.pdf`);

    // Create PDF document
    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
    });

    // Set up file stream with error handling
    const stream = fs.createWriteStream(filePath);
    stream.on("error", (err) => {
      console.error("Stream error:", err);
      return res
        .status(500)
        .json({ message: "Error creating PDF file stream" });
    });

    doc.pipe(stream);

    // **Step 2: Draw border around entire page**
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 20;

    doc
      .rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin)
      .lineWidth(1)
      .stroke();

    // **Step 3: Add College Header with correct logos**
    // Path to the logos - update these with your actual paths
    const leftLogoPath = path.join(__dirname, "../assets/svkm-logo.png");
    const rightLogoPath = path.join(__dirname, "../assets/college-logo.png");

    // Add left logo (SVKM)
    if (fs.existsSync(leftLogoPath)) {
      doc.image(leftLogoPath, 30, 30, { width: 60 });
    }

    // Add right logo (College emblem)
    if (fs.existsSync(rightLogoPath)) {
      doc.image(rightLogoPath, 505, 30, { width: 60 });
    }

    // College name and details - centered between logos
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Shri Vile Parle Kelavani Mandal's", 100, 35, {
        align: "center",
        width: 395,
      });
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("DWARKADAS J. SANGHVI COLLEGE OF ENGINEERING", 100, 50, {
        align: "center",
        width: 395,
      });
    doc
      .fontSize(8)
      .font("Helvetica")
      .text(
        "(Autonomous College Affiliated to the University of Mumbai)",
        100,
        65,
        { align: "center", width: 395 }
      );
    doc
      .fontSize(8)
      .font("Helvetica")
      .text("NAAC Accredited with 'A' Grade (3.24 on 4 Point Scale)", 100, 75, {
        align: "center",
        width: 395,
      });

    // Department header
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("DEPARTMENT OF INFORMATION TECHNOLOGY", 40, 95, {
        align: "center",
        width: 515,
      });
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(
        "Continuous Assessment for Laboratory / Assignment sessions",
        40,
        110,
        { align: "center", width: 515 }
      );
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Academic Year ${data.classDetails.academicYear || "2024 - 2025"}`,
        40,
        125,
        { align: "center", width: 515 }
      );
    // **Step 4: Add Student Info Section**
    const startY = 150;
    doc.fontSize(10).font("Helvetica-Bold");

    // Left side info
    doc
      .text("Name:", 40, startY)
      .font("Helvetica")
      .text(data.studentDetails.name, 85, startY);
    doc
      .font("Helvetica-Bold")
      .text("Course:", 40, startY + 15)
      .font("Helvetica")
      .text(data.classDetails.name, 85, startY + 15);
    doc
      .font("Helvetica-Bold")
      .text("Year:", 40, startY + 30)
      .font("Helvetica")
      .text(`${data.classDetails.year || "T. Y. B. Tech"}`, 75, startY + 30);

    // Right side info
    doc
      .font("Helvetica-Bold")
      .text("SAP ID:", 350, startY)
      .font("Helvetica")
      .text(data.studentDetails.sapid, 400, startY);
    doc
      .font("Helvetica-Bold")
      .text("Course Code:", 350, startY + 15)
      .font("Helvetica")
      .text(data.classDetails.courseCode, 420, startY + 15);
    doc
      .font("Helvetica-Bold")
      .text("Sem:", 350, startY + 30)
      .font("Helvetica")
      .text(`${data.classDetails.semester || "V"}`, 380, startY + 30);
    doc
      .font("Helvetica-Bold")
      .text("Batch:", 450, startY + 30)
      .font("Helvetica")
      .text(data.classDetails.batch, 490, startY + 30);

    // **Step 5: Create Rubric Table**
    const tableTop = startY + 60;
    const tableLeft = 40;

    // Define column widths
    const performanceIndicatorWidth = 240;
    const performanceColumnWidth = 27;

    // Create array of column widths
    const colWidth = [performanceIndicatorWidth];
    // Add performance columns (1-10)
    for (let i = 0; i < 10; i++) {
      colWidth.push(performanceColumnWidth);
    }

    const rowHeight = 25;

    // Draw table headers - First row
    doc.font("Helvetica").fontSize(8);

    let currentY = tableTop;
    let currentX = tableLeft;

    // Draw Performance Indicators header cell
    doc.rect(currentX, currentY, colWidth[0], rowHeight).stroke();
    doc
      .font("Helvetica-Bold")
      .text("Performance Indicators", currentX + 5, currentY + 5, {
        width: colWidth[0] - 10,
        align: "center",
      });
    doc.text("(Maximum 5 marks per indicator)", currentX + 5, currentY + 15, {
      width: colWidth[0] - 10,
      align: "center",
    });

    currentX += colWidth[0];

    // Draw number headers (1-10)
    for (let i = 1; i <= 10; i++) {
      doc.rect(currentX, currentY, colWidth[i], rowHeight).stroke();
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(i.toString(), currentX + 5, currentY + 10, {
          width: colWidth[i] - 10,
          align: "center",
        });
      currentX += colWidth[i];
    }

    // Second row - Course Outcome
    currentY += rowHeight;
    currentX = tableLeft;

    doc.rect(currentX, currentY, colWidth[0], rowHeight).stroke();
    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("Course Outcome", currentX + 5, currentY + 10, {
        width: colWidth[0] - 10,
        align: "center",
      });
    currentX += colWidth[0];

    // Draw empty cells
    for (let i = 1; i <= 10; i++) {
      doc.rect(currentX, currentY, colWidth[i], rowHeight).stroke();
      currentX += colWidth[i];
    }

    // Create assessment criteria rows
    const criteriaLabels = [
      ["1. Knowledge (5)", "(Factual/Conceptual/Procedural/", "Metacognitive)"],
      ["2. Describe (5)", "(Factual/Conceptual/Procedural/", "Metacognitive)"],
      [
        "3. Demonstration (5)",
        "(Factual/Conceptual/Procedural/",
        "Metacognitive)",
      ],
      [
        "4. Strategy (Analyse & / or",
        "Evaluate) (5)",
        "(Factual/Conceptual/",
        "Procedural/Metacognitive)",
      ],
      [
        "5. Interpret/ Develop",
        "(Factual/Conceptual/",
        "Procedural/Metacognitive)",
      ],
      [
        "6. Attitude towards learning (5)",
        "(receiving, attending, responding,",
        "valuing, organizing,",
        "characterization by value)",
      ],
      [
        "7. Non-verbal communication",
        "skills/ Behaviour or Behavioural",
        "skills",
        "(motor skills, hand-eye",
        "coordination, gross body",
        "etc)",
      ],
    ];

    doc.font("Helvetica");

    // Draw criteria rows
    for (let i = 0; i < criteriaLabels.length; i++) {
      currentY += rowHeight;
      currentX = tableLeft;

      let rowHeightMultiplier = criteriaLabels[i].length > 3 ? 2.5 : 1.5;
      let currentRowHeight = rowHeight * rowHeightMultiplier;

      // Draw label cell
      doc.rect(currentX, currentY, colWidth[0], currentRowHeight).stroke();

      // Add the criteria text with appropriate formatting
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .text(criteriaLabels[i][0], currentX + 5, currentY + 5, {
          width: colWidth[0] - 10,
        });
      doc.font("Helvetica").fontSize(7);

      for (let j = 1; j < criteriaLabels[i].length; j++) {
        doc.text(criteriaLabels[i][j], currentX + 5, currentY + 5 + j * 10, {
          width: colWidth[0] - 10,
        });
      }

      currentX += colWidth[0];

      // Draw cells for each indicator (1-10)
      for (let j = 1; j <= 10; j++) {
        doc.rect(currentX, currentY, colWidth[j], currentRowHeight).stroke();

        // Add dashes if rows 5 or 7 (Interpret or Non-verbal)
        if (i === 4 || i === 6) {
          doc
            .font("Helvetica")
            .fontSize(8)
            .text("--", currentX + 5, currentY + currentRowHeight / 2 - 5, {
              width: colWidth[j] - 10,
              align: "center",
            });
        }
        // Add grade data if available
        else if (j <= data.grades.length) {
          const grade = data.grades[j - 1];
          let value = "";

          // Map criteria index to the corresponding property in the data
          switch (i) {
            case 0:
              value = grade.knowledge;
              break;
            case 1:
              value = grade.description;
              break;
            case 2:
              value = grade.demonstration;
              break;
            case 3:
              value = grade.strategy;
              break;
            case 5:
              value = grade.attitude;
              break;
          }

          if (value && value !== "−" && value !== "-") {
            doc
              .font("Helvetica")
              .fontSize(8)
              .text(
                value.toString(),
                currentX + 5,
                currentY + currentRowHeight / 2 - 5,
                { width: colWidth[j] - 10, align: "center" }
              );
          }
        }

        currentX += colWidth[j];
      }

      currentY += currentRowHeight - rowHeight; // Adjust for taller rows
    }

    // Create total row
    currentY += rowHeight;
    currentX = tableLeft;

    doc.rect(currentX, currentY, colWidth[0], rowHeight).stroke();
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("Total (25)", currentX + 5, currentY + 10, {
        width: colWidth[0] - 10,
      });
    currentX += colWidth[0];

    // Draw total cells for each column
    for (let j = 1; j <= 10; j++) {
      doc.rect(currentX, currentY, colWidth[j], rowHeight).stroke();

      // Add totals if available
      if (j <= data.grades.length) {
        const grade = data.grades[j - 1];
        if (grade && grade.total) {
          doc
            .font("Helvetica")
            .fontSize(8)
            .text(grade.total.toString(), currentX + 5, currentY + 10, {
              width: colWidth[j] - 10,
              align: "center",
            });
        }
      }

      currentX += colWidth[j];
    }
// Create Date of Assignment row
currentY += rowHeight;
currentX = tableLeft;

doc.rect(currentX, currentY, colWidth[0], rowHeight).stroke();
doc
  .font("Helvetica-Bold")
  .fontSize(7)
  .text("Date", currentX + 5, currentY + 8, { width: colWidth[0] - 10, align: "center" });
currentX += colWidth[0];

// Draw date cells for each column
for (let j = 1; j <= 10; j++) {
  doc.rect(currentX, currentY, colWidth[j], rowHeight).stroke();

  // Add formatted date if available
  if (j <= data.grades.length) {
    const grade = data.grades[j - 1];
    if (grade && grade.dateOfAssignment) {
      const date = new Date(grade.dateOfAssignment);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`; // DD/MM/YY format

      doc
        .font("Helvetica")
        .fontSize(6.5) // Slightly reduced font size
        .text(formattedDate, currentX, currentY + 9, {
          width: colWidth[j], // Use full column width
          align: "center",
        });
    }
  }

  currentX += colWidth[j];
}


    // Create signature row
    currentY += rowHeight;
    currentX = tableLeft;

    doc.rect(currentX, currentY, colWidth[0], rowHeight).stroke();
    doc
      .fontSize(8)
      .text("Signature of the faculty member", currentX + 5, currentY + 10, {
        width: colWidth[0] - 10,
      });
    currentX += colWidth[0];

    // Draw signature cells
    for (let j = 1; j <= 10; j++) {
      doc.rect(currentX, currentY, colWidth[j], rowHeight).stroke();
      currentX += colWidth[j];
    }

    // Add grading key
    currentY += rowHeight + 5;
    doc
      .fontSize(8)
      .text(
        "Outstanding (5), Excellent (4), Good (3), Fair (2), Needs Improvement (1)",
        40,
        currentY,
        { align: "center", width: 515 }
      );

    // **Step 7: Add Signature Lines**
    currentY += 25;

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Sign of the Student:", tableLeft, currentY);
    doc
      .moveTo(tableLeft + 120, currentY + 5)
      .lineTo(tableLeft + 300, currentY + 5)
      .stroke();

    currentY += 30;
    doc.text("Signature of the Faculty member:", tableLeft, currentY);
    doc
      .moveTo(tableLeft + 170, currentY + 5)
      .lineTo(tableLeft + 300, currentY + 5)
      .stroke();

    // Right side - HOD signature
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Dr Vinaya Savant", 400, currentY);
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Head of the Department", 400, currentY + 15);

    currentY += 20;
    doc.text("Name of the Faculty member:", tableLeft, currentY);

    // Move down for faculty name (on left side)
    currentY += 15;
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(data.classDetails.facultyName, tableLeft, currentY);

    // Right side - Date
    doc.text("Date:", 400, currentY);

    // Add footer with college details
    const footerY = pageHeight - 50;
    doc
      .fontSize(6)
      .font("Helvetica")
      .text(
        "PLOT NO. D-15, JVPD SCHEME, BHAKTIVEDANTA SWAMI MARG, VILE PARLE (WEST), MUMBAI - 400056",
        40,
        footerY,
        { align: "center", width: 515 }
      );
    doc.text(
      "Tel.: 42335000/42335001  Email : info@djsce.ac.in / admin@djsce.ac.in  Website : www.djsce.ac.in",
      40,
      footerY + 10,
      { align: "center", width: 515 }
    );

    doc.end();

    // **Step 8: Return PDF**
    stream.on("finish", () => {
      // Check if file exists before sending
      if (fs.existsSync(filePath)) {
        res.download(filePath, `rubric_${sanitizedClassId}.pdf`, (err) => {
          if (err) {
            console.error("Download error:", err);
            return res.status(500).json({ message: "Error downloading PDF" });
          }
          // Clean up file after download
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file:", unlinkErr);
          });
        });
      } else {
        return res
          .status(500)
          .json({ message: "Generated PDF file not found" });
      }
    });
  } catch (error) {
    console.error("Error generating rubric PDF:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
};

module.exports = { generateRubricPDF };
