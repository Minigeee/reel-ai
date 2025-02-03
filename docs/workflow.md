# AI Coding Workflow

## Goal

- The goal is to have a near fully automated app development workflow
- The role of the human orchestrator is just to nudge the AI agents in the right direction as it works along

## Challenges

- One of the biggest challenges when using AI first development currently is that it is easy for AI agents to be inconsistent in code style and best practices
- AI agents will also sometimes make certain decisions, whether technical implementation or product decision, that does not always align with what the orchestrator wants
- When given vague goals and tasks, the methods an AI agent uses to implement is inconsistent
- AI agents do not plan for the future very well with respect to product development - they often choose (on average) the best options they have to carry out their immediate task. This method may work for single tasks, but when taking the entire chain of tasks required to develop a product, it may not be the best choice.
  - Therefore it is the role of the orchestrator to provide the structure and direction needed for AI agents to carry out its tasks effectively

## Workflow

### Part 1: Creating the Project Document

This document will set the vision and the direction for the project

#### 1. Project Description / Summary

- Provide a high-level overview of the app:
  - Purpose and goals
  - Problem it solves
  - Benefits to users
  - Outline the vision and value proposition

#### 2. Target Users

- Identify who will be using the app
- Identify user stories and user flows, how they will be interacting with the app

#### 3. Project Requirements

- List key features and functionalities:
  - Core user interactions
  - Must-have capabilities

#### 4. Core Features and Systems

- Given the project requirements, think step by step about what systems and features will be needed to implement the project
- Define major systems and features
  - Example for CRM app: ticket system, customer communication system (real-time, email), user dashboard, role-based access system, automation systems, organizations, analytics, etc.
  - This will be used to lay out a roadmap for the project
  - Describe how these systems interact and support the app's goals
  - IMPORTANT: This should not be a list of specific features, but rather a list of macro level systems and features that will be needed to implement the project. Do not get caught in the weeds

#### 5. Success Criteria

- Define the success criteria for the project:
  - Key performance indicators (KPIs)
  - User acceptance criteria
  - Compliance benchmarks

#### 6. Tech Stack

- Describe the tech stack that will be used in the project:
  - Frameworks
  - Libraries
  - Tools and technologies
- Describe the external services that will be used in the project:
  - Third-party APIs
  - Payment gateways
  - Authentication providers
  - Analytics and reporting tools

#### 7. Deployment and Operations

- Describe the QA and deployment process:
  - Hosting platform and infrastructure
  - Monitoring and maintenance needs

### Part 2: Establish Conventions

- Determine what coding style and conventions will be used
- Download a pre-made .cursorrules file and customize it to suit the needs of the project

#### 1. Common Systems

- These are systems, components, and snippets that will be used throughout the project, and are often not pieces unique to any single type of project
  - Utility files
  - Commonly used components
  - Error handling system

#### 2. Data Interface

This section will describe how data will be fetched and mutated. Often times, it will always be the same between projects.

- Always use an abstraction layer when doing any data fetching or mutations, for both client and server side
- Fetch data on server side in server components whenever possible
- If data is expected to change within the timeframe of a single session, use server side fetching to seed the initial data, then use react-query to manage refreshing and stale data
- When doing any client-side data fetching, use react-query
- When doing mutations, use server actions if data is otherwise not expected to change much within a single session
- If using react-query to manage data fetching, also use it for mutations if mutations are needed
- If dealing with fast real-time data (such as messages), use optimistic updates paired with some form of client side data management (i.e. custom data management through a Provider and Context, or react-query, etc.)

#### 3. Best Practices

- For React based frameworks: favor using useMemo, useEffect, and useCallback for performance
- When using server side fetching procedures, use React cache() to avoid double fetches
- Use layouts paired with provider components to provide server-side data fetches to client components (nested)

### Part 3: Data Model

The next step is to create a mostly complete data model that will be used to implement the project.
Data is the core behind any application, and it is important to design the model well to prevent future issues and slowdowns.

#### 1. Brainstorm the data model

- First, analyze the preliminary data model needs from the project document, specifically the Core Features and Systems section
- Think step by step about what data entities will be needed to implement the project
- Propose a list of data entities that will be needed to implement the project, and describe how each will be used and how they will relate to each other

#### 2. Create a first draft of the data model

- Create a list of data entities that will be needed to implement the project
- For each data entity, answer the following questions:
  - What is the purpose of the data entity?
  - What are the key attributes of the data entity?
  - What relationships does the data entity have with other data entities?
  - How will the user interact with the data entity?
  - What are the constraints on the data entity?
  - What are the indexes that should be created for the data entity?
- After creating the first draft, ask yourself if you have a full understanding of how the data model works and how it will be used
- IMPORTANT: This is a macro level outline, it should not include any specifics yet

#### 3. Create the data model

- This step builds on the previous step, the goal is to have a complete data schema description
- Using the data model outline created in the previous step, create a more fully fleshed out data model
- After fleshing out the data model, it should be descriptive enough to be used to create a database schema
- Decide on permission and access rules for each data entity. Describe the access policy in words as creating these policies are often complicated
- Include: purpose (of the data entity or structure), description (short one paragraph about how the data entity works, how it will be used, etc. to give more context to any readers of the data model), key attributes (columns descriptors), relationships (how it relates to other data entities, if it does), user interaction (how users will interact with the data entity, based on the user type), security policies (natural language of how the data entity will be accessed and modified, for CRUD)
- IMPORTANT: During the initial build up stage, try to limit feature sprawl

#### 4. Create the database schema

- Using the data model, create a database schema that will be used to implement the project
- This should be a complete database schema that will be used to implement the project

### Part 4: App Structure

- Create a document that outlines app structure
- Apps are large, so it is better to outline how all the core systems and features will fit together, and how they will consume the data model to display to the user before starting development
- This document should consider the project requirements, core features & systems, and the desired user experience into account when designing the structure

#### Step 1: Brainstorm the app structure

Start by creating a vague outline of the front-end views the user will be exposed to. Think about which views each user role (if using roles such as admin, client, etc.) will be exposed to, and how each view changes based on who is viewing it.

IMPORTANT: This is the first time you are thinking about the UI, so do not get caught up in the specifics of the UI.

- This outline should be vague, component of the outline should generally describe a view or feature without describing the specific UI components that will be used to create the view
- By the time the vague outline is created, you should be able to answer each of the following for each component of the outline:
  - Why does this view / feature exist?
  - What purpose does it serve in the project?
  - Who will be using this view?
  - What is the user flow expected to be like? How does a user access it?

#### Step 2: Drill into the details

For each part of the vague outline, drill into the details a little more

IMPORTANT: During the initial build up stage, try to limit feature sprawl. Focus on functionality that actually matters rather than adding crap just for the sake of it.

- Start answering these questions:
  - What components will be needed to achieve the purpose of the front-end view?
  - What will interactions with the key components do? Will it bring up a dialog with a form? Will I need to confirm a certain action? Does it sort this table? Does it link to another page?
  - What will the general layout of the view look like? Will there be a sidebar for info or nav? Will there be a header there? Should we include a breadcrumb component?
- The purpose is to establish the functionality of each view and its components
- Iterate over each of these components as you go

#### Step 3: Create the app structure

- Create the app structure
- Using the detailed outline, create a directory like structure of your app
- For web projects, this should be the route structure of your web app

### Part 5: Actionable Steps

- The first three parts were mostly planning. This part will be about implementation and execution
- This part will last throughout the rest of the project, it is an iterative step, along with the following parts
- With your app structure and main project document, the goal of this part is to start creating actionable steps you can feed to the coder agent

#### Step 1: Set up the project

- Create the Next app
- Add all needed libraries (shadcn, supabase, etc.)
- Copy in or create global common files (utilities, common components, etc.)
- Set up basic auth flow

#### Step 2: Create the database schema

- You should have a mostly completed data model… use it to create a schema and populate your database with tables and indices
- Create corresponding types (Typescript)
- Do not create the data interface layer yet, the needs for those are a little more fluid so they should be created on demand

#### Step 3: Choose an app structure view to focus on

This is the view that will be the focus of the next steps

#### Step 4: Split into tasks

The goal of this step:

- Choose one or a few pieces of the app structure to focus on
- Split these pieces into tasks that need to be completed in order to implement the structure pieces
- When splitting into tasks, consider:
  - Which data entities will be needed to make the feature work?
  - How will this data be consumed? Should it be fetched on server side because it can be treated as static data? Or should you do an initial server side fetch, and manage refetching with React Query? Or can it be treated as purely client side data that does not need to be fetched from the server?
  - What set of features should the structure piece offer to the user? (Hint: KISS)
  - What sub components will be needed to implement the feature or view? Can any of these be reused in other views?

To do this:

- First, think step by step about how you will create the tasks in a brainstorming phase.
- Make sure you are aware of why every feature is needed, and how it fits into the overall product
- If you run into an implementation detail that can be solved in many valid ways, choose the best one or ask me for clarification to make sure the decision aligns with the vision for the product
- When creating the task list, split them into sections
- For each section, include a short description paragraph to offer context to the coder agent

Considerations:

- Order the tasks so that the features that others are dependent on are implemented first. This means that foundational features are often implemented first. This also means that the data interface layer should often be implemented first.
- Do not include any specific code in the tasks, just the high level overview of what needs to be done
- IMPORTANT: During the initial build up stage, try to limit feature sprawl. Don't add features just for the sake of it.

#### Step 5: Feed the tasks to the model and repeat until done

- Guide the model as you go
- The model should understand how to interface with data, coding conventions, best practices (from the cursor rules)
- It should also understand how to implement the task, how it fits into the app, etc. (from the context and app structure document)

#### Step 6: Repeat steps 3-5 until the product is where you want it to be

- This is an iterative process, and the goal is to get the product to a point where it is where you want it to be
- The goal is to get the product to a point where it is where you want it to be
