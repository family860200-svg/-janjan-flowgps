# Notion Templates for Knowledge Management

Ready-to-use templates implementing SECI, PARA, and CODE patterns.

## Quick Capture Templates

### Inbox Item

For rapid capture during work.

```markdown
---
Database: Inbox
---

# {Quick title}

**Source:** {Where did this come from?}

**Raw capture:**
{Paste or type the raw information}

**Why it matters:**
{One sentence on relevance}

**Process to:** Projects | Areas | Resources | Archive
```

### Meeting Notes

Capture insights from conversations (Socialization → Externalization).

```markdown
---
Database: Notes
Type: Meeting
---

# {Meeting Title} - {Date}

## Attendees
-

## Context
{What was this meeting about?}

## Key Discussion Points
-

## Decisions Made
-

## Action Items
- [ ] {Action} - @{Person} - {Due date}

## Insights to Capture
> {Important insights that should become Resources}

## Follow-up Needed
-
```

### Concept Capture

Template for externalizing a new concept.

```markdown
---
Database: Resources
Type: Concept
Status: Draft
---

# {Concept Name}

## One-Sentence Definition
{Complete this: "{Concept Name} is..."}

## Why It Matters
{Why should someone care about this concept?}

## How It Works
{Explain the mechanism or framework}

### Key Components
1. **{Component 1}:** {Explanation}
2. **{Component 2}:** {Explanation}
3. **{Component 3}:** {Explanation}

## Examples
- **Example 1:** {Concrete illustration}
- **Example 2:** {Different context}

## Common Misconceptions
- **Misconception:** {What people get wrong}
- **Reality:** {Correct understanding}

## Related Concepts
- {Link to related concept 1}
- {Link to related concept 2}

## Sources
- {Original source or inspiration}
```

## SECI Phase Templates

### Socialization: Exploration Page

For collaborative sense-making.

```markdown
---
Temporary: true (delete after insights captured)
---

# Exploration: {Topic}

> 💭 **Purpose:** This is a temporary space for collaborative exploration. Share observations loosely. When insights emerge, capture them properly elsewhere.

## What We're Exploring
{Framing question or topic}

## Observations
<!-- Everyone add observations freely -->

### From {Name}
-

### From {Name}
-

## Emerging Patterns
<!-- What themes are we seeing? -->
-

## Questions That Arose
-

## Insights to Formalize
> Move these to proper Resources when ready
-

---
*⚠️ Archive or delete this page once exploration is complete*
```

### Externalization: Documentation Template

For converting tacit knowledge to explicit documentation.

```markdown
---
Database: Resources
Type: Process
Status: Draft
SECI-Phase: Externalization
---

# How to {Process Name}

## Overview
{One paragraph explaining what this process accomplishes}

## When to Use This
- {Trigger condition 1}
- {Trigger condition 2}

## Prerequisites
- [ ] {What needs to be in place first}
- [ ] {Required access or tools}

## Step-by-Step Process

### Step 1: {Action Verb} {Object}
{Detailed explanation}

> 💡 **Tip:** {Insider knowledge that makes this easier}

### Step 2: {Action Verb} {Object}
{Detailed explanation}

> ⚠️ **Watch out:** {Common mistake to avoid}

### Step 3: {Action Verb} {Object}
{Detailed explanation}

## Verification
How do you know it worked?
- [ ] {Check 1}
- [ ] {Check 2}

## Troubleshooting

### Problem: {Common issue}
**Solution:** {How to fix it}

### Problem: {Another issue}
**Solution:** {How to fix it}

## Related Processes
- {Link to upstream process}
- {Link to downstream process}

## History
| Date | Author | Change |
|------|--------|--------|
| {Date} | {Name} | Initial creation |
```

### Combination: Synthesis Document

For integrating multiple knowledge sources.

```markdown
---
Database: Resources
Type: Synthesis
Status: Draft
SECI-Phase: Combination
---

# {Synthesis Topic}: Integrated View

## Purpose
{Why this synthesis was needed}

## Sources Synthesized
- {Source 1} - {Key contribution}
- {Source 2} - {Key contribution}
- {Source 3} - {Key contribution}

## Key Themes

### Theme 1: {Name}
{Integrated understanding from multiple sources}

**Evidence:**
- From Source 1: {Quote or finding}
- From Source 2: {Quote or finding}

### Theme 2: {Name}
{Integrated understanding from multiple sources}

**Evidence:**
- From Source 1: {Quote or finding}
- From Source 3: {Quote or finding}

## Contradictions & Tensions
<!-- Where do sources disagree? -->

### {Topic of disagreement}
- **View A:** {From Source X}
- **View B:** {From Source Y}
- **Resolution/Note:** {How to think about this}

## Gaps Identified
<!-- What's missing from the combined knowledge? -->
- {Gap 1}
- {Gap 2}

## Implications
{What does this synthesis mean for our work?}

## Action Items
- [ ] {What to do with this knowledge}

## Visualization
[Embed diagram, chart, or concept map if helpful]
```

### Internalization: Practice Exercise

For converting explicit knowledge to tacit capability.

```markdown
---
Database: Resources
Type: Exercise
Related: {Concept being practiced}
SECI-Phase: Internalization
---

# Practice: {Skill Name}

## Learning Objective
After completing this exercise, you will be able to:
- {Capability 1}
- {Capability 2}

## Prerequisites
Before starting, ensure you understand:
- [ ] {Concept 1} - [Link]
- [ ] {Concept 2} - [Link]

## Scenario
{Set up the practice context}

## Exercise

### Part 1: {Sub-skill}

> 💡 **Question:** {Prompt that requires applying the concept}

<details>
<summary>Hint (try first without)</summary>
{Helpful hint}
</details>

<details>
<summary>Solution</summary>
{Complete answer with explanation}
</details>

### Part 2: {Sub-skill}

> 💡 **Question:** {More challenging prompt}

<details>
<summary>Hint</summary>
{Helpful hint}
</details>

<details>
<summary>Solution</summary>
{Complete answer with explanation}
</details>

### Part 3: Apply to Your Context

> 🎯 **Your turn:** Apply this concept to your actual work.

{Specific prompt for real-world application}

**Document your application:**
- What I did:
- What I learned:
- What I'd do differently:

## Reflection Questions
1. {Question prompting deeper understanding}
2. {Question connecting to other concepts}
3. {Question about edge cases}

## Next Steps
- [ ] {Follow-up practice}
- [ ] {Advanced topic to explore}
```

## PARA Templates

### Project Brief

For launching new projects.

```markdown
---
Database: Projects
Status: Not Started
Area: {Related Area}
---

# {Project Name}

## Outcome Definition
**Done looks like:** {Specific, measurable outcome}

## Context
**Why now:** {Why this project, why now}
**Background:** {Relevant context}

## Scope

### In Scope
- {Deliverable 1}
- {Deliverable 2}

### Out of Scope
- {Explicitly excluded item}

## Key Milestones
| Milestone | Target Date | Status |
|-----------|-------------|--------|
| {Milestone 1} | {Date} | ⬜ |
| {Milestone 2} | {Date} | ⬜ |
| {Milestone 3} | {Date} | ⬜ |

## Resources Needed
- {Resource 1}
- {Resource 2}

## Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {Risk 1} | H/M/L | H/M/L | {Strategy} |

## Success Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}

---

## Project Log
<!-- Add dated entries as project progresses -->

### {Date}
{Update}
```

### Area Overview

For documenting responsibility areas.

```markdown
---
Database: Areas
Owner: {Person}
---

# {Area Name}

## Description
{What this area encompasses}

## Standards to Maintain
- {Standard 1}
- {Standard 2}
- {Standard 3}

## Current State
**Health:** 🟢 Healthy | 🟡 Needs Attention | 🔴 Critical
**Last reviewed:** {Date}

## Active Projects
[Linked database view: Projects filtered to this Area]

## Key Resources
[Linked database view: Resources related to this Area]

## Recurring Activities
| Activity | Frequency | Last Done | Next Due |
|----------|-----------|-----------|----------|
| {Activity 1} | Weekly | {Date} | {Date} |
| {Activity 2} | Monthly | {Date} | {Date} |

## Goals & Metrics
| Metric | Current | Target | Trend |
|--------|---------|--------|-------|
| {Metric 1} | {Value} | {Value} | ↑/↓/→ |

## Improvement Ideas
- {Idea 1}
- {Idea 2}
```

## CODE Workflow Templates

### Weekly Review Checklist

For regular knowledge maintenance.

```markdown
# Weekly Review: {Date Range}

## 1. Capture Processing (Inbox Zero)
- [ ] Process all Inbox items
- [ ] Assign to: Project, Area, Resource, or Archive

**Inbox items processed:** {Count}

## 2. Project Review
For each active project:
- [ ] Is status accurate?
- [ ] Is next action defined?
- [ ] Any blockers to address?

**Projects reviewed:** {Count}
**Projects completed:** {Count}
**New projects added:** {Count}

## 3. Area Health Check
- [ ] Review area health indicators
- [ ] Flag areas needing attention

**Areas healthy:** {Count}
**Areas needing attention:** {Count}

## 4. Resource Maintenance
- [ ] Review recently added resources
- [ ] Update stale resources (>90 days)
- [ ] Add missing relations

**Resources updated:** {Count}

## 5. Archive Candidates
- [ ] Archive completed projects
- [ ] Archive outdated resources

**Items archived:** {Count}

## 6. Next Week Priorities
1. {Priority 1}
2. {Priority 2}
3. {Priority 3}

## Reflections
**What worked well:**
-

**What to improve:**
-

**Insights to capture:**
-
```

### Distillation Template

For progressive summarization.

```markdown
---
Database: Resources
Type: Distilled
Original: {Link to source}
---

# {Title}: Distilled

## Executive Summary (Layer 4)
> {One paragraph capturing the essential insight}

## Key Points (Layer 3)
> These are the highlighted portions of the highlights

1. **{Point 1}:** {Explanation}
2. **{Point 2}:** {Explanation}
3. **{Point 3}:** {Explanation}

## Important Passages (Layer 2)
> **Bold passages** from the original

{Quote 1 with **bold** on key phrases}

{Quote 2 with **bold** on key phrases}

{Quote 3 with **bold** on key phrases}

<details>
<summary>Full Content (Layer 1)</summary>

{Original content or link to it}

</details>

## My Notes
{Personal interpretation and application ideas}

## Action Items
- [ ] {How to apply this knowledge}
```

## Database Templates

### Database Button Templates

Create these as button blocks in Notion.

**New Inbox Item:**
```
Button: ➕ Quick Capture
Action: Create page in Inbox
Template: Inbox Item
```

**New Project:**
```
Button: 🚀 New Project
Action: Create page in Projects
Template: Project Brief
Open: Full page
```

**New Resource:**
```
Button: 📚 New Resource
Action: Create page in Resources
Template: Concept Capture
```

**Start Review:**
```
Button: 📋 Weekly Review
Action: Create page in Notes
Template: Weekly Review Checklist
Date: Today
```

## Integration Templates

### Notion ↔ knowledge-manager Integration

Use when working with both plugins.

```markdown
# Knowledge Session: {Topic}

## SECI Phase Identification
**Current phase:** {S/E/C/I}
**Indicators:** {What suggests this phase}

## Ba Context
**Active Ba:** {Originating/Dialoguing/Systemizing/Exercising}
**Environment setup:** {How the context was created}

## Session Objectives
- [ ] {Objective 1}
- [ ] {Objective 2}

## Knowledge Work Log

### {Time}: {Activity}
**Phase:** {S/E/C/I}
**Ba:** {Type}
**Notes:** {What happened}

### {Time}: {Activity}
**Phase:** {S/E/C/I}
**Ba:** {Type}
**Notes:** {What happened}

## Outputs Created
- [{Resource title}](link) - Type: {type}, Phase: {phase}
- [{Resource title}](link) - Type: {type}, Phase: {phase}

## Phase Transition Notes
**From:** {Phase}
**To:** {Phase}
**Transition technique used:** {Technique}
**Effectiveness:** {Assessment}

## Next Session
**Recommended phase:** {S/E/C/I}
**Recommended Ba:** {Type}
**Preparation needed:** {What to do before}
```
