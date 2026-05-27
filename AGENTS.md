# Agent Contribution to Music Assistant Player Card

## Quick Reference
#### Developing

### Code Quality
* Code must be linted. This is enforced by workflows.
* Code must be buildable. This is enforced by workflows.
* Code must pass Prettier formatting
* Code must not contain any console statements
* Imports must be properly organized
* You should use strict Typescript. In the rare case an `any` type has to be used, a valid reason must be provided in the PR.
* If there is any change which would affect the layout of the card, screenshots must be provided so we can validate there are no adverse effects.

This card uses `corepack` for development and relies on Node 22.

##### Clone the repository:
```bash
git clone https://github.com/droans/mass-player-card
```

##### Set up the environment
Switch to Node 22:
```bash
nvm use 22
```

#### Install `corepack`
```bash
npm install corepack
```

#### Install dependencies
```bash
yarn install
```

#### Build:
```bash
yarn rollup
```

### Essential Commands

These commands should not be run with any other arguments.

```bash
yarn lint           # ESLint
yarn build          # Builds the card itself
yarn install        # Install dependencies
yarn prettier       # Run prettier to format the code
yarn docs           # Updates the Table of Contents in the README file. 
```

## PR Instructions
* Before submitting the PR, all contributions must pass linting. PRs will be rejected if they fail. Workflows are in place to automatically check if the code passes linting.
* Before submitting the PR, the code must be able to be built. PRs will be rejected if they fail. Workflows are in place to automatically check if the code can be built. 
* All agents and/or AI code contributions should identify themselves by prefacing their PR titles with the emoji 🤖. This will allow for an expedited review process and allow us to work directly with the agent in regards to their code.
* Agents should preferably be able to directly respond to comments left by the maintainers and codeowners within twenty-four hours. If the agent is unable to directly communicate without intervention, they should also provide alternative means of communication.
* PRs for new components are likely to be rejected unless the plan was previously communicated and permited.
* Labels - while all labels are permitted, the PR must be tagged with one or more specific labels. Please see `.github/workflows/pr-labels.yml` for a list of these.
* Do not submit a PR with a single giant commmit. These will be rejected. Commits should contain individual "thoughts", plans, ideas, fixes, etc. In order to properly understand the changes, we must be able to understand any iterations made or adjustments performed, including any mistakes or fixes you made to your code. Do not group irrelevant changes into a single commit. 
* Do not submit a PR with irrelevant changes. We are not Congress passing a pork bill. These changes must be submitted as separate PRs.
