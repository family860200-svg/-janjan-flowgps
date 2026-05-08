# PARA Implementation in Notion

Complete guide to implementing Tiago Forte's PARA method using Notion's native features.

## Overview

PARA organizes information by **actionability**:

| Category | Purpose | Timeframe | Example |
|----------|---------|-----------|---------|
| **P**rojects | Active outcomes | Weeks-months | "Launch voucher system" |
| **A**reas | Ongoing responsibilities | Ongoing | "Product Development" |
| **R**esources | Reference material | As needed | "Notion patterns" |
| **A**rchives | Inactive items | Historical | Completed projects |

## Database Architecture

### Option A: Separate Databases

Create four independent databases with relations between them.

**Advantages:**
- Clear separation of concerns
- Simpler views per category
- Easier permissions management

**Structure:**
```
Workspace
├── Projects (database)
│   └── Related: Areas, Resources
├── Areas (database)
│   └── Related: Projects, Resources
├── Resources (database)
│   └── Related: Areas, Projects
└── Archives (database)
    └── Archived from: Projects, Areas, Resources
```

### Option B: Single Master Database

One "Everything" database with a Type property.

**Advantages:**
- Single source of truth
- Cross-category search
- Flexible views

**Structure:**
```
Everything (database)
├── Type: Project | Area | Resource | Archive
├── Status: varies by type
├── Related Items: self-relation
└── Views:
    ├── Projects Board
    ├── Areas List
    ├── Resources Gallery
    └── Archives Table
```

### Recommended: Hybrid Approach

Use separate databases for Projects and Areas (action-oriented), unified database for Resources.

## Projects Database

### Properties

| Property | Type | Purpose |
|----------|------|---------|
| Name | Title | Project name |
| Status | Select | Not Started, Active, Blocked, Complete |
| Deadline | Date | Target completion |
| Area | Relation | Owning responsibility area |
| Priority | Select | P1, P2, P3 |
| Outcome | Text | Definition of done |
| Next Action | Text | Immediate next step |
| Resources | Relation | Reference materials |

### Status Values

```
Not Started → Active → Complete
                ↓
             Blocked
```

**Transitions:**
- Not Started → Active: Work begins
- Active → Blocked: Waiting on dependency
- Blocked → Active: Dependency resolved
- Active → Complete: Outcome achieved

### Views

**1. Active Projects (Board)**
```
Filter: Status != Complete AND Status != Not Started
Group by: Area
Sort: Priority (P1 first)
```

**2. Project Pipeline (Table)**
```
Filter: None
Sort: Status, then Priority
Show: Name, Status, Deadline, Area, Next Action
```

**3. Upcoming Deadlines (Calendar)**
```
Filter: Status = Active
Calendar property: Deadline
```

**4. Blocked Projects (List)**
```
Filter: Status = Blocked
Sort: Last Edited (oldest first)
```

## Areas Database

### Properties

| Property | Type | Purpose |
|----------|------|---------|
| Name | Title | Area name |
| Description | Text | What this area covers |
| Standards | Text | Quality standards to maintain |
| Projects | Relation | Active projects in this area |
| Resources | Relation | Reference materials |
| Owner | Person | Responsible person |
| Health | Select | Healthy, Needs Attention, Critical |

### Defining Good Areas

Areas should be:
- **Ongoing**: No end date
- **Responsibilities**: Things you maintain
- **Broad but bounded**: Clear scope

**Examples:**
- Health (personal)
- Product Development (professional)
- Marketing (professional)
- Finances (personal/professional)
- Relationships (personal)

### Views

**1. Area Overview (Gallery)**
```
Filter: None
Card preview: Description
Show: Name, Health, Project count (rollup)
```

**2. Areas Needing Attention (List)**
```
Filter: Health = "Needs Attention" OR Health = "Critical"
Sort: Health
```

## Resources Database

### Properties

| Property | Type | Purpose |
|----------|------|---------|
| Name | Title | Resource name |
| Type | Select | Concept, Process, Reference, Template |
| Topics | Multi-select | Tags for categorization |
| Source | URL | Original source |
| Summary | Text | Key takeaways |
| Related | Relation | Self-relation for connections |
| SECI Phase | Select | S, E, C, I origin |
| Status | Select | Draft, Review, Published |

### Resource Types

**Concept:** Ideas, frameworks, mental models
- Example: "SECI Model", "Jobs to Be Done"

**Process:** How-to guides, workflows
- Example: "Code Review Process", "Onboarding Flow"

**Reference:** Facts, data, specifications
- Example: "API Documentation", "Style Guide"

**Template:** Reusable structures
- Example: "Meeting Notes Template", "Project Brief Template"

### Views

**1. By Topic (Board)**
```
Group by: Topics (first)
Sort: Name
```

**2. Recently Added (Table)**
```
Sort: Created time (newest first)
Limit: 20 items
```

**3. Needs Review (List)**
```
Filter: Status = "Draft" OR Last Edited > 90 days
Sort: Last Edited (oldest first)
```

**4. Knowledge Graph (Table with Relations)**
```
Show: Name, Type, Topics, Related (expanded)
Filter: None
```

## Archives

### Archiving Strategy

Archive items when:
- Project is complete
- Resource is outdated
- Area is no longer a responsibility

**Archive properties to add:**
- Archived Date (date)
- Archive Reason (select: Completed, Outdated, Transferred, Other)
- Original Location (text: which database/area)

### Archive Views

**1. Recently Archived (Table)**
```
Filter: Archived Date > 30 days ago
Sort: Archived Date (newest first)
```

**2. By Original Category (Board)**
```
Group by: Original Location
Sort: Archived Date
```

### Retrieval Pattern

When you need archived content:
1. Search Archives by keyword
2. Review Archive Reason for context
3. If reactivating: move back to appropriate PARA category
4. Update Status and clear archive fields

## Cross-Database Patterns

### Rollup Calculations

**On Areas:**
```
Active Project Count = Rollup of Projects
  Filter: Status = Active
  Calculate: Count
```

**On Projects:**
```
Resource Count = Rollup of Resources
  Calculate: Count
```

### Linked Views

Embed linked database views in pages:

**In Area page:**
```markdown
## Active Projects
[Linked view of Projects, filtered to this Area]

## Key Resources
[Linked view of Resources, filtered to related items]
```

**In Project page:**
```markdown
## Reference Materials
[Linked view of Resources for this project]

## Meeting Notes
[Linked view of Notes related to this project]
```

## Workflow Integration

### Daily Review
1. Check Active Projects view
2. Update Next Actions
3. Process Inbox (see CODE workflow)

### Weekly Review
1. Review all Projects for status accuracy
2. Check Areas health indicators
3. Archive completed items
4. Create new Projects from Areas needs

### Monthly Review
1. Evaluate Area coverage
2. Archive stale Resources
3. Consolidate related Resources
4. Update knowledge graph relations

## SECI Integration

| PARA Category | Primary SECI Activity |
|---------------|----------------------|
| Projects | Internalization (applying knowledge) |
| Areas | Combination (organizing domain knowledge) |
| Resources | Externalization (capturing concepts) |
| Archives | Combination (preserving for future reference) |

When creating Resources from Projects:
1. Complete project work (Internalization)
2. Reflect on learnings (Socialization → Externalization)
3. Capture in Resources (Externalization)
4. Link to relevant Areas (Combination)

## Templates

### Project Template
```markdown
# {Project Name}

## Outcome
What does "done" look like?

## Context
Why does this matter?

## Key Milestones
- [ ] Milestone 1
- [ ] Milestone 2
- [ ] Milestone 3

## Resources
[Linked database view]

## Notes
[Subpages for meeting notes, decisions, etc.]
```

### Area Template
```markdown
# {Area Name}

## Description
What is this area about?

## Standards
What quality standards must be maintained?

## Current Focus
What's the priority right now?

## Projects
[Linked view of related projects]

## Resources
[Linked view of related resources]
```

### Resource Template
```markdown
# {Resource Name}

## Summary
3-5 sentence overview

## Key Points
- Point 1
- Point 2
- Point 3

## Details
[Full content]

## Related
[Links to related resources]

## Source
[Original source if applicable]
```
