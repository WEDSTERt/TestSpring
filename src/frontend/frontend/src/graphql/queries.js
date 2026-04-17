import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser($id: ID!) {
    user(id: $id) {
      id
      fullName
      email
    }
  }
`;

export const GET_USER_PROJECTS = gql`
  query GetUserProjects($userId: ID!) {
    owned: projectsByOwner(ownerUserId: $userId) {
      id
      name
      owner { id fullName }
      members { id userId role }
    }
    member: projectsByMember(userId: $userId) {
      id
      name
      owner { id fullName }
      members { id userId role }
    }
  }
`;

export const GET_PROJECT_DETAILS = gql`
  query ProjectDetails($projectId: ID!) {
    project(id: $projectId) {
      id
      name
      owner { id fullName }
      members {
        id
        userId
        role
        user { id fullName email }
      }
    }
  }
`;