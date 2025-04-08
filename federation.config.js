/**
 * Configuration for Native Federation.
 * Keys are the remote names, values are the URLs to their remoteEntry.js
 */
export const federationConfig = {
    // Example: Angular 17+ Native Federation MFE
    mfe2: 'http://localhost:4202/remoteEntry.js',

    // Add other federated remotes here, e.g.:
    // anotherMfe: 'http://localhost:4203/remoteEntry.js',
};

/**
 * Optional: Shared dependencies configuration.
 * Useful if multiple MFEs rely on the exact same version of a library
 * provided by the shell.
 * For a vanilla JS shell, this is often less critical unless MFEs
 * are specifically built to consume shared dependencies this way.
 */
// export const sharedConfig = {
//   '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
//   '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
//   '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
//   'rxjs': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
// }; 