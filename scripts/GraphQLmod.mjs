// Within your organization create a private repository with issues and projects enabled and add a description of your choosing

// Create a pull request and an issue with just a simple title and body inside that repository

// Get and display the repository you created, as well as the the issue and pull request you made inside of it.

import { Octokit } from '@octokit/core';
import dotenv from 'dotenv';
dotenv.config();

const octokit = new Octokit({
  auth: process.env.TOKEN,
});

async function getRepositoryInfo(owner, repo) {
  const query = `
    query {
      repository(owner: "${owner}", name: "${repo}") {
        name
        description
        hasIssuesEnabled
        hasProjectsEnabled
        issues(first: 1) {
          nodes {
            title
            body
          }
        }
        pullRequests(first: 1) {
          nodes {
            title
            body
          }
        }
      }
    }
  `;

  try {
    const data = await octokit.graphql(query);
    console.log('getRepositoryInfo:');
    console.log('Repository Name:', data.repository.name);
    console.log('Repository Description:', data.repository.description);
    console.log('Issues Enabled:', data.repository.hasIssuesEnabled);
    console.log('Projects Enabled:', data.repository.hasProjectsEnabled);

    const issue = data.repository.issues.nodes[0];
    if (issue) {
      console.log('Issue:');
      console.log('Title:', issue.title);
      console.log('Body:', issue.body);
    }

    const pullRequest = data.repository.pullRequests.nodes[0];
    if (pullRequest) {
      console.log('Pull Request:');
      console.log('Title:', pullRequest.title);
      console.log('Body:', pullRequest.body);
    }
  } catch (error) {
    console.error('Error fetching repository information:', error.message);
  }
}

async function getuserID() {
  const query = `
    query {
      viewer(
        owner: "${owner}",
        id
        }`;
}

async function getRepoId(owner, repo) {
  const query = `
    query {
      repository(
        owner: "${owner}",
        name: "${repo}",){id}
        }`;
  try {
    const data = await octokit.graphql(query);
    console.log('get Repo ID:');
    console.log('Repository ID:', data.repository.id);
    return data.repository.id;
  } catch (error) {
    console.error('Error creating repository:', error.message);
  }
}

async function createRepository(name, description) {
  const mutation = `
    mutation {
      createRepository(input: {
        name: "${name}",
        description: "${description}",
        visibility: PRIVATE,
        hasIssuesEnabled: true,
      }) {
        repository {
          name
          id
          description
          owner{
            login
          }
        }
      }
    }
  `;

  try {
    const data = await octokit.graphql(mutation);
    console.log('createRepository:');
    console.log('Repository Name:', data.createRepository.repository.name);
    console.log('Repository id:', data.createRepository.repository.id);
  } catch (error) {
    console.error('Error creating repository:', error.message);
  }
}

async function createIssue(owner, repo, title, body) {
  const mutation = `
        mutation {
            createIssue(input: {
                repositoryId: "${await getRepoId(owner, repo)}",
                title: "${title}",
                body: "${body}"
            }) {
                issue {
                    title
                    body
                }
            }
        }
    `;

  try {
    const data = await octokit.graphql(mutation);
    console.log('createIssue:');
    console.log('Issue Title:', data.createIssue.issue.title);
    console.log('Issue Body:', data.createIssue.issue.body);
  } catch (error) {
    console.error('Error creating issue:', error.message);
  }
}

async function createPullRequest(
  owner,
  repo,
  title,
  headBranch,
  baseBranch,
  body
) {
  const mutation = `
      mutation CreatePullRequest(
        $title: String!,
        $headBranch: String!,
        $baseBranch: String!,
        $body: String!
      ) {
        createPullRequest(input: {
          repositoryId: "${await getRepoId(owner, repo)}",
          baseRefName: $baseBranch,
          headRefName: $headBranch,
          title: $title,
          body: $body
        }) {
          pullRequest {
            title
            body
            url
          }
        }
      }
    `;

  try {
    const data = await octokit.graphql(mutation, {
      owner: owner,
      repo: repo,
      title: title,
      headBranch: headBranch,
      baseBranch: baseBranch,
      body: body,
    });

    console.log('createPullRequest:');
    console.log(
      'Pull Request Title:',
      data.createPullRequest.pullRequest.title
    );
    console.log('Pull Request Body:', data.createPullRequest.pullRequest.body);
    console.log('Pull Request URL:', data.createPullRequest.pullRequest.url);
  } catch (error) {
    console.error('Error creating pull request:', error.message);
  }
}

async function makeProject(owner, repo, projectName) {
  const mutation = `
      mutation CreateProject(
        $owner: ID!,
        $projectName: String!
      ) {
        createProject(input: {
          ownerId: $owner,
          name: $projectName,
          body: "Project description",
        }) {
          project {
            id
            name
            body
          }
        }
      }
    `;

  try {
    const data = await octokit.graphql(mutation, {
      owner: owner,
      projectName: projectName,
    });

    console.log('createProject:');
    console.log('Project ID:', data.createProject.project.id);
    console.log('Project Name:', data.createProject.project.name);
    console.log('Project Body:', data.createProject.project.body);
  } catch (error) {
    console.error('Error creating project:', error.message);
  }
}

async function getAllPullRequests(owner, repo) {
  try {
    const response = await octokit.graphql({
      query: `
          query($owner: String!, $repo: String!) {
            repository(owner: $owner, name: $repo) {
              pullRequests(states: [OPEN, CLOSED, MERGED], first: 100) {
                nodes {
                  number
                  title
                  state
                  createdAt
                  updatedAt
                  closedAt
                  mergedAt
                  author {
                    login
                  }
                }
              }
            }
          }
        `,
      owner,
      repo,
    });

    return response.repository.pullRequests.nodes;
  } catch (error) {
    console.error('Error retrieving pull requests:', error.message);
    throw error;
  }
}

async function addIssueComment(repoID, issueID, title, body) {
  try {
    const response = await octokit.graphql({
      query: `
    mutation {
      updateIssue(input: {
        repositoryId:"${repoID}",
        issueID: "${issueID}",
        title: "${title}",
        body: "${body}"
      }) {
        issue {
          number
          title
          body
        }
      }
    }
  `,
    });
    // return response.repository.pullRequests.nodes;
  } catch (error) {
    console.error('Error commenting on issue', error.message);
    throw error;
  }
}

/* ------------------------ */
/* Issue Handler Code Below */
/* ------------------------ */

async function getIssueID(owner, repo, issueNum) {
  try {
    console.log(`getIssueId: ${owner}, ${repo}, ${issueNum} `);
    const response = await octokit.graphql({
      query: `
        query {
          repository(owner: "${owner}", name: "${repo}") {
            issue(number: ${issueNum}) {
              id
            }
          }
        }
      `,
    });
    console.log(`ID: ${response.repository.issue.id}`);
    return response.repository.issue.id;
  } catch (error) {
    console.error('Error getting issue ID', error.message);
    throw error;
  }
}

async function reactToIssue(issueID, reaction) {
  try {
    const response = await octokit.graphql({
      query: `
    mutation {
      addReaction(input: {subjectId: "${issueID}", content: ${reaction} }) {
        reaction {
          content
        }
        subject {
          id
        }
      }
    }
  `,
    });
    // return response.repository.pullRequests.nodes;
  } catch (error) {
    console.error('Error reacting on issue', error.message);
    throw error;
  }
}

async function editIssue(repoID, issueID, title, body) {
  try {
    const response = await octokit.graphql({
      query: `
      mutation {
        updateIssue(input: {
          repositoryId:"${repoID}",
          issueID: "${issueID}",
          title: "${title}",
          body: "${body}"
        }) {
          issue {
            number
            title
            body
          }
        }
      }
  `,
    });
  } catch (error) {
    console.error('Error reacting on issue', error.message);
    throw error;
  }
}

async function changeIssueTitle(repoID, issueID, title) {
  try {
    const response = await octokit.graphql({
      query: `
      mutation {
        updateIssue(input: {
          repositoryId:"${repoID}",
          issueID: "${issueID}",
          title: "${title}"
        }) {
          issue {
            number
            title
          }
        }
      }
  `,
    });
  } catch (error) {
    console.error('Error changing issue title', error.message);
    throw error;
  }
}

async function getUserId(assignee) {
  try {
    const response = await octokit.graphql({
      query: ` query {
        user(login: "username") {
          id
        }
      }
      `,
    });
    return response;
  } catch (error) {
    console.error('error getting user ID', error.message);
    throw error;
  }
}

async function assignToIssue(repoID, issueID, assignee) {
  try {
    const response = await octokit.graphql({
      query: `
        mutation {
          updateIssue(input: {
            id: "${issueID}",
            assigneeIds: ["${assignee}"],
          }) {
            issue {
              number
              title
              assignees(first: 10) {
                nodes {
                  login
                }
              }
            }
          }
        }
      `,
    });

    return response;
  } catch (error) {
    console.error('Error adding assignee to issue', error.message);
    throw error;
  }
}

/* ------------------------ */
/* Issue Handler Code Below */
/* ------------------------ */

export { getAllPullRequests };

/* Issue Handler */
export { reactToIssue };
export { getIssueID };
export { editIssue };
export { changeIssueTitle };
export { assignToIssue };
export { getUserId };
/* ------------- */

// Example usage
// const repo_owner = 'meher-liatrio';
// const repo_name = 'APIs';
// const repo_description = 'this repo is being created with the GraphQL API';
// const issue_title = 'this is a new issue';
// const issue_body = 'this issue is being created with the GraphQL API';
// const pull_title = 'Bleeding edge feature with graphql!';
// const head_branch = 'test-branch';
// const base_branch = 'main';
// const pull_body = 'Please pull this awesome new feature';
// const project_name="GraphQL project"

// createRepository(repo_owner, repo_name, repo_description);
// Add other GraphQL calls for creating issues, pull requests, etc.

// createRepository(repo_name,repo_description);
// const repoid = await getRepoId(repo_owner, repo_name);
// createIssue(repo_owner, repo_name, issue_title, issue_body);
// createPullRequest(repo_owner,repo_name,pull_title,head_branch,base_branch,pull_body);
// makeProject(repo_owner,repo_name,project_name);
// getRepositoryInfo(repo_owner, repo_name);
