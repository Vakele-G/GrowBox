# Project Agent Instructions

## Mission
Build the project described in PROJECT_SPEC.md, following
the ordered milestones in MILESTONES.md.

## Before coding
- Read PROJECT_SPEC.md, MILESTONES.md, and this file.
- Inspect the existing architecture, package scripts, tests,
  and repository status.
- Identify the earliest incomplete milestone.
- Summarize the scope, implementation plan, risks, and acceptance
  criteria before changing files.
- Ask for clarification if a requirement is materially ambiguous.

## Milestone boundaries
- Implement one milestone at a time.
- Do not start the next milestone until the current milestone
  has passed checks, been reviewed, and been published.
- Do not silently expand the milestone scope.
- Update MILESTONES.md only with truthful, verifiable status.
- Do not mark a milestone complete merely because code exists.

## Branching
- Never develop directly on main.
- Use scripts/start-milestone.sh M01 to create a milestone branch.
- Use milestone/M01 as the branch naming convention.
- Never force-push, rewrite published history, or delete branches
  without explicit human approval.
- If main has changed, stop and ask before rebasing or merging
  other work into the active feature branch.

## Implementation quality
- Follow existing conventions and architecture.
- Prefer simple, maintainable implementations.
- Add or update tests for meaningful behavior.
- Never invent successful test results.
- Do not weaken tests merely to make them pass.
- Do not commit generated artifacts unless required by the project.
- Never expose secrets, credentials, personal data, or API keys.

## Verification
- Discover the actual test, lint, type-check, and build commands
  from the project configuration.
- Run the applicable checks after implementation.
- Inspect git diff and git diff --check.
- Report checks that were skipped and why.
- Fix failures before asking for approval.
- Do not claim success when a check fails.

## Review and publishing
- Stop after implementation and verification.
- Present a summary of changes, test results, risks, and
  the complete diff for human review.
- Do not commit, push, create a pull request, or merge until
  a human explicitly approves the milestone.
- After approval, ask the human to run
  scripts/publish-milestone.sh with the intended paths.
- The publishing script is the only approved milestone
  publishing workflow.
- Never bypass its confirmation prompts.

## Git identity and transparency
- Preserve the configured real commit author.
- Never impersonate another person or change author metadata
  just to manipulate contribution statistics.
- Use Co-authored-by trailers only for genuine co-authors
  who agree to the attribution.
- The account used to authenticate a push is not necessarily
  the commit author.
- Never amend or rewrite a published commit to change attribution.

## Security and destructive actions
- Never print or commit secrets.
- Do not run destructive database migrations against shared
  or production environments without explicit approval.
- Ask before installing new dependencies, changing deployment
  infrastructure, or performing irreversible operations.
- Do not force-push or push directly to main.
- Stop if credentials, permissions, or repository ownership
  are unclear.

## Completion report
After each milestone, report:
1. Milestone ID and branch.
2. Implemented functionality.
3. Files changed.
4. Tests and checks with actual results.
5. Known limitations and outstanding risks.
6. Whether human review and publishing are still pending.
7. Commit hash and push result, only after they actually succeed.

