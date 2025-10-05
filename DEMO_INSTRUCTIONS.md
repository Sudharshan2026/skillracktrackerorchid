# Temporary User Page Demo

A preview page showing how profile data will be displayed when a user provides their SkillRack profile URL. The demo uses the existing components from the main application to ensure consistency.

## How to Access

Add `?demo=true` to the URL:

```
http://localhost:5173/?demo=true
```

Or in production:
```
https://your-domain.com/?demo=true
```

## Features Demonstrated

### 1. Profile URL Input
- Clean input form with demo mode indicator
- URL validation and user-friendly interface
- Clear instructions that this is sample data

### 2. Profile Statistics Display
- Uses the same `StatsDisplay` component as the main app
- Shows all problem categories with point calculations
- Displays profile information and achievements
- Medal counts and programming languages
- Certificate listings

### 3. Goal Planning
- Uses the same `GoalCalculator` component
- Interactive goal setting with target points and timeline
- Real-time calculation based on sample data

### 4. Achievement Plans
- Uses the same `ResultsDisplay` component
- Shows recommended strategies to reach goals
- Feasibility indicators and daily requirements
- Tips for success

## Sample Data

The demo uses realistic sample data:
- **Profile**: John Doe (SEC23AD073)
- **Department**: Computer Science and Engineering
- **Total Points**: 1100
- **Rank**: 142, Level: 12
- **Medals**: 15 Gold, 30 Silver, 20 Bronze
- **Problem Counts**:
  - Code Track: 120 (2 pts each)
  - Code Test: 8 (30 pts each)
  - Daily Test: 25 (20 pts each)
  - Daily Challenge: 30 (2 pts each)
  - Code Tutor: 45 (0 pts each)
- **Languages**: Python, Java, C, C++, JavaScript
- **Certificates**: 2 sample certificates

## Visual Design

The page follows the existing design system:
- Professional blue gradient (instead of purple)
- Card-based layout matching the main app
- Responsive design with proper breakpoints
- Clear demo mode indicators
- Consistent typography and spacing

## Components Reused

- `StatsDisplay` - Full profile statistics table
- `GoalCalculator` - Interactive goal planning form
- `ResultsDisplay` - Achievement path recommendations

## Navigation Flow

1. Enter any SkillRack profile URL
2. Click "Preview Profile Display"
3. View complete profile stats (sample data)
4. Set a goal and get achievement plans
5. Click "Try Another URL" to return

## Use Case

This demo page helps users:
- Understand what data will be extracted from their profile
- See how statistics will be calculated and displayed
- Preview the goal planning functionality
- Experience the complete user flow with sample data
- Verify the design and layout before using real data
