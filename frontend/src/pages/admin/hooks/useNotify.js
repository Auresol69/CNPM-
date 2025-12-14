import { useSnackbar } from 'notistack'

export function useNotify() {
  const { enqueueSnackbar } = useSnackbar()

  return {
    success: (message) => enqueueSnackbar(message, { variant: 'success' }),
    error: (message) => enqueueSnackbar(message, { variant: 'error' }),
    warning: (message) => enqueueSnackbar(message, { variant: 'warning' }),
    info: (message) => enqueueSnackbar(message, { variant: 'info' }),
  }
}

export default useNotify
