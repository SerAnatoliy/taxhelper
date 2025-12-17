import { IconBase } from "./AnyIcon.styles";

export const AnyIcon = ({ icon: Icon, size = '48px', ...props }) => (
  <IconBase size={size} {...props}>
    <Icon />
  </IconBase>
);