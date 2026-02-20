import { forwardRef } from 'react';
import styled from 'styled-components';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const InputWrapper = styled.div`
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  color: #111827;
  background-color: white;
  border: 1px solid ${(props) => (props.$hasError ? '#fca5a5' : '#d1d5db')};
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: border-color 0.2s, box-shadow 0.2s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? '#ef4444' : '#4f46e5')};
    box-shadow: 0 0 0 2px ${(props) => (props.$hasError ? '#fecaca' : '#c7d2fe')};
  }

  &:disabled {
    cursor: not-allowed;
    background-color: #f9fafb;
    color: #6b7280;
  }
`;

const ErrorMessage = styled.p`
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc2626;
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <InputWrapper>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <StyledInput
          ref={ref}
          id={inputId}
          $hasError={!!error}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && <ErrorMessage id={`${inputId}-error`}>{error}</ErrorMessage>}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';
