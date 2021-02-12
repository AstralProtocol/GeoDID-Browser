import gql from 'graphql-tag';

export default gql`
  query($where: GeoDID_filter!) {
    geoDIDs(where: $where) {
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
