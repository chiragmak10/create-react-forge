import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
};

const variantStyles = {
  primary: css`
    background-color: #4f46e5;
    color: white;
    &:hover:not(:disabled) {
      background-color: #6366f1;
    }
  `,
  secondary: css`
    background-color: #f3f4f6;
    color: #111827;
    &:hover:not(:disabled) {
      background-color: #e5e7eb;
    }
  `,
  outline: css`
    background-color: transparent;
    color: #374151;
    border: 1px solid #d1d5db;
    &:hover:not(:disabled) {
      background-color: #f9fafb;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: #374151;
    &:hover:not(:disabled) {
      background-color: #f3f4f6;
    }
  `,
  danger: css`
    background-color: #dc2626;
    color: white;
    &:hover:not(:disabled) {
      background-color: #ef4444;
    }
  `,
};

const sizeStyles = {
  sm: css`
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
  `,
  md: css`
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
  `,
  lg: css`
    padding: 0.75rem 1rem;
    font-size: 1rem;
  `,
};

const StyledButton = styled.button<{
  $variant: ButtonProps['variant'];
  $size: ButtonProps['size'];
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: background-color 0.2s, color 0.2s;
  border: none;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }

  ${(props) => variantStyles[props.$variant || 'primary']}
  ${(props) => sizeStyles[props.$size || 'md']}
`;

const LoadingSpinner = styled.span`
  margin-right: 0.5rem;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        $variant={variant}
        $size={size}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';
