import { RouteConfig } from "vue-router";

function shouldFlatRoute(route: RouteConfig) {
  return route.path && route.children && !(route as any).component;
}

function applyPrefix(prefix: string, routes: RouteConfig[]) {
  return routes.map((route) => {
    route.path = prefix + "/" + route.path;
    return route;
  });
}

export function flatRoutes(routes: RouteConfig[]): RouteConfig[] {
  const flattenedRoutes: RouteConfig[] = [];

  for (const route of routes) {
    if (!route.children || route.children.length === 0) {
      flattenedRoutes.push(route);
    } else {
      if (shouldFlatRoute(route)) {
        // Flat the logical nesting and call recursion
        flattenedRoutes.push(
          ...flatRoutes(applyPrefix(route.path, route.children))
        );
      } else {
        // Keep the nesting level but call recursion on children
        route.children = flatRoutes(route.children);
        flattenedRoutes.push(route);
      }
    }
  }

  return flattenedRoutes;
}
