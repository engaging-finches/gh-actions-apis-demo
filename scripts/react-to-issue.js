import { reactToIssue } from './GraphQLmod.mjs';
import { getIssueID } from './GraphQLmod.mjs';

import process from 'process';

const owner_repo = process.argv[2];
const split = owner_repo.split('/');
const owner = split[0];
const repo = split[1];

const issueNum = process.argv[3];
const reaction = process.argv[4];

console.log(`${owner}, ${repo}, ${issueNum}, ${reaction}`);
async function main() {
  try {
    const issueID = await getIssueID(owner, repo, issueNum);
    await reactToIssue(issueID, reaction);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
