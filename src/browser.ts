import { BrowserContext, Page, chromium } from '@playwright/test';

export class BrowserManager {
    private static instance: BrowserManager;
    private browserContext: BrowserContext | null = null;
    private page: Page | null = null;

    private constructor() { }

    static getInstance(): BrowserManager {
        if (!BrowserManager.instance) {
            BrowserManager.instance = new BrowserManager();
        }
        return BrowserManager.instance;
    }

    async initialize(userDataDir: string): Promise<{ context: BrowserContext; page: Page }> {
        if (!this.browserContext) {
            this.browserContext = await chromium.launchPersistentContext(userDataDir, {
                headless: false,
                args: ["--start-maximized"]
            });

            const pages = this.browserContext.pages();
            this.page = pages.length ? pages[0] : await this.browserContext.newPage();
        }

        return { context: this.browserContext, page: this.page };
    }

    async close(): Promise<void> {
        if (this.browserContext) {
            await this.browserContext.close();
            this.browserContext = null;
            this.page = null;
        }
    }
} 