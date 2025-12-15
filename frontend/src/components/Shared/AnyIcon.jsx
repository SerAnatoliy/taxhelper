import styled from 'styled-components';


const IconBase = styled.span`
  display: inline-flex;
  width: ${({ size }) => size || '48px'};
  height: ${({ size }) => size || '48px'};

  svg {
    width: 100%;
    height: 100%;
  }
`;

export const AnyIcon = ({ icon: Icon, size = '48px', ...props }) => (
  <IconBase size={size} {...props}>
    <Icon />
  </IconBase>
);