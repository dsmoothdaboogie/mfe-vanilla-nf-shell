import { loadWebComponentScript, loadFederatedComponent } from './loader.js';

const contentElement = document.getElementById('content');

// Define routes: map path to loading configuration or a function
const routes = {
    '/': () => {
        contentElement.innerHTML = '<h2>Home</h2><p>Welcome to the vanilla JS microfrontend shell!</p>';
        return Promise.resolve(null); // Resolve with null, no element created
    },
    '/mfe1': { // Example: Loading via direct script (Angular 16 WC or any other WC)
        type: 'script',
        config: {
            scriptUrl: 'http://127.0.0.1:8080/my-angular-element.js', // <-- UPDATE THIS URL
            elementName: 'my-angular-element' // <-- UPDATE ELEMENT TAG
        }
    },
    '/mfe2': { // Example: Loading via Native Federation (Angular 17+)
        type: 'federation',
        config: {
            remoteName: 'mfe2', // Must match federation.config.js key
            exposedModule: './web-component', // Module exposed by mfe2
            elementName: 'mfe2-root' // <-- UPDATE ELEMENT TAG defined in mfe2's web-component module
        }
    }
    // Add more routes here for other microfrontends
    // e.g., another script-based MFE:
    // '/legacy-widget': {
    //     type: 'script',
    //     config: {
    //         scriptUrl: 'http://localhost:5001/bundle.js',
    //         elementName: 'legacy-ng12-widget'
    //     }
    // }
};

/**
 * Handles routing logic based on the current URL path.
 * Finds the matching route, calls the appropriate loader, and renders the element.
 */
async function handleRouteChange() {
    const path = window.location.pathname;
    console.log(`Routing to: ${path}`);
    const route = routes[path];

    // Clear previous content before loading new MFE
    contentElement.innerHTML = '';

    if (!route) {
        console.warn(`No route defined for path: ${path}`);
        contentElement.innerHTML = '<h2>404 Not Found</h2><p>Sorry, the page you requested could not be found.</p>';
        return;
    }

    try {
        let elementPromise = null;

        if (typeof route === 'function') {
            elementPromise = route(); // Execute function directly (e.g., for home page)
        } else if (route.type === 'script') {
            contentElement.innerHTML = `<p>Loading MFE from script: ${route.config.scriptUrl}...</p>`;
            elementPromise = loadWebComponentScript(route.config.scriptUrl, route.config.elementName);
        } else if (route.type === 'federation') {
            contentElement.innerHTML = `<p>Loading federated MFE: ${route.config.remoteName} (${route.config.exposedModule})...</p>`;
            elementPromise = loadFederatedComponent(route.config.remoteName, route.config.exposedModule, route.config.elementName);
        } else {
            throw new Error(`Invalid route configuration for path: ${path}`);
        }

        const element = await elementPromise;

        // Only append if the promise resolved with an actual element
        if (element instanceof HTMLElement) {
            console.log(`Element <${element.tagName}> created successfully for path ${path}. Appending to content.`);
            contentElement.innerHTML = ''; // Clear loading message
            contentElement.appendChild(element);
        } else {
            console.log(`Route handler for ${path} completed, but no element was returned (likely intentional).`);
        }

    } catch (error) {
        console.error(`Error loading content for path ${path}:`, error);
        contentElement.innerHTML = `<h2>Error Loading Microfrontend</h2><p>Failed to load content for ${path}.</p><pre>${error.message}</pre>`;
    }
}

/**
 * Sets up event listeners for navigation and handles the initial route.
 */
export function initializeRouter() {
    console.log('[Router] Initializing router...'); // <-- Log 1: Confirm function entry

    // Intercept clicks on local links
    document.body.addEventListener('click', (event) => {
        console.log('[Router] Body click detected.'); // <-- Log 2: Confirm listener fires

        const target = event.target.closest('a');

        // Conditions to check if we should handle this click
        if (target &&                     // Was an anchor tag clicked (or within an anchor)?
            target.href &&                // Does the anchor have an href?
            target.origin === window.location.origin && // Is it linking to the same origin (our shell)?
            !event.ctrlKey &&             // Was Ctrl not held?
            !event.metaKey &&             // Was Command (Mac) not held?
            !event.shiftKey &&            // Was Shift not held?
            target.target !== '_blank') { // Is the target not set to open in a new tab?

            const path = new URL(target.href).pathname;
            if (path !== window.location.pathname) {
                event.preventDefault(); // <-- THIS SHOULD BE CALLED
                history.pushState({ path }, '', path);
                console.log('Navigating via pushState to:', path);
                handleRouteChange();
            }
        } else if (target) {
            // Log why we might NOT be handling the click
            console.log('Click on <a> ignored:', {
                href: target.href,
                originMatch: target.origin === window.location.origin,
                modifiers: { ctrl: event.ctrlKey, meta: event.metaKey, shift: event.shiftKey },
                target: target.target
            });
        }
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        console.log('popstate event fired', event.state);
        handleRouteChange(); // Re-evaluate the route based on the new URL
    });

    // Handle the initial page load
    console.log('Initial page load, handling route...');
    handleRouteChange();
} 