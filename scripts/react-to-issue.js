import { reactToIssue } from './GraphQLmod.mjs';
const { argv, argv0 } = require('node:process');

const issueID = process.argv0;

reactToIssue(issueID);
