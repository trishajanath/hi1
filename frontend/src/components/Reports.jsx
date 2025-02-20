import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "./reports.css";


const Reports = () => {
 const [reports, setReports] = useState([]);


 useEffect(() => {
   fetch("http://localhost:8000/images/reports")
     .then((response) => response.json())
     .then((data) => setReports(data.reports))
     .catch((error) => console.error("Error fetching reports:", error));
 }, []);


 const deleteReport = (filename) => {
   if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
     fetch(`http://localhost:8000/images/reports/${filename}`, {
       method: "DELETE",
     })
       .then((response) => {
         if (!response.ok) {
           throw new Error("Failed to delete report");
         }
         return response.json();
       })
       .then(() => {
         setReports(reports.filter((report) => report.filename !== filename));
       })
       .catch((error) => console.error("Error deleting report:", error));
   }
 };


 const downloadPDF = (report) => {
   const doc = new jsPDF();
   doc.text(`Report: ${report.filename}`, 10, 10);
   doc.text(`Predicted Subtype: ${report.predicted_subtype}`, 10, 20);
   doc.text(`Confidence: ${report.confidence}`, 10, 30);
   doc.save(`${report.filename}.pdf`);
 };


 return (
   <div className="reports-container">
     <h2>Microscopy Analysis Reports</h2>
     <div className="reports-list">
       {reports.length === 0 ? (
         <p>No reports available</p>
       ) : (
         reports.map((report, index) => (
           <div key={index} className="report-card">
             <h3>{report.filename}</h3>
             <p><strong>Predicted Subtype:</strong> {report.predicted_subtype}</p>
             <p><strong>Confidence:</strong> {report.confidence}</p>
             <div className="images-container">
               <div className="image-section">
                 <span className="image-label">Original Image</span>
                 <img src={report.original_image} alt="Original" className="report-image" />
               </div>
               <div className="image-section">
                 <span className="image-label">Heatmap</span>
                 <img src={report.heatmap} alt="Heatmap" className="report-image" />
               </div>
             </div>
             <div className="report-actions">
               <button className="delete-btn" onClick={() => deleteReport(report.filename)}>🗑 Delete</button>
               <button className="download-btn" onClick={() => downloadPDF(report)}>📄 Download PDF</button>
             </div>
           </div>
         ))
       )}
     </div>
   </div>
 );
};


export default Reports;