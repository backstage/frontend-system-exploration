const app = createApp({
  apis,
  plugins: Object.values(plugins),
  icons: {
    alert: AlarmIcon,
  },
  components: {
    SignInPage: (props) => (
      <SignInPage
        {...props}
        provider={{
          id: 'google',
          title: 'Google',
          message: 'Sign In using Google',
          apiRef: googleAuthApiRef,
        }}
        title="Select a sign-in method"
        align="center"
      />
    ),
  },
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
    });
  },
});

const entityWarningContent = (
  <>
    <EntitySwitch>
      <EntitySwitch.Case if={isOrphan}>
        <Grid item xs={12}>
          <EntityOrphanWarning />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasCatalogProcessingErrors}>
        <Grid item xs={12}>
          <EntityProcessingErrorsPanel />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
  </>
);

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    {entityWarningContent}

    <Grid item md={6} xs={12}>
      <EntityAboutCard variant="gridItem" />
    </Grid>

    <Grid item md={6} xs={12}>
      <EntityCatalogGraphCard variant="gridItem" height={400} />
    </Grid>

    <EntitySwitch>
      <EntitySwitch.Case if={isPagerDutyAvailable}>
        <Grid item md={6}>
          <EntityPagerDutyCard />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <Grid item md={4} xs={12}>
      <EntityLinksCard />
    </Grid>

    <EntitySwitch>
      <EntitySwitch.Case if={hasLabels}>
        <Grid item md={4} xs={12}>
          <EntityLabelsCard />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={isGithubInsightsAvailable}>
        <Grid item md={6}>
          <EntityGithubInsightsLanguagesCard />
          <EntityGithubInsightsReleasesCard />
        </Grid>
        <Grid item md={6}>
          <EntityGithubInsightsReadmeCard maxHeight={350} />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>

    <Grid item md={8} xs={12}>
      <EntityHasSubcomponentsCard variant="gridItem" />
    </Grid>
  </Grid>
);

const entityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isKind('component')}>
      <EntitySwitch>
        <EntitySwitch.Case if={isComponentType('service')}>
          <EntityLayout>
            <EntityLayout.Route path="/" title="Overview">
              {overviewContent}
            </EntityLayout.Route>

            <EntityLayout.Route path="/dependencies" title="Dependencies">
              <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12} md={6}>
                  <EntityDependsOnComponentsCard variant="gridItem" />
                </Grid>
              </Grid>
            </EntityLayout.Route>

            <EntityLayout.Route path="/code-insights" title="Code Insights">
              <EntityGithubInsightsContent />
            </EntityLayout.Route>

            <EntityLayout.Route path="/todos" title="TODOs">
              <EntityTodoContent />
            </EntityLayout.Route>

            <EntityLayout.Route path="/feedback" title="Feedback">
              <EntityFeedbackResponseContent />
            </EntityLayout.Route>
          </EntityLayout>
        </EntitySwitch.Case>

        <EntitySwitch.Case>
          <EntityLayout>
            <EntityLayout.Route path="/" title="Overview">
              {overviewContent}
            </EntityLayout.Route>

            <EntityLayout.Route path="/todos" title="TODOs">
              <EntityTodoContent />
            </EntityLayout.Route>

            <EntityLayout.Route path="/feedback" title="Feedback">
              <EntityFeedbackResponseContent />
            </EntityLayout.Route>
          </EntityLayout>
        </EntitySwitch.Case>
      </EntitySwitch>
    </EntitySwitch.Case>

    <EntitySwitch.Case if={isKind('user')}>
      <EntityLayoutWrapper>
        <EntityLayout.Route path="/" title="Overview">
          <Grid container spacing={3}>
            {entityWarningContent}

            <Grid item xs={12} md={6}>
              <EntityUserProfileCard variant="gridItem" />
            </Grid>
            <Grid item xs={12} md={6}>
              <EntityOwnershipCard
                variant="gridItem"
                entityFilterKind={customEntityFilterKind}
              />
            </Grid>
            <Grid item xs={12}>
              <EntityLikeDislikeRatingsCard />
            </Grid>
          </Grid>
        </EntityLayout.Route>
      </EntityLayoutWrapper>
    </EntitySwitch.Case>

    <EntitySwitch.Case>
      <EntityLayout>
        <EntityLayout.Route path="/" title="Overview">
          {overviewContent}
        </EntityLayout.Route>

        <EntityLayout.Route path="/todos" title="TODOs">
          <EntityTodoContent />
        </EntityLayout.Route>

        <EntityLayout.Route path="/feedback" title="Feedback">
          <EntityFeedbackResponseContent />
        </EntityLayout.Route>
      </EntityLayout>
    </EntitySwitch.Case>
  </EntitySwitch>
);

const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route
      path="/create"
      element={
        <ScaffolderPage
          groups={[
            {
              title: 'Recommended',
              filter: (entity) =>
                entity?.metadata?.tags?.includes('recommended') ?? false,
            },
          ]}
        />
      }
    >
      <ScaffolderFieldExtensions>
        <LowerCaseValuePickerFieldExtension />
      </ScaffolderFieldExtensions>
      <ScaffolderLayouts>
        <TwoColumnLayout />
      </ScaffolderLayouts>
    </Route>
    <Route
      path="/tech-radar"
      element={<TechRadarPage width={1500} height={800} />}
    />
    <Route path="/graphiql" element={<GraphiQLPage />} />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage />}>
      <SettingsLayout.Route path="/advanced" title="Advanced">
        <AdvancedSettings />
      </SettingsLayout.Route>
    </Route>
  </FlatRoutes>
);

const sidebar = (
  <Sidebar>
    <SidebarLogo />
    <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
      <SidebarSearchModal>
        {({ toggleModal }) => <SearchModal toggleModal={toggleModal} />}
      </SidebarSearchModal>
    </SidebarGroup>
    <SidebarDivider />
    <SidebarGroup label="Menu" icon={<MenuIcon />}>
      <SidebarItem icon={HomeIcon} to="catalog" text="Home" />
      <SidebarItem icon={CreateComponentIcon} to="create" text="Create..." />

      <SidebarDivider />

      <SidebarScrollWrapper>
        <SidebarItem icon={MapIcon} to="tech-radar" text="Tech Radar" />
        <SidebarItem icon={GraphiQLIcon} to="graphiql" text="GraphiQL" />
      </SidebarScrollWrapper>

      <SidebarDivider />

      <Shortcuts allowExternalLinks />
    </SidebarGroup>
    <SidebarSpace />
    <SidebarDivider />
    <SidebarGroup
      label="Settings"
      icon={<UserSettingsSignInAvatar />}
      to="/settings"
    >
      <SidebarSettings />
    </SidebarGroup>
  </Sidebar>
);

export default app.createRoot(
  <>
    <AlertDisplay transientTimeoutMs={2500} />
    <OAuthRequestDialog />
    <AppRouter>
      <SidebarPage>
        {sidebar}
        {routes}
      </SidebarPage>
    </AppRouter>
  </>
);
