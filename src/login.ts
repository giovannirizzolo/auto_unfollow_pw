import { Page } from '@playwright/test';
import { config } from './config';
import { test } from '@playwright/test';

export async function login(page: Page) {
    // Check if we're already logged in
    const isLoggedIn = await page.evaluate(() => {
        const inboxLink = document.querySelector('a[href="/direct/inbox/"]');
        return !!inboxLink;
    });

    if (!isLoggedIn) {
        console.log('Not logged in, proceeding with login...');
        // Check if we have credentials
        if (!config.instagram.username || !config.instagram.password) {
            throw new Error('Instagram credentials not found. Please check your .env file.');
        }

        // Navigate to Instagram
        await page.goto('https://www.instagram.com');

        // Handle cookie consent if present
        try {
            const cookieButton = page.getByRole('button', { name: /decline|reject|only essential/i });
            if (await cookieButton.isVisible({ timeout: 5000 })) {
                console.log('Handling cookie consent...');
                await cookieButton.click();
                await page.waitForTimeout(1000); // Wait for cookie dialog to close
            }
        } catch (error) {
            console.log('No cookie consent dialog found, continuing...');
        }

        // Wait for the login form
        await page.waitForSelector('input[name="username"]');
        await page.waitForSelector('input[name="password"]');

        // Fill in credentials
        await page.fill('input[name="username"]', config.instagram.username);
        await page.fill('input[name="password"]', config.instagram.password);

        // Click login button
        await page.click('button[type="submit"]');

        // Wait for navigation after login with more specific patterns
        try {
            await Promise.race([
                page.waitForURL('**/instagram.com/accounts/onetap/**', { timeout: 30000 }),
                page.waitForURL('**/instagram.com/**', { timeout: 30000 })
            ]);
        } catch (error) {
            console.log('Navigation timeout, checking current URL...');
        }

        // Handle onetap URL if present
        if (page.url().includes('/accounts/onetap/')) {
            console.log('Handling onetap URL...');
            await page.waitForTimeout(2000); // Wait for any redirects
            await page.goto('https://www.instagram.com/');
        }

        // Wait for the inbox link to be visible (indicates successful login)
        try {
            await page.waitForSelector('a[href="/direct/inbox/"]', { timeout: 10000 });
            console.log('Successfully logged in');
        } catch (error) {
            console.error('Failed to detect successful login. Current URL:', page.url());
            throw new Error('Login verification failed');
            return
        }
    } else {
        console.log('Already logged in');
        test.skip();
    }
} 