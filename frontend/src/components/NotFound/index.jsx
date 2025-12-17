import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import { GradientPageContainer, PageTitle, PageSubtitle } from '../Shared/FormComponents/FormComponents.styles';
import { ActionButton } from '../Shared/ActionButton/ActionButton';
import { MainContent, ButtonContainer, ErrorCode, Illustration } from './NotFound.styles';


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