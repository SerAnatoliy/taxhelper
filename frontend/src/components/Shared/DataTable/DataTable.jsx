import {
  TableContainer,
  StyledTable,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  ActionIconsWrapper,
  ActionIconButton,
  EmptyState,
  LoadingState,
  StatusBadge,
} from './DataTable.styles';

/**
 * Reusable DataTable component for Expenses, Income, and Reports pages
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions { key, label, align?, render? }
 * @param {Array} props.data - Array of data objects
 * @param {boolean} props.loading - Loading state
 * @param {string} props.loadingText - Text to show while loading
 * @param {string} props.emptyText - Text to show when no data
 * @param {string} props.minWidth - Minimum table width (default: '500px')
 * @param {Function} props.renderActions - Function to render action buttons (row) => JSX
 * @param {Function} props.onRowClick - Optional row click handler
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  loadingText = 'Loading...',
  emptyText = 'No data found.',
  minWidth = '500px',
  renderActions,
  onRowClick,
}) => {
  if (loading) {
    return <LoadingState>{loadingText}</LoadingState>;
  }

  if (data.length === 0) {
    return <EmptyState>{emptyText}</EmptyState>;
  }

  return (
    <TableContainer>
      <StyledTable $minWidth={minWidth}>
        <TableHead>
          <tr>
            {columns.map((col) => (
              <TableHeaderCell key={col.key} $align={col.align}>
                {col.label}
              </TableHeaderCell>
            ))}
            {renderActions && <TableHeaderCell>Actions</TableHeaderCell>}
          </tr>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              onClick={() => onRowClick?.(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col) => (
                <TableCell key={col.key} $align={col.align}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </TableCell>
              ))}
              {renderActions && (
                <TableCell>
                  <ActionIconsWrapper>
                    {renderActions(row)}
                  </ActionIconsWrapper>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
};

export {
  TableContainer,
  StyledTable,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  ActionIconsWrapper,
  ActionIconButton,
  EmptyState,
  LoadingState,
  StatusBadge,
};

export default DataTable;