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

interface BotListProps {
  events: Event[];
  refetch: () => void;
}

export function EventList ({ events, refetch }: BotListProps) {
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