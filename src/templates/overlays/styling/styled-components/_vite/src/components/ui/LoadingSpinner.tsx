import styled, { keyframes } from 'styled-components';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
};

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const sizes = {
  sm: '1rem',
  md: '2rem',
  lg: '4rem',
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div<{ $size: 'sm' | 'md' | 'lg' }>`
  width: ${(props) => sizes[props.$size]};
  height: ${(props) => sizes[props.$size]};
  border-radius: 50%;
  border: 2px solid #d1d5db;
  border-top-color: #4f46e5;
  animation: ${spin} 1s linear infinite;
`;

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <Container>
      <Spinner $size={size} role="status" aria-label="Loading" />
    </Container>
  );
}




