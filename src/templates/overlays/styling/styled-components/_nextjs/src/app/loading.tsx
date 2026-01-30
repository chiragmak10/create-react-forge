'use client';

import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  border-top-color: #4f46e5;
  animation: ${spin} 1s linear infinite;
`;

export default function Loading() {
  return (
    <Container>
      <Spinner role="status" aria-label="Loading" />
    </Container>
  );
}


