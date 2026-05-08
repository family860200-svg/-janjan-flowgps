---
name: Notion Knowledge Patterns
description: This skill should be used when the user asks about "Notion knowledge management", "SECI in Notion", "documenting in Notion", "organizing knowledge in Notion", "Notion database architecture", "PARA in Notion", "second brain Notion", "Notion templates for knowledge", or needs to apply knowledge management principles using Notion's features.
version: 0.1.0
---

# Notion Knowledge Management Patterns

This skill extends knowledge-manager with Notion-specific implementations of SECI phases, PARA organization, CODE workflow, and native Notion architecture patterns.

## Prerequisites

- **knowledge-manager plugin** installed (provides theoretical foundation)
- Notion workspace access
- Understanding of SECI model (load `seci-grai` skill if needed)

## SECI Phases in Notion

### Socialization (Tacit → Tacit)

**Goal:** Share tacit knowledge through shared experience in Notion.

**Notion Features:**
- Real-time collaboration (multiple cursors)
- Comments and discussions
- @mentions for expertise location
- Page sharing and permissions

**Patterns:**

1. **Collaborative Exploration Pages**
   ```
   Create temporary "Exploration: [Topic]" pages
   - Invite collaborators
   - Add initial observations loosely
   - Use comments for side discussions
   - Delete after insights captured elsewhere
   ```

2. **Team Wiki with Open Editing**
   ```
   Shared space with low barrier to contribute
   - Anyone can add observations
   - Comments surface tacit disagreements
   - @mentions bring in domain experts
   ```

3. **Meeting Notes as Socialization**
   ```
   Live collaborative notes during discussions
   - Capture emerging shared understanding
   - Use callouts for key insights
   - Tag action items inline
   ```

**GRAI Field:** Socialization H→M achieved through iterative prompting with Notion content as context.

### Externalization (Tacit → Explicit)

**Goal:** Convert tacit understanding into structured Notion pages.

**Notion Features:**
- Page templates
- Database properties
- Block types (callouts, toggles, code)
- Headings and structure

**Patterns:**

1. **Template-Driven Capture**
   ```markdown
   ## Concept Template
   - **What it is:** [Definition]
   - **Why it matters:** [Rationale]
   - **How it works:** [Mechanism]
   - **Examples:** [Concrete illustrations]
   - **Related to:** [Links to other pages]
   ```

2. **Progressive Formalization**
   ```
   Stage 1: Bullet points (quick capture)
   Stage 2: Paragraphs (expand ideas)
   Stage 3: Sections with headings (structure)
   Stage 4: Templates and properties (formalize)
   ```

3. **Database-as-Glossary**
   ```
   Create "Concepts" database with:
   - Name (title)
   - Definition (text)
   - Category (select)
   - Related Concepts (relation)
   - Status (Draft/Review/Published)
   - Owner (person)
   ```

**GRAI Field:** Externalization M→H achieved when AI structures informal notes into Notion format.

### Combination (Explicit → Explicit)

**Goal:** Synthesize and organize explicit knowledge using Notion's database power.

**Notion Features:**
- Database relations
- Rollups
- Linked database views
- Filters and sorts
- Formulas

**Patterns:**

1. **Hub Database Pattern**
   ```
   Central "Knowledge Base" database
   ├── Related: Projects (what uses this)
   ├── Related: Sources (where it came from)
   ├── Related: People (who knows this)
   └── Views:
       ├── By Category (board)
       ├── By Status (table)
       ├── Recent (sorted list)
       └── Gaps (filtered: needs review)
   ```

2. **Synthesis Pages**
   ```
   Create pages that combine multiple sources:
   - Linked database view of related items
   - Narrative connecting the pieces
   - Callouts for key insights
   - Gap identification section
   ```

3. **Cross-Reference Views**
   ```
   On any knowledge page, add:
   - "Related Knowledge" linked database
   - Filter: Related Concepts contains [this page]
   - Shows everything connected to current topic
   ```

**GRAI Field:** Combination M→H achieved when AI synthesizes multiple Notion pages into unified content.

### Internalization (Explicit → Tacit)

**Goal:** Convert Notion documentation into embodied capability through practice.

**Notion Features:**
- Toggle blocks (reveal/hide)
- Checkboxes
- Synced blocks
- Embedded content

**Patterns:**

1. **Progressive Disclosure Learning**
   ```markdown
   > 💡 **Question:** What are the four SECI phases?

   <toggle>
   **Answer:**
   1. Socialization (Tacit → Tacit)
   2. Externalization (Tacit → Explicit)
   3. Combination (Explicit → Explicit)
   4. Internalization (Explicit → Tacit)
   </toggle>
   ```

2. **Practice Checklists**
   ```markdown
   ## Practice: [Topic]

   ### Prerequisites
   - [ ] Read: [Link to concept page]
   - [ ] Understand: [Key principle]

   ### Exercise
   - [ ] Step 1: [Action]
   - [ ] Step 2: [Action]
   - [ ] Step 3: [Action]

   ### Reflection
   - What worked well?
   - What was confusing?
   - How would you apply this?
   ```

3. **Annotated Examples**
   ```
   Real-world walkthrough with:
   - Step-by-step with callouts explaining "why"
   - Common mistakes highlighted
   - Links to reference material
   - Space for personal notes
   ```

**GRAI Field:** Internalization M→H achieved when AI generates practice exercises from Notion docs.

## PARA Organization in Notion

Organize SECI outputs using PARA structure:

### Projects Database
```
Properties:
- Name (title)
- Status (Not Started/Active/Complete/On Hold)
- Deadline (date)
- Area (relation → Areas)
- Tasks (relation → Tasks)
- Notes (relation → Resources)
```

### Areas Database
```
Properties:
- Name (title)
- Description (text)
- Projects (relation → Projects)
- Resources (relation → Resources)
- Owner (person)
```

### Resources Database
```
Properties:
- Name (title)
- Type (Concept/Process/Reference/Template)
- Topics (multi-select)
- Related (relation → self)
- Source (URL)
- SECI Phase (select: S/E/C/I)
```

### Archive View
```
Filter: Status = "Archived" OR
        Last Edited > 90 days ago
Sort: Last Edited (descending)
```

### PARA ↔ SECI Mapping

| PARA | Primary SECI Output |
|------|---------------------|
| Projects | Internalization artifacts (applied knowledge) |
| Areas | Combination artifacts (organized domains) |
| Resources | Externalization artifacts (captured concepts) |
| Archives | Historical combination (preserved knowledge) |

## CODE Workflow in Notion

### Capture
**Inbox database for quick capture:**
```
Properties:
- Content (title)
- Source (URL/text)
- Captured (date, auto)
- Processed (checkbox)
- Destination (relation → Resources)
```

**Quick capture template:**
```markdown
## Quick Capture
**Source:**
**Key insight:**
**Why it matters:**
**Process to:** [Projects/Areas/Resources/Archive]
```

### Organize
**Weekly review process:**
1. Filter Inbox: Processed = false
2. For each item:
   - Decide: Project, Area, Resource, or Archive?
   - Create/link to appropriate database
   - Mark as processed
3. Review Resources for consolidation opportunities

### Distill
**Progressive summarization in Notion:**
```
Layer 1: Full capture (original content)
Layer 2: Bold key passages
Layer 3: Highlight within bold
Layer 4: Executive summary at top
```

Use callouts for each layer:
```markdown
> 📌 **Summary:** [Layer 4 - one sentence]

> 💡 **Key Points:** [Layer 3 - highlights]
<toggle>Full content with Layer 2 bolding...</toggle>
```

### Express
**Output templates:**
- Blog post template
- Decision document
- Project brief
- Knowledge share presentation

## Notion-Native Patterns

### Database Architecture

**Hub & Spoke Pattern:**
```
         ┌─── Tasks
         │
Knowledge ───┼─── Projects
   Hub       │
         └─── People
```

**Master Database Pattern:**
```
One "Everything" database with:
- Type property (Task/Note/Project/Resource)
- Filtered views for each type
- Single source of truth
```

### Views as Perspectives

Create multiple views of same data:

| View Type | Use For |
|-----------|---------|
| Table | Bulk editing, data entry |
| Board | Workflow/status management |
| Calendar | Time-based planning |
| Gallery | Visual browsing |
| List | Simple scanning |
| Timeline | Project planning |

### Synced Blocks

Use synced blocks for:
- Standard definitions (sync to multiple pages)
- Status updates (single source, multiple dashboards)
- Templates that need global updates

### Template Buttons

Create template buttons for:
- New concept capture
- Meeting notes
- Project kickoff
- Weekly review

## Workflow Recommendations

### Daily Capture
1. Inbox captures throughout day
2. Quick processing at end of day
3. Link to relevant Projects/Areas

### Weekly Review
1. Process all inbox items
2. Review active Projects status
3. Update Areas dashboards
4. Archive completed items

### Monthly Synthesis
1. Review Resources for patterns
2. Create synthesis documents
3. Update knowledge graph relations
4. Identify gaps

## Integration with knowledge-manager

This skill complements knowledge-manager's theoretical foundation:

| knowledge-manager | km-notion |
|-------------------|-----------|
| SECI theory | Notion implementation |
| Ba contexts | Notion collaboration features |
| Knowledge assets | PARA organization |
| Phase transitions | CODE workflow |

Use knowledge-manager skills for "why" and this skill for "how in Notion".

## Additional Resources

### Reference Files

For detailed patterns and templates:

- **`references/para-implementation.md`** - Complete PARA setup in Notion
- **`references/database-patterns.md`** - Advanced database architectures
- **`references/templates.md`** - Ready-to-use Notion templates
