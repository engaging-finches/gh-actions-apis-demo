import { assignToIssue } from './GraphQLmod.mjs';
import { changeIssueTitle } from './GraphQLmod.mjs';
import { getIssueID } from './GraphQLmod.mjs';
import { getUserId } from './GraphQLmod.mjs';

import process from 'process';

const owner_repo = process.argv[2];
const split = owner_repo.split('/');
const owner = split[0];
const repo = split[1];

const issue_num = process.argv[3];
const repo_id = process.argv[4];
const issue_title = process.argv[5];

/* regular expression to find assignees */
const assign_regex = /\+a\{(.*?)\}/g;
/* find matches */
const matches = issue_title.match(assign_regex);
/* extract matches into array */
const extracted = matches
  ? matches.map((match) => match.replace(/\+a\{(.*?)\}/, '$1'))
  : [];

const title_without_assignees = issue_title.replace(assign_regex, '').trim();

console.log(extracted);
console.log(title_without_assignees);

console.log(`main: ${owner}, ${repo}, ${issue_num}`);
async function main() {
  try {
    const issue_id = await getIssueID(owner, repo, issue_num);

    for (let i = 0; i < extracted.length; i++) {
      console.log(`id: ${extracted[i]}`);
      const user_id = await getUserId(extracted[i]);
      assignToIssue(repo_id, issue_id, user_id);
    }
    if (extracted.length > 0) {
      changeIssueTitle(repo_id, issue_id, title_without_assignees);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
