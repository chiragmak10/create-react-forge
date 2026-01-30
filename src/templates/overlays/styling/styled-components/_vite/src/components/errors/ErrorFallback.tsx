import { FallbackProps } from 'react-error-boundary';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc2626;
`;

const Message = styled.p`
  margin-top: 1rem;
  color: #4b5563;
`;

const RetryButton = styled.button`
  margin-top: 1.5rem;
  border-radius: 0.375rem;
  background-color: #4f46e5;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: background-color 0.2s;

  &:hover {
    background-color: #6366f1;
  }
`;

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Container role="alert">
      <Content>
        <Title>Something went wrong</Title>
        <Message>{error.message || 'An unexpected error occurred'}</Message>
        <RetryButton onClick={resetErrorBoundary}>Try again</RetryButton>
      </Content>
    </Container>
  );
}


