export type PathParams = {[key:string]: string};
export type HttpRequest = (GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost) 
  & { pathParams?: PathParams };
export type HttpOutput = GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput;
export interface HttpResponse {
  result: HttpOutput | null;
  error?: string | null;
}

export type MiddlewareFn = (request:HttpRequest, response: HttpResponse) => void;
export type RouteHandler = MiddlewareFn | MiddlewareFn[];

export interface ApplicationBuilder {
  use(fn:MiddlewareFn): this;
  get(match:string, fn:RouteHandler): this;
  post(match:string, fn:RouteHandler): this;
  all(match:string, fn:RouteHandler): this;
}

export type Application = (request:HttpRequest) => HttpOutput;

export type ApplicationBuilderFn = (builder: ApplicationBuilder) => void;