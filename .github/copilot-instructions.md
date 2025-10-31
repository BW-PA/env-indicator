# GitHub Copilot Instructions for env-indicator

## Project Overview

**env-indicator** is a browser extension that adds visual environment markers to web pages to help developers differentiate between development, staging, production, and other environments. The extension displays customizable corner ribbons or triangles on web pages based on configurable URL matching rules.

### Key Features

- 🎗️ Visual indicators (ribbons or triangles) in page corners
- 🎨 Customizable colors and positioning
- 🔧 Flexible URL matching rules (regex, prefix, suffix, contains)
- 🌐 Multi-browser support (Chrome, Firefox, Edge)
- 💾 Import/export configuration
- 🌍 Internationalization (i18n) support

## Technology Stack

- **Framework**: Vue 3 with Composition API
- **Build Tool**: Quasar Framework v2 (Vite-based)
- **Browser Extension API**: WebExtension Polyfill
- **Storage**: Chrome Storage API (sync)
- **UI Library**: Quasar Components
- **Styling**: SCSS
- **Internationalization**: Chrome i18n API
- **Visual Indicator**: ribbon-corner library
- **Error Tracking**: Sentry (optional)

## Project Structure

```
env-indicator/
├── src/                      # Main application source (Vue app)
│   ├── App.vue              # Root Vue component
│   ├── assets/              # Static assets
│   │   └── defaultEnvs.json # Default environment configurations
│   ├── boot/                # Quasar boot files (app initialization)
│   │   ├── sentry.js       # Sentry error tracking setup
│   │   └── webextension-i18n.js # i18n integration
│   ├── components/          # Reusable Vue components
│   ├── css/                 # Global styles
│   ├── layouts/             # Page layouts
│   │   └── MainLayout.vue  # Main application layout
│   ├── pages/               # Page components
│   │   ├── IndexPage.vue   # Main configuration page
│   │   ├── PopupPage.vue   # Extension popup page
│   │   └── ErrorNotFound.vue # 404 page
│   └── router/              # Vue Router configuration
│       ├── index.js        # Router setup
│       └── routes.js       # Route definitions
├── src-bex/                 # Browser extension specific code
│   ├── background.js        # Background service worker
│   ├── my-content-script.js # Content script (injected into pages)
│   ├── manifest.json        # Extension manifest
│   ├── _locales/           # i18n message files
│   │   ├── en/
│   │   └── zh_CN/
│   ├── assets/             # Extension assets
│   └── icons/              # Extension icons
├── public/                  # Public static files
├── docs/                    # Documentation and screenshots
├── quasar.config.js        # Quasar build configuration
├── eslint.config.js        # ESLint configuration
└── package.json            # Dependencies and scripts
```

## Architecture

### Extension Components

1. **Background Script** (`src-bex/background.js`)

   - Service worker that manages extension lifecycle
   - Handles storage operations via bridge pattern
   - Opens options page on installation/click
   - Manages communication between content scripts and app

2. **Content Script** (`src-bex/my-content-script.js`)

   - Injected into all web pages
   - Reads environment rules from Chrome storage
   - Matches current domain against rules
   - Injects visual indicators using ribbon-corner library
   - Applies indicators based on matching rules

3. **Options Page** (`src/pages/IndexPage.vue`)

   - Full-featured configuration interface
   - Manages environment rules (CRUD operations)
   - Import/export JSON configurations
   - Rule reordering (priority-based matching)
   - Form validation and color pickers

4. **Popup Page** (`src/pages/PopupPage.vue`)
   - Quick access toggle to enable/disable extension
   - Link to full options page
   - Compact 300x300px interface

### Communication Pattern

The extension uses Quasar's BEX bridge pattern for communication:

- **background.js** ↔ **content script** ↔ **Vue app**
- Events: `storage.get`, `storage.set`, `storage.remove`, `log`, `getTime`

### Data Model

Environment configuration object structure:

```javascript
{
  envName: string,           // Display name (e.g., "Dev 🤣")
  envBackgroundColor: string, // Hex color (e.g., "#00a300")
  textColor: string,         // Hex color (e.g., "#FFFFFF")
  ruleType: string,          // "regex" | "prefix" | "suffix" | "contains"
  ruleValue: string,         // Pattern to match against hostname
  position: string,          // "left" | "right" | "left_bottom" | "right_bottom"
  shape: string              // "ribbon" | "triangle"
}
```

### Storage

Uses Chrome Storage Sync API for cross-device synchronization:

- `envs`: Array of environment configurations
- `enable`: Boolean flag to enable/disable extension

## Development Workflow

### Setup

```bash
# Install Quasar CLI globally
yarn global add @quasar/cli

# Install dependencies
yarn install

# The postinstall script automatically runs 'quasar prepare'
```

### Development

```bash
# Start development mode with hot reload
quasar dev -m bex -T chrome  # For Chrome
quasar dev -m bex -T firefox # For Firefox

# Lint code
yarn run lint

# Format code
yarn run format
```

### Build

```bash
# Build for production
quasar build -m bex -T chrome  # For Chrome
quasar build -m bex -T firefox # For Firefox

# Output directory: dist/bex/
```

### Testing

Currently, no automated tests are configured. Manual testing workflow:

1. Load unpacked extension from `dist/bex/` in browser
2. Test URL matching rules on various sites
3. Verify visual indicators appear correctly
4. Test import/export functionality
5. Verify popup and options pages work

## Code Style and Conventions

### Vue Component Style

- Use Composition API or Options API (project uses Options API)
- Single File Components (.vue)
- Template-first approach
- Reactive data in `data()` function
- Methods in `methods` object
- Lifecycle hooks: `mounted()`, `watch`

### Naming Conventions

- Components: PascalCase (e.g., `IndexPage.vue`)
- Files: kebab-case for scripts, PascalCase for components
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE (if applicable)

### Code Organization

- Keep components focused and single-responsibility
- Extract reusable logic into separate functions
- Use Quasar components for UI consistency
- Store shared data in Chrome Storage, not Vuex/Pinia

### Internationalization

- Use `this.$i18n(key)` in Vue templates
- Message keys defined in `src-bex/_locales/*/messages.json`
- Support multiple languages (en, zh_CN)

## Key Files to Understand

### 1. `src-bex/my-content-script.js`

The core logic for matching domains and injecting indicators. Key functions:

- `setEnv(env)`: Creates and positions the visual indicator
- URL matching logic: Iterates through rules in order, first match wins
- Uses `ribbon-corner` library for visual rendering

### 2. `src/pages/IndexPage.vue`

The main configuration interface. Key features:

- Environment table with inline editing
- Form validation using Quasar rules
- Rule reordering (up/down arrows)
- Import/export JSON functionality
- Color pickers for background and text colors

### 3. `src-bex/background.js`

Extension lifecycle and storage management:

- Bridge setup for cross-context communication
- Storage event handlers: `storage.get`, `storage.set`, `storage.remove`
- Extension installation handler

### 4. `quasar.config.js`

Build configuration:

- BEX mode configuration
- Boot files registration
- Vite plugin setup (ESLint checker)
- Framework plugins (Notify)

### 5. `src/assets/defaultEnvs.json`

Default environment configurations loaded on first install:

- Dev (localhost/127.0.0.1)
- Staging (st./staging.)
- Preview (pre./preview)
- Production (.srv suffix)

## Common Tasks and Patterns

### Adding a New Environment Rule Field

1. Update data model in `defaultEnvs.json`
2. Add form field in `IndexPage.vue` (form section)
3. Add table column in `IndexPage.vue` (columns array)
4. Update `setEnv()` in `my-content-script.js` to use new field
5. Update i18n messages in `_locales/*/messages.json`

### Modifying Visual Indicator Appearance

Edit `setEnv()` function in `src-bex/my-content-script.js`:

- Adjust `ribbonCorner()` parameters
- Modify positioning logic
- Change size, fonts, or styles

### Adding a New Storage Property

1. Define default value in initialization code
2. Add storage.get() call where needed
3. Add storage.set() call when value changes
4. Consider migration for existing users

### Adding i18n Support for New Text

1. Add message key to `src-bex/_locales/en/messages.json`
2. Add translations to other locale files (e.g., `zh_CN`)
3. Use `this.$i18n('messageKey')` in Vue components
4. Use `chrome.i18n.getMessage('messageKey')` in non-Vue code

### Debugging Extension Issues

- **Content script not injecting**: Check manifest.json matches patterns
- **Storage not persisting**: Verify Chrome Storage permissions
- **Bridge communication fails**: Check port connections in console
- **Indicator not showing**: Debug domain matching logic, check CSS z-index
- **Build errors**: Run `quasar prepare` to regenerate type files

## Browser Extension Specifics

### Manifest V3 Considerations

- Uses service worker for background (Chrome)
- Uses background scripts for Firefox
- Proper permissions: `storage`, `host_permissions`
- Content Security Policy configured

### Cross-Browser Compatibility

- Use `webextension-polyfill` for API compatibility
- Different background script setup per browser (see manifest.json)
- Test on all target browsers before release

### Storage Limits

- Chrome Storage Sync: 100KB total, 8KB per item
- Keep environment configurations concise
- Consider compression for large configs

## Dependencies and Libraries

### Core Dependencies

- **@quasar/extras**: Icon sets and fonts
- **quasar**: UI component library
- **vue**: Framework core
- **vue-router**: Client-side routing
- **webextension-polyfill**: Cross-browser extension API
- **ribbon-corner**: Visual indicator rendering library

### Dev Dependencies

- **@quasar/app-vite**: Quasar CLI build tool
- **eslint**: Code linting
- **prettier**: Code formatting
- **vite-plugin-checker**: Build-time type checking and linting

### Optional Dependencies

- **@sentry/vue**: Error tracking (configured but optional)

## Troubleshooting

### Common Issues

**Build fails with module errors**

- Run `quasar prepare` to regenerate .quasar directory
- Clear node_modules and reinstall: `rm -rf node_modules && yarn install`

**ESLint errors**

- Check `eslint.config.js` for flat config format
- Ensure all files match the lint command pattern
- Run `yarn run format` to auto-fix formatting

**Extension not loading**

- Verify manifest.json is valid
- Check console for errors in background page
- Ensure all permissions are declared

**Indicator not appearing**

- Check browser console for content script errors
- Verify storage contains valid environment rules
- Ensure URL matches a configured rule
- Check CSS conflicts with host page

### Debug Mode

Enable debug mode in bridge creation:

```javascript
const bridge = createBridge({ debug: true })
```

## Best Practices

1. **Always test on multiple browsers** before committing
2. **Preserve backward compatibility** for stored configurations
3. **Validate user input** before saving to storage
4. **Use Quasar components** for consistent UI
5. **Follow Vue style guide** for component structure
6. **Keep content script lightweight** for performance
7. **Handle storage.sync quota limits** gracefully
8. **Provide clear error messages** in UI
9. **Document breaking changes** in commit messages
10. **Test with various URL patterns** to ensure rule matching works

## Security Considerations

- **Content Security Policy**: Configured in manifest.json
- **Host permissions**: Uses `*://*/*` - be mindful of security implications
- **Input validation**: Always validate and sanitize user input (regex patterns, colors)
- **XSS prevention**: Use Vue's built-in escaping, avoid `v-html` with user content
- **Storage security**: Chrome Storage Sync is encrypted by Chrome

## Performance Optimization

- **Content script efficiency**: Minimize DOM manipulation
- **Rule matching order**: Place more common rules first
- **Lazy loading**: Components are lazy-loaded via router
- **Storage reads**: Cache storage values when possible
- **Build optimization**: Vite handles code splitting and minification

## Future Enhancement Ideas

- [ ] Add more shape options (circles, badges)
- [ ] Support for multiple indicators per page
- [ ] Conditional rules (AND/OR logic)
- [ ] Dark mode support
- [ ] Keyboard shortcuts for toggling
- [ ] Animation effects for indicators
- [ ] Rule testing/preview feature
- [ ] Sync settings across team (cloud storage)
- [ ] Export rules as code snippets
- [ ] Browser sync with other browsers

## Resources

- [Quasar Framework Documentation](https://quasar.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [WebExtension API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [ribbon-corner Library](https://www.npmjs.com/package/ribbon-corner)

## Contributing Guidelines

When contributing to this project:

1. **Code Style**: Follow existing patterns and run linter
2. **Commits**: Write clear, descriptive commit messages
3. **Testing**: Manually test changes across browsers
4. **Documentation**: Update this file if adding new features
5. **Internationalization**: Add translations for new UI text
6. **Backward Compatibility**: Don't break existing configurations

## Contact and Support

- **Repository**: [https://github.com/BW-PA/env-indicator](https://github.com/BW-PA/env-indicator)
- **Chrome Web Store**: [env-indicator](https://chrome.google.com/webstore/detail/env-indicator/kgdbcpllbbnimjgoiomfdebldcofmlbl)
- **Firefox Add-ons**: [env-indicator](https://addons.mozilla.org/firefox/addon/env-indicator)
- **Edge Add-ons**: [env-indicator](https://microsoftedge.microsoft.com/addons/detail/nlgegepgfcagnbjdnjbaoiiooklkhlcj)
