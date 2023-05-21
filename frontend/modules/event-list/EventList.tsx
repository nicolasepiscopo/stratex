import { Box, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

export interface Event {
  // TODO: define properly this event model
  amountInvested: number;
  amountReceived: number;
  transactionFee: number;
  tokenAddressFrom: string;
  tokenAddressTo: string;
  transactionHash: string;
  date: string;
}

interface BotListProps {
  events: Event[];
}

export function EventList ({ events }: BotListProps) {
  return (
    <TableContainer component={Paper}>
      <Box p={1} textAlign="center">
        <Typography variant="overline">
          Bots Transaction Events
        </Typography>
      </Box>
      <Table aria-label="events-table">
        <TableHead>
          <TableRow>
            <TableCell>
              Invested
            </TableCell>
            <TableCell>
              Received
            </TableCell>
            <TableCell>
              Fee
            </TableCell>
            <TableCell>
              Transaction Hash
            </TableCell>
            <TableCell>
              Date
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => {
            return (
              <TableRow key={event.transactionHash}>
                <TableCell>
                  {event.amountInvested} WETH
                </TableCell>
                <TableCell>
                  {event.amountReceived} WMATIC
                </TableCell>
                <TableCell>
                  {event.transactionFee} WETH
                </TableCell>
                <TableCell>
                  {event.transactionHash}
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