const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8002';

test.describe('Taiwan Bus PWA', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto(BASE_URL);
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Bus/);
    const title = await page.title();
    expect(title).toContain('Bus');
  });

  test('has no cross-app navigation links', async ({ page }) => {
    // Should not have links to other transport apps
    const mrtLinks = page.locator('a[href*="mrt.html"]');
    const ubikeLinks = page.locator('a[href*="ubike.html"]');
    const railLinks = page.locator('a[href*="rail.html"]');
    const thsrLinks = page.locator('a[href*="thsr.html"]');
    const weatherLinks = page.locator('a[href*="weather.html"]');
    const earthquakeLinks = page.locator('a[href*="earthquake.html"]');
    const oilLinks = page.locator('a[href*="oil.html"]');

    await expect(mrtLinks).toHaveCount(0);
    await expect(ubikeLinks).toHaveCount(0);
    await expect(railLinks).toHaveCount(0);
    await expect(thsrLinks).toHaveCount(0);
    await expect(weatherLinks).toHaveCount(0);
    await expect(earthquakeLinks).toHaveCount(0);
    await expect(oilLinks).toHaveCount(0);
  });

  test('map element exists', async ({ page }) => {
    const map = page.locator('#map-canvas');
    await expect(map).toBeVisible();
  });

  test('tab buttons exist', async ({ page }) => {
    const routeTab = page.locator('.tab-btn[data-tab="schedule"]');
    const nearbyTab = page.locator('.tab-btn[data-tab="nearby"]');

    await expect(routeTab).toBeVisible();
    await expect(nearbyTab).toBeVisible();

    // Check initial state - Route Schedule should be active
    await expect(routeTab).toHaveClass(/active/);
  });

  test('tab switching works', async ({ page }) => {
    const routeTab = page.locator('.tab-btn[data-tab="schedule"]');
    const nearbyTab = page.locator('.tab-btn[data-tab="nearby"]');
    const scheduleContent = page.locator('#tab-schedule');
    const nearbyContent = page.locator('#tab-nearby');

    // Initially Route Schedule tab should be active
    await expect(routeTab).toHaveClass(/active/);
    await expect(scheduleContent).toHaveClass(/active/);
    await expect(nearbyContent).not.toHaveClass(/active/);

    // Click Nearby Stops tab
    await nearbyTab.click();
    await expect(nearbyTab).toHaveClass(/active/);
    await expect(nearbyContent).toHaveClass(/active/);
    await expect(routeTab).not.toHaveClass(/active/);
    await expect(scheduleContent).not.toHaveClass(/active/);

    // Switch back to Route Schedule
    await routeTab.click();
    await expect(routeTab).toHaveClass(/active/);
    await expect(scheduleContent).toHaveClass(/active/);
    await expect(nearbyTab).not.toHaveClass(/active/);
    await expect(nearbyContent).not.toHaveClass(/active/);
  });

  test('route city selector exists with 20+ options', async ({ page }) => {
    const citySelect = page.locator('#route-city-select');
    await expect(citySelect).toBeVisible();

    const options = citySelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(20);

    // Check some specific cities exist
    await expect(citySelect.locator('option[value="Taipei"]')).toHaveCount(1);
    await expect(citySelect.locator('option[value="NewTaipei"]')).toHaveCount(1);
    await expect(citySelect.locator('option[value="Taoyuan"]')).toHaveCount(1);
    await expect(citySelect.locator('option[value="Taichung"]')).toHaveCount(1);
    await expect(citySelect.locator('option[value="Kaohsiung"]')).toHaveCount(1);
  });

  test('route search input exists', async ({ page }) => {
    const searchInput = page.locator('#route-search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Search route/i);

    // Test that input is functional
    await searchInput.fill('299');
    await expect(searchInput).toHaveValue('299');
  });

  test('route select exists', async ({ page }) => {
    const routeSelect = page.locator('#route-select');
    await expect(routeSelect).toBeVisible();

    // Should have default option
    const defaultOption = routeSelect.locator('option[value=""]');
    await expect(defaultOption).toHaveCount(1);
  });

  test('direction tabs exist', async ({ page }) => {
    const directionTabs = page.locator('.direction-tabs');
    await expect(directionTabs).toBeVisible();

    const outboundTab = page.locator('.direction-tab[data-dir="go"]');
    const returnTab = page.locator('.direction-tab[data-dir="back"]');

    await expect(outboundTab).toBeVisible();
    await expect(returnTab).toBeVisible();

    // Outbound should be active initially
    await expect(outboundTab).toHaveClass(/active/);
  });

  test('direction tab switching works', async ({ page }) => {
    const outboundTab = page.locator('.direction-tab[data-dir="go"]');
    const returnTab = page.locator('.direction-tab[data-dir="back"]');

    // Initially outbound is active
    await expect(outboundTab).toHaveClass(/active/);
    await expect(returnTab).not.toHaveClass(/active/);

    // Click return tab
    await returnTab.click();
    await expect(returnTab).toHaveClass(/active/);
    await expect(outboundTab).not.toHaveClass(/active/);

    // Click back to outbound
    await outboundTab.click();
    await expect(outboundTab).toHaveClass(/active/);
    await expect(returnTab).not.toHaveClass(/active/);
  });

  test('nearby stops city selector exists with 20+ options', async ({ page }) => {
    // Switch to Nearby Stops tab
    const nearbyTab = page.locator('.tab-btn[data-tab="nearby"]');
    await nearbyTab.click();

    const citySelect = page.locator('#city-select');
    await expect(citySelect).toBeVisible();

    const options = citySelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(20);
  });

  test('nearby stops search input exists', async ({ page }) => {
    // Switch to Nearby Stops tab
    const nearbyTab = page.locator('.tab-btn[data-tab="nearby"]');
    await nearbyTab.click();

    const searchInput = page.locator('#search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Search/i);
  });

  test('language toggle button exists and works', async ({ page }) => {
    const langBtn = page.locator('#lang-btn');
    await expect(langBtn).toBeVisible();

    // Should initially show EN or 中文
    const initialText = await langBtn.textContent();
    expect(['EN', '中文']).toContain(initialText);

    // Click to toggle
    await langBtn.click();

    // Text should change
    const newText = await langBtn.textContent();
    expect(newText).not.toBe(initialText);
    expect(['EN', '中文']).toContain(newText);
  });

  test('locate button exists', async ({ page }) => {
    const locateBtn = page.locator('.locate-btn');
    await expect(locateBtn).toBeVisible();
    await expect(locateBtn).toContainText('📍');
  });

  test('Leaflet map initializes', async ({ page }) => {
    // Wait for Leaflet to initialize
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();

    // Check for Leaflet zoom controls
    const zoomControl = page.locator('.leaflet-control-zoom');
    await expect(zoomControl).toBeVisible();
  });

  test('all required JS files load', async ({ page }) => {
    // Listen for network requests
    const jsFiles = [];
    page.on('response', response => {
      const url = response.url();
      if (url.endsWith('.js')) {
        jsFiles.push(url);
      }
    });

    // Reload to capture all requests
    await page.reload();

    // Wait a bit for all resources to load
    await page.waitForTimeout(2000);

    // Check that required JS files were loaded
    const hasCommon = jsFiles.some(url => url.includes('js/common.js'));
    const hasBus = jsFiles.some(url => url.includes('js/bus.js'));
    const hasBottomSheet = jsFiles.some(url => url.includes('js/bottom-sheet.js'));

    expect(hasCommon).toBeTruthy();
    expect(hasBus).toBeTruthy();
    expect(hasBottomSheet).toBeTruthy();
  });

  test('manifest.webapp returns 200', async ({ page }) => {
    const response = await page.goto(BASE_URL + '/manifest.webapp');
    expect(response.status()).toBe(200);

    // Check it's JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/json/i);
  });

  test('service worker is registered', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for service worker registration
    await page.waitForTimeout(2000);

    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });

    expect(swRegistered).toBeTruthy();
  });

  test('no console errors on initial load', async ({ page }) => {
    const errors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Filter out network errors (which are OK)
    const nonNetworkErrors = errors.filter(error => {
      const lowerError = error.toLowerCase();
      return !lowerError.includes('network') &&
             !lowerError.includes('fetch') &&
             !lowerError.includes('failed to fetch') &&
             !lowerError.includes('net::') &&
             !lowerError.includes('cors');
    });

    expect(nonNetworkErrors).toHaveLength(0);
  });

  test('page header contains Taiwan Bus text', async ({ page }) => {
    const header = page.locator('h1#page-title');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Taiwan Bus');
  });

  test('sheet handle and summary exist (mobile UI)', async ({ page }) => {
    const sheetHandle = page.locator('.sheet-handle');
    const sheetPill = page.locator('.sheet-pill');
    const sheetSummary = page.locator('#sheet-summary');

    // These elements exist in DOM (even if hidden on desktop)
    await expect(sheetHandle).toHaveCount(1);
    await expect(sheetPill).toHaveCount(1);
    await expect(sheetSummary).toHaveCount(1);
  });

  test('stop selectors are hidden initially', async ({ page }) => {
    const stopSelectors = page.locator('#stop-selectors');
    await expect(stopSelectors).toBeHidden();
  });

  test('route stop list exists', async ({ page }) => {
    const routeStopList = page.locator('#route-stop-list');
    await expect(routeStopList).toBeVisible();

    // Should show default message
    const noSchedule = routeStopList.locator('.no-schedule');
    await expect(noSchedule).toBeVisible();
  });

  test('nearby stops info bar exists', async ({ page }) => {
    // Switch to Nearby Stops tab
    const nearbyTab = page.locator('.tab-btn[data-tab="nearby"]');
    await nearbyTab.click();

    const infoBar = page.locator('#info-bar');
    await expect(infoBar).toBeVisible();
  });

  test('nearby stops list exists', async ({ page }) => {
    // Switch to Nearby Stops tab
    const nearbyTab = page.locator('.tab-btn[data-tab="nearby"]');
    await nearbyTab.click();

    const stopList = page.locator('#stop-list');
    await expect(stopList).toBeVisible();
  });

  test('float button container exists with buttons', async ({ page }) => {
    const floatContainer = page.locator('.float-btn-container');
    await expect(floatContainer).toBeVisible();

    const langBtn = floatContainer.locator('.lang-btn');
    const locateBtn = floatContainer.locator('.locate-btn');

    await expect(langBtn).toBeVisible();
    await expect(locateBtn).toBeVisible();
  });

  test('responsive container layout exists', async ({ page }) => {
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    const panel = page.locator('#panel');
    const mapCanvas = page.locator('#map-canvas');

    await expect(panel).toBeVisible();
    await expect(mapCanvas).toBeVisible();
  });
});
