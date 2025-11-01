import { test, expect } from '@playwright/test';
import { login } from '../src/login';
import { BrowserManager } from '../src/browser';
import { UserListManager } from '../src/userList';
import path from 'path';

// Helper function to check user page status
async function checkUserPageStatus(page, username: string) {
  // Check for various page states that would prevent unfollowing
  const checks = [
    { selector: 'text=Sorry, this page isn\'t available', reason: 'Page not available' },
    { selector: 'text=Requested', reason: 'Private account' },
    { selector: 'text=User not found', reason: 'User not found' },
    { selector: 'text=No posts yet', reason: 'Account may be restricted' }
  ];

  for (const check of checks) {
    const isVisible = await page.locator(check.selector).isVisible({ timeout: 2000 });
    if (isVisible) {
      return { available: false, reason: check.reason };
    }
  }

  return { available: true, reason: null };
}


const userDataDir = path.join(process.cwd(), '.playwright-user-data');
let page;


test.beforeAll(async () => {
  const browserManager = BrowserManager.getInstance();
  const { page: browserPage } = await browserManager.initialize(userDataDir);
  page = browserPage;

  // Navigate to Instagram
  await page.goto('https://www.instagram.com');

  // Load users list
  const userListManager = UserListManager.getInstance();
  await userListManager.loadUsers("lists/not_following_back.txt");
})

test.afterAll(async () => {
  // Ensure unavailable users are saved even if test fails
  const userListManager = UserListManager.getInstance();
  const unavailableUsers = userListManager.getUnavailableUsers();

  if (unavailableUsers.length > 0) {
    await userListManager.saveUnavailableUsers();
    console.log(`Final save: ${unavailableUsers.length} unavailable users saved to lists/unavailable_users.txt`);
  }
})


// test('user-pwd pass correctly', async () => {
//   // Expect a title "to contain" a substring.
//   expect(page).toHaveTitle(/Instagram/);

//   const userNameInput = page.locator("#loginForm > div > div:nth-child(1) > div > label > input")
//   const passwordInput = page.locator("#loginForm > div > div:nth-child(2) > div > label > input[name=password]")
//   const loginBtn = page.locator("#loginForm > div > div:nth-child(3)")

//   const allowCookiesBtn = page.getByText("Allow all cookies")
//   const otpInput = page.locator("input[name=verificationCode]")


//   // expect(allowCookiesBtn).toBeVisible

//   // await allowCookiesBtn.click({
//   //   force: true
//   // })
//   expect(userNameInput).toBeVisible && expect(passwordInput).toBeVisible
//   await userNameInput.fill("user")
//   await passwordInput.fill("pwd")

//   expect(loginBtn).toBeEnabled

//   await loginBtn.click()

//   await page.waitForTimeout(20000)

// });

// test('otp code pass successfully', async () => {
//   expect(page).toHaveURL(new RegExp("https:\/\/www\.instagram\.com\/accounts\/login\/two_factor\?.*"))
//   const continueBtn = page.getByText('Confirm')

//   expect(continueBtn).toBeVisible

//   await continueBtn.waitForEvent('click')


//   await page.waitForURL('.*next')


// })
test('login to instagram', async () => {
  await login(page)
})

test('Navigate to profile page', async () => {
  const userListManager = UserListManager.getInstance();
  const usersList = userListManager.getUsers();
  let processedCount = 0;
  let unfollowedCount = 0;

  for (const user of usersList) {
    processedCount++;
    console.log(`\n🔍 Processing user ${processedCount}/${usersList.length}: ${user}`);

    try {
      await page.goto(`https://www.instagram.com/${user}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000); // Increased wait time for page load

      // Check if the user page is available
      const pageStatus = await checkUserPageStatus(page, user);
      if (!pageStatus.available) {
        console.log(`❌ ${pageStatus.reason} for user: ${user}`);
        userListManager.addUnavailableUser(user, pageStatus.reason);
        continue;
      }

      // Look for Following button (try multiple variations)
      let followingButton = page.getByRole('button', { name: 'Following Down chevron icon' });
      let isFollowingVisible = await followingButton.isVisible({ timeout: 2000 });

      if (!isFollowingVisible) {
        // Try alternative Following button text
        followingButton = page.getByRole('button', { name: 'Following' });
        isFollowingVisible = await followingButton.isVisible({ timeout: 2000 });
      }

      if (!isFollowingVisible) {
        // Try finding any button that contains "Following"
        followingButton = page.locator('button:has-text("Following")');
        isFollowingVisible = await followingButton.isVisible({ timeout: 2000 });
      }

      if (!isFollowingVisible) {
        // Check if there's a "Requested" button (pending follow request)
        const requestedButton = page.getByRole('button', { name: 'Requested' });
        const isRequestedVisible = await requestedButton.isVisible({ timeout: 2000 });

        if (isRequestedVisible) {
          console.log(`❌ Follow request pending for user: ${user}`);
          userListManager.addUnavailableUser(user, 'Follow request pending');
          continue;
        }

        // Check if we're simply not following them
        const followButton = page.getByRole('button', { name: 'Follow' });
        const isFollowVisible = await followButton.isVisible({ timeout: 2000 });

        if (isFollowVisible) {
          console.log(`❌ Not following user: ${user}`);
          userListManager.addUnavailableUser(user, 'Not following this user');
          continue;
        }

        console.log(`❌ Cannot find Following button for user: ${user}`);
        userListManager.addUnavailableUser(user, 'Following button not found');
        continue;
      }

      // Proceed with unfollowing
      console.log(`📝 Clicking Following button for user: ${user}`);
      expect(followingButton).toBeAttached();
      expect(followingButton).toBeVisible();
      await followingButton.click();

      // Wait for the unfollow dialog to appear
      await page.waitForTimeout(1000);

      const unfollowButton = page.getByRole('button', { name: 'Unfollow' });
      const isUnfollowVisible = await unfollowButton.isVisible({ timeout: 5000 });

      if (!isUnfollowVisible) {
        console.log(`❌ Unfollow button not found in dialog for user: ${user}`);
        userListManager.addUnavailableUser(user, 'Unfollow button not found in dialog');
        continue;
      }

      console.log(`🔘 Clicking Unfollow button for user: ${user}`);
      expect(unfollowButton).toBeAttached();
      expect(unfollowButton).toBeVisible();

      // Force the click if needed and wait for any potential confirmation dialogs
      await unfollowButton.click({ force: true });

      // Check if there's a confirmation dialog (some accounts might have this)
      await page.waitForTimeout(500);
      const confirmUnfollowButton = page.getByRole('button', { name: 'Unfollow' });
      const hasConfirmDialog = await confirmUnfollowButton.isVisible({ timeout: 2000 });

      if (hasConfirmDialog) {
        console.log(`🔄 Confirmation dialog appeared, clicking final Unfollow for user: ${user}`);
        await confirmUnfollowButton.click({ force: true });
      }

      // Wait for the action to complete and verify success
      await page.waitForTimeout(2000);

      // Check if the button changed back to "Follow" (indicating successful unfollow)
      const followButton = page.getByRole('button', { name: 'Follow' });
      const unfollowSuccessful = await followButton.isVisible({ timeout: 3000 });

      if (unfollowSuccessful) {
        unfollowedCount++;
        console.log(`✅ Successfully unfollowed user: ${user} (${unfollowedCount} unfollowed so far)`);
      } else {
        console.log(`⚠️ Unfollow may not have completed for user: ${user} - button state unclear`);
        userListManager.addUnavailableUser(user, 'Unfollow action unclear - button state not changed');
      }

      // Additional wait between users to avoid rate limiting
      await page.waitForTimeout(1000);

    } catch (error) {
      console.log(`❌ Error processing user ${user}:`, error.message);
      userListManager.addUnavailableUser(user, `Error: ${error.message}`);
      continue;
    }
  }

  // Save unavailable users to file
  await userListManager.saveUnavailableUsers();

  const unavailableUsers = userListManager.getUnavailableUsers();
  console.log(`\n📊 Summary:`);
  console.log(`   Total users processed: ${processedCount}`);
  console.log(`   Successfully unfollowed: ${unfollowedCount}`);
  console.log(`   Unavailable/Skipped: ${unavailableUsers.length}`);

  if (unavailableUsers.length > 0) {
    console.log(`\n❌ Unavailable users saved to: lists/unavailable_users.txt`);
    unavailableUsers.forEach(entry => {
      console.log(`   ${entry.username} - ${entry.reason}`);
    });
  }
})

