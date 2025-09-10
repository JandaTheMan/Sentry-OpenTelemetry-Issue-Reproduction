async function getInitialData() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const data = await response.json();
        return {success: true, data, message: 'Server-side fetch on page render completed'};
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            message: 'Server-side fetch on page render failed',
        };
    }
}

export default async function Home() {
    const initialData = await getInitialData();

    return (
        <div className="min-h-screen p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Sentry + OpenTelemetry Issue Reproduction</h1>

            <div className="bg-gray-100 p-4 rounded-lg mb-8">
                <h2 className="text-xl font-semibold mb-4">Issue Description:</h2>
                <p className="mb-4">
                    When Sentry is enabled with <code className="bg-white px-2 py-1 rounded">skipOpenTelemetrySetup:
                    true</code>,
                    Nextjs fetch spans are not generated.
                </p>

                <div className="mb-4">
                    <h3 className="font-semibold">To test:</h3>
                    <ol className="list-decimal list-inside mt-2">
                        <li>Run without Sentry DSN - fetch spans appear in grafana</li>
                        <li>Add SENTRY_DSN to .env - fetch spans disappear</li>
                    </ol>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Server-side fetch results:</h3>

                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Initial Page Render Fetch:</h4>
                    <div className="bg-black text-green-400 p-4 rounded-lg">
                        <pre className="text-sm overflow-auto">{JSON.stringify(initialData, null, 2)}</pre>
                    </div>
                </div>

                <p className="text-sm text-gray-600">
                    Check Grafana OpenTelemetry spans from both fetch requests
                </p>
            </div>
        </div>
    );
}