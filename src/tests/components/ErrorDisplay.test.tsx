import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorDisplay from '../../src/components/ErrorDisplay';
import type { ApiErrorResponse } from '../../src/types';

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
    value: mockWindowOpen,
});

// Mock scrollIntoView
const mockScrollIntoView = jest.fn();
Object.defineProperty(Element.prototype, 'scrollIntoView', {
    value: mockScrollIntoView,
});

describe('ErrorDisplay Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('String Error Messages', () => {
        test('should display simple string error', () => {
            render(<ErrorDisplay error="Something went wrong" />);

            expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
            expect(screen.getByText('Something went wrong')).toBeInTheDocument();
            expect(screen.getByText('❌')).toBeInTheDocument();
        });

        test('should show default guidance for string errors', () => {
            render(<ErrorDisplay error="Network error" />);

            expect(screen.getByText('What you can try:')).toBeInTheDocument();
            expect(screen.getByText('Please try again')).toBeInTheDocument();
            expect(screen.getByText('If the problem persists, try refreshing the page')).toBeInTheDocument();
            expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
        });
    });

    describe('API Error Responses', () => {
        test('should handle INVALID_URL error code', () => {
            const error: ApiErrorResponse = {
                success: false,
                error: 'Invalid SkillRack profile URL format',
                code: 'INVALID_URL'
            };

            render(<ErrorDisplay error={error} />);

            expect(screen.getByText('Invalid Profile URL')).toBeInTheDocument();
            expect(screen.getByText('The URL you entered is not a valid SkillRack profile link.')).toBeInTheDocument();
            expect(screen.getByText('⚠️')).toBeInTheDocument();
            expect(screen.getByText('Make sure you copied the complete URL from your browser')).toBeInTheDocument();
            expect(screen.queryByText('🔄 Try Again')).not.toBeInTheDocument(); // No retry for invalid URL
        });

        test('should handle NETWORK_ERROR error code', () => {
            const error: ApiErrorResponse = {
                success: false,
                error: 'Unable to connect to SkillRack',
                code: 'NETWORK_ERROR'
            };

            render(<ErrorDisplay error={error} />);

            expect(screen.getByText('Connection Problem')).toBeInTheDocument();
            expect(screen.getByText('Unable to connect to SkillRack or fetch your profile data.')).toBeInTheDocument();
            expect(screen.getByText('🌐')).toBeInTheDocument();
            expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
            expect(screen.getByText('🔄 Try Again')).toBeInTheDocument(); // Should show retry
        });

        test('should handle NOT_FOUND error code', () => {
            const error: ApiErrorResponse = {
                success: false,
                error: 'Profile not found',
                code: 'NOT_FOUND'
            };

            render(<ErrorDisplay error={error} />);

            expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
            expect(screen.getByText('The profile could not be accessed or does not exist.')).toBeInTheDocument();
            expect(screen.getByText('🔍')).toBeInTheDocument();
            expect(screen.getByText('Verify that the profile URL is correct')).toBeInTheDocument();
            expect(screen.getByText('🔄 Try Again')).toBeInTheDocument();
        });

        test('should handle PARSE_ERROR error code', () => {
            const error: ApiErrorResponse = {
                success: false,
                error: 'Failed to parse profile data',
                code: 'PARSE_ERROR'
            };

            render(<ErrorDisplay error={error} />);

            expect(screen.getByText('Profile Parsing Failed')).toBeInTheDocument();
            expect(screen.getByText('Unable to extract statistics from your SkillRack profile.')).toBeInTheDocument();
            expect(screen.getByText('🔧')).toBeInTheDocument();
            expect(screen.getByText('Your profile page might have an unexpected format')).toBeInTheDocument();
            expect(screen.getByText('🔄 Try Again')).toBeInTheDocument();
        });
    });

    describe('Context-Specific Errors', () => {
        test('should handle validation context errors', () => {
            render(
                <ErrorDisplay
                    error="Please enter a valid number"
                    context="validation"
                />
            );

            expect(screen.getByText('Input Error')).toBeInTheDocument();
            expect(screen.getByText('Please enter a valid number')).toBeInTheDocument();
            expect(screen.getByText('📝')).toBeInTheDocument();
            expect(screen.getByText('Please check your input and try again')).toBeInTheDocument();
            expect(screen.queryByText('🔄 Try Again')).not.toBeInTheDocument();
        });

        test('should handle goal context errors', () => {
            render(
                <ErrorDisplay
                    error="Target points must be higher than current points"
                    context="goal"
                />
            );

            expect(screen.getByText('Goal Calculation Error')).toBeInTheDocument();
            expect(screen.getByText('Target points must be higher than current points')).toBeInTheDocument();
            expect(screen.getByText('🎯')).toBeInTheDocument();
            expect(screen.getByText('Check that your target points and timeline are valid')).toBeInTheDocument();
            expect(screen.queryByText('🔄 Try Again')).not.toBeInTheDocument();
        });

        test('should handle profile context errors', () => {
            render(
                <ErrorDisplay
                    error="Generic error"
                    context="profile"
                />
            );

            expect(screen.getByText('📖 View Instructions')).toBeInTheDocument();
        });
    });

    describe('Interactive Features', () => {
        test('should call onRetry when retry button is clicked', async () => {
            const user = userEvent.setup();
            const mockOnRetry = jest.fn();

            const error: ApiErrorResponse = {
                success: false,
                error: 'Network error',
                code: 'NETWORK_ERROR'
            };

            render(<ErrorDisplay error={error} onRetry={mockOnRetry} />);

            const retryButton = screen.getByText('🔄 Try Again');
            await user.click(retryButton);

            expect(mockOnRetry).toHaveBeenCalledTimes(1);
        });

        test('should call onClear when close button is clicked', async () => {
            const user = userEvent.setup();
            const mockOnClear = jest.fn();

            render(<ErrorDisplay error="Test error" onClear={mockOnClear} />);

            const closeButton = screen.getByLabelText('Close error message');
            await user.click(closeButton);

            expect(mockOnClear).toHaveBeenCalledTimes(1);
        });

        test('should not show close button when onClear is not provided', () => {
            render(<ErrorDisplay error="Test error" />);

            expect(screen.queryByLabelText('Close error message')).not.toBeInTheDocument();
        });

        test('should scroll to instructions when View Instructions is clicked', async () => {
            const user = userEvent.setup();

            // Mock querySelector to return an element
            const mockElement = { scrollIntoView: mockScrollIntoView };
            const mockQuerySelector = jest.fn().mockReturnValue(mockElement);
            Object.defineProperty(document, 'querySelector', {
                value: mockQuerySelector,
            });

            render(<ErrorDisplay error="Test error" context="profile" />);

            const instructionsButton = screen.getByText('📖 View Instructions');
            await user.click(instructionsButton);

            expect(mockQuerySelector).toHaveBeenCalledWith('.instructions');
            expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        });

        test('should open GitHub issue when Report Issue is clicked', async () => {
            const user = userEvent.setup();

            const error: ApiErrorResponse = {
                success: false,
                error: 'Test error message',
                code: 'NETWORK_ERROR'
            };

            render(<ErrorDisplay error={error} context="profile" />);

            const reportButton = screen.getByText('🐛 Report Issue');
            await user.click(reportButton);

            expect(mockWindowOpen).toHaveBeenCalledWith(
                expect.stringContaining('github.com'),
                '_blank'
            );

            const callArgs = mockWindowOpen.mock.calls[0][0];
            expect(callArgs).toContain('Error%20Report');
            expect(callArgs).toContain('Test%20error%20message');
            expect(callArgs).toContain('NETWORK_ERROR');
            expect(callArgs).toContain('profile');
        });
    });

    describe('Accessibility', () => {
        test('should have proper ARIA attributes', () => {
            render(<ErrorDisplay error="Test error" />);

            const errorContainer = screen.getByRole('alert');
            expect(errorContainer).toBeInTheDocument();

            const icon = screen.getByText('❌');
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });

        test('should have proper button labels', () => {
            const mockOnRetry = jest.fn();
            const mockOnClear = jest.fn();

            render(
                <ErrorDisplay
                    error="Test error"
                    onRetry={mockOnRetry}
                    onClear={mockOnClear}
                    context="profile"
                />
            );

            expect(screen.getByLabelText('Close error message')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '🔄 Try Again' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '📖 View Instructions' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '🐛 Report Issue' })).toBeInTheDocument();
        });

        test('should have proper heading structure', () => {
            render(<ErrorDisplay error="Test error" />);

            expect(screen.getByRole('heading', { level: 3, name: 'Something Went Wrong' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { level: 4, name: 'What you can try:' })).toBeInTheDocument();
        });

        test('should have proper list structure for guidance', () => {
            render(<ErrorDisplay error="Test error" />);

            const guidanceList = screen.getByRole('list');
            expect(guidanceList).toBeInTheDocument();

            const guidanceItems = screen.getAllByRole('listitem');
            expect(guidanceItems.length).toBeGreaterThan(0);
        });
    });

    describe('Error Severity Classes', () => {
        test('should apply warning class for warning severity errors', () => {
            const error: ApiErrorResponse = {
                success: false,
                error: 'Invalid URL',
                code: 'INVALID_URL'
            };

            const { container } = render(<ErrorDisplay error={error} />);

            expect(container.firstChild).toHaveClass('warning');
        });

        test('should apply error class for error severity errors', () => {
            const error: ApiErrorResponse = {
                success: false,
                error: 'Network error',
                code: 'NETWORK_ERROR'
            };

            const { container } = render(<ErrorDisplay error={error} />);

            expect(container.firstChild).toHaveClass('error');
        });
    });

    describe('Edge Cases', () => {
        test('should handle malformed API response', () => {
            const malformedError = {
                success: false,
                // Missing error and code properties
            } as any;

            render(<ErrorDisplay error={malformedError} />);

            expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
            expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
        });

        test('should handle API response with success: true (edge case)', () => {
            const successResponse = {
                success: true,
                data: { some: 'data' }
            } as any;

            render(<ErrorDisplay error={successResponse} />);

            expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
            expect(screen.getByText('Unexpected error format')).toBeInTheDocument();
        });

        test('should handle empty string error', () => {
            render(<ErrorDisplay error="" />);

            expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
            expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
        });

        test('should handle error without code property', () => {
            const errorWithoutCode: ApiErrorResponse = {
                success: false,
                error: 'Some error message'
                // No code property
            } as any;

            render(<ErrorDisplay error={errorWithoutCode} />);

            expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
            expect(screen.getByText('Some error message')).toBeInTheDocument();
        });
    });

    describe('Button Visibility', () => {
        test('should show retry button only for retryable errors', () => {
            const { rerender } = render(
                <ErrorDisplay
                    error={{ success: false, error: 'Invalid URL', code: 'INVALID_URL' }}
                    onRetry={jest.fn()}
                />
            );

            expect(screen.queryByText('🔄 Try Again')).not.toBeInTheDocument();

            rerender(
                <ErrorDisplay
                    error={{ success: false, error: 'Network error', code: 'NETWORK_ERROR' }}
                    onRetry={jest.fn()}
                />
            );

            expect(screen.getByText('🔄 Try Again')).toBeInTheDocument();
        });

        test('should not show retry button when onRetry is not provided', () => {
            render(
                <ErrorDisplay
                    error={{ success: false, error: 'Network error', code: 'NETWORK_ERROR' }}
                />
            );

            expect(screen.queryByText('🔄 Try Again')).not.toBeInTheDocument();
        });

        test('should show View Instructions button only for profile context', () => {
            const { rerender } = render(
                <ErrorDisplay error="Test error" context="validation" />
            );

            expect(screen.queryByText('📖 View Instructions')).not.toBeInTheDocument();

            rerender(<ErrorDisplay error="Test error" context="profile" />);

            expect(screen.getByText('📖 View Instructions')).toBeInTheDocument();
        });
    });
});