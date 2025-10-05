import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalCalculator from '../../src/components/GoalCalculator';
import type { GoalCalculatorProps } from '../../src/types';

// Mock the ValidationError component
jest.mock('../../src/components/ValidationError', () => {
  return function MockValidationError({ message }: { message: string }) {
    return <div data-testid="validation-error">{message}</div>;
  };
});

describe('GoalCalculator Component', () => {
  const defaultProps: GoalCalculatorProps = {
    currentPoints: 1000,
    onCalculate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render component title and current points', () => {
      render(<GoalCalculator {...defaultProps} />);
      
      expect(screen.getByText('Set Your Goal')).toBeInTheDocument();
      expect(screen.getByText('Current Points:')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });

    test('should render input fields with proper labels', () => {
      render(<GoalCalculator {...defaultProps} />);
      
      expect(screen.getByLabelText('Target Points')).toBeInTheDocument();
      expect(screen.getByLabelText('Timeline (Days)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Calculate Achievement Plan' })).toBeInTheDocument();
    });

    test('should render quick preset buttons', () => {
      render(<GoalCalculator {...defaultProps} />);
      
      expect(screen.getByText('Quick Goals')).toBeInTheDocument();
      expect(screen.getByText('+1,000 points')).toBeInTheDocument();
      expect(screen.getByText('+2,000 points')).toBeInTheDocument();
      expect(screen.getByText('+5,000 points')).toBeInTheDocument();
      expect(screen.getByText('in 30 days')).toBeInTheDocument();
      expect(screen.getByText('in 60 days')).toBeInTheDocument();
      expect(screen.getByText('in 90 days')).toBeInTheDocument();
    });

    test('should show appropriate placeholders', () => {
      render(<GoalCalculator {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('e.g., 2,000')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., 30')).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    test('should validate target points input', async () => {
      const user = userEvent.setup();
      
      render(<GoalCalculator {...defaultProps} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      
      // Test empty input
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Please enter a valid target points number'
      );
      
      // Test invalid number
      await user.type(targetInput, 'abc');
      await user.type(timelineInput, '30');
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Please enter a valid target points number'
      );
      
      // Test negative number
      await user.clear(targetInput);
      await user.type(targetInput, '-100');
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Target points must be greater than 0'
      );
      
      // Test zero
      await user.clear(targetInput);
      await user.type(targetInput, '0');
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Target points must be greater than 0'
      );
      
      // Test unreasonably high number
      await user.clear(targetInput);
      await user.type(targetInput, '2000000');
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Target points seems unreasonably high (max: 1,000,000)'
      );
      
      // Test target lower than current points
      await user.clear(targetInput);
      await user.type(targetInput, '500');
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Target must be higher than your current points (1,000)'
      );
    });

    test('should validate timeline input', async () => {
      const user = userEvent.setup();
      
      render(<GoalCalculator {...defaultProps} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      
      await user.type(targetInput, '2000');
      
      // Test empty timeline
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Please enter a valid number of days'
      );
      
      // Test invalid number
      await user.type(timelineInput, 'abc');
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Please enter a valid number of days'
      );
      
      // Test negative number
      await user.clear(timelineInput);
      await user.type(timelineInput, '-10');
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Timeline must be at least 1 day'
      );
      
      // Test zero
      await user.clear(timelineInput);
      await user.type(timelineInput, '0');
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Timeline must be at least 1 day'
      );
      
      // Test unreasonably long timeline
      await user.clear(timelineInput);
      await user.type(timelineInput, '5000');
      await user.click(submitButton);
      expect(screen.getByTestId('validation-error')).toHaveTextContent(
        'Timeline seems unreasonably long (max: 10 years)'
      );
    });

    test('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      
      render(<GoalCalculator {...defaultProps} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      
      // Trigger validation errors
      await user.click(submitButton);
      expect(screen.getAllByTestId('validation-error')).toHaveLength(2);
      
      // Start typing in target input
      await user.type(targetInput, '2');
      expect(screen.getAllByTestId('validation-error')).toHaveLength(1);
      
      // Start typing in timeline input
      await user.type(timelineInput, '3');
      expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
    });
  });

  describe('Preset Buttons', () => {
    test('should set values when preset buttons are clicked', async () => {
      const user = userEvent.setup();
      
      render(<GoalCalculator {...defaultProps} />);
      
      const targetInput = screen.getByLabelText('Target Points') as HTMLInputElement;
      const timelineInput = screen.getByLabelText('Timeline (Days)') as HTMLInputElement;
      
      // Test +1,000 points preset
      await user.click(screen.getByText('+1,000 points'));
      expect(targetInput.value).toBe('2000'); // 1000 + 1000
      expect(timelineInput.value).toBe('30');
      
      // Test +2,000 points preset
      await user.click(screen.getByText('+2,000 points'));
      expect(targetInput.value).toBe('3000'); // 1000 + 2000
      expect(timelineInput.value).toBe('60');
      
      // Test +5,000 points preset
      await user.click(screen.getByText('+5,000 points'));
      expect(targetInput.value).toBe('6000'); // 1000 + 5000
      expect(timelineInput.value).toBe('90');
    });

    test('should clear errors when preset is used', async () => {
      const user = userEvent.setup();
      
      render(<GoalCalculator {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      
      // Trigger validation errors
      await user.click(submitButton);
      expect(screen.getAllByTestId('validation-error')).toHaveLength(2);
      
      // Use preset
      await user.click(screen.getByText('+1,000 points'));
      expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('should call onCalculate with correct values on valid submission', async () => {
      const user = userEvent.setup();
      const mockOnCalculate = jest.fn();
      
      render(<GoalCalculator {...defaultProps} onCalculate={mockOnCalculate} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      
      await user.type(targetInput, '2500');
      await user.type(timelineInput, '45');
      await user.click(submitButton);
      
      expect(mockOnCalculate).toHaveBeenCalledWith(2500, 45);
    });

    test('should not call onCalculate when validation fails', async () => {
      const user = userEvent.setup();
      const mockOnCalculate = jest.fn();
      
      render(<GoalCalculator {...defaultProps} onCalculate={mockOnCalculate} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      
      await user.type(targetInput, '500'); // Lower than current points
      await user.click(submitButton);
      
      expect(mockOnCalculate).not.toHaveBeenCalled();
    });

    test('should handle form submission via Enter key', async () => {
      const user = userEvent.setup();
      const mockOnCalculate = jest.fn();
      
      render(<GoalCalculator {...defaultProps} onCalculate={mockOnCalculate} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      
      await user.type(targetInput, '2000');
      await user.type(timelineInput, '30');
      await user.keyboard('{Enter}');
      
      expect(mockOnCalculate).toHaveBeenCalledWith(2000, 30);
    });
  });

  describe('Goal Preview', () => {
    test('should show goal preview when valid inputs are provided', async () => {
      const user = userEvent.setup();
      
      render(<GoalCalculator {...defaultProps} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      
      await user.type(targetInput, '2500');
      await user.type(timelineInput, '45');
      
      expect(screen.getByText('Goal Preview')).toBeInTheDocument();
      expect(screen.getByText('2,500 points')).toBeInTheDocument();
      expect(screen.getByText('45 days')).toBeInTheDocument();
      expect(screen.getByText('1,500 additional points')).toBeInTheDocument();
    });

    test('should not show goal preview when inputs are invalid', async () => {
      const user = userEvent.setup();
      
      render(<GoalCalculator {...defaultProps} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      
      await user.type(targetInput, '500'); // Invalid (lower than current)
      await user.type(timelineInput, '30');
      
      expect(screen.queryByText('Goal Preview')).not.toBeInTheDocument();
    });

    test('should calculate required points correctly', async () => {
      const user = userEvent.setup();
      
      render(<GoalCalculator {...defaultProps} currentPoints={1500} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      
      await user.type(targetInput, '3000');
      await user.type(timelineInput, '60');
      
      expect(screen.getByText('1,500 additional points')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    test('should disable submit button when inputs are empty', () => {
      render(<GoalCalculator {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      expect(submitButton).toBeDisabled();
    });

    test('should enable submit button when both inputs have values', async () => {
      const user = userEvent.setup();
      
      render(<GoalCalculator {...defaultProps} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      
      expect(submitButton).toBeDisabled();
      
      await user.type(targetInput, '2000');
      expect(submitButton).toBeDisabled();
      
      await user.type(timelineInput, '30');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large current points', () => {
      render(<GoalCalculator {...defaultProps} currentPoints={999999} />);
      
      expect(screen.getByText('999,999')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., 1,000,999')).toBeInTheDocument();
    });

    test('should handle zero current points', () => {
      render(<GoalCalculator {...defaultProps} currentPoints={0} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., 1,000')).toBeInTheDocument();
    });

    test('should handle decimal inputs by parsing as integers', async () => {
      const user = userEvent.setup();
      const mockOnCalculate = jest.fn();
      
      render(<GoalCalculator {...defaultProps} onCalculate={mockOnCalculate} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      
      await user.type(targetInput, '2000.5');
      await user.type(timelineInput, '30.7');
      await user.click(submitButton);
      
      expect(mockOnCalculate).toHaveBeenCalledWith(2000, 30);
    });

    test('should handle whitespace in inputs', async () => {
      const user = userEvent.setup();
      const mockOnCalculate = jest.fn();
      
      render(<GoalCalculator {...defaultProps} onCalculate={mockOnCalculate} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      
      await user.type(targetInput, ' 2000 ');
      await user.type(timelineInput, ' 30 ');
      await user.click(submitButton);
      
      expect(mockOnCalculate).toHaveBeenCalledWith(2000, 30);
    });
  });

  describe('Accessibility', () => {
    test('should have proper form labels and associations', () => {
      render(<GoalCalculator {...defaultProps} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      
      expect(targetInput).toHaveAttribute('id', 'target-points');
      expect(timelineInput).toHaveAttribute('id', 'timeline-days');
      expect(targetInput).toHaveAttribute('type', 'number');
      expect(timelineInput).toHaveAttribute('type', 'number');
    });

    test('should have proper input constraints', () => {
      render(<GoalCalculator {...defaultProps} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const timelineInput = screen.getByLabelText('Timeline (Days)');
      
      expect(targetInput).toHaveAttribute('min', '1');
      expect(targetInput).toHaveAttribute('max', '1000000');
      expect(timelineInput).toHaveAttribute('min', '1');
      expect(timelineInput).toHaveAttribute('max', '3650');
    });

    test('should apply error styling when validation fails', async () => {
      const user = userEvent.setup();
      
      render(<GoalCalculator {...defaultProps} />);
      
      const targetInput = screen.getByLabelText('Target Points');
      const submitButton = screen.getByRole('button', { name: 'Calculate Achievement Plan' });
      
      await user.type(targetInput, '500');
      await user.click(submitButton);
      
      expect(targetInput).toHaveClass('error');
    });
  });
});