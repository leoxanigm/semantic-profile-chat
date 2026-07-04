COMPOSE := docker compose

.DEFAULT_GOAL := help

.PHONY: help up start dev down stop restart build rebuild status logs \
	logs-api logs-web logs-ollama config pull clean reset

help:
	@echo "Available commands:"
	@echo "  make up           Start all services in the background"
	@echo "  make dev          Start all services with attached logs"
	@echo "  make down         Stop and remove containers"
	@echo "  make stop         Stop containers without removing them"
	@echo "  make restart      Restart all services"
	@echo "  make build        Build application images"
	@echo "  make rebuild      Rebuild and recreate all services"
	@echo "  make status       Show service status"
	@echo "  make logs         Follow all service logs"
	@echo "  make logs-api     Follow API logs"
	@echo "  make logs-web     Follow web logs"
	@echo "  make logs-ollama  Follow Ollama logs"
	@echo "  make config       Validate and render Compose configuration"
	@echo "  make pull         Pull upstream images"
	@echo "  make clean        Remove containers and orphaned containers"
	@echo "  make reset        Remove containers and volumes, including models"

up start:
	$(COMPOSE) up --detach

dev:
	$(COMPOSE) up

down:
	$(COMPOSE) down

stop:
	$(COMPOSE) stop

restart:
	$(COMPOSE) restart

build:
	$(COMPOSE) build

rebuild:
	$(COMPOSE) up --detach --build --force-recreate

status:
	$(COMPOSE) ps --all

logs:
	$(COMPOSE) logs --follow --tail=200

logs-api:
	$(COMPOSE) logs --follow --tail=200 api

logs-web:
	$(COMPOSE) logs --follow --tail=200 web

logs-ollama:
	$(COMPOSE) logs --follow --tail=200 ollama

config:
	$(COMPOSE) config

pull:
	$(COMPOSE) pull

clean:
	$(COMPOSE) down --remove-orphans

reset:
	@printf "This removes containers and volumes, including downloaded models. Continue? [y/N] "; \
	read answer; \
	case "$$answer" in \
		y|Y|yes|YES) $(COMPOSE) down --volumes --remove-orphans ;; \
		*) echo "Cancelled." ;; \
	esac