/**
 * Copyright (c) 2025 Sudharshan2026
 * Licensed under the MIT License
 */

// Test setup file for Jest
// This file runs before each test file

import '@testing-library/jest-dom';

// Mock console.error to avoid noise in test output
global.console = {
  ...console,
  error: jest.fn(),
};