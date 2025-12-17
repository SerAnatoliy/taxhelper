import { BaseButton, BaseButtonLink } from "./ActionButton.styles";
export const SubmitButton = ({
  to,
  children,
  width,
  height,
  padding,
  fontSize,
  ...props
}) => (
  <BaseButton
    to={to}
    width={width}
    height={height}
    padding={padding}
    fontSize={fontSize}
    {...props}
  >
    {children}
  </BaseButton>
);

export const ActionButton = ({
  to,
  children,
  width,
  height,
  padding,
  fontSize,
  ...props
}) => (
  <BaseButtonLink
    to={to}
    width={width}
    height={height}
    padding={padding}
    fontSize={fontSize}
    {...props}
  >
    {children}
  </BaseButtonLink>
);