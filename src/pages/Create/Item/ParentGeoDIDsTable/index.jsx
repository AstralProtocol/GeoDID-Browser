import React from 'react';
import clsx from 'clsx';
import { connect } from 'react-redux';
import { lighten, makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
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
  Button,
  Radio,
} from '@material-ui/core';
import { getShortGeoDID } from 'utils';
import { setSelectedGeoDID, setSelectedParentCreation } from 'core/redux/spatial-assets/actions';

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
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" />
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
  const classes = useToolbarStyles();
  const { numSelected, selected } = props;

  let toolbarContent;

  if (numSelected > 0) {
    toolbarContent = (
      <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
        {getShortGeoDID(selected)} selected
      </Typography>
    );
  } else if (numSelected === 0) {
    toolbarContent = (
      <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
        Add a Collection as Parent?
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

function ParentGeoDIDsTable(props) {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(3);
  const history = useHistory();

  const {
    geoDIDID,
    dispatchSetSelectedParentCreation,
    dispatchSetSelectedGeoDID,
    allAvailableParents,
    loading,
    maxNumberOfRows,
    selected,
    isDisabled,
  } = props;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, id) => {
    if (!isDisabled) {
      if (selected !== id) {
        dispatchSetSelectedParentCreation(id);
      } else {
        dispatchSetSelectedParentCreation(null);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleGeoDIDSelection = (value) => {
    dispatchSetSelectedGeoDID(value);
    history.push(`/browse/${value}`);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, allAvailableParents.length - page * rowsPerPage);

  let tableBody;

  if (allAvailableParents.length > 0 && !loading) {
    tableBody = (
      <TableBody>
        {stableSort(allAvailableParents, getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row) => {
            const isItemSelected = selected === row.id || false;

            const labelId = `enhanced-table-checkbox-${row.id}`;
            return (
              <TableRow
                hover
                role="checkbox"
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={row.id}
                selected={isItemSelected}
              >
                <TableCell padding="checkbox" onClick={(event) => handleClick(event, row.id)}>
                  <Radio
                    disabled={isDisabled}
                    checked={!isDisabled ? isItemSelected : false}
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </TableCell>
                <TableCell component="th" id={labelId} scope="row" padding="none">
                  <Button onClick={() => handleGeoDIDSelection(row.id)}>{row.id}</Button>
                </TableCell>
                <TableCell align="left">{row.type}</TableCell>
                <TableCell align="left">{row.cid}</TableCell>
              </TableRow>
            );
          })}
        <TableRow key="empty-1" style={{ height: 33 * emptyRows }}>
          <TableCell colSpan={6} />
        </TableRow>
      </TableBody>
    );
  } else if (emptyRows > 0 && !loading) {
    tableBody = (
      <TableBody>
        <TableRow key="empty-2" style={{ height: 33 * emptyRows }}>
          <TableCell colSpan={6} />
        </TableRow>
      </TableBody>
    );
  } else if (loading) {
    tableBody = (
      <TableBody>
        <TableRow key="loading" style={{ height: 33 * rowsPerPage }}>
          <TableCell colSpan={6} style={{ alignItems: 'center', textAlign: 'center' }}>
            <CircularProgress />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          numSelected={selected ? 1 : 0}
          selected={selected}
          geoDIDID={geoDIDID}
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
              numSelected={selected ? 1 : 0}
              selected={selected}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={allAvailableParents.length}
            />
            {tableBody}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[1, maxNumberOfRows]}
          component="div"
          count={allAvailableParents.length}
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
  selected: state.spatialAssets.parent,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetSelectedParentCreation: (parent) => dispatch(setSelectedParentCreation(parent)),
  dispatchSetSelectedGeoDID: (geoDIDID) => dispatch(setSelectedGeoDID(geoDIDID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ParentGeoDIDsTable);
