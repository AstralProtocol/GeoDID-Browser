import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { useQuery } from '@apollo/react-hooks';
import geoDIDQuery from 'core/graphql/geoDIDQuery';
import Map from 'components/Map';

const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
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

const GeoDIDView = (props) => {
  const {
    match: { params },
  } = props;

  const { geoDIDID } = params;

  const classes = useStyles();
  const parentRef = useRef(null);
  // const [geoDIDID, setSelectedGeoDIDId] = useState(null);
  const { data: dataSelected, loading: loadingSelected } = useQuery(geoDIDQuery, {
    variables: {
      geoDIDID,
    },
  });

  const selectedGeoDID = dataSelected ? dataSelected.geoDID : null;

  let geoDIDMetadata;

  if (selectedGeoDID) {
    geoDIDMetadata = (
      <Grid container spacing={0} direction="row" justify="center">
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
  } else if (!selectedGeoDID && loadingSelected) {
    geoDIDMetadata = <CircularProgress />;
  } else {
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
          <Card classes={{ root: classes.metadata }} variant="outlined" style={{ height: '48vh' }}>
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
  );
};

export default GeoDIDView;
