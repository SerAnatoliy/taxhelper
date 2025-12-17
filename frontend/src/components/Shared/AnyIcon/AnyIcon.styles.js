import styled from 'styled-components';


export const IconBase = styled.span`
  display: inline-flex;
  width: ${({ size }) => size || '48px'};
  height: ${({ size }) => size || '48px'};

  svg {
    width: 100%;
    height: 100%;
  }
`;