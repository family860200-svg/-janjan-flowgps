# Notion Database Architecture Patterns

Advanced patterns for structuring Notion databases for knowledge management.

## Core Concepts

### Properties as Schema

Notion databases are schema-defined through properties:

| Property Type | Use For | Examples |
|---------------|---------|----------|
| Title | Primary identifier | Name, Topic |
| Text | Free-form content | Description, Notes |
| Number | Quantities, scores | Priority, Rating |
| Select | Single choice | Status, Type, Category |
| Multi-select | Multiple tags | Topics, Tags |
| Date | Temporal data | Deadline, Created, Modified |
| Person | Ownership, assignment | Owner, Author |
| Relation | Links between databases | Projects → Areas |
| Rollup | Aggregations from relations | Count, Sum |
| Formula | Computed values | Days until deadline |
| Checkbox | Boolean states | Done, Published |
| URL | External links | Source, Documentation |
| Files | Attachments | Documents, Images |

### Views as Perspectives

One database, many views:

```
Knowledge Base (database)
│
├── View: Table (data entry, bulk editing)
├── View: Board (status workflow)
├── View: Calendar (time-based planning)
├── View: Gallery (visual browsing)
├── View: List (quick scanning)
└── View: Timeline (project planning)
```

Each view can have:
- Different visible properties
- Different filters
- Different sorts
- Different groupings

## Architecture Patterns

### Pattern 1: Hub and Spoke

Central database connected to specialized databases.

```
                    ┌─────────────┐
                    │   Tasks     │
                    └──────┬──────┘
                           │
┌─────────────┐    ┌───────┴───────┐    ┌─────────────┐
│  Projects   │────│  Knowledge    │────│   People    │
└─────────────┘    │     Hub       │    └─────────────┘
                   └───────┬───────┘
                           │
                    ┌──────┴──────┐
                    │   Sources   │
                    └─────────────┘
```

**Implementation:**

```
Knowledge Hub (central database)
├── Property: Related Projects (relation → Projects)
├── Property: Related People (relation → People)
├── Property: Source (relation → Sources)
├── Property: Tasks (relation → Tasks)
└── Views for each perspective
```

**When to use:**
- Need to see everything from knowledge perspective
- Cross-reference different entity types
- Build comprehensive knowledge graph

### Pattern 2: Master Database

Single database with Type property for everything.

```
Everything Database
├── Type: Note | Task | Project | Resource | Meeting
├── Status: varies by Type
├── Due: for Tasks/Projects
├── Related: self-relation
└── Views:
    ├── Notes (filter: Type = Note)
    ├── Tasks (filter: Type = Task)
    ├── Projects (filter: Type = Project)
    └── All (no filter)
```

**When to use:**
- Small to medium knowledge bases
- Want unified search
- Prefer simplicity over separation

### Pattern 3: Domain-Driven

Databases organized by business domain.

```
Workspace
├── Product/
│   ├── Features (database)
│   ├── Bugs (database)
│   └── Releases (database)
├── Marketing/
│   ├── Campaigns (database)
│   ├── Content (database)
│   └── Analytics (database)
└── Operations/
    ├── Processes (database)
    ├── Vendors (database)
    └── Compliance (database)
```

**When to use:**
- Large organizations
- Clear domain boundaries
- Different teams own different areas

### Pattern 4: Temporal Layers

Separate databases by time horizon.

```
Workspace
├── Daily/ (short-term, high churn)
│   ├── Today's Tasks
│   └── Daily Notes
├── Weekly/ (medium-term planning)
│   ├── Sprint Items
│   └── Weekly Reviews
├── Quarterly/ (strategic)
│   ├── OKRs
│   └── Initiatives
└── Evergreen/ (permanent reference)
    ├── Knowledge Base
    └── Processes
```

**When to use:**
- GTD-style workflows
- Need clear temporal boundaries
- Different retention policies

## Relation Strategies

### Self-Relations (Knowledge Graph)

Enable linking items within same database.

```
Resources Database
├── Name: "SECI Model"
├── Related: (self-relation)
│   ├── "Knowledge Spiral"
│   ├── "Ba Contexts"
│   └── "Tacit Knowledge"
```

**Create with:**
1. Add Relation property
2. Select same database
3. Optionally create reverse relation

### Cross-Database Relations

Connect different entity types.

```
Projects ←→ Resources
   ↓           ↓
 Tasks ←→ People
```

**Best practices:**
- Name relations clearly (not just "Related")
- Use bidirectional when both sides need access
- Consider rollups for aggregations

### Rollup Patterns

Aggregate data from related items.

**Count Pattern:**
```
Areas Database
├── Projects: relation → Projects
├── Active Projects: rollup
│   ├── Relation: Projects
│   ├── Property: Status
│   ├── Calculate: Count values
│   └── Filter: Status = Active
```

**Sum Pattern:**
```
Projects Database
├── Tasks: relation → Tasks
├── Total Effort: rollup
│   ├── Relation: Tasks
│   ├── Property: Effort (number)
│   └── Calculate: Sum
```

**Completion Pattern:**
```
Projects Database
├── Tasks: relation → Tasks
├── Completion: rollup
│   ├── Relation: Tasks
│   ├── Property: Done (checkbox)
│   └── Calculate: Percent checked
```

## Formula Patterns

### Date Calculations

**Days until deadline:**
```
dateBetween(prop("Deadline"), now(), "days")
```

**Overdue indicator:**
```
if(
  prop("Status") != "Complete" and
  prop("Deadline") < now(),
  "🔴 Overdue",
  ""
)
```

**Age of item:**
```
dateBetween(now(), prop("Created"), "days") + " days old"
```

### Status Logic

**Auto-status from progress:**
```
if(
  prop("Completion") == 100,
  "Complete",
  if(
    prop("Completion") > 0,
    "In Progress",
    "Not Started"
  )
)
```

**Health indicator:**
```
if(
  prop("Days Overdue") > 7,
  "🔴 Critical",
  if(
    prop("Days Overdue") > 0,
    "🟡 At Risk",
    "🟢 On Track"
  )
)
```

### Priority Scoring

**Weighted priority:**
```
prop("Urgency") * 2 + prop("Impact") * 3
```

**Eisenhower matrix:**
```
if(
  prop("Urgent") and prop("Important"),
  "1-Do First",
  if(
    prop("Important"),
    "2-Schedule",
    if(
      prop("Urgent"),
      "3-Delegate",
      "4-Eliminate"
    )
  )
)
```

## View Configuration Recipes

### Kanban Board

**Purpose:** Workflow management
```
View type: Board
Group by: Status
Sort within group: Priority (ascending)
Properties shown: Name, Assignee, Due Date
```

### Daily Dashboard

**Purpose:** Today's focus
```
View type: Table
Filter: Due Date = Today OR Status = In Progress
Sort: Priority, then Due Date
Properties: Name, Status, Due Date, Project
```

### Review Queue

**Purpose:** Items needing attention
```
View type: List
Filter:
  Status = Draft OR
  Last Edited < 30 days ago OR
  Needs Review = true
Sort: Last Edited (oldest first)
```

### Knowledge Graph View

**Purpose:** See connections
```
View type: Table
Filter: None
Properties: Name, Type, Related (expanded), Topics
Sort: Name (alphabetical)
```

### Timeline Planning

**Purpose:** Project scheduling
```
View type: Timeline
Timeline by: Start Date → End Date
Show: Name, Status, Owner
Group by: Area (optional)
```

## Synced Blocks Strategy

### Definition Sync

Maintain single source of truth for definitions.

**Pattern:**
1. Create "Definitions" page with official definitions
2. Use synced blocks for each definition
3. Embed synced definitions where needed

**Example:**
```markdown
# Definitions Page

/synced-block: SECI Model
The SECI model describes four modes of knowledge conversion...

/synced-block: Tacit Knowledge
Knowledge that is difficult to articulate...
```

### Status Dashboard Sync

Single status block, multiple dashboard locations.

**Pattern:**
1. Create status summary block
2. Sync to relevant dashboards
3. Update in one place, reflects everywhere

### Template Components

Reusable template pieces.

**Pattern:**
1. Create "Template Components" page
2. Synced blocks for common sections
3. Include in templates as needed

**Example components:**
- Standard meeting header
- Review checklist
- Project status template

## Performance Optimization

### Database Size Guidelines

| Items | Performance | Recommendation |
|-------|-------------|----------------|
| < 500 | Excellent | No optimization needed |
| 500-2000 | Good | Use filtered views |
| 2000-5000 | Moderate | Archive old items |
| > 5000 | Degraded | Split database or archive |

### View Optimization

**Do:**
- Use filters to limit displayed items
- Limit properties shown in views
- Use linked databases for focused views

**Don't:**
- Create views showing all items unfiltered
- Show all properties in every view
- Nest too many linked databases

### Relation Optimization

**Do:**
- Limit relations per item (< 50)
- Use rollups instead of counting manually
- Filter rollup calculations

**Don't:**
- Create circular relation dependencies
- Relate everything to everything
- Use relations for simple categorization (use selects)

## Migration Patterns

### From Separate Pages to Database

1. Create database with needed properties
2. For each page:
   - Create new database entry
   - Copy content to entry body
   - Set properties from page metadata
3. Archive original pages

### From Single Database to Multiple

1. Identify natural divisions (by Type usually)
2. Create new specialized databases
3. Copy items by type to appropriate database
4. Establish cross-database relations
5. Update views and links

### Merging Databases

1. Identify target database
2. Add any missing properties from source
3. Move items with "Move to" action
4. Update relations and links
5. Delete empty source database
