# unicen-crowdcontrol-ui

This project aims to provide a user friendly frontend web application to hide the complexities of the crowd simulation software from the users and provide a meaningful dashboard at a glance

## Notes

Raw project was generated with [yo webapp generator](https://github.com/yeoman/generator-webapp)

## Installation

1. Ensure latest [node.js](https://nodejs.org/en/download/) is installed to get access to `npm`
2. Install dependecies: `npm install -g bower gulp-cli`
3. Run `npm install` to install node modules
4. run `bower install` to install frontend dependecies


## Usage

1. Run `gulp serve` for preview
2. Run `gulp build` to build your webapp for production
3. Run `gulp serve:dist` to preview the production build

## Workflow

Since we are only using elements within the dist folder for production, the following is steps on how to ensure changes are being committed and updated into the gh-pages branch.

1. Upon making any changes, run `gulp build` to rebuild your webapp for production
2. `git add dist -f && git commit -m "<messages>"` to commit all changes to dist folder
3. 'git subtree push --prefix dist origin gh-pages'