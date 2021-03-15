import React from 'react';
import clsx from 'clsx';
import { connect } from 'react-redux';
import { lighten, makeStyles } from '@material-ui/core/styles';
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import { getBytes32FromGeoDIDid } from 'utils';
import { useWallet } from 'core/hooks/web3';
import { toggleAddGeoDIDAsChildrenModal } from 'core/redux/modals/actions';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'id', numeric: false, disablePadding: true, label: 'GeoDID ID' },
  { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
  { id: 'cid', numeric: false, disablePadding: false, label: 'CID' },
];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
  selected: {
    marginRight: '10px',
  },
}));

const EnhancedTableToolbar = (props) => {
  const { tx, contracts } = useWallet();
  const classes = useToolbarStyles();
  const {
    numSelected,
    selected,
    geoDIDID,
    type,
    isModal,
    dispatchToggleAddGeoDIDAsChildrenModal,
  } = props;

  const handleAddSelectedGeoDIDsAsChildren = () => {
    const childrenGeoDIDsAsBytes = selected
      ? selected.reduce((bytes32Ids, selectedGeoDID) => {
          bytes32Ids.push(getBytes32FromGeoDIDid(selectedGeoDID));

          return bytes32Ids;
        }, [])
      : [];

    tx(
      contracts.SpatialAssets.addChildrenGeoDIDs(
        getBytes32FromGeoDIDid(geoDIDID),
        childrenGeoDIDsAsBytes,
      ),
    );
    if (isModal) {
      dispatchToggleAddGeoDIDAsChildrenModal(false);
    }
  };

  const handleRemoveSelectedGeoDIDsAsChildren = () => {
    const childrenGeoDIDsAsBytes = selected
      ? selected.reduce((bytes32Ids, selectedGeoDID) => {
          bytes32Ids.push(getBytes32FromGeoDIDid(selectedGeoDID));

          return bytes32Ids;
        }, [])
      : [];

    tx(
      contracts.SpatialAssets.removeChildrenGeoDIDs(
        getBytes32FromGeoDIDid(geoDIDID),
        childrenGeoDIDsAsBytes,
      ),
    );
  };

  let toolbarContent;

  if (type === 'Add' && numSelected > 0) {
    toolbarContent = (
      <>
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
        <Tooltip title="Add Selected">
          <IconButton aria-label="add" onClick={handleAddSelectedGeoDIDsAsChildren}>
            <Typography className={classes.selected} variant="h6" component="div" display="block">
              Add selected
            </Typography>
            <LibraryAddIcon />
          </IconButton>
        </Tooltip>
      </>
    );
  } else if (type === 'Remove' && numSelected > 0) {
    toolbarContent = (
      <>
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
        <Tooltip title="Remove Selected">
          <IconButton aria-label="add" onClick={handleRemoveSelectedGeoDIDsAsChildren}>
            <Typography className={classes.selected} variant="h6" component="div" display="block">
              Remove selected
            </Typography>
            <LibraryAddIcon />
          </IconButton>
        </Tooltip>
      </>
    );
  } else if (type === 'Remove' && numSelected === 0) {
    toolbarContent = (
      <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
        Select GeoDIDs to remove as Children
      </Typography>
    );
  } else if (type === 'Add' && numSelected === 0) {
    toolbarContent = (
      <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
        Select GeoDIDs to add as Children
      </Typography>
    );
  }
  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {toolbarContent}
    </Toolbar>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

function ChildrenGeoDIDsTable(props) {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const {
    geoDIDID,
    type,
    isModal,
    dispatchToggleAddGeoDIDAsChildrenModal,
    allAvailableChildren,
    loading,
    maxNumberOfRows,
  } = props;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = allAvailableChildren.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, allAvailableChildren.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          selected={selected}
          geoDIDID={geoDIDID}
          type={type}
          isModal={isModal}
          dispatchToggleAddGeoDIDAsChildrenModal={dispatchToggleAddGeoDIDAsChildrenModal}
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="small"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={allAvailableChildren.length}
            />
            <TableBody>
              {allAvailableChildren.length > 0 && !loading ? (
                stableSort(allAvailableChildren, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const isItemSelected = isSelected(row.id);
                    const labelId = `enhanced-table-checkbox-${row.id}`;

                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </TableCell>
                        <TableCell component="th" id={labelId} scope="row" padding="none">
                          {row.id}
                        </TableCell>
                        <TableCell align="right">{row.type}</TableCell>
                        <TableCell align="right">{row.cid}</TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow style={{ height: 33 * rowsPerPage }}>
                  <TableCell colSpan={6} style={{ alignItems: 'center', textAlign: 'center' }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 33 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, maxNumberOfRows]}
          component="div"
          count={allAvailableChildren.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

const mapStateToProps = (state) => ({
  geoDIDID: state.spatialAssets.geoDIDID,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchToggleAddGeoDIDAsChildrenModal: (open) => dispatch(toggleAddGeoDIDAsChildrenModal(open)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChildrenGeoDIDsTable);
