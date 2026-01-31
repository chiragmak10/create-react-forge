import { Link } from 'react-router-dom';
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
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #111827;

  @media (min-width: 640px) {
    font-size: 3.75rem;
  }
`;

const Description = styled.p`
  margin-top: 1.5rem;
  font-size: 1.125rem;
  line-height: 2rem;
  color: #4b5563;
`;

const ButtonGroup = styled.div`
  margin-top: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
`;

const PrimaryButton = styled(Link)`
  border-radius: 0.375rem;
  background-color: #4f46e5;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  text-decoration: none;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: background-color 0.2s;

  &:hover {
    background-color: #6366f1;
  }

  &:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }
`;

const SecondaryLink = styled.a`
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.5rem;
  color: #111827;
  text-decoration: none;

  &:hover {
    color: #4f46e5;
  }
`;

export function Landing() {
  return (
    <Container>
      <Content>
        <Title>Welcome to Your App</Title>
        <Description>
          A production-ready React application scaffolded with create-react-forge.
        </Description>
        <ButtonGroup>
          <PrimaryButton to="/dashboard">Get started</PrimaryButton>
          <SecondaryLink
            href="https://github.com/alan2207/bulletproof-react"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more <span aria-hidden="true">→</span>
          </SecondaryLink>
        </ButtonGroup>
      </Content>
    </Container>
  );
}



