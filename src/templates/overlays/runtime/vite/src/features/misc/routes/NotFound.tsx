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

const ErrorCode = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #4f46e5;
`;

const Title = styled.h1`
  margin-top: 1rem;
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.025em;

  @media (min-width: 640px) {
    font-size: 3rem;
  }
`;

const Description = styled.p`
  margin-top: 1.5rem;
  font-size: 1rem;
  line-height: 1.75rem;
  color: #4b5563;
`;

const Actions = styled.div`
  margin-top: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
`;

const HomeLink = styled(Link)`
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  background-color: #4f46e5;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #6366f1;
  }

  &:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }
`;

export function NotFound() {
  return (
    <Container>
      <Content>
        <ErrorCode>404</ErrorCode>
        <Title>Page not found</Title>
        <Description>
          Sorry, we couldn't find the page you're looking for.
        </Description>
        <Actions>
          <HomeLink to="/">Go back home</HomeLink>
        </Actions>
      </Content>
    </Container>
  );
}
