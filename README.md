## Gmail Signatures Extension

### Development

#### Prerequisites
- [NodeJS](https://nodejs.org/en/) -- The runtime the application requires

#### Setting up development environment
- Clone the repository -- `git clone `
- Change in repository directory -- `cd email-signatures`
- Install the dependencies -- `npm install`
- Build the extension -- `npm run deploy`
- Open up Google Chrome at the URL `chrome://extensions`
- Check the "Developer mode' checkbox
- Click the button 'Load unpacked extension'
- Select the 'build' folder from within the 'email-signatures' directory
- Visit https://mail.google.com and compose a new email, you should have a signature added of FT articles!

### Deploying to Chrome Webstore
- Bump the version number within './src/manifest.json' accordingly
- Build the extension -- `npm run deploy`
- Zip up the contents of './build'
- Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
- [View all items by the internal publisher](https://chrome.google.com/webstore/developer/dashboard/ua1f0874776e375813592dabc534e2d01)
- Open the [edit page for FTLabs Gmail Signatures](https://chrome.google.com/webstore/developer/edit/jolenialiljjnmhelekbmpoplemdbjjo)
- Click the 'Upload Updated Package' button
- Locate your zipped file and upload.
- Scroll to the bottom of the page and click the button 'Publish changes'