# Gemini Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Removed
- Removed unnecessary documentation and temporary files.
- Removed `componentTaggerPlugin` and `logErrorsPlugin` from `vite.config.ts`.
- Removed unused dependencies.

### Changed
- Moved `coverage` directory to the root of the project.
- Cleaned up the `.gitignore` file.
- Moved `visual-edits` directory to the root of the project and added it to `.gitignore`.

### Added
- Added missing dependencies.

### Fixed
- Fixed all security vulnerabilities by updating dependencies and using `overrides` in `package.json`.
- Fixed the build process by reinstalling missing PostCSS plugins and fixing a TypeScript error in `vite.config.ts`.