Controllers
===

As a part of the MVC implementation, Mirai uses controllers to handle the pre-compilation and rending of the view on the client's browser. Controllers use `Express` to route requests and execute accordingly.

## Creating a controller

If you haven't [created a view yet](https://github.com/itsmistad/Mirai/tree/develop/src/views#creating-a-view), do that first before creating your controller.

1. In `src/controllers/`, create the directory path that reflects the one you created for your view.
2. Create `<name>Controller.js` where `<name>` is the name of your view without ".hjs".
3. Insert the following snippet, replacing "<Page>" and "<page>" (capitalization matters!) with the name of your view without ".hjs":

> ```js
> 'use strict';
> 
> const View = require('../views/shared/view');
> 
> class <Page>Controller {
>     constructor(root) {
>         this.name = '<page>';
>     }
> 
>     async run(route, req, res) {
>         const v = new View(res, '<page>');
>         v.render({
>             title: '<Page>'
>         });
>     }
> }
> 
> module.exports = <Page>Controller;
> ```

4. In [webService.js](https://github.com/itsmistad/Mirai/blob/develop/src/services/webService.js), search for `let routes = [`.
5. Add an entry for your controller using the provided template (in this case, use `'GET'`):

> ```js
> ['/path/to/page/', '<page>Controller', 'GET' or 'POST']
> ```

6. Be sure that the first string of your entry is the path to the directory that holds the view and not the path to the view itself. `/path/to/page/` vs `/path/to/page/page.hjs`

Congratulations, your page will now render at the expected path!

## Creating and using controller variables

Often times, we'll need to pass data from the server to the client before the view renders without the need for an additional request. This can be achieved using controller variables:

1. Open your page's controller and search for `v.render({`. Here you should see `title:`. This is an example of a _required_ controller variable the `src/views/shared/layout.hjs` uses.
2. Below this, add your key-value pair that you want to be passed to the view on-render.
3. In your view, insert `{{ <key> }}` where `<key>` is the name of your variable as defined in step 2.

Your view will now render with the value of your controller variable.

## Adding additional routes to the same controller

When we need a controller to handle multiple request paths, we'll need to map multiple routes to the same controller. However, it's recommended that you never have multiple views per controller. Follow these steps to add an additional route:

1. In [webService.js](https://github.com/itsmistad/Mirai/blob/develop/src/services/webService.js), search for `let routes = [`.
2. Add another entry with the same template, but modify the first string to whatever path you want. If my original was `/path/to/page/`, you could do `/path/to/page/create`, for example.
3. In your controller, use a switch-case to split behavior based on the `route`:

> ```js
>     async run(route, req, res) {
>         const v = new View(res, '<page>');
>         switch (route) {
>         case '/path/to/page':
>             v.render({
>                 title: '<Page>'
>             });
>             break;
>         case '/path/to/page/create':
>             // Do something.
>             res.send('Hello world!');
>             break;
>         }
>     }
> ```

Done!