# Prerequisites

- [Systems and package manager](#systems-and-package-manager)
- [NodeJS v20](#nodejs-v20)
- [PostgreSQL v16](#postgresql-v16)
- [Create a local PostgreSQL database](#create-a-local-postgresql-database)

## Systems and package manager

[Back to top ↑](#prerequisites)

**Ubuntu:**

Ensure your are on version 22.04 or superior.

**MacOS:**

Ensure your are on version 14 or superior and install the [HomeBrew](https://brew.sh/) package manager.

**Windows:**

Ensure you are in version 10 or superior and ensure [Winget](https://apps.microsoft.com/detail/9NBLGGH4NNS1?rtc=1&hl=fr-fr&gl=FR#activetab=pivot:overviewtab) package manager is up to date.

## NodeJS v20

[Back to top ↑](#prerequisites)

**Ubuntu:**

```bash
# Add NodeJS repository, GPG key and update APT repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\

# Install NodeJS 20
sudo apt install -y nodejs
```

**MacOS:**

```bash
# Install NodeJS 20
brew install node@20

# Make NodeJS 20 binaries available globally
brew link node@20
```

**Windows:**

Run the following in an elevated PowerShell.

```powershell
# Install NodeJS 20
winget install OpenJS.NodeJS.LTS --version 20.10.0 --source winget
```

## PostgreSQL v16

[Back to top ↑](#prerequisites)

**Ubuntu:**

```bash
# Add PostgreSQL repository
echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list > /dev/null

# Add PostgreSQL GPG key
wget -O- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor | sudo tee /etc/apt/keyrings/postgresql.gpg > /dev/null

# Update APT registry
sudo apt update

# Install PostgreSQL 16
sudo apt install -y 'postgresql-16'

# Define admin password
sudo su --command "psql --command \"ALTER USER postgres PASSWORD 'postgres';\"" - postgres
```

**MacOS:**

```bash
# Install PostgreSQL 16
brew install postgresql@16

# Make PostgreSQL 16 binaries available globally
brew link postgresql@16

# Start PostgreSQL 16 as a daemon
brew services start postgresql@16

# Define admin password
psql --dbname postgres "ALTER USER postgres PASSWORD 'postgres';"
```

**Windows:**

Run the following in an elevated PowerShell.

```powershell
# Install PostgreSQL 16
winget install PostgreSQL.PostgreSQL --version 16.1 --source winget

# Make PostgreSQL 16 binaries available globally
$postgresqlPath = 'C:\Program Files\PostgreSQL\16\bin'
$existingPath = [System.Environment]::GetEnvironmentVariable("Path",[System.EnvironmentVariableTarget]::Machine)
if (($existingPath -like "*$postgresqlPath*") -eq $False) {
  $newPath = $existingPath + ";$postgresqlPath"
  [System.Environment]::SetEnvironmentVariable('Path', $newPath, [System.EnvironmentVariableTarget]::Machine)
}
```

Then, restart your PowerShell to be able to execute the "psql" command.

## Create a local PostgreSQL database

[Back to top ↑](#prerequisites)

**Ubuntu:**

```bash
# Create database
sudo su --command "psql --command \"CREATE DATABASE \"hexagonal_architecture_db\" ENCODING UTF8;\"" - postgres

# Create user
sudo su --command "psql --command \"CREATE ROLE \"hexagonal_architecture_user\" WITH LOGIN PASSWORD 'hexagonal_architecture_password';\"" - postgres

# Make the user owner of the database & grant him all privileges
sudo su --command "psql --command \"ALTER DATABASE \"hexagonal_architecture_db\" OWNER TO \"hexagonal_architecture_user\";\"" - postgres
sudo su --command "psql --command \"GRANT ALL PRIVILEGES ON DATABASE \"hexagonal_architecture_db\" to \"hexagonal_architecture_user\";\"" - postgres
```

**MacOS:**

```bash
# Create database
psql --dbname postgres --command "CREATE DATABASE \"hexagonal_architecture_db\" ENCODING UTF8;"

# Create user
psql --dbname postgres --command "CREATE ROLE \"hexagonal_architecture_user\" WITH LOGIN PASSWORD 'hexagonal_architecture_password';"

# Make the user owner of the database & grant him all privileges
psql --dbname postgres --command "ALTER DATABASE \"hexagonal_architecture_db\" OWNER TO \"hexagonal_architecture_user\";"
psql --dbname postgres --command "GRANT ALL PRIVILEGES ON DATABASE \"hexagonal_architecture_db\" to \"hexagonal_architecture_user\";"
```

**Windows:**

The password to use by default is 'postgres'.

```powershell
# Create database
psql --username postgres --command "CREATE DATABASE \"hexagonal_architecture_db\" ENCODING UTF8;"

# Create user
psql --username postgres --command "CREATE ROLE \"hexagonal_architecture_user\" WITH LOGIN PASSWORD 'hexagonal_architecture_password';"

# Make the user owner of the database & grant him all privileges
psql --username postgres --command "ALTER DATABASE \"hexagonal_architecture_db\" OWNER TO \"hexagonal_architecture_user\";"
psql --username postgres --command "GRANT ALL PRIVILEGES ON DATABASE \"hexagonal_architecture_db\" to \"hexagonal_architecture_user\";"
```
