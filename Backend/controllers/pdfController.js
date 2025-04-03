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

    // Register Times New Roman font (make sure you have the font files)
    doc.registerFont('Times-Roman', path.join(__dirname, '../fonts/times.ttf'));
    doc.registerFont('Times-Bold', path.join(__dirname, '../fonts/timesbd.ttf'));

    // Pipe the PDF content to a file stream
    const stream = fs.createWriteStream(filePath); // Declare `stream` here
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
      .font("Times-Bold")
      .text("Shri Vile Parle Kelavani Mandal's", 100, 35, {
        align: "center",
        width: 395,
      });
    doc
      .fontSize(12)
      .font("Times-Bold")
      .text("DWARKADAS J. SANGHVI COLLEGE OF ENGINEERING", 100, 50, {
        align: "center",
        width: 395,
      });
    doc
      .fontSize(8)
      .font("Times-Roman")
      .text(
        "(Autonomous College Affiliated to the University of Mumbai)",
        100,
        65,
        { align: "center", width: 395 }
      );
    doc
      .fontSize(8)
      .font("Times-Roman")
      .text("NAAC Accredited with 'A' Grade (3.24 on 4 Point Scale)", 100, 75, {
        align: "center",
        width: 395,
      });

    // Department header
    doc
      .fontSize(12)
      .font("Times-Bold")
      .text("DEPARTMENT OF INFORMATION TECHNOLOGY", 40, 95, {
        align: "center",
        width: 515,
      });
    doc
      .fontSize(10)
      .font("Times-Bold")
      .text(
        "Continuous Assessment for Laboratory / Assignment sessions",
        40,
        110,
        { align: "center", width: 515 }
      );
    doc
      .fontSize(10)
      .font("Times-Roman")
      .text(
        `Academic Year ${data.classDetails.academicYear || "2024 - 2025"}`,
        40,
        125,
        { align: "center", width: 515 }
      );
    // **Step 4: Add Student Info Section**
    const startY = 150;
    doc.fontSize(10).font("Times-Bold");

    // Left side info
    doc
      .text("Name:", 40, startY)
      .font("Times-Roman")
      .text(data.studentDetails.name, 85, startY);
    doc
      .font("Times-Bold")
      .text("Course:", 40, startY + 15)
      .font("Times-Roman")
      .text(data.classDetails.name, 85, startY + 15);
    doc
      .font("Times-Bold")
      .text("Year:", 40, startY + 30)
      .font("Times-Roman")
      .text(`${data.classDetails.year || "T. Y. B. Tech"}`, 75, startY + 30);

    // Right side info
    doc
      .font("Times-Bold")
      .text("SAP ID:", 350, startY)
      .font("Times-Roman")
      .text(data.studentDetails.sapid, 400, startY);
    doc
      .font("Times-Bold")
      .text("Course Code:", 350, startY + 15)
      .font("Times-Roman")
      .text(data.classDetails.courseCode, 420, startY + 15);
    doc
      .font("Times-Bold")
      .text("Sem:", 350, startY + 30)
      .font("Times-Roman")
      .text(`${data.classDetails.semester || "V"}`, 380, startY + 30);
    doc
      .font("Times-Bold")
      .text("Batch:", 450, startY + 30)
      .font("Times-Roman")
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
    doc.font("Times-Roman").fontSize(8);

    let currentY = tableTop;
    let currentX = tableLeft;

    // Draw Performance Indicators header cell
    doc.rect(currentX, currentY, colWidth[0], rowHeight).stroke();
    doc
      .font("Times-Bold")
      .text("Performance Indicators", currentX + 5, currentY + 5, {
        width: colWidth[0] - 10,
        align: "center",
      });
    
    // Calculate total marks from grading scheme
    const gradingScheme = data.classDetails.gradingScheme || {};
    const totalMaxMarks = Object.values(gradingScheme).reduce((sum, value) => sum + (parseInt(value) || 0), 0);
    
    doc.text(`(Maximum ${totalMaxMarks} marks total)`, currentX + 5, currentY + 15, {
      width: colWidth[0] - 10,
      align: "center",
    });

    currentX += colWidth[0];

    // Draw number headers (1-10)
    for (let i = 1; i <= 10; i++) {
      doc.rect(currentX, currentY, colWidth[i], rowHeight).stroke();
      doc
        .fontSize(8)
        .font("Times-Roman")
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
      .font("Times-Bold")
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

    // Create assessment criteria rows with dynamic max marks based on gradingScheme
    const criteriaLabels = [
      {
        key: "knowledge",
        labels: [
          "1. Knowledge",
          "(Factual/Conceptual/Procedural/",
          "Metacognitive)"
        ]
      },
      {
        key: "description",
        labels: [
          "2. Describe",
          "(Factual/Conceptual/Procedural/",
          "Metacognitive)"
        ]
      },
      {
        key: "demonstration",
        labels: [
          "3. Demonstration",
          "(Factual/Conceptual/Procedural/",
          "Metacognitive)"
        ]
      },
      {
        key: "strategy",
        labels: [
          "4. Strategy (Analyse & / or",
          "Evaluate)",
          "(Factual/Conceptual/",
          "Procedural/Metacognitive)"
        ]
      },
      {
        key: "interpret",
        labels: [
          "5. Interpret/ Develop",
          "(Factual/Conceptual/",
          "Procedural/Metacognitive)"
        ]
      },
      {
        key: "attitude",
        labels: [
          "6. Attitude towards learning",
          "(receiving, attending, responding,",
          "valuing, organizing,",
          "characterization by value)"
        ]
      },
      {
        key: "nonverbal",
        labels: [
          "7. Non-verbal communication",
          "skills/ Behaviour or Behavioural",
          "skills",
          "(motor skills, hand-eye",
          "coordination, gross body",
          "etc)"
        ]
      }
    ];

    doc.font("Times-Roman");

    // Draw criteria rows
    for (let i = 0; i < criteriaLabels.length; i++) {
      currentY += rowHeight;
      currentX = tableLeft;

      let rowHeightMultiplier = criteriaLabels[i].labels.length > 3 ? 2.5 : 1.5;
      let currentRowHeight = rowHeight * rowHeightMultiplier;

      // Draw label cell
      doc.rect(currentX, currentY, colWidth[0], currentRowHeight).stroke();

      // Get max marks for this category from gradingScheme
      const categoryKey = criteriaLabels[i].key;
      const maxMarks = gradingScheme[categoryKey] || 0;
      const shouldSkip = maxMarks === 0;

      // Add the criteria text with appropriate formatting
      const firstLineText = shouldSkip 
        ? `${criteriaLabels[i].labels[0].split(".")[0]}. ${criteriaLabels[i].labels[0].split(".")[1]}`
        : `${criteriaLabels[i].labels[0].split(".")[0]}. ${criteriaLabels[i].labels[0].split(".")[1]} (${maxMarks})`;
      
      doc
        .font("Times-Bold")
        .fontSize(8)
        .text(firstLineText, currentX + 5, currentY + 5, {
          width: colWidth[0] - 10,
        });
      doc.font("Times-Roman").fontSize(7);

      for (let j = 1; j < criteriaLabels[i].labels.length; j++) {
        doc.text(criteriaLabels[i].labels[j], currentX + 5, currentY + 5 + j * 10, {
          width: colWidth[0] - 10,
        });
      }

      currentX += colWidth[0];

      // Draw cells for each indicator (1-10)
      for (let j = 1; j <= 10; j++) {
        doc.rect(currentX, currentY, colWidth[j], currentRowHeight).stroke();

        // Add dashes if rows are for categories with 0 marks in gradingScheme
        if (shouldSkip) {
          doc
            .font("Times-Roman")
            .fontSize(8)
            .text("--", currentX + 5, currentY + currentRowHeight / 2 - 5, {
              width: colWidth[j] - 10,
              align: "center",
            });
        }
        // Add grade data if available and category is valid
        else if (j <= data.grades.length) {
          const grade = data.grades[j - 1];
          let value = "";

          // Map criteria index to the corresponding property in the data
          switch (categoryKey) {
            case "knowledge":
              value = grade.knowledge;
              break;
            case "description":
              value = grade.description;
              break;
            case "demonstration":
              value = grade.demonstration;
              break;
            case "strategy":
              value = grade.strategy;
              break;
            case "interpret":
              value = grade.interpret;
              break;
            case "attitude":
              value = grade.attitude;
              break;
            case "nonverbal":
              value = grade.nonverbal;
              break;
          }

          // Modified condition to handle zero values
          if (value !== undefined && value !== null && value !== "−" && value !== "-") {
            const displayValue = (value === 0 || value === "0") ? "0" : value.toString();
            doc
              .font("Times-Roman")
              .fontSize(8)
              .text(
                displayValue,
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
      .font("Times-Bold")
      .fontSize(8)
      .text(`Total (${totalMaxMarks})`, currentX + 5, currentY + 10, {
        width: colWidth[0] - 10,
      });
    currentX += colWidth[0];

    // Draw total cells for each column
    for (let j = 1; j <= 10; j++) {
      doc.rect(currentX, currentY, colWidth[j], rowHeight).stroke();

      // Add totals if available
      if (j <= data.grades.length) {
        const grade = data.grades[j - 1];
        if (grade && grade.total !== undefined && grade.total !== null) {
          const displayTotal = (grade.total === 0 || grade.total === "0") ? "0" : grade.total.toString();
          doc
            .font("Times-Roman")
            .fontSize(8)
            .text(displayTotal, currentX + 5, currentY + 10, {
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
      .font("Times-Bold")
      .fontSize(7)
      .text("Date", currentX + 5, currentY + 8, {
        width: colWidth[0] - 10,
        align: "center",
      });
    currentX += colWidth[0];

    // Draw date cells for each column
    for (let j = 1; j <= 10; j++) {
      doc.rect(currentX, currentY, colWidth[j], rowHeight).stroke();

      // Add formatted date if available
      if (j <= data.grades.length) {
        const grade = data.grades[j - 1];
        if (grade && grade.dateOfAssignment) {
          const date = new Date(grade.dateOfAssignment);
          const formattedDate = `${date
            .getDate()
            .toString()
            .padStart(2, "0")}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`; // DD/MM/YY format

          doc
            .font("Times-Roman")
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
      .font("Times-Bold")
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
      .font("Times-Bold")
      .text("Dr Vinaya Savant", 400, currentY);
    doc
      .fontSize(10)
      .font("Times-Bold")
      .text("Head of the Department", 400, currentY + 15);

    currentY += 20;
    doc.text("Name of the Faculty member:", tableLeft, currentY);

    // Move down for faculty name (on left side)
    currentY += 15;
    doc
      .fontSize(10)
      .font("Times-Bold")
      .text(data.classDetails.facultyName, tableLeft, currentY);

    // Right side - Date
    doc.text("Date:", 400, currentY);

    // Add footer with college details
    const footerY = pageHeight - 50;
    doc
      .fontSize(6)
      .font("Times-Roman")
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