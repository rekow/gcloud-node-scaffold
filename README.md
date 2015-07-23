# gcloud-node-scaffold

a very simple scaffold for node projects running on google cloud platform.

super customized to my usecase, but i don't want to pay for private npm modules, so.

## installing

`npm install -g gcloud-node-scaffold`

## usage

`gcloud-node-scaffold [--options] [project-id]`

options can be any of the following:

    -a, --author      Author information.
    -d, --directory   Target directory for new project. Defaults to project ID.
    -h, --help        Print this message and exit.
    -p, --project     ID of the project in the Google Cloud Platform console.
    -v, --version     Optional project version string. Defaults to "1.0.0".

the `project-id` positional arg is equivalent to `--project`. if both are provided, `--project` will be ignored.

the tool will prompt for any required values not provided.

## running the app

once scaffold is finished, `cd` to the project directory and run `npm install` to install dependencies. then run with `npm start` and visit `http://localhost:8080` to see the default landing page.

## configuration

By default, sessions and OAuth2 are disabled pending configuration:

- to enable OAuth set the correct values for [`clientId`](https://github.com/davidrekow/gcloud-node-scaffold/tree/master/src/sensitive.js#L6) and [`clientSecret`](https://github.com/davidrekow/gcloud-node-scaffold/tree/master/src/sensitive.js#L7) properties, then uncomment the [OAuth2 middleware init](https://github.com/davidrekow/gcloud-node-scaffold/tree/master/src/app.js#L33)
- to enable sessions set the value of [`sessionSecret`](https://github.com/davidrekow/gcloud-node-scaffold/tree/master/src/sensitive.js#L8), then uncomment the [session middleware init](https://github.com/davidrekow/gcloud-node-scaffold/tree/master/src/app.js#L33)

## scaffold

the following files will be populated, using user-provided values (see [the src folder](https://github.com/davidrekow/gcloud-node-scaffold/tree/master/src/) to explore in more detail):
    
    [project dir]
      ├── .dockerignore
      ├── .gitignore
      ├── Dockerfile
      ├── LICENSE
      ├── README.md
      ├── app.js
      ├── app.yaml
      ├── assets
      │   ├── css
      │   │   ├── lib
      │   │   │   └── pure
      │   │   │       ├── base.min.css
      │   │   │       ├── buttons.min.css
      │   │   │       ├── forms.min.css
      │   │   │       ├── grid.min.css
      │   │   │       └── menus.min.css
      │   │   └── main.css
      │   └── js
      ├── config.js
      ├── lib
      │   ├── appengine.js
      │   ├── oauth2.js
      │   └── shared
      │       └── t.js
      ├── package.json
      ├── sensitive.js
      ├── services
      │   ├── fs.js
      │   └── render.js
      ├── streams
      │   ├── RenderStream.js
      │   └── index.js
      └── views
          ├── index.t
          ├── layout
          │   ├── base.t
          │   ├── main.t
          │   └── nav.t
          └── static
              └── 404.t

## stack
- [pure](https://github.com/yahoo/pure) css grid & basic styles
- [t+](https://github.com/davidrekow/t) for isomorphic templating (new repo coming soon).
- take a look at the [package.json](https://github.com/davidrekow/gcloud-node-scaffold/tree/master/package.json) for any other dependencies.
