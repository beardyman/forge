
# Forge
A utility for deploying migrations for changing system state. 
---
Migrations are generally database schema alterations or static data updates but can be anything that 
is able to be executed via javascript. The common use case (and the reason this lib was written) is for database
schema migrations, however at its core this library just keeps track of state for files that are run so it can be 
used to migrate the state of anything. File state, database state, infrastructure state; it all depends on the 
migrations that you create.

## Getting Started
1. Create a plugin
2. Configure `forge` to point to that plugin
3. Run `forge migrate`

## Why?
So many alternative migration tools (flyway, knex.js) are written with specific database support and they 
are generally bloated supporting many features that many teams don't need. For teams that use multiple 
database systems it's sometimes hard to find a single migration tool that supports all of their databases which
leads to using multiple, generally very different, tools.

I wanted to create a tool where users could easily write their own plugin for state management without much effort, 
allowing them to setup database connections how they see fit. The user can easily write the logic to create 
schemas, tables and inserting state data for this tool so it can easily support any database or system that the user
wants to use.  Technically, a user could use a file or store the state in s3 if they wanted to.

### Why are schema migrations important?
"Ok, cool, but why would I want to use this tool?".  I hear it, I get what you're saying. If it just runs js files that
run SQL (or whatever), why can't I do that manually?  Short story is, you can. However, the point of this tool is 
to make it easy to manage state across multiple environments for repeatable deployments. This makes it easy to 
deploy your schema with your code.  You can run `forge` with your deployment to deploy database changes alongside code.
This allows you to easily rollout or rollback database changes to match the state of your deployed code.

## How do I use it?
### Setup a plugin
This is easier than it sounds. Forge requires a plugin to manage its own state to know which files have been run.
This creates an interface for `forge` to be able to create and manage tables for managing its own state.

#### Plugin requirements

```shell
# initializes forge's state tables, will call `createSchema` 
forge initialize

# migrate to latest
forge migrate

# migrate to a specific version
forge migrate --version <version>

# rollback to the previous version
forge rollback

# rollback to a specific version
forge rollback --version <version>
```

TODO:
* ```shell
# initializes forge's state tables with existing migrations
forge initialize --existing

# initializes forge's state tables with existing migrations up to (and including) a specific version
forge initialize --existing --version <version>

# skip validation
forge rollback -f | --force
```

* Validate user input
* Validate config
* Validate plugin
* Check for existence of schema / tables


```shell
# configurations
migrationsDirectory
migrationTable
migrationPlugin
logLevel
schema
```
