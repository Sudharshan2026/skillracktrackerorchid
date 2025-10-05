# SkillRack Tracker 2.0

A lightweight personal dashboard that allows students to paste their SkillRack profile link to instantly view their coding statistics and calculate how many problems they need to solve to achieve personal goals.

## ✨ Features

- **Instant Profile Analysis**: Parse SkillRack profiles in real-time
- **Goal Planning**: Calculate personalized achievement paths
- **Stateless Design**: No registration or data storage required
- **Responsive UI**: Works on desktop and mobile devices
- **Multiple Strategies**: Get suggestions for Code Tracks, Daily Tests, or mixed approaches

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Serverless API (Vercel functions)
- **Parsing**: Cheerio for HTML extraction
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

## 🎯 How to Use

1. **Find Your Profile URL**:
   - Login to SkillRack Profile
   - Enter your password
   - Click 'View' to access your profile
   - Copy the URL from your browser

2. **Analyze Your Stats**:
   - Paste your profile URL into the tracker
   - View your categorized points breakdown
   - See calculations like "Code Track → 470 × 2 = 940"

3. **Plan Your Goals**:
   - Set a target score and timeline
   - Get multiple achievement path suggestions
   - Choose from Code Tracks only, Daily Tests only, or mixed strategies

## 🏗️ Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Sudharshan2026/skillracktracker2.o.git

# Navigate to project directory
cd skillracktracker2.o

# Install dependencies
npm install
```

### Running Locally
```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📊 SkillRack Scoring System

- **Code Track**: 2 points per problem
- **Code Tutor**: 0 points (display only)
- **Daily Test**: 20 points per test (max 1/day)
- **Daily Challenge**: 2 points per challenge (max 1/day)
- **Code Test**: 30 points per test

## 🚀 Deployment

The application is designed for serverless deployment on Vercel:

```bash
# Deploy to Vercel
npm run build
vercel --prod
```

## 🔒 Privacy

- **No Data Storage**: All analysis happens in real-time
- **No User Accounts**: Completely stateless operation
- **No Tracking**: Your profile data stays private

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/Sudharshan2026/skillracktracker2.o/issues) on GitHub.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
