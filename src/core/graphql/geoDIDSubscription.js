import gql from 'graphql-tag';

export default gql`
  subscription($geoDIDID: ID!) {
    geoDID(id: $geoDIDID) {
      id
      owner
      cid
      storage
      root
      isRoot
      parent
      edges {
        id
        active
        childGeoDID {
          id
          owner
          cid
          storage
          root
          isRoot
          parent
          active
          type
          edges {
            id
            active
            childGeoDID {
              id
              type
            }
          }
        }
      }
      active
      type
      errors
      bytes32hash
      bytes32hashWithQM
    }
  }
`;
