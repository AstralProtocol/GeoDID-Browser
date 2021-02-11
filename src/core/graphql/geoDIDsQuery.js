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
        }
      }
      active
      type
    }
  }
`;
