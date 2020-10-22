# vue-routes-flattener

This [package](https://www.npmjs.com/package/package) is meant to be used with [Vue Router](https://router.vuejs.org) and based on [this issue](https://github.com/vuejs/vue-router/issues/745).
It allows usage of grouping routes, logical routes without 'component' property meant to reduce repetition in their children paths.
This feature is purely additive and doesn't affect standard vue-router behaviour.

## Install

```bash
yarn add @dreamonkey/vue-routes-flattener
```

## Use case

Suppose you have a "MainLayout" component, containing a router outlet which displays these pages:

- MainLayout
  - Home -> '/home'
  - NewYork -> '/locations/new-york'
  - LosAngeles -> '/locations/los-angeles'
  - Italy -> '/locations/italy'
  - Contacts -> '/contacts

Also suppose you don't need a '/location' page containing a router outlet.
Your routes configuration will be:

```js
// src/router/routes.ts

import { RouteConfig } from "vue-router";

const routes: RouteConfig[] = [
  {
    path: "/",
    component: () => import("layouts/main-layout.vue"),
    children: [
      { path: "home", component: () => import("pages/home.vue") },
      {
        path: "locations/new-york", // <-- "locations" repetition
        component: () => import("pages/new-york.vue"),
      },
      {
        path: "locations/los-angeles", // <-- "locations" repetition
        component: () => import("pages/los-angeles.vue"),
      },
      {
        path: "locations/italy", // <-- "locations" repetition
        component: () => import("pages/italy.vue"),
      },
      {
        path: "contacts",
        component: () => import("pages/contacts.vue"),
      },
    ],
  },
];

export default routes;
```

## Usage

Using this package you can reduce repetitions in code, while obtaining the same configuration at runtime:

```js
// src/router/routes.ts

import { RouteConfig } from "vue-router";
import { flatRoutes } from "@dreamonkey/vue-routes-flattener"; // <-- Import from the package

const routes: RouteConfig[] = flatRoutes([
  // Apply the flattening === ^^^^^^^^^^
  {
    path: "/",
    component: () => import("layouts/main-layout.vue"),
    children: [
      { path: "home", component: () => import("pages/home.vue") },
      {
        path: "locations", // <-- Grouping route, no 'component' is defined
        children: [
          {
            path: "new-york", // <-- No repetition into child path
            component: () => import("pages/new-york.vue"),
          },
          {
            path: "los-angeles", // <-- No repetition into child path
            component: () => import("pages/los-angeles.vue"),
          },
          {
            path: "italy", // <-- No repetition into child path
            component: () => import("pages/italy.vue"),
          },
        ],
      },
      {
        path: "contacts",
        component: () => import("pages/contacts.vue"),
      },
    ],
  },
]);

export default routes;
```

If you forget to apply `flatRoutes`, Vue Router will throw an error because routes without 'component' property are not allowed.

## Why this feature is not natively available

This feature is not natively available due to [some concerns exposed by Evan You](https://github.com/vuejs/vue-router/issues/745#issuecomment-263410514).

> I think this breaks the relationship between route config nesting and router-view nesting and can make things a bit harder to reason about.

URLs/paths are based on the filesystem, with its directories and files. Directories are the entry point of a new nesting level, while files are actual content.

If you think about our example configuration into as a filesystem structure (`D` = Directory, `f` = File) you'll probably get something like:

```
-MainLayout(D)
|--Home(f)
|--Locations(D)
  |--NewYork(f)
  |--LosAngeles(f)
  |--Italy(f)
|--Contacts(f)
```

Vue Router configuration is based on router outlets instead. A router outlet open a new nesting level **and** is hosted into a component which could add content. In our comparison, the hosting component is **both** a directory and a file, and this can lead to confusing results in some edge cases.

The same example, using router outlets (`O`) as directories, would be:

```
-MainLayout(O)
|--Home(f)
|--Locations(O)
  |--NewYork(f)
  |--LosAngeles(f)
  |--Italy(f)
|--Contacts(f)
```

but this would require you to create a dummy component containing only a router outlet.
If you also need a `Locations` page, for example an index with links to other Location-related pages, you would need to either have the dummy component dynamically change its template based on the current route or get rid of the router outlet altogether, flat out all routes and put there the new index component.

The former option increases the complexity of a component which should not be there in the first place, while the latter will generate repetition and lead to a de-sync between the URL structure (as you mentally imagine it when thinking about directories) and the configuration one.

```
-Main-layout(O)
|--Home(f)
|--Locations(f)
|--Locations-NewYork(f)
|--Locations-LosAngeles(f)
|--Locations-Italy(f)
|--Contacts(f)
```

This package allows you to use "virtual" router outlets (aka grouping routes) which help you keep the configuration in sync with your directory-based mental model, then flattens the configuration at runtime.
You can also provide an "index" component (Locations page in our previous example) by specifying a child of the grouping route with an empty path (`""`):

```js
// src/router/routes.ts

import { RouteConfig } from "vue-router";
import { flatRoutes } from "@dreamonkey/vue-routes-flattener";

const routes: RouteConfig[] = flatRoutes([
  {
    path: "/",
    component: () => import("layouts/main-layout.vue"),
    children: [
      { path: "home", component: () => import("pages/home.vue") },
      {
        path: "locations", // <-- grouping route / "virtual" router outlet
        children: [
          { path: "", component: () => import("pages/locations.vue") }, // <-- "index" component
          {
            path: "new-york",
            component: () => import("pages/new-york.vue"),
          },
          {
            path: "los-angeles",
            component: () => import("pages/los-angeles.vue"),
          },
          {
            path: "italy",
            component: () => import("pages/italy.vue"),
          },
        ],
      },
      {
        path: "contacts",
        component: () => import("pages/contacts.vue"),
      },
    ],
  },
]);

export default routes;
```

## License

MIT
