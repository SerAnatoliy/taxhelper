import {
  SummaryCardContainer,
  SummaryTitle,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
} from './SummaryCard.styles';

/**
 * Reusable SummaryCard component for displaying totals and summaries
 * Can be used for Income Summary, Expenses Summary, etc.
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (e.g., 'Income Summary', 'Expenses Summary')
 * @param {Array} props.items - Array of items to display [{ label, value, highlight?, variant? }]
 * @param {React.ReactNode} props.children - Custom content to render
 * @param {string} props.className - Additional CSS class
 */
const SummaryCard = ({
  title,
  items = [],
  children,
  className,
}) => {
  return (
    <SummaryCardContainer className={className}>
      {title && <SummaryTitle>{title}</SummaryTitle>}
      
      {items.map((item, index) => (
        <SummaryItem key={item.label || index}>
          <SummaryLabel>{item.label}</SummaryLabel>
          <SummaryValue $highlight={item.highlight} $variant={item.variant}>
            {item.value}
          </SummaryValue>
        </SummaryItem>
      ))}

      {children}
    </SummaryCardContainer>
  );
};

export {
  SummaryCardContainer,
  SummaryTitle,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
};

export default SummaryCard;