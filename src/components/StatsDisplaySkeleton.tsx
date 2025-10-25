/**
 * Copyright (c) 2025 Sudharshan2026
 * Licensed under the MIT License
 */

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './StatsDisplay.css';

/**
 * Skeleton loading component for StatsDisplay
 * Provides visual feedback during data fetching
 */
export const StatsDisplaySkeleton = () => {
  return (
    <div className="stats-display">
      <h2 className="stats-title">
        <Skeleton width={250} height={32} />
      </h2>
      
      <div className="main-content-grid">
        {/* Profile Information Skeleton - Left column */}
        <div className="profile-info">
          <div className="profile-header">
            <Skeleton circle width={80} height={80} />
            <div className="profile-details" style={{ flex: 1 }}>
              <Skeleton width={200} height={24} style={{ marginBottom: 8 }} />
              <Skeleton width={120} height={18} style={{ marginBottom: 8 }} />
              <Skeleton width={280} height={18} style={{ marginBottom: 8 }} />
              <Skeleton width={80} height={18} />
            </div>
          </div>
          
          <div className="additional-stats">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="stat-item">
                <Skeleton width={60} height={16} />
                <Skeleton width={40} height={20} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Statistics Table Skeleton - Right column */}
        <div className="stats-table-section">
          <div className="table-total-points">
            <Skeleton width={120} height={20} />
            <Skeleton width={150} height={36} />
          </div>
          
          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th><Skeleton width={100} /></th>
                  <th><Skeleton width={120} /></th>
                  <th><Skeleton width={140} /></th>
                  <th><Skeleton width={100} /></th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="stats-row">
                    <td><Skeleton width={120} /></td>
                    <td><Skeleton width={60} /></td>
                    <td><Skeleton width={160} /></td>
                    <td><Skeleton width={80} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Achievement Highlights Skeleton */}
      <div className="achievement-highlights">
        <h4><Skeleton width={150} height={24} /></h4>
        <div className="highlight-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="highlight-item">
              <Skeleton width={80} height={32} />
              <Skeleton width={120} height={18} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};