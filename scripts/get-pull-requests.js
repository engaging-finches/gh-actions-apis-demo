import { getAllPullRequests } from './GraphQLmod.mjs';

import { promises as fsPromises } from 'fs';

const owner = 'engaging-finches';
const repository = 'gh-actions-apis-demo';

let csvData;

getAllPullRequests(owner, repository)
  .then((pullRequests) => {
    // console.log('Pull Requests:', pullRequests);
    const flattened = flatten(pullRequests);
    csvData = toCsv(flattened);
    console.log(csvData);

    // write csv data to file
    return fsPromises.writeFile('pull_requests.csv', csvData, 'utf8');
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });

const flatten = function flattenPullRequestsForEasyCsvFormatting(pullRequests) {
  const flattenedPullRequests = pullRequests.map((pr) => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    closedAt: pr.closedAt,
    mergedAt: pr.mergedAt,
    authorLogin: pr.author.login,
  }));
  return flattenedPullRequests;
};

// Convert flattened data to CSV format
const toCsv = function convertFlattenedToCsv(flattened) {
  const csvData = [
    'Number,Title,State,Created At,Updated At,Closed At,Merged At,Author Login',
    ...flattened.map(
      (pr) =>
        `${pr.number},"${pr.title}",${pr.state},"${pr.createdAt}","${pr.updatedAt}",${pr.closedAt},${pr.mergedAt},"${pr.authorLogin}"`
    ),
  ].join('\n');
  return csvData;
};
