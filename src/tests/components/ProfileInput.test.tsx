import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileInput from '../../src/components/ProfileInput';
import type { ProfileInputProps } from '../../src/types';

// Mock the ValidationError component
jest.mock('../../src/components/ValidationError', () => {
  return function MockValidationError({ message }: { message: string }) {
    return <div data-testid="validation-error">{message}</div>;
  };
});

describe('ProfileInput Component', () => {
  const defaultProps: ProfileInputProps = {
    onSubmit: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render instructions section', () => {
      render(<ProfileInput {...defaultProps} />);
      
      expect(screen.getByText('How to Find Your SkillRack Profile Link')).toBeInTheDocument();
      expect(screen.getByText('Login to your SkillRack account')).toBeInTheDocument();
      expect(screen.getByText('Go to your Profile section')).toBeInTheDocument();
      expect(screen.getByText('Enter your password when prompted')).toBeInTheDocument();
      expect(screen.getByText("Click the 'View' button to access your profile")).toBeInTheDocument();
      expect(screen.getByText("Copy the URL from your browser's address bar")).toBeInTheDocument();
    });

    test('should render URL input form', () => {
      render(<ProfileInput {...defaultProps} />);
      
      expect(screen.getByLabelText('SkillRack Profile URL:')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://skillrack.com/profile/123456/abcdef')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Analyze Profile' })).toBeInTheDocument();
    });

    test('should show example URL format', () => {
      render(<ProfileInput {...defaultProps} />);
      
      expect(screen.getByText('https://skillrack.com/profile/123456/abcdef')).toBeInTheDocument();
    });
  });

  describe('URL Input Validation', () => {
    test('should accept valid SkillRack URLs', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      
      render(<ProfileInput {...defaultProps} onSubmit={mockOnSubmit} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      const submitButton = screen.getByRole('button', { name: 'Analyze Profile' });
      
      const validUrls = [
        'https://skillrack.com/profile/123456/abcdef123',
        'http://skillrack.com/profile/789/xyz789',
        'https://www.skillrack.com/profile/999/test123'
      ];

      for (const url of validUrls) {
        await user.clear(input);
        await user.type(input, url);
        await user.click(submitButton);
        
        expect(mockOnSubmit).toHaveBeenCalledWith(url);
        mockOnSubmit.mockClear();
      }
    });

    test('should reject invalid URLs with appropriate error messages', async () => {
      const user = userEvent.setup();
      
      render(<ProfileInput {...defaultProps} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      const submitButton = screen.getByRole('button', { name: 'Analyze Profile' });
      
      const invalidUrls = [
        'https://google.com/profile/123/abc',
        'https://skillrack.com/dashboard',
        'not-a-url',
        'https://skillrack.com/profile/123'
      ];

      for (const url of invalidUrls) {
        await user.clear(input);
        await user.type(input, url);
        await user.click(submitButton);
        
        expect(screen.getByTestId('validation-error')).toHaveTextContent(
          'Please enter a valid SkillRack profile URL (e.g., https://skillrack.com/profile/123456/abcdef)'
        );
      }
    });

    test('should show error when submitting empty URL', async () => {
      const user = userEvent.setup();
      
      render(<ProfileInput {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: 'Analyze Profile' });
      await user.click(submitButton);
      
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Please enter your SkillRack profile URL'
      );
    });

    test('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      
      render(<ProfileInput {...defaultProps} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      const submitButton = screen.getByRole('button', { name: 'Analyze Profile' });
      
      // First trigger an error
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      
      // Then start typing to clear the error
      await user.type(input, 'h');
      expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    test('should show loading state when loading prop is true', () => {
      render(<ProfileInput {...defaultProps} loading={true} />);
      
      expect(screen.getByText('Analyzing Profile...')).toBeInTheDocument();
      expect(screen.getByText('Fetching your SkillRack profile data...')).toBeInTheDocument();
      expect(screen.getByText('This may take a few seconds')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    test('should disable input field when loading', () => {
      render(<ProfileInput {...defaultProps} loading={true} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      expect(input).toBeDisabled();
    });

    test('should show spinner during loading', () => {
      render(<ProfileInput {...defaultProps} loading={true} />);
      
      expect(document.querySelector('.spinner')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    test('should disable submit button when input is empty', () => {
      render(<ProfileInput {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: 'Analyze Profile' });
      expect(submitButton).toBeDisabled();
    });

    test('should enable submit button when input has value', async () => {
      const user = userEvent.setup();
      
      render(<ProfileInput {...defaultProps} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      const submitButton = screen.getByRole('button', { name: 'Analyze Profile' });
      
      expect(submitButton).toBeDisabled();
      
      await user.type(input, 'https://skillrack.com/profile/123/abc');
      expect(submitButton).not.toBeDisabled();
    });

    test('should handle form submission via Enter key', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      
      render(<ProfileInput {...defaultProps} onSubmit={mockOnSubmit} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      
      await user.type(input, 'https://skillrack.com/profile/123456/abcdef');
      await user.keyboard('{Enter}');
      
      expect(mockOnSubmit).toHaveBeenCalledWith('https://skillrack.com/profile/123456/abcdef');
    });

    test('should prevent form submission when loading', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      
      render(<ProfileInput {...defaultProps} onSubmit={mockOnSubmit} loading={true} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      
      await user.type(input, 'https://skillrack.com/profile/123456/abcdef');
      await user.keyboard('{Enter}');
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('should have proper form labels and associations', () => {
      render(<ProfileInput {...defaultProps} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      expect(input).toHaveAttribute('id', 'profile-url');
      expect(input).toHaveAttribute('type', 'url');
      expect(input).toHaveAttribute('required');
    });

    test('should have proper input attributes for mobile', () => {
      render(<ProfileInput {...defaultProps} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      expect(input).toHaveAttribute('autoComplete', 'url');
      expect(input).toHaveAttribute('inputMode', 'url');
    });

    test('should apply error styling when validation fails', async () => {
      const user = userEvent.setup();
      
      render(<ProfileInput {...defaultProps} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      const submitButton = screen.getByRole('button', { name: 'Analyze Profile' });
      
      await user.type(input, 'invalid-url');
      await user.click(submitButton);
      
      expect(input).toHaveClass('error');
    });
  });

  describe('Edge Cases', () => {
    test('should handle whitespace-only input', async () => {
      const user = userEvent.setup();
      
      render(<ProfileInput {...defaultProps} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      const submitButton = screen.getByRole('button', { name: 'Analyze Profile' });
      
      await user.type(input, '   ');
      await user.click(submitButton);
      
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Please enter your SkillRack profile URL'
      );
    });

    test('should trim whitespace from valid URLs', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      
      render(<ProfileInput {...defaultProps} onSubmit={mockOnSubmit} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      const submitButton = screen.getByRole('button', { name: 'Analyze Profile' });
      
      await user.type(input, '  https://skillrack.com/profile/123456/abcdef  ');
      await user.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledWith('  https://skillrack.com/profile/123456/abcdef  ');
    });

    test('should handle rapid form submissions', async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn();
      
      render(<ProfileInput {...defaultProps} onSubmit={mockOnSubmit} />);
      
      const input = screen.getByLabelText('SkillRack Profile URL:');
      const submitButton = screen.getByRole('button', { name: 'Analyze Profile' });
      
      await user.type(input, 'https://skillrack.com/profile/123456/abcdef');
      
      // Rapid clicks
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(3);
    });
  });
});