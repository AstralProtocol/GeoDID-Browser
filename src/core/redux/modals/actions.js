export const actions = {
  OPEN_FILTER: 'modals/open-filter',
  CLOSE_FILTER: 'modals/close-filter',
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
