import { Field, useField } from 'formik';
import { default as MaterialTextField } from '@material-ui/core/TextField';
import { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label: string;
  multiline?: boolean;
}

export default function TextField({
  id,
  name,
  label,
  multiline,
  required = false,
  type,
  placeholder,
  ...otherProps
}: Props) {
  const [field, meta] = useField({ name, type: type ?? 'text' });

  return (
    <Field
      size="small"
      fullWidth={true}
      {...otherProps}
      as={MaterialTextField}
      id={id}
      name={name}
      label={label}
      multiline={multiline}
      required={required}
      error={meta.error && meta.touched}
      helperText={meta.touched && meta.error}
      variant="outlined"
      type={type}
      placeholder={placeholder}
    />
  );
}
