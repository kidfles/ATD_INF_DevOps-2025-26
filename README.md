# ATD_INF_DevOps-2025-26

DevOps monorepo met een Angular frontend, Express API, Audit Service, MongoDB databases en RabbitMQ message queue. CI/CD via GitHub Actions, monitoring via Prometheus en Grafana.

## Architectuur

```
Browser → Client (Angular, port 4200)
              │
              │ HTTP
              ▼
         API (Express, port 3000) → MongoDB (mydb)
              │
              │ publish: "user.created"
              ▼
         RabbitMQ (port 5672)
              │
              │ consume
              ▼
    Audit Service (Express, port 3002) → MongoDB (auditdb)
```

Wanneer een gebruiker wordt aangemaakt via `POST /users`, publiceert de API een `user.created` event naar RabbitMQ. De Audit Service luistert op de `audit-logs` queue, ontvangt het event en slaat het op in zijn eigen MongoDB database. Zo ontstaat een onafhankelijke audit trail zonder dat de services direct aan elkaar gekoppeld zijn.

## Services

### API
[![Test-API](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/CI-API.yml/badge.svg?branch=development)](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/CI-API.yml)
[![Lint-API](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/Lint-API.yml/badge.svg?branch=development)](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/Lint-API.yml)

Express REST API die gebruikers beheert. Draait op port 3000 met MongoDB (`mydb`) als database. Bij het aanmaken van een gebruiker wordt een event gepubliceerd naar RabbitMQ (fire-and-forget: als RabbitMQ niet beschikbaar is, werkt de API gewoon door).

**Endpoints:**
| Methode | Pad | Beschrijving |
|---------|-----|--------------|
| GET | `/users` | Alle gebruikers ophalen |
| POST | `/users` | Gebruiker aanmaken + event naar RabbitMQ |

### Audit Service
[![CI-AuditService](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/CI-AuditService.yml/badge.svg?branch=development)](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/CI-AuditService.yml)
[![Lint-AuditService](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/Lint-AuditService.yml/badge.svg?branch=development)](https://github.com/kidfles/ATD_INF_DevOps-2025-26/actions/workflows/Lint-AuditService.yml)

Onafhankelijke microservice die audit logs bijhoudt. Draait op port 3002 met een eigen MongoDB (`auditdb`). Luistert via RabbitMQ naar events van de API en slaat deze automatisch op. Biedt ook REST endpoints voor het handmatig opvragen en aanmaken van logs.

**Endpoints:**
| Methode | Pad | Beschrijving |
|---------|-----|--------------|
| GET | `/audit-logs` | Alle audit logs ophalen (optioneel: `?action=user.created` voor filtering) |
| POST | `/audit-logs` | Handmatig een audit log aanmaken (veld `action` is verplicht) |

**RabbitMQ consumer:** Bij opstarten verbindt de service met RabbitMQ en luistert naar de `audit-logs` queue. Bij connectieproblemen probeert het maximaal 5 keer opnieuw met 5 seconden tussentijd.

### Client

Angular frontend die draait op port 4200. Communiceert met de API voor het beheren van gebruikers.

### Monitoring

- **Prometheus** (port 9090) — scrapet metrics van de API, Audit Service en MongoDB
- **Grafana** (port 3001) — dashboards voor Node.js metrics en MongoDB
- **Alertmanager** (port 9093) — stuurt alerts via e-mail bij problemen

## Project starten

### Vereisten
- Docker en Docker Compose
- Node.js 20 (voor lokaal ontwikkelen/testen)

### Met Docker (aanbevolen)

```bash
docker-compose up --build -d
```

Dit start alle services op:

| Service | URL |
|---------|-----|
| Client | http://localhost:4200 |
| API | http://localhost:3000 |
| Audit Service | http://localhost:3002 |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

Stoppen:
```bash
docker-compose down
```

### Flow testen

```bash
# Maak een gebruiker aan
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Test"}'

# Wacht even voor RabbitMQ propagatie
sleep 2

# Bekijk de audit logs
curl http://localhost:3002/audit-logs
```

Het resultaat toont een audit log met `"action": "user.created"` — bewijs dat het event via RabbitMQ is doorgekomen.

### Lokaal ontwikkelen (zonder Docker)

**API:**
```bash
cd api
npm install
npm run dev     # Start op port 3000 met hot-reload
npm test        # Jest tests
npm run lint    # ESLint
```

**Audit Service:**
```bash
cd audit-service
npm install
npm run dev     # Start op port 3002 met hot-reload
npm test        # Jest tests (5 tests, in-memory MongoDB)
npm run lint    # ESLint
```

**Client:**
```bash
cd client
npm install
npm start       # Angular dev server op port 4200
```

## CI/CD

Alle workflows draaien op push en pull requests naar `development`:

| Workflow | Beschrijving |
|----------|--------------|
| CI-API | Jest tests met coverage rapport |
| Lint-API | ESLint checks |
| CI-AuditService | Jest tests met coverage rapport |
| Lint-AuditService | ESLint checks |
