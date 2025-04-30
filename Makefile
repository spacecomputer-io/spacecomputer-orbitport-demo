CONTAINER_TOOL?=docker ## Container tool to use (docker or nerdctl)
DOCKER_TAG?=latest ## Docker image tag (e.g., v1.0.0)
DOCKER_IMAGE?=wayfinder
DOCKER_CONTAINER_NAME?=wayfinder-ui

docker-build:
	@${CONTAINER_TOOL} build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .

docker-clean:
	$(CONTAINER_TOOL) rm -f $(DOCKER_CONTAINER_NAME) 2> /dev/null

docker-run: 
	@${CONTAINER_TOOL} run -p 3000:3000 -v $(shell pwd)/.env:/.env --name ${DOCKER_CONTAINER_NAME} ${DOCKER_IMAGE}:${DOCKER_TAG}

# Show help message
help:
	@echo ""
	@echo "Usage: make [vars] <cmd>"
	@echo ""
	@echo "Available commands:"
	@echo "  docker-build    Build Docker image"
	@echo "  docker-run      Run Docker image"
	@echo "  docker-clean    Remove Docker images"
	@echo "  help           Show this help message"
	@echo ""
	@echo "Variables:"
	@echo "  CONTAINER_TOOL Container tool to use (default: docker)"
	@echo "  DOCKER_TAG     Docker image tag (default: latest)"
	@echo "  DOCKER_IMAGE   Docker image name (default: orbitport)"
	@echo "  DOCKER_CONTAINER_NAME Docker container name (default: orbitport)"
	@echo ""
	@echo "Example:"
	@echo "  make CONTAINER_TOOL=nerdctl DOCKER_TAG=v1.0.0 docker-build"
	@echo ""

.PHONY: docker-build docker-clean docker-run help

default: help 

