import gql from 'graphql-tag';

export default gql`
  query($geoDIDID: ID!) {
    geoDID(id: $geoDIDID) {
      id
      owner
      cid
      storage
      root
      parent
      edges {
        id
        childGeoDID {
          id
          owner
          cid
          storage
          root
          parent
          active
          type
          edges {
            id
            childGeoDID {
              id
              type
            }
          }
        }
      }
      active
      type
    }
  }
`;
