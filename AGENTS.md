# Project Agent Instructions

## Mission
Build the project in PROJECT_SPEC.md, following the ordered
milestones in MILESTONES.md.

## Workflow
- Read PROJECT_SPEC.md, MILESTONES.md, and this file first.
- Work on the earliest incomplete milestone, one at a time.
- Do not expand a milestone's scope. Ask the human only if a
  requirement is materially ambiguous; otherwise make a sensible
  choice, note it in the completion report, and keep going.
- After finishing a milestone, run the project's real test, lint,
  and build commands. Fix failures before moving on.
- Never invent test results and never weaken tests to make them pass.
- Update MILESTONES.md with truthful status only.
- When checks pass, publish with:
    scripts/commit-milestone.sh <ID> "<short description>"
  then continue directly to the next milestone. Do not wait for
  human approval between milestones.
- If checks fail and you cannot fix them, do not publish. Stop and
  report the problem.

## Git rules
- Work directly on main. No feature branches, no pull requests.
- scripts/commit-milestone.sh is the only way to commit and push.
  It sets the git author and SSH key, rotating between teammates.
- Never run git commit, git push, or git config yourself.
- Never force-push, rewrite history, or amend commits.
- Never read or print ~/.ssh or any key.

## Quality
- Follow existing conventions and prefer simple, maintainable code.
- Add or update tests for meaningful behaviour.
- Never commit secrets, API keys, or personal data. Keep them in
  .env, which must stay in .gitignore.
- Do not commit generated artifacts unless the project requires them.
- Ask before installing major new dependencies or running destructive
  commands against shared data.

## After each milestone, report briefly
1. Milestone ID and what was built.
2. Checks run and their actual results.
3. Known limitations.
4. Commit hash and push result, only after they succeeded.