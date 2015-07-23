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

