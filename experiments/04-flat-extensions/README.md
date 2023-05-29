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
