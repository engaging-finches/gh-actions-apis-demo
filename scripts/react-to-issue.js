import { reactToIssue } from './GraphQLmod.mjs';
import { getIssueID } from './GraphQLmod.mjs';

import process from 'process';

const owner = process.argv[2];
const fullRepo = process.argv[3];
const repoParts = fullRepo.split('/');
const repo = repoParts[1];

const issueNum = parseInt(process.argv[4]); // Assuming issueNum is expected to be a number
const reaction = process.argv[5];

async function main() {
  try {
    const issueID = await getIssueID(owner, repo, issueNum);
    await reactToIssue(issueID, reaction);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
