/**
 * Things we need
 * 
 * Register components into the app for a specific group/type/extension point
 * Retrieve components from the app for a specific group/type/extension point,
 *   - hook style
 * 
 */

import { HomeIcon } from "@backstage/core-icons";

// Somewhere in core code...
const sidebarItemExtensionPointRef = createExtensionPoint(
  id: 'core.sidebarItem',
  config: z.object({
    icon: React.Element,
    to: z.string(),
    text: z.string(),
  }),
);

/** Sidebar */
export const Sidebar = () => {
    const { extensions: sidebarItems } = useExtensionPoint(sidebarItemExtensionPointRef);

    return (
      <SidebarWrapper>
        {sidebarItems}
      </SidebarWrapper>
    );
};
/** End of sidebar*/

/** @public */
export const catalogPlugin = createPlugin({
  pluginId: "catalog",
  extensions: [
    createExtensionFactory({
      extensionPoint: sidebarItemExtensionPointRef,
      factory: (_config, deps) => {
        if (!deps.rbacWhatever.isRbacAdmin()) {
          return null;
        }

        return [
          {
            config: {
              icon: HomeIcon,
              to: "catalog",
              text: "Home",
            }
          },
        ];
        // <SidebarItem
        //   icon={HomeIcon}
        //   to="catalog"
        //   text="Home"
        //   {...config.props}
        // />
      ),
    }),
  ],
  apis: [
    createApiFactory({
      api: catalogApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CatalogClient({ discoveryApi, fetchApi }),
    }),
    createApiFactory({
      api: starredEntitiesApiRef,
      deps: { storageApi: storageApiRef },
      factory: ({ storageApi }) =>
        new DefaultStarredEntitiesApi({ storageApi }),
    }),
  ],
  routes: {
    catalogIndex: rootRouteRef,
    catalogEntity: entityRouteRef,
  },
  externalRoutes: {
    createComponent: createComponentRouteRef,
    viewTechDoc: viewTechDocRouteRef,
  },
  __experimentalConfigure(
    options?: CatalogInputPluginOptions
  ): CatalogPluginOptions {
    const defaultOptions = {
      createButtonTitle: "Create",
    };
    return { ...defaultOptions, ...options };
  },
});

// // 
// export const catalogPlugin = createBackendPlugin({
//   pluginId: "catalog",
//   register(env) {
//     const processingExtensions = new CatalogExtensionPointImpl();
//     // plugins depending on this API will be initialized before this plugins init method is executed.
//     env.registerExtensionPoint(
//       catalogProcessingExtensionPoint,
//       processingExtensions
//     );

//     env.registerInit({
//       deps: {
//         logger: coreServices.logger,
//         config: coreServices.config,
//         reader: coreServices.urlReader,
//         permissions: coreServices.permissions,
//         database: coreServices.database,
//         httpRouter: coreServices.httpRouter,
//         lifecycle: coreServices.lifecycle,
//         scheduler: coreServices.scheduler,
//       },
//       async init({
//         logger,
//         config,
//         reader,
//         database,
//         permissions,
//         httpRouter,
//         lifecycle,
//         scheduler,
//       }) {
//         const winstonLogger = loggerToWinstonLogger(logger);
//         const builder = await CatalogBuilder.create({
//           config,
//           reader,
//           permissions,
//           database,
//           scheduler,
//           logger: winstonLogger,
//         });
//         builder.addProcessor(...processingExtensions.processors);
//         builder.addEntityProvider(...processingExtensions.entityProviders);
//         const { processingEngine, router } = await builder.build();

//         await processingEngine.start();
//         lifecycle.addShutdownHook(() => processingEngine.stop());
//         httpRouter.use(router);
//       },
//     });
//   },
// });
