import styled from 'styled-components';
import Hero from './Hero/Hero';
import Features from './Features/Features';
import Pricing from './Pricing/Pricing';
import Footer from '../Shared/Footer/Footer';
import Header from '../Shared/Header/Header';

const Container = styled.div`
  min-height: 100vh;
`;

const Landing = () => {
  return (
    <Container>
      <Header />
      <Hero />
      <Features id="features" />
      <Pricing id="pricing" />
      <Footer />
    </Container>
  );
};

export default Landing;