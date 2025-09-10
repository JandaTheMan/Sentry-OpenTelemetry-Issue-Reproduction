# Sentry + OpenTelemetry Issue Reproduction

**Issue**: Sentry SDK interferes with OpenTelemetry fetch spans in Node.js even with `skipOpenTelemetrySetup: true`

## Problem Description

When initializing Sentry SDK alongside OpenTelemetry instrumentation, Nextjs fetch spans stop being generated, despite:
- Setting `skipOpenTelemetrySetup: true` in Sentry configuration
- Properly configuring OpenTelemetry auto-instrumentations
- Loading OpenTelemetry before Sentry initialization

## Environment

- **Node.js**: v22.17.1
- **Next.js**: 15.5.2
- **@sentry/nextjs**: ^10.11.0
- **@opentelemetry/auto-instrumentations-node**: ^0.63.0
- **OS**: macOS Darwin 24.6.0

## Reproduction Steps

### Prerequisites
1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local observability stack (OpenTelemetry Collector + Tempo + Grafana):
   ```bash
   npm run observability:up
   ```
   This will start:
   - OpenTelemetry Collector (ports 4317/4318)
   - Tempo (trace storage)
   - Grafana (http://localhost:3003)
   
   **Note**: First login to Grafana requires username: `admin` and password: `admin`

### Test Case 1: Without Sentry (✅ Expected behavior)
1. Ensure `SENTRY_DSN` is not set in `.env`
2. Start the server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000
4. Check traces in Grafana at http://localhost:3003/explore (tempo as source). Pre-configured [url](http://localhost:3003/explore?schemaVersion=1&panes=%7B%22x4u%22:%7B%22datasource%22:%22tempo%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22datasource%22:%7B%22type%22:%22tempo%22,%22uid%22:%22tempo%22%7D,%22queryType%22:%22traceqlSearch%22,%22limit%22:20,%22tableType%22:%22traces%22,%22metricsQueryType%22:%22range%22,%22filters%22:%5B%7B%22id%22:%2265afe55b%22,%22operator%22:%22%3D%22,%22scope%22:%22span%22%7D%5D%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1)  for traces search.
5. **Result**: OpenTelemetry spans are generated and visible grafana. Fetch spans are present.

### Test Case 2: With Sentry (❌ Broken behavior)
1. Set `SENTRY_DSN` in `.env` file:
   ```
   SENTRY_DSN=your-sentry-dsn-here
   ```
2. Restart the server:
   ```bash
   npm run dev
   ```
3. Click "Make Fetch Request" button
4. Check traces in Grafana at http://localhost:3003/explore (tempo as source). Pre-configured [url](http://localhost:3003/explore?schemaVersion=1&panes=%7B%22x4u%22:%7B%22datasource%22:%22tempo%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22datasource%22:%7B%22type%22:%22tempo%22,%22uid%22:%22tempo%22%7D,%22queryType%22:%22traceqlSearch%22,%22limit%22:20,%22tableType%22:%22traces%22,%22metricsQueryType%22:%22range%22,%22filters%22:%5B%7B%22id%22:%2265afe55b%22,%22operator%22:%22%3D%22,%22scope%22:%22span%22%7D%5D%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1)  for traces search.
5. **Result**: OpenTelemetry spans are generated and visible grafana. Fetch spans are not present.


## Configuration Details

### OpenTelemetry Setup (`instrumentation.node.ts`)
- Uses `@opentelemetry/auto-instrumentations-node` with HTTP instrumentation enabled
- Properly configured before Sentry initialization

### Sentry Configuration (`sentry.server.config.ts`)
```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  skipOpenTelemetrySetup: true, // Should prevent interference
  integrations: [Sentry.httpIntegration({spans: false})],
});
```

### Load Order
1. OpenTelemetry SDK initializes first (`instrumentation.node.ts`)
2. Sentry initializes conditionally based on `SENTRY_DSN` environment variable

## Expected Behavior

OpenTelemetry Nextjs fetch instrumentation should continue generating spans when Sentry is enabled with `skipOpenTelemetrySetup: true`.

## Actual Behavior

Fetch spans disappear completely when Sentry SDK is initialized, regardless of the `skipOpenTelemetrySetup` setting.

## Package Dependencies

```json
{
  "@opentelemetry/api": "^1.9.0",
  "@opentelemetry/auto-instrumentations-node": "^0.63.0",
  "@opentelemetry/context-async-hooks": "^2.1.0",
  "@opentelemetry/exporter-trace-otlp-grpc": "^0.204.0",
  "@opentelemetry/sdk-node": "^0.204.0",
  "@sentry/nextjs": "^10.11.0",
  "next": "15.5.2"
}
```

## Observability Stack

### Cleanup
To stop the observability stack:
```bash
npm run observability:down
```

### Trace Visualization
After running tests, view traces in Grafana:
- **Basic exploration**: http://localhost:3003/explore
- **Pre-configured trace search**: [url ](http://localhost:3003/explore?schemaVersion=1&panes=%7B%22x4u%22:%7B%22datasource%22:%22tempo%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22datasource%22:%7B%22type%22:%22tempo%22,%22uid%22:%22tempo%22%7D,%22queryType%22:%22traceqlSearch%22,%22limit%22:20,%22tableType%22:%22traces%22,%22metricsQueryType%22:%22range%22,%22filters%22:%5B%7B%22id%22:%2265afe55b%22,%22operator%22:%22%3D%22,%22scope%22:%22span%22%7D%5D%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1)

---

This minimal reproduction case demonstrates the conflict between Sentry and OpenTelemetry instrumentation that prevents proper observability setup.