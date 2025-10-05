import React from 'react';
import type { StatsDisplayProps } from '../types';
import './StatsDisplay.css';

const StatsDisplay: React.FC<StatsDisplayProps> = ({ profileData }) => {
  const calculateCategoryPoints = () => {
    const { stats } = profileData;
    return {
      codeTrack: stats.codeTrack * 2,
      codeTutor: stats.codeTutor * 0,
      dailyTest: stats.dailyTest * 20,
      dailyChallenge: stats.dailyChallenge * 2,
      codeTest: stats.codeTest * 30,
    };
  };

  const categoryPoints = calculateCategoryPoints();

  const formatCount = (count: number): string => {
    return count === 0 ? '0' : count.toLocaleString();
  };

  const formatPoints = (points: number): string => {
    return points === 0 ? '0' : points.toLocaleString();
  };

  return (
    <div className="stats-display">
      <h2 className="stats-title">Your SkillRack Statistics</h2>
      
      <div className="main-content-grid">
        {/* Profile Information Section - Left column on desktop */}
        <div className="profile-info">
          <div className="profile-header">
            {profileData.profileImage && (
              <img 
                src={profileData.profileImage} 
                alt="Profile" 
                className="profile-image"
              />
            )}
            <div className="profile-details">
              <h3 className="profile-name">{profileData.name}</h3>
              <div className="profile-id">ID: {profileData.id}</div>
              <div className="profile-education">
                <span className="department">{profileData.department}</span>
                {profileData.college && (
                  <>
                    <span className="divider">•</span>
                    <span className="college">{profileData.college}</span>
                  </>
                )}
                {profileData.year && (
                  <>
                    <span className="divider">•</span>
                    <span className="year">{profileData.year}</span>
                  </>
                )}
              </div>
              {profileData.gender && (
                <div className="profile-gender">{profileData.gender}</div>
              )}
            </div>
          </div>
          
          <div className="additional-stats">
            <div className="stat-item">
              <span className="stat-label">Rank</span>
              <span className="stat-value">{formatCount(profileData.stats.rank)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Level</span>
              <span className="stat-value">{formatCount(profileData.stats.level)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🥇 Gold</span>
              <span className="stat-value">{formatCount(profileData.stats.gold)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🥈 Silver</span>
              <span className="stat-value">{formatCount(profileData.stats.silver)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🥉 Bronze</span>
              <span className="stat-value">{formatCount(profileData.stats.bronze)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Solved</span>
              <span className="stat-value">{formatCount(profileData.stats.programsSolved)}</span>
            </div>
          </div>
        </div>
        
        {/* Statistics Section - Right column on desktop */}
        <div className="stats-table-section">
          {/* Total Points Section */}
          <div className="table-total-points">
            <div className="table-total-label">Total Points</div>
            <div className="table-total-value">{formatPoints(profileData.stats.totalPoints)}</div>
          </div>
          
          {/* Statistics Table */}
          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Problems Solved</th>
                  <th>Points Calculation</th>
                  <th>Total Points</th>
                </tr>
              </thead>
              <tbody>
                <tr className="stats-row">
                  <td className="category-name">
                    <span className="category-icon">🏃</span>
                    Code Track
                  </td>
                  <td className="problem-count">
                    {formatCount(profileData.stats.codeTrack)}
                  </td>
                  <td className="calculation">
                    {formatCount(profileData.stats.codeTrack)} × 2 = {formatPoints(categoryPoints.codeTrack)}
                  </td>
                  <td className="points">
                    {formatPoints(categoryPoints.codeTrack)}
                  </td>
                </tr>

                <tr className="stats-row">
                  <td className="category-name">
                    <span className="category-icon">📝</span>
                    Code Test
                  </td>
                  <td className="problem-count">
                    {formatCount(profileData.stats.codeTest)}
                  </td>
                  <td className="calculation">
                    {formatCount(profileData.stats.codeTest)} × 30 = {formatPoints(categoryPoints.codeTest)}
                  </td>
                  <td className="points">
                    {formatPoints(categoryPoints.codeTest)}
                  </td>
                </tr>

                <tr className="stats-row">
                  <td className="category-name">
                    <span className="category-icon">📅</span>
                    Daily Test
                  </td>
                  <td className="problem-count">
                    {formatCount(profileData.stats.dailyTest)}
                  </td>
                  <td className="calculation">
                    {formatCount(profileData.stats.dailyTest)} × 20 = {formatPoints(categoryPoints.dailyTest)}
                  </td>
                  <td className="points">
                    {formatPoints(categoryPoints.dailyTest)}
                  </td>
                </tr>

                <tr className="stats-row">
                  <td className="category-name">
                    <span className="category-icon">⚡</span>
                    Daily Challenge
                  </td>
                  <td className="problem-count">
                    {formatCount(profileData.stats.dailyChallenge)}
                  </td>
                  <td className="calculation">
                    {formatCount(profileData.stats.dailyChallenge)} × 2 = {formatPoints(categoryPoints.dailyChallenge)}
                  </td>
                  <td className="points">
                    {formatPoints(categoryPoints.dailyChallenge)}
                  </td>
                </tr>

                <tr className="stats-row code-tutor-row">
                  <td className="category-name">
                    <span className="category-icon">👨‍🏫</span>
                    Code Tutor
                  </td>
                  <td className="problem-count">
                    {formatCount(profileData.stats.codeTutor)}
                  </td>
                  <td className="calculation">
                    {formatCount(profileData.stats.codeTutor)} × 0 = 0
                    <span className="no-points-note">(No points)</span>
                  </td>
                  <td className="points">
                    0
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {profileData.stats.totalPoints === 0 && (
        <div className="zero-stats-message">
          <p><strong>No points found in your profile.</strong></p>
          <p>Start solving problems on SkillRack to see your statistics here!</p>
        </div>
      )}

      {Object.keys(profileData.languages).length > 0 && (
        <div className="languages-section">
          <h4>Programming Languages</h4>
          <div className="languages-grid">
            {Object.entries(profileData.languages).map(([language, count]) => (
              <div key={language} className="language-item">
                <span className="language-name">{language}</span>
                <span className="language-count">{formatCount(count)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {profileData.certificates.length > 0 && (
        <div className="certificates-section">
          <h4>Certificates ({profileData.certificates.length})</h4>
          <div className="certificates-list">
            {profileData.certificates.map((cert, index) => (
              <div key={index} className="certificate-item">
                <div className="certificate-title">{cert.title}</div>
                {cert.date && <div className="certificate-date">{cert.date}</div>}
                {cert.link && (
                  <a 
                    href={cert.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="certificate-link"
                  >
                    View Certificate
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {profileData.stats.totalPoints > 0 && (
        <div className="achievement-highlights">
          <h4>Quick Stats</h4>
          <div className="highlight-grid">
            <div className="highlight-item">
              <span className="highlight-number">
                {formatCount(profileData.stats.codeTrack + profileData.stats.codeTest + 
                  profileData.stats.dailyTest + profileData.stats.dailyChallenge)}
              </span>
              <span className="highlight-label">Total Problems</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">
                {formatCount(Math.max(profileData.stats.codeTrack, profileData.stats.codeTest, 
                  profileData.stats.dailyTest, profileData.stats.dailyChallenge))}
              </span>
              <span className="highlight-label">Best Category</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-number">
                {formatPoints(Math.max(categoryPoints.codeTrack, categoryPoints.codeTest, 
                  categoryPoints.dailyTest, categoryPoints.dailyChallenge))}
              </span>
              <span className="highlight-label">Top Points</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsDisplay;