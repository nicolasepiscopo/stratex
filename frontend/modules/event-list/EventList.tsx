import { Box, Chip, Divider, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import orderBy from "lodash/orderBy";
import { useEvents } from "./EventList.helpers";
import { Refresh } from "@mui/icons-material";

export interface Event {
  id: string;
  // Crypto currency symbol
  symbol: string;
  symbolImage: string;
  orderType: 'buy' | 'sell';
  quantity: number;
  // The price at which the order was executed
  tradePrice: number;
  // The date at which the order was executed
  date: string;
}

interface BotListProps {
  events: Event[];
}

export function EventList ({ events }: BotListProps) {
  const { events: data, refetch } = useEvents();

  console.log(data);

  return (
    <TableContainer component={Paper}>
      <Box p={1} textAlign="center">
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Typography variant="overline">
            Bots Transaction Events
          </Typography>
          <Tooltip title="Refresh List">
            <IconButton onClick={() => refetch()} size="small">
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
                  <Box
                    aria-label={event.symbol}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundImage: `url(${event.symbolImage})`,
                      backgroundSize: 'cover',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={event.orderType.toUpperCase()}
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {event.quantity}
                </TableCell>
                <TableCell>
                  {event.tradePrice}
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