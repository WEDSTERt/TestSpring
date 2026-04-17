import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      fullName
      email
    }
  }
`;

export const REGISTER = gql`
  mutation CreateUser($fullName: String!, $email: String!, $password: String!) {
    createUser(fullName: $fullName, email: $email, password: $password) {
      id
      fullName
      email
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $fullName: String, $password: String) {
    updateUser(id: $id, fullName: $fullName, password: $password) {
      id
      fullName
      email
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $name: String) {
    updateProject(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const ADD_PROJECT_MEMBER = gql`
  mutation AddProjectMember($projectId: ID!, $userId: ID!, $role: RoleProject) {
    addProjectMember(projectId: $projectId, userId: $userId, role: $role) {
      id
    }
  }
`;

export const UPDATE_MEMBER_ROLE = gql`
  mutation UpdateProjectMember($id: ID!, $role: RoleProject) {
    updateProjectMember(id: $id, role: $role) {
      id
      role
    }
  }
`;

export const REMOVE_MEMBER = gql`
  mutation RemoveProjectMember($id: ID!) {
    removeProjectMember(id: $id)
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;