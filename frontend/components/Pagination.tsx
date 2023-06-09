import { ArrowBack, ArrowForward } from "@mui/icons-material";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface PaginationProps {
  pageCount: number;
  page: number;
  setPage: (page: number) => void;
}

export function Pagination ({ pageCount, page, setPage }: PaginationProps) {
  if (pageCount === 1) return null;

  return (
    <Stack direction="row" justifyContent="space-between" p={1} spacing={1}>
      <Button onClick={() => setPage(page - 1)} startIcon={<ArrowBack />} disabled={page <= 0}>
        Previous
      </Button>
      <Typography variant="overline" color="gray">
        Page {page + 1} of {pageCount}
      </Typography>
      <Button onClick={() => setPage(page + 1)} endIcon={<ArrowForward />} disabled={pageCount - 1 <= page}>
        Next
      </Button>
    </Stack>
  );
}