import React from 'react';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import {
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
  Radio,
} from '@material-ui/core';
import { getShortGeoDID, uuidv4 } from 'utils';

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
  { id: 'id', numeric: false, disablePadding: true, label: 'Id' },
  { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
  { id: 'serviceEndpoint', numeric: false, disablePadding: false, label: 'Endpoint' },
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
  const { numSelected } = props;

  let toolbarContent;

  if (numSelected > 0) {
    toolbarContent = (
      <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
        Asset selected
      </Typography>
    );
  } else if (numSelected === 0) {
    toolbarContent = (
      <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
        Select dropped asset to preview
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

export default function AssetsTable(props) {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const { setSelectedAsset, selectedAsset, assets, maxNumberOfRows } = props;

  console.log(assets);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, id) => {
    if (selectedAsset && selectedAsset.id === id) {
      setSelectedAsset(null);
    } else {
      const foundAsset = assets.find((file) => file.id === id);
      setSelectedAsset(foundAsset);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, assets.length - page * rowsPerPage);

  let tableBody;

  if (assets.length > 0) {
    tableBody = (
      <TableBody>
        {stableSort(assets, getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row) => {
            const isItemSelected = selectedAsset ? selectedAsset.id === row.id : false;
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
                  <Radio checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }} />
                </TableCell>
                <TableCell component="th" id={labelId} scope="row" padding="none">
                  {`${row.id.substr(0, 13)}... ${row.id.split('#')[1]}`}
                </TableCell>
                <TableCell align="left">{row.type}</TableCell>
                <TableCell key={uuidv4()} align="left">
                  {getShortGeoDID(row.serviceEndpoint)}
                </TableCell>
              </TableRow>
            );
          })}
        <TableRow key="empty-1" style={{ height: 33 * emptyRows }}>
          <TableCell colSpan={6} />
        </TableRow>
      </TableBody>
    );
  } else if (emptyRows > 0) {
    tableBody = (
      <TableBody>
        <TableRow key="empty-2" style={{ height: 33 * emptyRows }}>
          <TableCell colSpan={6} />
        </TableRow>
      </TableBody>
    );
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selectedAsset ? 1 : 0} />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="small"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selectedAsset ? 1 : 0}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={assets.length}
            />
            {tableBody}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, maxNumberOfRows]}
          component="div"
          count={assets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
