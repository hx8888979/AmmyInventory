import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
// @mui
import { Stack, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------
import { useLoginMutation } from '../../../features/api/apiSlice';

export default function LoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading, isSuccess, isError, error }] = useLoginMutation();
  const { handleSubmit, register, formState: { errors }, setError, clearErrors } = useForm();

  const handleClick = async ({ username, password }) => {
    try {
      const response = await login({ username, password }).unwrap();
      localStorage.setItem('token_expiry', response.expiry);
      navigate('/dashboard/inventory', { replace: true });
    } catch (error) {
      setError('result', { type: 'customer', message: "username/password isn't match" })
    }
  };

  const clearResultError = () => clearErrors('result');

  return (
    <form onSubmit={handleSubmit(handleClick)}>
      <Stack spacing={3}>
        <TextField label="Email address" inputProps={register("username", { required: true, maxLength: { value: 40, message: "should be less than 40 letters" } })} error={!!errors.username} helperText={errors.username?.message} onChange={clearResultError} />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            ...register("password", { required: true }),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
            onChange: clearResultError
          }}
          error={!!errors.password} helperText={errors.password?.message}
        />

      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        {!!errors.result ? <Typography variant='caption' sx={{ color: 'red' }}>{errors.result?.message}</Typography> : null}
        {/* <Checkbox name="remember" label="Remember me" />
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link> */}
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isLoading}>
        Login
      </LoadingButton>
    </form>
  );
}
