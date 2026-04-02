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

## Links en Logins overzicht

Zodra je de applicatie [start via Docker](#project-starten), zijn deze links beschikbaar.

| Service | Externe URL | Interne URL (in Docker netwerk) | Inloggegevens (Gebruiker / URL) | Extra Beschrijving |
|---------|-------------|---------------------------------|---------------------------------|--------------------|
| **Client Frontend** | [http://localhost:4200](http://localhost:4200) | `http://client:4200` | N/A | Angular applicatie waarmee de interactie start. |
| **Express API** | [http://localhost:3000](http://localhost:3000) | `http://api:3000` | N/A | Hoofd API (Express) die verzoeken afhandelt. |
| **Audit Service API** | [http://localhost:3002](http://localhost:3002) | `http://audit-service:3002` | N/A | API die zich richt op audit/log acties (Express). |
| **RabbitMQ Management** | [http://localhost:15672](http://localhost:15672) | `amqp://rabbitmq:5672` | `guest` / `guest` | Berichtqueue, management interface. |
| **Prometheus** | [http://localhost:9090](http://localhost:9090) | `http://prometheus:9090` | N/A | Tool voor het loggen en analyseren van applicatie-statistieken |
| **Alertmanager** | [http://localhost:9093](http://localhost:9093) | `http://alertmanager:9093` | N/A | Verzendt alerts via bijv. e-mail. |
| **Grafana** | [http://localhost:3001](http://localhost:3001) | `http://grafana:3000` | `admin` / `admin` | Dashboard(s) om stats van Prometheus visueel te zien. |
| **MongoDB API** | N/A | `mongodb://db:27017` | `admin` / `secretpassword` | Database voor de API ('mydb' database) |
| **MongoDB Audit Service** | `localhost:27018` | `mongodb://audit-db:27017` | `admin` / `secretpassword` | Database voor audit-service ('auditdb' database) |


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

- **Prometheus** (port 9090) - scrapet metrics van de API, Audit Service en MongoDB
- **Grafana** (port 3001) - dashboards voor Node.js metrics en MongoDB
- **Alertmanager** (port 9093) - stuurt alerts via e-mail bij problemen

## Project starten

### Vereisten
- Docker en Docker Compose
- Node.js 20 (voor lokaal ontwikkelen/testen)

### Met Docker (aanbevolen)

Dit project is zo ingericht dat de makkelijkste manier om op te starten is met Docker Compose.

In de terminal of command line type het volgende commando in de hoofd map (waar docker-compose.yml staat):
```bash
docker-compose up --build -d
```

Dit start alle services op de achtergrond. Je kunt de links en logins bekijken in de sectie [Links en Logins overzicht](#links-en-logins-overzicht).

Om alle services weer te stoppen draai je:
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

Het resultaat toont een audit log met `"action": "user.created"` - bewijs dat het event via RabbitMQ is doorgekomen.

### Lokaal ontwikkelen (zonder Docker)

Je kan de applicatie natuurlijk ook gewoon zonder Docker draaien. OPMERKING: RabbitMQ en de Mongo databases zul je hiervoor handmatig (of afgedwongen met losstaande dockers) up and running moeten hebben voor alles correct werkt.

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
