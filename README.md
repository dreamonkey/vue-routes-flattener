# Vue-routes-flattener

This is a [NPM Package(PKG)](https://www.npmjs.com/package/package)
It automatically manage parent paths that doesn't have any component.
This feature is not currently available in (vue router)[https://router.vuejs.org]. You can read more on this (issue)[https://github.com/vuejs/vue-router/issues/745].
Using this PKG should not affect the standard vue-router behavior it only adds a useful feature.

## Install

```bash
yarn add -D @dreamonkey/vue-routes-flattener
```

## Use Vue Routes

To benefit of this PKG main feature you should have or need some nested routes.
Suppose you have a project with these pages:

- Home -> '' or '/home'
- Contacts -> '/contacts
- Location-new-york -> '/locations/new-york'
- Location-los-angeles -> '/locations/los-angeles'
- Location-italy -> '/locations/italy'

Also suppose that you don't need some kind of a 'location' layout.
The correct way to set up your routes would be:

```js
// src/router/routes.

import { RouteConfig } from "vue-router";

const routes: RouteConfig[] = [
  {
    path: "/",
    component: () => import("layouts/main-layout.vue"),
    children: [
      { path: "", component: () => import("pages/home.vue") },
      { path: "home", component: () => import("pages/home.vue") },
      {
        path: "locations/new-york",
        component: () => import("pages/new-york.vue"),
      },
      {
        path: "locations/los-angeles",
        component: () => import("pages/los-angeles.vue"),
      },
      {
        path: "locations/italy",
        component: () => import("pages/italy.vue"),
      },
      {
        path: "contacts",
        component: () => import("pages/contacts.vue"),
      },
    ],
  },

  {
    path: "*",
    component: () => import("pages/error404.vue"),
  },
];

export default routes;
```

## Use

This AE allows to:

```js
// src/router/routes.

import { RouteConfig } from "vue-router";

const routes: RouteConfig[] = [
  {
    path: "/",
    component: () => import("layouts/main-layout.vue"),
    children: [
      { path: "", component: () => import("pages/home.vue") },
      { path: "home", component: () => import("pages/home.vue") },
      {
        path: "locations", // <-- Notice
        children: [
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

  {
    path: "*",
    component: () => import("pages/error404.vue"),
  },
];

export default routes;
```

Using an empty parent will generate an error so you need to intercept the route before it's used by the vue router:

```js
// src/router/index.js

import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./routes";
import flatRoutes from "@dreamonkey/vue-routes-flattener"; //<-- Notice the import
Vue.use(VueRouter);

export default function () {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes: flatRoutes(routes), //<------------------- Notice flatRoutes()

    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
  });

  return Router;
}
```

## Why is not implemented in vue router

Currently you can't find a builtin implementation that permits you to have a void parent.

To understand how vue router's mechanism works don't compare it with folders because urls were designed to react different from path.

Let's try to build a website's page system using the folder mentality replicating the example above.
So on your desktop create an empty Folder(`F`) called 'Project' and put inside the pages that are the same as files(`f`).

```
-Project(F)
|
|--Home(f)
|--Contacts(f)
|--Location-new-york(f)
|--Location-los-angeles(f)
|--Location-italy(f)
```

You can already spot a problem which is `how can i represent the main-layout?`.
The `main-layout` is not a simple folder where you can put files inside. Instead is a real entity that should be added to all your pages which we will call `router outlet`(`O`).

```
-Project(F)
|
|--Main-layout(O)
  |
  |--Home(f)
  |--Contacts(f)
  |--Location-new-york(f)
  |--Location-los-angeles(f)
  |--Location-italy(f)
```

But you still want a way to represent folders so you can have some sort of a page container rather then something that host them.

```
-Project(F)
|
|--Main-layout(O)
  |
  |--Home(f)
  |--Contacts(f)
  |--Locations(O)
    |
    |--New-york(f)
    |--Los-angeles(f)
    |--Italy(f)
```

This example imposes you to have a router outlet page that you don't need.

Also if you want a single page called `Locations` where you have all the links to all location page the only way to achieve this with vue router is to separately create all the page without any outlet page loosing the grouping benefit.

With this PKG you'll need to add a `route` object with an empty path( '' ) inside:

```js
// src/router/routes.

import { RouteConfig } from "vue-router";

const routes: RouteConfig[] = [
  {
    path: "/",
    component: () => import("layouts/main-layout.vue"),
    children: [
      { path: "", component: () => import("pages/home.vue") },
      { path: "home", component: () => import("pages/home.vue") },
      {
        path: "locations",
        children: [
          { path: "", component: () => import("pages/location.vue") }, //<-- Notice that
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

  {
    path: "*",
    component: () => import("pages/error404.vue"),
  },
];

export default routes;
```

## License

MIT
