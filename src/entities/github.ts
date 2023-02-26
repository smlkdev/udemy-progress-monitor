import { operations } from "@octokit/openapi-types";

export interface GitHubCredentials {
  token: string;
  owner: string;
  repo: string;
}

// weird access to openapi-types
export type Tree = operations["git/create-tree"]["requestBody"]["content"]["application/json"]["tree"];
// "lookup type" inherited from above
export type TreeObject = Tree[0];
