# ATD_INF_DevOps-2025-26

## Projectbeschrijving
DevOps monorepo met een Angular frontend, Express API, MongoDB database en RabbitMQ message queue. CI/CD via GitHub Actions.

## API
[![Test-API](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/CI-API.yml/badge.svg?branch=development)](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/CI-API.yml)
[![Lint-API](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/Lint-API.yml/badge.svg?branch=development)](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/Lint-API.yml)

Express REST API (port 3000) met MongoDB als database. Beheert gebruikers en publiceert events naar RabbitMQ bij het aanmaken van een gebruiker.

## Audit Service
[![CI-AuditService](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/CI-AuditService.yml/badge.svg?branch=development)](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/CI-AuditService.yml)
[![Lint-AuditService](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/Lint-AuditService.yml/badge.svg?branch=development)](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/Lint-AuditService.yml)

Express microservice (port 3002) met eigen MongoDB. Luistert via RabbitMQ naar events van de API en slaat audit logs op. Biedt GET/POST endpoints op `/audit-logs` voor het opvragen en handmatig aanmaken van logs.

## Client
Angular frontend (port 4200) die communiceert met de API.