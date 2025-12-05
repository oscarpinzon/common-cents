import { Box, Typography } from "@mui/material";

export function PageHeader() {
  return (
    <Box component="header">
      <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
        CommonCents
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Household expenses for you + your partner
      </Typography>
    </Box>
  );
}