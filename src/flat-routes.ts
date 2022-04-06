import { RouteRecordRaw } from "vue-router";
import { PossibleVirtualRouteRecord, isVirtualRoute } from "./virtual-route";

function applyPrefix(prefix: string, routes: PossibleVirtualRouteRecord[]) {
  return routes.map((route) => {
    route.path = prefix + "/" + route.path;
    return route;
  });
}

export function flatRoutes(
  routes: PossibleVirtualRouteRecord[]
): RouteRecordRaw[] {
  const flattenedRoutes: RouteRecordRaw[] = [];

  for (const route of routes) {
    if (isVirtualRoute(route)) {
      // Flat the logical nesting and call recursion
      flattenedRoutes.push(
        ...flatRoutes(applyPrefix(route.path, route.children))
      );
    } else {
      if (!route.children || route.children.length === 0) {
        flattenedRoutes.push(route as RouteRecordRaw);
      } else {
        // Keep the nesting level but call recursion on children
        route.children = flatRoutes(
          route.children
        ) as PossibleVirtualRouteRecord[];
        flattenedRoutes.push(route as RouteRecordRaw);
      }
    }
  }

  return flattenedRoutes;
}
