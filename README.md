# @gcanossa/gas-http-api
Google Apps Script http api microframework, inspired by expressJs.

## Installation

In order to isntall the package in your project just execute the command:
```
npm i -D @gcanossa/gas-http-api
```

## Usage

The library expose an **appBuilder** function which allows you to create and configure an http response handler for the special function events **doGet** and **doPost** of the Google Apps Script environment.

You can create and configure an **app function** and use it to handle both special events.

```ts

const app = appBuilder(builder => {
  builder
    .use((req, res)=>{
      console.log(req.contextPath)
    })
    .get('/api/:name', (req, res) => {
      respond(res).text(`Hello ${req.pathParams!.name}`);
    })
    .all('/view/:name', (req, res) => {
      respond(res).view('index.e2e', {name: req.pathParams!.name});
    })
});

function doGet(e: GoogleAppsScript.Events.DoGet){
  return app(e);
}

function doPost(e: GoogleAppsScript.Events.DoPost){
  return app(e);
}

```

It is possible to insert special segments in the mapping url pattern in the form of **:*name*** which will be matched against the real request setting the keys of the *params* member of the request object.

To build the response an helper is available wich allows and simplifies the production of text, downloadable content, json and templated html views.

```ts
interface HttpResponseHelper {
  ok():void;
  view(path:string, params:ViewParams):void;
  json(content:any):void;
  text(content:string):void;
  download(content:string, filename: string):void;
  error(error:string):void;
}

```