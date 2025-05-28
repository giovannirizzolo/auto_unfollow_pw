# Auto unfollow PW

Playwright suite to unfollow people with no effort

## ⚠️ Disclaimer


## Purpose

This Playwright suite is intended to be used to automatize the process of removing people who don't follow you back on Instagram (in the future also for other social medias)

## Getting Started

    ‼️ BEFORE GETTING STARTED, PLEASE ENSURE YOUR ACCOUNT 2FA IS DISABLED, SO THE LOGIN PROCESS CAN HAPPEN SMOOTHLY.

    REACTIVATE 2FA WHEN YOU'RE DONE, TO KEEP YOU ACCOUNT SAFE
    

### How to get your Instagram data

In order to access information about your instagram account data, you must submit a request using Meta Accounts Center, that you can access by going under `Settings > See More in Accounts Center`

or by visiting the link [https://accountscenter.instagram.com/](https://accountscenter.instagram.com/).

Once you get in you can download you information in few simple steps:

1. On the side menu click on **Your information and permissions**.
2. Select **Download your information > Download or transfer information**.
3. Select your Instagram account.
4. Choose to download **Some of your information**.
5. Scroll down until you find **Followers and following** under the **Connections** section, so check it then click **Next**.
6. Select **Download to device**.
7. Choose the **Date range** for your data
8. Specify the email you want your data to be sent to under **Notify**.
9. Choose **JSON** as **Format** and Media quality to Low.
10. Click on **Create files**

Now you just have to wait that your data are processed by Meta so that that you can use it inside the Auto Unfollow PW Suite.

### Compare JSON files to extract usernames

When you get your data from Meta, you can use this repo... [TBD]


## How to run it

Follow these steps to setup the env to work correctly with your account data:

- Create a `lists/not_following_back.txt` file where to add the list of IG usernames who don't follow you back
  - The usernames must be one per line like:

        first_user
        second_user
        third_user
        

To get started with the automations you should:

 1. Fill the `.env` file with your Instagram **username** and **password** (leave the other values as they are if you don't have specific testing purposes)
 2. Run the test suite using `npm run testui`
 3. Click on the play button on `example.spec.ts`
