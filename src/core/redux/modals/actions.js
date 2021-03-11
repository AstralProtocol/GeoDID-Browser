export const actions = {
  OPEN_FILTER: 'modals/open-filter',
  CLOSE_FILTER: 'modals/close-filter',
  ERROR: 'snackbar/ERROR',
  CLOSE_ERROR: 'snackbar/CLOSE_ERROR',
};

export const openFilter = () => ({
  type: actions.OPEN_FILTER,
  payload: {
    openFilter: true,
  },
});

export const closeFilter = () => ({
  type: actions.CLOSE_FILTER,
  payload: {
    openFilter: false,
  },
});

export const snackbarError = (errorMsg) => ({
  type: actions.ERROR,
  payload: {
    errorMsg,
    openError: true,
  },
});

export const closeSnackbar = () => ({
  type: actions.CLOSE_ERROR,
  payload: {
    errorMsg: '',
    openError: false,
  },
});
