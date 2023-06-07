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
import orderBy from "lodash/orderBy";
import Refresh from "@mui/icons-material/Refresh";
import { Event } from "./EventList.helpers";
import { toast } from "react-toastify";
import { SymbolCell } from "./symbol-cell";

interface BotListProps {
  events: Event[];
  refetch: () => Promise<unknown>;
}

export function EventList ({ events, refetch }: BotListProps) {
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
    <TableContainer component={Paper}>
      <Box p={1} textAlign="center">
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Typography variant="overline">
            Bots Transaction Events
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
            <TableCell>
              Symbol
            </TableCell>
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
          {orderBy(events, ['date'], ['desc']).map((event) => {
            return (
              <TableRow key={event.id}>
                <TableCell>
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
    </TableContainer>
  );
}