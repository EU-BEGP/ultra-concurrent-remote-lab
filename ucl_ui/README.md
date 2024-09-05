# Ultra-concurrent Remote Lab UI

This is an Angular project that provides an User Interface for the Ultra-concurrent Remote Laboratory.

## Usage

With the repository already cloned in your system navigate to the _sl_ui_ directory:

```
cd ultra-concurrent-remote-lab/sl_ui/
```

### Environment Setup

To ensure proper configuration of the UI, it's essential to create an environment file named **_.env_**.
This file can be adapted to setup the project either for a _development_ or _production_ environment.

#### Configuring .env for Development

```
### DOCKER
RESTART_POLICY=no
```

#### Configuring .env for Production

```
### DOCKER
RESTART_POLICY=always
```

#### Environment Variables

The environment variable used for the project is explained in the following table:

| Variable       | Explanation                          |
| -------------- | ------------------------------------ |
| RESTART_POLICY | Restart policy for Docker containers |

### Additional Configuration

#### The `config.json` file

This file holds the UI configuration.

To ensure correct requests, update the `"baseUrl": ""` field to point to your API. Remember, this field may vary based on whether you're using it in a production or development environment.
| Development Environment | Production Environment |
|--|--|
| `"baseUrl": "http://localhost:8000/",` | `"baseUrl": "https://<domain_name>/ultra-concurrent-rl/api/",` |

#### The Dockerfile

While running in the **development** environment you need to modify a line in the `Dockerfile` to avoid base path errors.

Change this line:

```
RUN npm run ng build -- --base-href /ultra-concurrent-rl/
```

To this:

```
RUN npm run ng build
```

### Running the Project

Once the environment setup is done you can run the project following the next steps:

- Build the docker image running the following command:

  ```
  docker-compose build
  ```

- Run UI:

  ```
  docker-compose up
  ```
