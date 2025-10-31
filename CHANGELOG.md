# Changelog

All notable changes to SkillRack Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support for both SkillRack URL formats:
  - Profile format: `https://www.skillrack.com/profile/[id]/[hash]`
  - Resume format: `https://www.skillrack.com/faces/resume.xhtml?id=[id]&key=[hash]`
- Enhanced profile validation to detect non-existent users
- Comprehensive error detection for profile not found scenarios
- Multiple layers of "user not found" detection:
  - HTTP status codes (404, 410)
  - Response content analysis
  - Empty profile statistics validation

### Changed
- **URL Validation**: Updated frontend validation to accept both profile and resume.xhtml URL formats
- **Error Messages**: Improved error message to show examples of both accepted URL formats
- **URL Processing**: Enhanced backend URL preprocessing to detect existing resume.xhtml format and skip unnecessary conversion
- **Error Classification**: Better distinction between network errors and profile not found errors
- **User Experience**: Non-existent profiles now show "Profile Not Found" instead of "Connection Problem"

### Fixed
- **URL Format Support**: Users can now directly enter resume.xhtml URLs without conversion errors
- **Error Accuracy**: Incorrect or non-existent profile URLs now properly display "Profile Not Found" error instead of generic connection errors
- **Profile Detection**: Enhanced detection of empty profiles and non-existent users through multiple validation layers

### Technical Details

#### Frontend Changes
- **File**: `src/utils/urlPreprocessing.ts`
  - Updated `validateSkillRackUrl()` function to accept both URL formats using comprehensive URL parsing
  - Replaced simple regex with robust URL validation that checks hostname, protocol, and path patterns

- **File**: `src/components/ProfileInput.tsx`
  - Enhanced error message to include examples of both accepted URL formats
  - Improved user guidance for URL input validation

- **File**: `src/tests/components/ProfileInput.test.tsx`
  - Updated test expectations to match new comprehensive error messages

#### Backend Changes
- **File**: `api/parse-profile.ts`
  - Enhanced `preprocessApiUrl()` to detect existing resume.xhtml format
  - Added multiple layers of profile existence validation
  - Improved error handling with specific `PROFILE_NOT_FOUND` detection
  - Added content-based validation for profile not found scenarios
  - Enhanced retry logic with better error classification

#### Error Handling Improvements
- **Network Errors**: True connection issues (DNS, timeouts) → "Connection Problem" 
- **Profile Not Found**: Invalid URLs, non-existent users → "Profile Not Found"
- **Validation Logic**: Multiple detection methods for comprehensive coverage

### Developer Notes
- All changes maintain backward compatibility
- Existing profile URLs continue to work as before
- New resume.xhtml URLs are now supported natively
- Enhanced error reporting provides better debugging information
- Improved user experience with more accurate error messages

---

## Previous Releases

<!-- Previous changelog entries would go here -->