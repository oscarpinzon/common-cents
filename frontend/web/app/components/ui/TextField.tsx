import { TextField as MuiTextField, TextFieldProps } from "@mui/material";

export function TextField(props: TextFieldProps) {
  return <MuiTextField variant="outlined" {...props} />;
}
