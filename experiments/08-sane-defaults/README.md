# Sane Defaults

An exploration into how plugins can provide sane defaults while still allowing
for customization in the app.

We assume a certain set of [defaults](./defaults-provided-by-plugins.yaml)
provided by plugins, and then set up a challenge in
[app-config.yaml](./app-config.yaml) for how to configure a number of cards on
the overview page. There's some tricky nested ordering that makes this
non-trivial, along with the need for config overrides.

We found that by not providing cards by default, we actually simplify the
configuration a lot. It removes the need for disabling cards that we don't want,
and the ordering becomes very simple. Listing packages is a bit of a chore, and
we will likely strive to build some form of build-time discovery that
automatically brings in plugin packages into the app, at least in a default
setup.
