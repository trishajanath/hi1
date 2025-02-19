import React from 'react';
import BottomNavBar from './BottomNavBar'; // Import BottomNavBar component
import './Reports.css'; // Import the CSS file for styling

const Reports = () => {
  return (
    <div className="reports-page-container">
      <h1 className="reports-title">Reports</h1>
      <p className="reports-description">View and manage your patient reports here.</p>
      <div className="reports-list">
        <p>No reports available.</p>
      </div>
      <BottomNavBar /> {/* Add BottomNavBar component */}
    </div>
  );
};

export default Reports;