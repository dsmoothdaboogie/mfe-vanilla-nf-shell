import { loadRemoteModule } from '@softarc/native-federation-runtime';

// Cache loaded script URLs to avoid adding them multiple times
const loadedScripts = new Set();

/**
 * Loads a web component by dynamically adding its script tag to the document.
 * @param {string} scriptUrl - The URL of the JavaScript file defining the web component.
 * @param {string} elementName - The tag name of the web component (e.g., 'my-element').
 * @returns {Promise<HTMLElement>} A promise that resolves with the created web component element.
 */
export function loadWebComponentScript(scriptUrl, elementName) {
    return new Promise((resolve, reject) => {
        const scriptId = `script-${elementName}`;

        // Check if script is already loaded or currently loading
        if (loadedScripts.has(scriptUrl) || document.getElementById(scriptId)) {
            console.log(`Script ${scriptUrl} already requested or loaded.`);
            // Attempt to create element immediately, assuming script loaded successfully previously
            try {
                const element = document.createElement(elementName);
                resolve(element);
            } catch (e) {
                // This might happen if a previous load failed silently or the element wasn't defined
                console.error(`Failed to create element ${elementName} even though script ${scriptUrl} was previously loaded/requested.`, e);
                reject(`Failed to create element ${elementName} after script ${scriptUrl} was presumably loaded.`);
            }
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId; // Add ID for potential future checks
        script.src = scriptUrl;
        script.type = 'text/javascript';
        script.async = true;

        script.onload = () => {
            console.log(`Script loaded successfully: ${scriptUrl}`);
            loadedScripts.add(scriptUrl);
            try {
                // Create the element *after* the script has loaded
                const element = document.createElement(elementName);
                resolve(element);
            } catch (e) {
                console.error(`Script ${scriptUrl} loaded, but failed to create element ${elementName}. Is the tag name correct and defined in the script?`, e);
                reject(`Script ${scriptUrl} loaded, but failed to create element ${elementName}.`);
            }
        };

        script.onerror = (error) => {
            console.error(`Error loading script: ${scriptUrl}`, error);
            // Remove the failed script tag?
            document.getElementById(scriptId)?.remove();
            reject(`Failed to load script: ${scriptUrl}`);
        };

        console.log(`Appending script: ${scriptUrl}`);
        document.body.appendChild(script);
    });
}

/**
 * Loads a web component exposed via Native Federation.
 * @param {string} remoteName - The name of the remote application (must match federation.config.js).
 * @param {string} exposedModule - The module exposed by the remote (e.g., './web-component').
 * @param {string} elementName - The tag name of the web component defined in the exposed module.
 * @returns {Promise<HTMLElement>} A promise that resolves with the created web component element.
 */
export async function loadFederatedComponent(remoteName, exposedModule, elementName) {
    console.log(`Loading federated component: ${remoteName} - ${exposedModule}`);
    try {
        // Ensure the remote module code is loaded and executed
        // This implicitly calls customElements.define if the module does that
        await loadRemoteModule(remoteName, exposedModule);
        console.log(`Module loaded: ${remoteName} - ${exposedModule}. Creating element ${elementName}.`);

        // Create the element instance
        const element = document.createElement(elementName);
        return element;
    } catch (err) {
        console.error(`Error loading federated component: ${remoteName} - ${exposedModule}`, err);
        throw new Error(`Failed to load federated component ${elementName} from ${remoteName}.`);
    }
} 