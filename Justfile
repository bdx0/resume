# Justfile for managing the project with Docker Compose

# Build the Docker image for the Next.js application
build:
  DOCKER_HOST=ssh://root@nix01 docker-compose build cv-nextjs

# Start the Docker Compose services in detached mode
up:
  DOCKER_HOST=ssh://root@nix01 docker-compose up --build -d

# Stop and remove Docker Compose services
down:
  DOCKER_HOST=ssh://root@nix01 docker-compose down

logs *args:
  DOCKER_HOST=ssh://root@nix01 docker-compose logs -n 100 {{args}}

# Rebuild, stop, and start the Docker Compose services
rebuild: down build up

# Run the Next.js development server inside the container
dev:
  DOCKER_HOST=ssh://root@nix01 docker-compose run --rm --service-ports cv-nextjs npm run dev

# Get a shell inside the running cv-nextjs container
shell:
  DOCKER_HOST=ssh://root@nix01 docker-compose exec cv-nextjs bash

# Run linting for the Next.js project
lint:
  DOCKER_HOST=ssh://root@nix01 docker-compose run --rm cv-nextjs npm run lint

# Run tests for the Next.js project
test:
  DOCKER_HOST=ssh://root@nix01 docker-compose run --rm cv-nextjs npm test

# Run docker compose watch
watch:
  DOCKER_HOST=ssh://root@nix01 docker-compose up --build --watch
