import { reactToIssue } from './GraphQLmod.mjs';
import process from 'process';

const issueID = process.argv[2];

reactToIssue(issueID);
