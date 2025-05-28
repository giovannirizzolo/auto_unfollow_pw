import { test, expect } from '@playwright/test';
import { login } from '../src/login';
import { BrowserManager } from '../src/browser';
import { UserListManager } from '../src/userList';


const userDataDir = "/Users/grizzolo/Library/"
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
//   await userNameInput.fill("dario99__")
//   await passwordInput.fill("paktuc-rezvEv-5vofzi")

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

  for (const user of usersList) {
    await page.goto(`https://www.instagram.com/${user}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    const followButton = page.getByRole('button', { name: 'Following Down chevron icon' })

    expect(followButton).toBeAttached()
    expect(followButton).toBeVisible()
    followButton.click()

    const unfollowButton = page.getByRole('button', { name: 'Unfollow' })
    expect(unfollowButton).toBeAttached()
    expect(unfollowButton).toBeVisible()

    await page.waitForTimeout(3000)

    unfollowButton.click()
    await page.waitForTimeout(3000)
    console.log('Last unfollowd user is :>> ', user);
  }
})

