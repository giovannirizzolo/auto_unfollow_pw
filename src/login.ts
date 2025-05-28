import { Page, test } from '@playwright/test';
import { config } from './config';

export async function login(page: Page): Promise<void> {
    try {
        // Check if credentials are available
        if (!config.instagram.username || !config.instagram.password) {
            throw new Error('Instagram credentials not found. Please check your .env file.');
        }

        // Navigate to Instagram
        await page.goto('https://www.instagram.com/');

        // Quick check for login state with a short timeout
        const isLoggedIn = await page.evaluate(() => {
            return document.querySelector('a[href*="/direct/inbox"]') !== null;
        }).catch(() => false);


        if (isLoggedIn) {
            console.log('Already logged in to Instagram');
            test.skip();
            return;
        }

        // If not logged in, proceed with login
        await page.goto('https://www.instagram.com/accounts/login/');

        // Wait for the login form to be visible
        await page.waitForSelector('input[name="username"]');

        // Fill in the login form
        await page.fill('input[name="username"]', config.instagram.username);
        await page.fill('input[name="password"]', config.instagram.password);

        // Click the login button
        await page.click('button[type="submit"]');

        // Wait for navigation after login
        await page.waitForURL('**/instagram.com/**');

        // Handle "Save Login Info" dialog if it appears
        const saveLoginButton = page.getByRole('button', { name: /save info/i });
        if (await saveLoginButton.isVisible()) {
            await saveLoginButton.click();
        }

        // Handle "Turn on Notifications" dialog if it appears
        const notNowButton = page.getByRole('button', { name: /not now/i });
        if (await notNowButton.isVisible()) {
            await notNowButton.click();
        }

        console.log('Successfully logged in to Instagram');
    } catch (error) {
        console.error('Failed to login to Instagram:', error);
        throw error;
    }
} 