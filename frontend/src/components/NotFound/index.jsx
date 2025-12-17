import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { GradientPageContainer, PageTitle, PageSubtitle } from '../Shared/FormComponents';
import { ActionButton } from '../Shared/ActionButton';
import { theme } from '../../theme';

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
`;

const ErrorCode = styled.h1`
  font-size: 120px;
  font-weight: 700;
  color: ${theme.colors.logoBlue};
  margin: 0;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 180px;
  }
`;

const Illustration = styled.div`
  font-size: 80px;
  margin: 1rem 0 2rem;

  @media (min-width: 768px) {
    font-size: 100px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1.5rem;
  }
`;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <GradientPageContainer>
      <Header />
      <MainContent>
        <ErrorCode>404</ErrorCode>
        <Illustration>🔍</Illustration>
        <PageTitle $size="32px">Page Not Found</PageTitle>
        <PageSubtitle $maxWidth="500px">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </PageSubtitle>

        <ButtonContainer>
          <ActionButton to="/" width="180px" padding="0.75rem 1.5rem">
            Go to Home
          </ActionButton>
          <ActionButton
            as="button"
            onClick={() => navigate(-1)}
            width="180px"
            padding="0.75rem 1.5rem"
            style={{ background: 'rgba(255,255,255,0.5)' }}
          >
            Go Back
          </ActionButton>
        </ButtonContainer>
      </MainContent>
      <Footer />
    </GradientPageContainer>
  );
};

export default NotFound;