

```shell
# initializes forge's state tables, will call `createSchema` 
forge initialize

# initializes forge's state tables with existing migrations
forge initialize --existing

# initializes forge's state tables with existing migrations up to (and including) a specific version
forge initialize --existing <version>

# migrate to latest
forge migrate

# migrate to a specific version
forge migrate <version>

# rollback to the previous version
forge rollback

# rollback to a specific version
forge rollback <version>

# skip validation
forge rollback -y 
```



```shell
# configurations
migrationsDirectory
migrationTable
migrationPlugin
logLevel
schema
```
