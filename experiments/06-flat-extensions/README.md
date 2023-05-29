# Flat Extensions

This experiment translates [base app](../00-base/App.tsx) into a flat YAML,
where each node in the app tree is represented as a an extension. Roughly, the
schema is as follows:

```ts
// Every part of the app is an extension with a distinct ID, all the way down to `'root'`
type ExtensionId = string;
// Extension points with `/` will use the default extension point
type ExtensionPointId = ExtensionId | `${ExtensionId}/${string}`;

interface Config {
  extensions: {
    // A map of all extension in the app
    [extensionId: ExtensionId]: {
      // The extension point at which this extension will be placed. What points are available depends on the parent extension
      at:
        | ExtensionPointId
        | ExtensionPointId[]
        | {
            point: ExtensionPointId | ExtensionPointId[];
            // Config that is provided to the parent extension point for how to integrate this extension into the parent
            config: JsonObject;
          };
      use: string; // Path to the concrete implementation of the extension
      // Config that is provided to the concrete implementation, available config depends on the implementation
      config: JsonObject;
    };
  };
}
```

The app is built out of extensions that pick an extension point that they want
to be injected at using the `at` property. Extensions provide extension points
themselves, where each extension may provide multiple different named extension
points. What extension points are available depends on the implementation
selected through `use`. A concrete extension can have any number of named
extension points, selected via the `/<point>` suffix, as well as a single
default extension point that will be used if the suffix is omitted.

Along with the parent extension point you can also provide `config` that will be
passed along to the parent concrete implementation.

A single extension can chose to be provided to multiple parent extension points
in order to avoid duplication, although they must share the same configuration.

As part of installing a plugin you may get any number of extension points
provided by default. In a typical app, most of the extensions listed in this
example would not actually be needed in practice, and instead provided as
defaults.

## Bonus Experiments

A couple of smaller experiments on top of
[`app-config.yaml`](./app-config.yaml).

### Extension Point Shorthands

Rather than needing to give every single extension instance its own ID, we could
allow for shorthand declarations of the type `<parent-id>/<point-name>`. For
example, the following:

```yaml
extensions:
  core.nav.shortcuts:
    at: core.nav/shortcuts
    use: '@backstage/plugin-shortcuts#Shortcuts'
    config:
      allowExternalLinks: true
  core.nav.settings:
    at: core.nav/settings
    use: '@backstage/plugin-user-settings#SidebarSettings'
```

Could be written as:

```yaml
extensions:
  core.nav/shortcuts:
    use: '@backstage/plugin-shortcuts#Shortcuts'
    config:
      allowExternalLinks: true
  core.nav/settings:
    use: '@backstage/plugin-user-settings#SidebarSettings'
```

The benefit of this is that lets us skip the invention of a new ID. This seems
to be particularly useful for custom leaf instances that are not provided by
default.

It's uncertain whether this would scale to deeper structures, for example could
we use `core.nav/settings/notifications`? What if there can be multiple
`settings` instances?

### Named Entity Page Switch Cases

By naming the entity page switch pages we could avoid messing around with
extension points for the entity page switching logic. We'd instead have
something in its own namespace, like:

```yaml
entity.page.switch:
  at: catalog.pages.entity
  use: '@backstage/plugin-catalog#EntitySwitch'
  config:
    pages:
      serviceComponent:
        allOf:
          - isKind: component
          - isComponentType: service
      websiteComponent:
        allOf:
          - isKind: component
          - isComponentType: website
      defaultComponent:
        isKind: component
      user:
        isKind: user
      default: {}

# The switches could be made available as extension points to configure the layout
entity.page.switch/serviceComponent:
  use: '@backstage/plugin-catalog#EntityLayout'

entity.content.todo:
  at:
    point: entity.page.switch
    config:
      title: TODOs
      path: /todos
      pages:
        serviceComponent: true
        defaultComponent: true
        default: true
  use: '@backstage/plugin-todo#EntityTodoContent'
```

A big downside of this approach would be that it's very high friction to add
custom entity pages, since every single extension for the page would need to be
reconfigured. That's already the case in the current experiment, but it is
**still** the case here.

```yaml
entity.content.todo:
  at:
    config:
      pages:
        serviceComponent: false
        websiteComponent: true
```

### Remote Entity Page Switching

Perhaps we can get rid of the entity page switch cases altogether? There are
essentially two pieces of logic solving the same problem in the app, first the
entity page switch pages contain logic for whether an extension should be
rendered, and the there's local logic for each extension too using the `is*`
pattern. This works well in TSX because the hierarchical structure is well
represented there, but with this much more flat declaration there's less to have
a logical difference between for example "user" and "component" entity pages.
What we might do instead is simply have ever individual piece of content be
responsible for its own rendering conditions, for example:

```yaml
entity.content.todo:
  at:
    point: entity.page.switch
    config:
      title: TODOs
      path: /todos
      if:
        kind: 'component'
        type: 'service'
  use: '@backstage/plugin-todo#EntityTodoContent'
```

Each extension instance defines its own conditions for when it should be
rendered. There are no "component" pages or "user" pages, just one entity page
conditionally renders all content based on the entity. The above TODO content
would be rendered only for components of type "service", but there is no
"service component page".
