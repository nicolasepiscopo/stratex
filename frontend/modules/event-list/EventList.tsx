import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import orderBy from "lodash/orderBy";
import Refresh from "@mui/icons-material/Refresh";
import { Event } from "./EventList.helpers";
import { toast } from "react-toastify";
import { SymbolCell } from "./symbol-cell";
import { usePaginatedResults } from "../../hooks/usePaginatedResults";
import { Pagination } from "../../components/Pagination";

interface BotListProps {
  events: Event[];
  refetch: () => Promise<unknown>;
  title?: string;
  pageSize?: number;
}

export function EventList ({ events = [], refetch, title, pageSize = 10 }: BotListProps) {
  const { paginatedResults, setPage, page, pageCount } = usePaginatedResults(orderBy(events, ['date'], ['desc']), { pageSize });
  const handleOnClick = () => {
    toast.promise(
      refetch(),
      {
        error: 'Error fetching events',
        success: 'Events fetched successfully',
        pending: 'Fetching events...',
      }
    )
  }

  return (
    <Card sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Box p={1} textAlign="center">
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Typography variant="overline">
              {title ?? 'Bots Transaction Events'}
            </Typography>
            <Tooltip title="Refresh List">
              <IconButton onClick={handleOnClick} size="small">
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        <Table aria-label="events-table">
          <TableHead>
            <TableRow>
              <TableCell width={100} />
              <TableCell>
                Order Type
              </TableCell>
              <TableCell>
                Qty
              </TableCell>
              <TableCell>
                Trade Price
              </TableCell>
              <TableCell>
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResults.map((event, index) => {
              return (
                <TableRow key={index}>
                  <TableCell align="center">
                    <SymbolCell 
                      botId={event.botId}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={event.orderType.toUpperCase()}
                      color={event.orderType === 'buy' ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {event.quantity}
                  </TableCell>
                  <TableCell>
                    ${event.tradePrice}
                  </TableCell>
                  <TableCell>
                    {event.date}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Pagination page={page} pageCount={pageCount} setPage={setPage} />
      </TableContainer>
      {events.length === 0 && (
        <Box p={2} textAlign="center">
          <Typography variant="overline" color="gray">
            No events yet
          </Typography>
        </Box>
      )}
    </Card>
  );
}