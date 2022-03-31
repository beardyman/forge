# Forge
A utility for deploying migrations for changing system state. 
---

![Unit Tests](https://github.com/beardyman/forge/actions/workflows/unit-tests.yml/badge.svg)
![Functional Tests](https://github.com/beardyman/forge/actions/workflows/func-tests.yml/badge.svg)


Migrations are generally database schema alterations or static data updates but can be anything that 
is able to be executed via javascript. The common use case (and the reason this lib was written) is for database
schema migrations, however at its core this library just keeps track of state for files that are run, so it can be 
used to migrate the state of anything. File state, database state, infrastructure state; it all depends on the 
migrations that you create.

## Getting Started
1. Setup a Plugin
2. Create migrations
3. Configure `forge` to point to that plugin and migrations
4. Run `forge migrate`

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
### Setup a Migration State Plugin
todo: 

#### Create Your Own Migration State Plugin
If you need to create a custom migration state plugin because your storage system isn't currently supported, 
please see the [writing plugins guide](tutorials/writing-plugins.md).

### Configuration
Forge's configuration should be set in the project's `package.json` file under the property `"forge"`. The configuration can be in two different formats.
The default format can be used if there's only one set of migrations in the project.

The only **required** property of a configuration is `"migrationStatePlugin"`.

Config defaults:
```json 
{
  "logLevel": "info",
  "migrationsDirectory": "migrations",
  "migrationTable": "forge_migrations",
  "schema": "public"
}
```

Example configuration: 
```json
{
  "forge": {
    "migrationStatePlugin": "./schema/postgres.js",
    "migrationsDirectory": "./schema",
    "schema": "test_migrations",
    "logLevel": "debug"
  }
}
```

The other configuration format is for named configurations.  This can be useful if your project requires two separate migrations.  Names are arbitrary 
and there are no limits to how many named migrations you can have.  The defaults above apply to each named configuration.
```json
{
  "forge": {
    "logLevel": "debug",
    "db": {
      "migrationStatePlugin": "./schema/postgres.js",
      "migrationsDirectory": "./schema",
      "schema": "test_migrations"
    },
    "infra": {
      "migrationStatePlugin": "./infra/aws.js",
      "migrationsDirectory": "./infra",
      "schema": "infra_migrations"
    }
  }
}
```

### Run migrate or rollback
```shell
# record existing migrations
forge initialize

# record existing migrations prior to and including a specific version
forge initialize --version <version>

# migrate to latest
forge migrate

# migrate using a named configuration
forge migrate <name>

# migrate to a specific version
forge migrate --version <version>

# rollback to the previous version
forge rollback

# rollback using a named configuration
forge rollback <name>

# rollback to a specific version (sets the state to the version specified)
forge rollback --version <version>
```
