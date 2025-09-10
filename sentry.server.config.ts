import * as Sentry from '@sentry/nextjs';

if (process.env.SENTRY_DSN) {

    Sentry.init({
        dsn: "sentryDSN",
        environment: "issueTest",
        release: "release",
        skipOpenTelemetrySetup: true,
        integrations: [
            Sentry.httpIntegration({spans: false}),
        ],
    });

}