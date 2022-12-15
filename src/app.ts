import { Application, ApplicationBuilder, ApplicationBuilderFn, HttpRequest, HttpResponse, MiddlewareFn, PathParams, RouteHandler } from "./types";

type RouteEntries = {[key:string]: RouteHandler};

interface PathMatchResult {
  path: string;
  params: PathParams
}

interface BuilderParams {
  middlewares: MiddlewareFn[];
  routes: RouteEntries
}

const pathMatch = (paths: string[], requestPath: string, prefix: string): PathMatchResult | null => {

  for(let path of paths){
    if(!path.startsWith(prefix))
      continue;

    const reqSegments = requestPath?.split('/')??[];
    const pathSegments = path.replace(new RegExp(`^${prefix}`), '').split('/');

    if(reqSegments.length != pathSegments.length)
      continue;

    const params:{[key:string]: string} = {};
    let i = 0;
    while(i < reqSegments.length){
      if(pathSegments[i] != reqSegments[i]){
        if(!pathSegments[i].startsWith(':'))
          break;

        params[pathSegments[i].replace(/^:/,'')] = reqSegments[i];
      }
      i++;
    }
    if(i == reqSegments.length)
      return {
        path,
        params
      };
  }

  return null;
}

const createBuilder = ({middlewares, routes}: BuilderParams): ApplicationBuilder => {
  const app = {
    use:(fn: MiddlewareFn) => {
      if(!!fn)
        middlewares.push(fn);
      return app;
    },
    get: (match: string, fn: MiddlewareFn | MiddlewareFn[]) => {
      match = match.replace(/^\//, '');
      routes[`get://${match}`] = fn;
      return app;
    },
    post:(match: string, fn: MiddlewareFn | MiddlewareFn[]) => {
      match = match.replace(/^\//, '');
      routes[`post://${match}`] = fn;
      return app;
    },
    all:(match: string, fn: MiddlewareFn | MiddlewareFn[]) => {
      match = match.replace(/^\//, '');
      routes[`get://${match}`] = fn;
      routes[`post://${match}`] = fn;
      return app;
    }
  };

  return app;
}

const createRequestHandelr = ({middlewares, routes}: BuilderParams): Application =>{
  return (request: HttpRequest) => {
    const response:HttpResponse = { result: null };
    for(let fn of middlewares) {
      if(response.error){
        throw new Error(response.error);
      }
  
      if(response.result){
        return response.result;
      }

      fn(request, response);
    }

    const methodPrefix = (request as any).postData !== undefined ? 'post://' : 'get://'
    const match = pathMatch(Object.keys(routes), request.pathInfo, methodPrefix);
    
    if(!match)
      throw Error(`Resource not found '${request.pathInfo}'`);

    request.pathParams = match.params;

    const fn = routes[match.path];

    if(fn instanceof Array){
      for(let f of fn){
        if(response.error)
          break;

        f(request, response);
      }
    }
    else{
      fn(request, response);
    }

    if(response.error){
      throw new Error(response.error);
    }

    if(!response.result){
      throw new Error(`Missing result for handled resource '${request.pathInfo}'`);
    }
    
    return response.result;
  }
}

export const appBuilder = (builder:ApplicationBuilderFn): Application => {
  const middlewares: MiddlewareFn[] = [];
  const routes:RouteEntries = {};

  const app = createBuilder({middlewares, routes});

  builder(app);

  return createRequestHandelr({middlewares, routes});
}

export default appBuilder;