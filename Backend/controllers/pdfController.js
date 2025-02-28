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
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Sanitize classId to prevent path issues
        const sanitizedClassId = classId.toString().trim();
        const filePath = path.join(tempDir, `rubric_${sanitizedClassId}.pdf`);
        
        // Create PDF document
        const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4' 
        });
        
        // Set up file stream with error handling
        const stream = fs.createWriteStream(filePath);
        stream.on('error', (err) => {
            console.error('Stream error:', err);
            return res.status(500).json({ message: "Error creating PDF file stream" });
        });
        
        doc.pipe(stream);

        // **Step 2: Add Title and Academic Year**
        doc.fontSize(16).font('Helvetica-Bold').text("Continuous Assessment Rubrics", { align: "center" });
        doc.fontSize(12).font('Helvetica').text(`Academic Year ${data.classDetails.academicYear || "2024 - 2025"}`, { align: "center" });
        doc.moveDown(2);

        // **Step 3: Add Student Info Section**
        doc.fontSize(10).text(`Name: ____________________________________________`);
        doc.text(`SAP ID: ___________________`);
        doc.moveDown();

        // **Step 4: Add Course Details**
        const classDetails = data.classDetails;
        doc.text(`Course: `).font('Helvetica-Bold').text(`${classDetails.name}`, { continued: true }).font('Helvetica').text(` Course Code: ${classDetails.courseCode}`);
        doc.text(`Year: ${classDetails.year || "T. Y. B. Tech"} Sem: ${classDetails.semester || "V"} Batch: __________`);
        doc.text(`Department: ${classDetails.department}`);
        doc.moveDown(2);

        // **Step 5: Determine the number of assignments in the data**
        // Extract unique assignments from grades
        const uniqueAssignments = [...new Set(data.grades.map(grade => grade.assignmentNumber))];
        const numAssignments = Math.min(uniqueAssignments.length, 10); // Maximum 10 assignments

        // Sort assignments in ascending order
        uniqueAssignments.sort((a, b) => a - b);

        // **Step 6: Create Rubric Table**
        const tableTop = doc.y;
        const tableLeft = 50;
        
        // Define column widths
        const performanceIndicatorWidth = 180;
        const performanceColumnWidth = 20;
        const assignmentColumnWidth = 35;
        
        // Calculate total table width based on number of assignments
        const totalPerformanceColumns = 10; // Always show 10 performance columns
        const totalTableWidth = performanceIndicatorWidth + 
                              (totalPerformanceColumns * performanceColumnWidth) + 
                              (numAssignments * assignmentColumnWidth);
        
        // Create array of column widths
        const colWidth = [performanceIndicatorWidth];
        // Add performance columns (1-10)
        for (let i = 0; i < totalPerformanceColumns; i++) {
            colWidth.push(performanceColumnWidth);
        }
        // Add assignment columns
        for (let i = 0; i < numAssignments; i++) {
            colWidth.push(assignmentColumnWidth);
        }
        
        const rowHeight = 40;
        
        // Draw table headers
        doc.font('Helvetica-Bold').fontSize(8);
        
        // First row - headers
        let currentY = tableTop;
        let currentX = tableLeft;
        
        // Draw header cells
        doc.rect(currentX, currentY, colWidth[0], rowHeight).stroke();
        doc.text("Performance Indicators\n(Minimum 3 Indicators)", currentX + 5, currentY + 10, { width: colWidth[0] - 10, align: 'center' });
        currentX += colWidth[0];
        
        // Draw number headers (1-10)
        for (let i = 1; i <= totalPerformanceColumns; i++) {
            doc.rect(currentX, currentY, colWidth[i], rowHeight).stroke();
            doc.text(i.toString(), currentX + 5, currentY + 15, { width: colWidth[i] - 10, align: 'center' });
            currentX += colWidth[i];
        }
        
        // Draw Assignment headers
        for (let i = 0; i < numAssignments; i++) {
            const assignmentIndex = totalPerformanceColumns + 1 + i;
            doc.rect(currentX, currentY, colWidth[assignmentIndex], rowHeight).stroke();
            doc.text(`Assignment ${uniqueAssignments[i]}`, currentX + 2, currentY + 15, { width: colWidth[assignmentIndex] - 4, align: 'center' });
            currentX += colWidth[assignmentIndex];
        }
        
        // Second row - Course Outcome
        currentY += rowHeight;
        currentX = tableLeft;
        
        doc.rect(currentX, currentY, colWidth[0], rowHeight/2).stroke();
        doc.text("Course Outcome", currentX + 5, currentY + 5, { width: colWidth[0] - 10 });
        currentX += colWidth[0];
        
        // Draw "1" for each column
        for (let i = 1; i <= totalPerformanceColumns + numAssignments; i++) {
            const colWidthIndex = i;
            doc.rect(currentX, currentY, colWidth[colWidthIndex], rowHeight/2).stroke();
            doc.text("1", currentX + 5, currentY + 5, { width: colWidth[colWidthIndex] - 10, align: 'center' });
            currentX += colWidth[colWidthIndex];
        }
        
        // Create assessment criteria rows
        const criteriaLabels = [
            "1. Knowledge (6)\n(Factual/Conceptual/Procedural/ Metacognitive)",
            "2. Describe (6)\n(Factual/Conceptual/Procedural/ Metacognitive)",
            "3. Demonstration (8)\n(Factual/Conceptual/Procedural/ Metacognitive)",
            "4. Strategy (Analyse & / or Evaluate)\n(Factual/Conceptual/Procedural/Metacognitive)",
            "5. Interpret/ Develop\n(Factual/Conceptual/Procedural/Metacognitive)",
            "6. Attitude towards learning (5)\n(receiving, attending, responding, valuing, organizing, characterization by value)"
        ];
        
        doc.font('Helvetica');
        
        // Draw criteria rows
        for (let i = 0; i < criteriaLabels.length; i++) {
            currentY += rowHeight/2;
            currentX = tableLeft;
            
            // Draw label cell
            doc.rect(currentX, currentY, colWidth[0], rowHeight).stroke();
            doc.text(criteriaLabels[i], currentX + 5, currentY + 5, { width: colWidth[0] - 10 });
            currentX += colWidth[0];
            
            // Draw empty cells for each column
            for (let j = 1; j <= totalPerformanceColumns + numAssignments; j++) {
                const colWidthIndex = j;
                doc.rect(currentX, currentY, colWidth[colWidthIndex], rowHeight).stroke();
                
                // If we have data for this assignment and criteria, add it
                if (j > totalPerformanceColumns) {
                    const assignmentNum = uniqueAssignments[j - totalPerformanceColumns - 1];
                    const assignment = data.grades.find(g => g.assignmentNumber === assignmentNum);
                    
                    if (assignment) {
                        let value = "";
                        // Map criteria index to the corresponding property in the data
                        switch(i) {
                            case 0: value = assignment.knowledge; break;
                            case 1: value = assignment.description; break;
                            case 2: value = assignment.demonstration; break;
                            case 3: value = assignment.strategy; break;
                            case 4: value = assignment.interpret || "−"; break;
                            case 5: value = assignment.attitude; break;
                        }
                        
                        if (value && value !== "−" && value !== "-") {
                            doc.text(value.toString(), currentX + 5, currentY + 15, { width: colWidth[colWidthIndex] - 10, align: 'center' });
                        }
                    }
                }
                
                currentX += colWidth[colWidthIndex];
            }
        }
        
        // Create total row
        currentY += rowHeight;
        currentX = tableLeft;
        
        doc.rect(currentX, currentY, colWidth[0], rowHeight/2).stroke();
        doc.font('Helvetica-Bold').text("Total (Out of 25)", currentX + 5, currentY + 5, { width: colWidth[0] - 10 });
        currentX += colWidth[0];
        
        for (let j = 1; j <= totalPerformanceColumns; j++) {
            doc.rect(currentX, currentY, colWidth[j], rowHeight/2).stroke();
            currentX += colWidth[j];
        }
        
        // Add totals for assignments
        for (let i = 0; i < numAssignments; i++) {
            const colWidthIndex = totalPerformanceColumns + 1 + i;
            const assignmentNum = uniqueAssignments[i];
            const assignment = data.grades.find(g => g.assignmentNumber === assignmentNum);
            
            doc.rect(currentX, currentY, colWidth[colWidthIndex], rowHeight/2).stroke();
            
            if (assignment && assignment.total) {
                doc.text(assignment.total.toString(), currentX + 5, currentY + 5, { width: colWidth[colWidthIndex] - 10, align: 'center' });
            }
            
            currentX += colWidth[colWidthIndex];
        }
        
        // Create signature row
        currentY += rowHeight/2;
        currentX = tableLeft;
        
        doc.rect(currentX, currentY, colWidth[0], rowHeight/2).stroke();
        doc.text("Signature of the faculty member", currentX + 5, currentY + 5, { width: colWidth[0] - 10 });
        currentX += colWidth[0];
        
        for (let j = 1; j <= totalPerformanceColumns + numAssignments; j++) {
            const colWidthIndex = j;
            doc.rect(currentX, currentY, colWidth[colWidthIndex], rowHeight/2).stroke();
            currentX += colWidth[colWidthIndex];
        }
        
        // **Step 7: Add Signature Lines**
        currentY += rowHeight/2 + 30;
        
        doc.fontSize(10).font('Helvetica').text("Sign of the Student:", tableLeft, currentY);
        doc.moveTo(tableLeft + 120, currentY + 5).lineTo(tableLeft + 300, currentY + 5).stroke();
        
        currentY += 30;
        doc.text("Signature of the Faculty member:", tableLeft, currentY);
        doc.moveTo(tableLeft + 170, currentY + 5).lineTo(tableLeft + 300, currentY + 5).stroke();
        
        doc.text("Signature of Head of the Department", tableLeft + 320, currentY);
        doc.moveTo(tableLeft + 320, currentY + 30).lineTo(tableLeft + 500, currentY + 30).stroke();
        
        currentY += 20;
        doc.text(`Name of the Faculty member: ${classDetails.facultyName || ""}`, tableLeft, currentY);
        doc.text("Date:", tableLeft + 320, currentY);
        
        // Add Bloom's Taxonomy section if there's enough space
        if (currentY < 700) {
            currentY += 50;
            doc.font('Helvetica-Bold').fontSize(12).text("Bloom's (Revised) Taxonomy", tableLeft, currentY, { align: 'center' });
            
            // Course code and outcome table
            currentY += 30;
            const outcomeTableTop = currentY;
            const outcomeColWidths = [80, 300, 100];
            
            // Header
            doc.font('Helvetica-Bold').fontSize(10);
            doc.rect(tableLeft, outcomeTableTop, outcomeColWidths[0], 30).stroke();
            doc.rect(tableLeft + outcomeColWidths[0], outcomeTableTop, outcomeColWidths[1], 30).stroke();
            doc.rect(tableLeft + outcomeColWidths[0] + outcomeColWidths[1], outcomeTableTop, outcomeColWidths[2], 30).stroke();
            
            doc.text("Code", tableLeft + 5, outcomeTableTop + 10, { width: outcomeColWidths[0] - 10, align: 'center' });
            doc.text("Course Outcome", tableLeft + outcomeColWidths[0] + 5, outcomeTableTop + 10, { width: outcomeColWidths[1] - 10, align: 'center' });
            doc.text("Bloom's Level", tableLeft + outcomeColWidths[0] + outcomeColWidths[1] + 5, outcomeTableTop + 10, { width: outcomeColWidths[2] - 10, align: 'center' });
            
            // Data row
            const dataY = outcomeTableTop + 30;
            doc.font('Helvetica').fontSize(9);
            doc.rect(tableLeft, dataY, outcomeColWidths[0], 30).stroke();
            doc.rect(tableLeft + outcomeColWidths[0], dataY, outcomeColWidths[1], 30).stroke();
            doc.rect(tableLeft + outcomeColWidths[0] + outcomeColWidths[1], dataY, outcomeColWidths[2], 30).stroke();
            
            doc.text(classDetails.courseCode || "DJS22ITL504.1", tableLeft + 5, dataY + 10, { width: outcomeColWidths[0] - 10 });
            doc.text("Design secure system using appropriate security mechanism", tableLeft + outcomeColWidths[0] + 5, dataY + 10, { width: outcomeColWidths[1] - 10 });
            doc.text("Apply", tableLeft + outcomeColWidths[0] + outcomeColWidths[1] + 5, dataY + 10, { width: outcomeColWidths[2] - 10, align: 'center' });
        }
        
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
                return res.status(500).json({ message: "Generated PDF file not found" });
            }
        });

    } catch (error) {
        console.error("Error generating rubric PDF:", error);
        res.status(500).json({ message: "Error generating PDF" });
    }
};

module.exports = { generateRubricPDF };