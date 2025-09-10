import {context} from '@opentelemetry/api';
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks';
import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-grpc';
import {NodeSDK} from '@opentelemetry/sdk-node';
import {SimpleSpanProcessor} from '@opentelemetry/sdk-trace-base';
import {W3CTraceContextPropagator} from '@opentelemetry/core';


context.setGlobalContextManager(new AsyncLocalStorageContextManager());

const traceExporter = new OTLPTraceExporter();
const batchSpanProcessor = new SimpleSpanProcessor(traceExporter);

const sdk = new NodeSDK({
    spanProcessors: [batchSpanProcessor],
    textMapPropagator: new W3CTraceContextPropagator(),
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-http': {
                enabled: true
            },
            '@opentelemetry/instrumentation-dns': {
                enabled: false
            }
        }),
    ],
});

// Start the OpenTelemetry SDK
sdk.start();

// Ensure proper shutdown on process exit
process.on('SIGTERM', () => {
    sdk
        .shutdown()
        .then(() => console.log('OpenTelemetry SDK shut down successfully'))
        .catch((error: Error) => console.error('Error shutting down OpenTelemetry SDK:', error))
        .finally(() => process.exit(0));
});
