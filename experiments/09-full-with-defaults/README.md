# Full With Defaults

This mixes together [07-flat-entity-pages](../07-flat-entity-pages/README.md)
and the last iteration of [08-sane-defaults](../08-sane-defaults/README.md) to
create a full app.

Compared to the full config we see a massive reduction in the amount of YAML. A
lot of it is sidebar config, which we can attempt to simplify and reduce through
a separate effort.

Note that as discussed in the previous experiment, we do not install entity page
cards and content by default, they all need to be listed explicitly. We do
however install routes automatically, meaning that a top-level tool plugin
installation is as simple as `yarn add`.
