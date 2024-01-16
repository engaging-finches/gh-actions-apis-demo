import { getAllPullRequests } from './GraphQLmod.mjs';

const owner = 'engaging-finches';
const repository = 'gh-actions-apis-demo';

getAllPullRequests(owner, repository)
  .then((pullRequests) => {
    console.log('Pull Requests:', pullRequests);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });
