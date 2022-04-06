import {
  RouteComponent,
  RouteLocationNormalized,
  RouteRecordRaw,
  RouteRecordRedirectOption,
  _RouteRecordBase as OriginalRouteRecordBase,
} from "vue-router";

interface _RouteRecordBase extends Omit<OriginalRouteRecordBase, "children"> {
  children?: PossibleVirtualRouteRecord[];
}

export type PossibleVirtualRouteRecord =
  | VirtualRoute
  | RouteRecordSingleView
  | RouteRecordMultipleViews
  | RouteRecordRedirect;

interface VirtualRoute extends _RouteRecordBase {
  children: PossibleVirtualRouteRecord[];
  redirect?: never;
  component?: never;
  components?: never;
}

export function isVirtualRoute(
  route: PossibleVirtualRouteRecord
): route is VirtualRoute {
  return (
    !!route.path &&
    !!route.children &&
    !(route as RouteRecordRaw).component &&
    !(route as RouteRecordRaw).components &&
    !(route as RouteRecordRaw).redirect
  );
}

// COPIED FROM VUE ROUTER, BUT EXTENDING OUR ROUTE RECORD BASE
// It's not possible to mix records with different signature for "children" property,
// so we need to redefine all records using the augmented children type we use to support virtual routes
// This is also the reason for routes casting into flatRoutes, as the underlying types are incompatible

type Lazy<T> = () => Promise<T>;

/**
 * Allowed Component definitions in route records provided by the user
 */
declare type RawRouteComponent = RouteComponent | Lazy<RouteComponent>;

type _RouteRecordProps =
  | boolean
  | Record<string, any>
  | ((to: RouteLocationNormalized) => Record<string, any>);

/**
 * Route Record defining one single component with the `component` option.
 */
declare interface RouteRecordSingleView extends _RouteRecordBase {
  /**
   * Component to display when the URL matches this route.
   */
  component: RawRouteComponent;
  components?: never;
  /**
   * Allow passing down params as props to the component rendered by `router-view`.
   */
  props?: _RouteRecordProps;
}

/**
 * Route Record defining multiple named components with the `components` option.
 */
declare interface RouteRecordMultipleViews extends _RouteRecordBase {
  /**
   * Components to display when the URL matches this route. Allow using named views.
   */
  components: Record<string, RawRouteComponent>;
  component?: never;
  /**
   * Allow passing down params as props to the component rendered by
   * `router-view`. Should be an object with the same keys as `components` or a
   * boolean to be applied to every component.
   */
  props?: Record<string, _RouteRecordProps> | boolean;
}

/**
 * Route Record that defines a redirect. Cannot have `component` or `components`
 * as it is never rendered.
 */
declare interface RouteRecordRedirect extends _RouteRecordBase {
  redirect: RouteRecordRedirectOption;
  component?: never;
  components?: never;
}
