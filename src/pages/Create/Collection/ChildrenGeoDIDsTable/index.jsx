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
  Checkbox,
  Button,
} from '@material-ui/core';
import { setSelectedGeoDID, setSelectedChildrenCreation } from 'core/redux/spatial-assets/actions';

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
            inputProps={{ 'aria-label': 'select all' }}
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
  const classes = useToolbarStyles();
  const { numSelected, type } = props;

  let toolbarContent;

  if (type === 'Add' && numSelected > 0) {
    toolbarContent = (
      <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
        {numSelected} selected
      </Typography>
    );
  } else if (type === 'Add' && numSelected === 0) {
    toolbarContent = (
      <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
        Add GeoDIDs as children?
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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const history = useHistory();

  const {
    type,
    dispatchSetSelectedGeoDID,
    dispatchSetSelectedChildrenCreation,
    allAvailableChildren,
    loading,
    maxNumberOfRows,
    selected,
  } = props;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = allAvailableChildren.map((n) => n.id);
      dispatchSetSelectedChildrenCreation(newSelecteds);
      return;
    }
    dispatchSetSelectedChildrenCreation([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
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

    dispatchSetSelectedChildrenCreation(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleGeoDIDSelection = (value) => {
    dispatchSetSelectedGeoDID(value);
    history.push(`/browse/${value}`);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, allAvailableChildren.length - page * rowsPerPage);

  let tableBody;

  if (allAvailableChildren.length > 0 && !loading) {
    tableBody = (
      <TableBody>
        {stableSort(allAvailableChildren, getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row) => {
            const isItemSelected = isSelected(row.id);
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
                  <Checkbox checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }} />
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
        <EnhancedTableToolbar numSelected={selected.length} type={type} />
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
            {tableBody}
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
  selected: state.spatialAssets.children,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetSelectedChildrenCreation: (children) =>
    dispatch(setSelectedChildrenCreation(children)),
  dispatchSetSelectedGeoDID: (geoDIDID) => dispatch(setSelectedGeoDID(geoDIDID)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChildrenGeoDIDsTable);
