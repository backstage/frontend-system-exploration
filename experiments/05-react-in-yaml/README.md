# React in YAML

This experiment is more or less a plan translation of the
[base app](../00-base/App.tsx) to YAML. It's not a proposed solution for
declarative integration, but more of a potential direction to head towards.

Every Backstage app is a large tree of routing, layout, logic, extensions and
components. This kind of approach uses a deep YAML structure to represent that
tree. The exact structure of the tree itself is fairly visible, but it's still
hard to get an overview of what the app looks like. In particular there is a lot
of duplication and it seems to be difficult for plugins to provide powerful
defaults with this kind of approach.
