import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SearchBar from 'material-ui-search-bar';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Typography,
  // ListItem,
  // ListItemText,
  CircularProgress,
} from '@material-ui/core';
import { TreeView, TreeItem } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Virtuoso } from 'react-virtuoso';
import { useQuery } from '@apollo/react-hooks';
import geoDIDsQuery from 'core/graphql/geoDIDsQuery';
import geoDIDQuery from 'core/graphql/geoDIDQuery';
import { useWallet } from 'core/hooks/web3';
import Map from './Map';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    paddingTop: '10px',
    paddingLeft: '10px',
    paddingBottom: '10px',
    width: '100%',
  },
  container: {},
  button: {
    textAlign: 'center',
    position: 'relative',
    top: '50%',
    transform: `translateY(-50%)`,
    background: 'linear-gradient(45deg, #8FB8ED 30%, #62BFED 90%)',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    borderRadius: '20px',
  },
  searchBar: {
    textAlign: 'center',
    position: 'relative',
    top: '50%',
    transform: `translateY(-50%)`,
  },
  list: {
    borderRadius: '20px',
    height: '100%',
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  map: {
    borderRadius: '20px',
  },
  metadata: {
    borderRadius: '20px',
  },
  scrollbar: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      width: '0px',
    },
  },
}));
const iff = (condition, then, otherwise) => (condition ? then : otherwise);

const Dashboard = () => {
  const classes = useStyles();
  const parentRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');
  const [expanded, setExpanded] = useState([]);
  const [geoDIDID, setSelectedGeoDIDId] = useState(null);
  const { address } = useWallet();

  const { data, loading } = useQuery(geoDIDsQuery, {
    variables: {
      where: {
        ...(address ? { owner: address.toLowerCase() } : {}),
        ...{ active: true },
        ...{ type: 'Collection' },
        ...{ isRoot: true },
      },
    },
  });

  const { data: dataAll } = useQuery(geoDIDsQuery, {
    variables: {
      where: {
        ...{ active: true },
      },
    },
  });

  const { data: dataSelected } = useQuery(geoDIDQuery, {
    variables: {
      geoDIDID,
    },
  });

  const geoDIDs = data ? data.geoDIDs : [];
  const allGeoDIDs = dataAll ? dataAll.geoDIDs : [];
  const selectedGeoDID = dataSelected ? dataSelected.geoDID : null;

  const reduceSubTree = (nodes) =>
    nodes.reduce((newNodes, node) => {
      let extraEdges = null;

      const foundExtra = allGeoDIDs.some((geoDID) => {
        if (geoDID.id === node.childGeoDID.id && Array.isArray(geoDID.edges)) {
          extraEdges = geoDID.edges;
        }
        return extraEdges;
      });

      newNodes.push({
        id: node.id,
        geoDIDid: node.childGeoDID.id,
        type: node.childGeoDID.type,
        children: Array.isArray(node.childGeoDID.edges)
          ? reduceSubTree(node.childGeoDID.edges)
          : iff(foundExtra, reduceSubTree(extraEdges), null),
      });
      return newNodes;
    }, []);

  const treeGeoDIDs =
    geoDIDs.length > 0 && allGeoDIDs.length > 0
      ? geoDIDs.reduce((newGeoDID, geoDID) => {
          const children = Array.isArray(geoDID.edges) ? reduceSubTree(geoDID.edges) : null;

          newGeoDID.push({
            id: geoDID.id,
            geoDIDid: geoDID.id,
            type: geoDID.type,
            children,
          });
          return newGeoDID;
        }, [])
      : [];

  const renderTree = (nodes) => {
    const id = nodes.geoDIDid || nodes.id;
    return (
      <TreeItem
        key={id}
        nodeId={id}
        label={`${nodes.type} ${id.substr(0, 15)}... ${id.substr(-4)}`}
      >
        {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
      </TreeItem>
    );
  };

  let listArea;

  /*
  const traverseTree = (rootGeoDID, treeGeoDIDs) => {
    const sequence = treeGeoDIDs.find((newSequence, node) => {

      if (node.id !== targetGeoDID){
        newSequence.push(node.id);
      }

      return newNodes;
    }, []);
  };
*/

  if (treeGeoDIDs.length > 0 && !loading) {
    listArea = (
      <Virtuoso
        data={treeGeoDIDs}
        style={{ height: '90%' }}
        itemContent={(index, node) => (
          <TreeView
            key={index}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpanded={['root']}
            expanded={expanded}
            onNodeSelect={(event, nodeId) => setSelectedGeoDIDId(nodeId)}
            onNodeToggle={(event, nodeIds) => setExpanded(nodeIds)}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            {renderTree(node)}
          </TreeView>
        )}
        components={{
          Scroller: React.forwardRef(({ style, children }, ref) => (
            // an alternative option to assign the ref is
            // <div ref={(r) => ref.current = r}>
            <div
              style={{
                ...style,
              }}
              ref={ref}
              className={classes.scrollbar}
            >
              {children}
            </div>
          )),
        }}
      />
    );
  } else if (loading) {
    listArea = (
      <div style={{ height: '90%' }}>
        <CircularProgress />
      </div>
    );
  } else if (treeGeoDIDs.length === 0 && !loading) {
    listArea = <div style={{ height: '90%' }}>No GeoDIDs found</div>;
  }

  let geoDIDMetadata;

  if (expanded.length > 0 && selectedGeoDID) {
    geoDIDMetadata = (
      <Grid container spacing={2} direction="row" justify="center">
        <Grid item xs={2}>
          <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
            GeoDID ID
          </Typography>
          <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
            Content ID
          </Typography>
          <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
            Type
          </Typography>
        </Grid>
        <Grid item xs={10}>
          <Typography variant="subtitle1" gutterBottom>
            {selectedGeoDID.id}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {selectedGeoDID.cid}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {selectedGeoDID.type}
          </Typography>
        </Grid>
      </Grid>
    );
  } else if (expanded.length > 0 && !selectedGeoDID) {
    geoDIDMetadata = <CircularProgress />;
  } else if (expanded.length === 0 && !selectedGeoDID) {
    geoDIDMetadata = '';
  }

  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justify="center"
      alignItems="stretch"
      className={classes.root}
    >
      <Grid item xs={4}>
        <Grid container spacing={0} className={classes.container}>
          <Grid item xs={3} style={{ height: '10vh' }}>
            <Button fullWidth size="small" className={classes.button}>
              Filter
            </Button>
          </Grid>
          <Grid item xs={9} style={{ height: '10vh' }}>
            <SearchBar
              className={classes.searchBar}
              placeholder="Search GeoDID"
              value={searchValue}
              onChange={(newValue) => setSearchValue(newValue)}
              onRequestSearch={() => console.log(searchValue)}
            />
          </Grid>
          <Grid item xs={12} style={{ height: '86vh' }}>
            <Card classes={{ root: classes.list }} variant="outlined">
              <CardContent style={{ height: '100%' }}>
                <Typography variant="h5" component="h1" gutterBottom>
                  Browse GeoDIDs
                </Typography>
                {listArea}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={8}>
        <Grid container spacing={0} className={classes.container}>
          <Grid item xs={12}>
            <Card
              classes={{ root: classes.map }}
              variant="outlined"
              style={{ height: '48vh' }}
              ref={parentRef}
            >
              <Map parentRef={parentRef} />
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card
              classes={{ root: classes.metadata }}
              variant="outlined"
              style={{ height: '48vh' }}
            >
              <CardContent style={{ height: '90%' }}>
                <Typography variant="h5" component="h1" gutterBottom>
                  GeoDID Metadata
                </Typography>
                {geoDIDMetadata}
              </CardContent>
              <CardActions>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
