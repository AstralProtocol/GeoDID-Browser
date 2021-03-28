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
  IconButton,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';

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
  { id: 'tag', numeric: false, disablePadding: true, label: 'Tag' },
  { id: 'type', numeric: false, disablePadding: false, label: 'Type' },
  { id: 'size', numeric: false, disablePadding: false, label: 'size' },
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
        <TableCell padding="checkbox" />
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

  const {
    setSelectedAsset,
    selectedAsset,
    fileObjects,
    setFileObjs,
    files,
    setFiles,
    maxNumberOfRows,
  } = props;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, tag) => {
    if (selectedAsset && selectedAsset.tag === tag) {
      setSelectedAsset(null);
    } else {
      const foundAsset = files.find((file) => file.tag === tag);
      setSelectedAsset(foundAsset);
    }
  };

  const handleRemove = (event, tag) => {
    if (selectedAsset && selectedAsset.tag === tag) {
      setSelectedAsset(null);
    }
    const newFiles = files.filter((file) => file.tag !== tag);

    const newFileObjs = fileObjects.filter((file) => file.file.name !== tag);
    setFiles(newFiles);
    setFileObjs(newFileObjs);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (tag) => selectedAsset && selectedAsset.tag === tag;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, files.length - page * rowsPerPage);

  let tableBody;

  if (files.length > 0) {
    tableBody = (
      <TableBody>
        {stableSort(files, getComparator(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row) => {
            const isItemSelected = isSelected(row.tag);
            const labelId = `enhanced-table-checkbox-${row.tag}`;
            return (
              <TableRow
                hover
                role="checkbox"
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={row.tag}
                selected={isItemSelected}
              >
                <TableCell padding="checkbox" onClick={(event) => handleClick(event, row.tag)}>
                  <Radio checked={isItemSelected} inputProps={{ 'aria-labelledby': labelId }} />
                </TableCell>
                <TableCell component="th" id={labelId} scope="row" padding="none">
                  {row.tag}
                </TableCell>
                <TableCell align="left">{row.type}</TableCell>
                <TableCell align="left">{row.size}</TableCell>
                <TableCell padding="checkbox" onClick={(event) => handleRemove(event, row.tag)}>
                  <IconButton>
                    <DeleteIcon />
                  </IconButton>
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
              rowCount={files.length}
            />
            {tableBody}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, maxNumberOfRows]}
          component="div"
          count={files.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
