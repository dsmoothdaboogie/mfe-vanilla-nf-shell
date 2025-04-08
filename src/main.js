import { initFederation } from '@softarc/native-federation-runtime';
import { federationConfig } from '../federation.config.js';
import { initializeRouter } from './router.js';

/**
 * Main bootstrap function for the shell application.
 * Initializes Native Federation and the Router.
 */
async function bootstrap() {
    console.log('Bootstrapping Vanilla JS Shell...');
    try {
        // IMPORTANT: Initialize Native Federation BEFORE setting up the router
        // or loading any components that might rely on federated modules.
        // Pass the federation config (remotes) and optionally shared dependencies config.
        // Add option to prevent runtime from managing import map, as we handle core part inline
        await initFederation({}, { manageImportMap: false });
        console.log('Native Federation initialized successfully.');

        // Initialize the client-side router
        initializeRouter();
        console.log('Router initialized successfully.');

        console.log('Vanilla JS Shell bootstrap complete.');

    } catch (error) {
        console.error("Fatal error during application bootstrap:", error);
        // Display error to the user in the main content area
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.innerHTML = `
                <h2>Application Initialization Failed</h2>
                <p>Could not start the microfrontend shell. Please check the console for details.</p>
                <pre>${error.message}</pre>
            `;
        }
    }
}

// Start the application
bootstrap(); 