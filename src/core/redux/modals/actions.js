export const actions = {
  OPEN_FILTER: 'modals/open-filter',
  CLOSE_FILTER: 'modals/close-filter',
  ERROR: 'snackbar/ERROR',
  CLOSE_ERROR: 'snackbar/CLOSE_ERROR',
  OPEN_ADD_CHILDREN_MODAL: 'modals/OPEN_ADD_CHILDREN:MODAL',
  OPEN_ADD_PARENT_MODAL: 'modals/OPEN_ADD_PARENT_MODAL',
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

export const toggleAddGeoDIDAsChildrenModal = (open) => ({
  type: actions.OPEN_ADD_CHILDREN_MODAL,
  payload: {
    addChildrenModal: open,
  },
});

export const toggleAddGeoDIDAsParentModal = (open) => ({
  type: actions.OPEN_ADD_PARENT_MODAL,
  payload: {
    addParentModal: open,
  },
});
