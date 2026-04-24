.PHONY: setup start stop restart logs logs-be logs-fe clean dev status

setup:
	@chmod +x setup.sh
	@./setup.sh

start:
	docker compose up -d

stop:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

logs-be:
	docker compose logs -f backend

logs-fe:
	docker compose logs -f frontend

clean:
	@echo "WARNING: This will delete all database and config data."
	@read -p "Are you sure? (y/n) " ans && [ $ans == y ]
	docker compose down -v
	rm -rf bifrost-data

dev:
	docker compose -f docker-compose.dev.yml up --build

status:
	docker compose ps
