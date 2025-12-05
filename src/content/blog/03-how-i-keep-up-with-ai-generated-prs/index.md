---
title: "How I keep up with AI-generated PRs"
description: "Use AI to review AI-generated code"
date: "Dec 5 2025"
draft: false
---

AI coding assistants have shifted the bottleneck in software development. Writing code is now trivially fast. Reviewing it is not.

Purely automated PR review tools like Greptile or Cursor's BugBot help, but they're not sufficient. They catch bugs, but you can't fully trust them. More importantly, they miss the point of code review entirely. PRs aren't just about correctness—they're about socializing changes with your team. A good review ensures everyone understands what's changing and why.

As CTO of a small but growing team, I want to stay close to the code as long as possible. That means I need a workflow that lets me review PRs quickly without sacrificing depth. Here's what I've landed on.

## Setup

You'll need:

- Cursor (or any IDE that supports MCP and can shell out to a CLI)
- The [gh CLI](https://cli.github.com/), logged in (`gh auth login`)
- Optionally, the [GitHub Pull Requests](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github) extension. I can't stand GitHub's web UI—I want to see diffs in my editor while planning my review.

## The Prompt

The key insight is to have the AI generate a _plan_ for your review, not the review itself. Put Cursor in plan mode, then run this prompt ([gist](https://gist.github.com/rgarcia/742d8a91b051a57c51dcab8aba6d352e), [add to cursor](/add-to-cursor/pr-review)):

> You are helping me review a pull request. Follow this workflow:
>
> ### Step 1: Find Relevant PRs
>
> Find open PRs where I am assigned, requested as a reviewer, or have already submitted a review:
>
> ```bash
> gh pr list \
>   --search "is:open (review-requested:@me OR reviewed-by:@me OR assignee:@me)" \
>   --limit 10 \
>   --json number,title,author,reviewRequests,assignees,createdAt \
>   --jq '.[] | {number, title, author: .author.login, reviewers: [.reviewRequests[]?.login], assignees: [.assignees[]?.login], created: .createdAt}'
> ```
>
> If there are multiple PRs, ask which one I want to review. Present the results to me as a numbered list for me to choose from. If there's only one, confirm before proceeding.
>
> ### Step 2: Check Out and Examine the PR
>
> Once I confirm the PR:
>
> 1. Check out the PR locally: `gh pr checkout <PR_NUMBER>`
> 2. Get PR details: `gh pr view <PR_NUMBER>`
> 3. Get the full diff against the base branch: `gh pr diff <PR_NUMBER>`
> 4. Check for existing review comments: `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments`
>
> ### Step 3: Analyze the Changes
>
> Examine the diff and provide:
>
> **High-Level Summary**
>
> - What is the overall purpose of this PR?
> - New APIs introduced (endpoints, functions, methods)
> - New or modified data structures (types, interfaces, schemas)
> - New dependencies or libraries added
> - Architectural or design pattern changes
> - Configuration changes
> - Database migrations or schema changes
> - Any breaking changes
>
> **Dependency Check**
>
> - For any new dependencies: check if they are actively maintained
> - Flag archived, deprecated, or unmaintained libraries
> - Look for existing libraries in the codebase that could be used instead (check imports across the codebase)
>
> **Impact Assessment**
>
> - How does this affect existing code?
> - What areas of the codebase will need to be aware of these changes?
> - Are there documentation implications?
>
> ### Step 4: Review Focus Areas
>
> Identify specific areas I should focus my review on:
>
> - Complex logic that needs careful examination
> - Potential edge cases or error handling gaps
> - Performance considerations
> - Security implications
> - Test coverage gaps
> - Code style or consistency issues
>
> ### Step 5: Suggested Comments
>
> Prepare a list of suggested review comments. For each comment:
>
> - Keep it short and to the point
> - Use a friendly, suggestion-based tone (e.g., "Consider...", "Might be worth...", "Nit: ...")
> - Only be strongly opinionated if there's an obvious bug or issue
> - Include the file path and line number
> - **Verify line numbers** by reading the actual file content before suggesting
>
> Format each suggestion as:
>
> ```
> File: <path>
> Line: <number>
> Comment: <your suggestion>
> ```
>
> ### Step 6: Prepare gh CLI Commands
>
> Generate ready-to-run commands. **Important**: Add all line comments first, then submit the review so comments appear as part of the review.
>
> 1. Get the commit SHA for comments:
>
>    ```bash
>    COMMIT_SHA=$(gh pr view <PR_NUMBER> --json headRefOid -q .headRefOid)
>    ```
>
> 2. Add line-specific comments using `gh api`:
>
>    ```bash
>    gh api repos/{owner}/{repo}/pulls/{pr_number}/comments \
>      -f body="<comment>" \
>      -f path="<file_path>" \
>      -f commit_id="$COMMIT_SHA" \
>      -F line=<line_number> \
>      -f side="RIGHT"
>    ```
>
>    For multi-line comments, add `-F start_line=<start>` before `-F line=<end>`.
>
> 3. Reply to existing comments (if needed):
>
>    ```bash
>    gh api repos/{owner}/{repo}/pulls/{pr_number}/comments/{comment_id}/replies \
>      -f body="<reply>"
>    ```
>
> 4. **After all comments are added**, submit the review with a short summary:
>
>    ```bash
>    gh pr review <PR_NUMBER> --comment --body "Short summary here."
>    # Or use --approve or --request-changes as appropriate
>    ```
>
>    **Keep the final review body short** (1-2 sentences). The detailed feedback is in the line comments.
>
> ### Output Format
>
> Present your findings in sections, then wait for my feedback. I will:
>
> - Ask you to modify suggestions
> - Tell you which comments to keep/remove
> - Request changes to the review approach
>
> Do NOT submit any reviews or comments until I explicitly approve the plan.

## Iterate on the Plan

Split your panes: plan on the left, PR diff (via the extension) on the right. Now you can explore the code while refining your review plan.

Push back on the AI. Tweak the language. Remove comments that aren't necessary. Add ones it missed. Have it research questions you might have. The plan is a draft, not a finished product.

When you're satisfied, hit Cursor's "Build" button to execute the plan.

## Iterate on the Prompt

After each review, I run a meta-prompt to improve my workflow:

> In light of some of the back and forth in this chat can you edit my PR review prompt in @.cursor/commands/pr-review.md to reflect anything that might help future pr review plans get to a good place sooner?

This closes the loop. Each review makes the next one better.

## Conclusion

This workflow is still evolving, but it's already cut my review time significantly. The AI handles the tedious parts—summarizing changes, identifying potential issues—while I stay in control of the final output. Human in the loop, AI doing the heavy lifting.
