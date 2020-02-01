Mirai
=====

Mirai is an intuitive web application for daily organizing and planning.

**CSCE 4901.070 Team Name:** Alpha

- | `master` – what's deployed | `develop` – what's code-complete
--- | --- | ---
Build | [![Build Status](https://travis-ci.com/itsmistad/Mirai.svg?branch=master)](https://travis-ci.com/itsmistad/Mirai) | [![Build Status](https://travis-ci.com/itsmistad/Mirai.svg?branch=develop)](https://travis-ci.com/itsmistad/Mirai)
Version | - | 0.0.1
Live Url | - | -

Here's what it does:

1. 🤯 -- This need to be filled in. Sorry!

This code is open-source under the [MIT License](https://opensource.org/licenses/MIT).

#### Contributors
> [itsmistad](https://github.com/itsmistad/) - Derek Williamson
> 
> [tylercarey98](https://github.com/TylerCarey98) - Tyler Carey
>
> [apikus](https://github.com/apikus) - Anna Pikus
>
> [anguyen122](https://github.com/anguyen122) - Anthony Nguyen

## Development
### Requirements

1. bash (for Windows users, this can be obtained from GitBash or cmder)
2. [Node.js](https://nodejs.org/en/download/)
3. [MongoDB](https://www.mongodb.com/download-center/community)

## Setup

#### npm Packages

Download and install [Node.js](https://nodejs.org/en/download/) (which comes packaged with npm).
Run this command in the base directory of the repository:
> `npm install`

Your local repository should now be up-to-date with all the required packages for the application.

#### MongoDB

Download and install [MongoDB Community Server](https://www.mongodb.com/download-center/community).
Keep all settings as default during installation.

Your local database should now be up-and-running with the following connection string:
`mongodb://localhost:27017`

## Testing

From the base directory of the repo, run this to execute all tests:
> `npm test`

## Executing

Navigate to `./scripts/` and execute this script to (1) run any necessary migrations, (2) run all unit tests, and (3) start a local Mirai instance:
> `./start.sh`

Execute this script to start gulp with the BrowserSync and Sass tasks:
> `./watch.sh`

Your local instance of Mirai should be running and accessible at the following address:
`http://localhost:3000/`