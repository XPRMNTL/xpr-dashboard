[![XPRMNTL](https://raw.githubusercontent.com/XPRMNTL/XPRMNTL.github.io/master/images/ghLogo.png)](https://github.com/XPRMNTL/XPRMNTL.github.io)
# XPRMNTL Dashboard
[![Build Status](https://travis-ci.org/XPRMNTL/feature.svg?branch=master)](https://travis-ci.org/XPRMNTL/feature)
Dashboard component of the [XPRMNTL](https://github.com/XPRMNTL/XPRMNTL.github.io) Experiments as a Service product

## Features
The XPRMNTL dashboard is a UI for the API, which allows you to:

1. Select Github repositories to add to Experiments
2. Modify experiment configuration

The current implementation requires a Github Organization with repositories for the code and uses Github's OAuth2 strategies for authentication/authorization.


## Deployment

### Heroku
#### Automated
[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/XPRMNTL/feature/tree/master)
#### Manual
Create the Heroku repository

```sh
$ heroku apps:create
Created http://random-thing-23.herokuapp.com/ | git@heroku.com:random-thing-23.git
```


Clone the repository
```sh
$ git clone https://github.com/XPRMNTL/feature
```


Set the necessary environment variables
```sh
$ heroku config:set GITHUB_CLIENT_ID=idhere GITHUB_CLIENT_SECRET=secrethere GITHUB_ORGS=comma,separated,values BASE_URL=http://random-thing-23.herokuapp.com -a random-thing-23
```


Git push to Heroku
```sh
$ git remote add heroku git@heroku.com:random-thing-23.git
$ git push heroku master
```

## Anywhere else
Deploy it however makes you happy.

Required environment variables:

- `BASE_URL`
  - This url is the root of your application. It is used for OAuth on the server and the `<base>` tag on the client.
  - Example: "http://appname.herokuapp.com" (no trailing slash)
- `PORT`
  - The port on which the Express.js app will listen.
- `GITHUB_CLIENT_ID`
  - The OAuth ClientID obtained from github.com. When it asks for your homepage URL, use the `BASE_URL` above. Authorization callback URL is your `BASE_URL`+ "/auth/github/callback"
- `GITHUB_CLIENT_SECRET`
  - The OAuth Client secret obtained from github.com
- `GITHUB_ORGS`
  - A comma-separated (no spaces) list of Github Organizations from which to pull repos for experiments
  - Example: "heroku,github,something"
