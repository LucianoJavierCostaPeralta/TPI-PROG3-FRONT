import { HomeDashboardContent } from '../components/organisms';
import { HomeTemplate } from '../components/templates';
import { useHomeDashboard } from '../hooks/useHomeDashboard';
import { type HomeScreenProps } from '../types/workspace';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const dashboard = useHomeDashboard({ navigation });

  return (
    <HomeTemplate
      title={dashboard.headerNav.title}
      subtitle={dashboard.headerNav.subtitle}
      onBack={dashboard.headerNav.onBack}
      tabs={dashboard.tabs}
      activeTab={dashboard.activeTab}
      drawerVisible={dashboard.drawerVisible}
      onTabChange={dashboard.setActiveTab}
      onOpenDrawer={() => dashboard.setDrawerVisible(true)}
      onCloseDrawer={() => dashboard.setDrawerVisible(false)}
      onSignOut={dashboard.handleSignOut}
      onBellPress={() => dashboard.setActiveTab('notifications')}
      bellActive={dashboard.activeTab === 'notifications'}
      unreadCount={dashboard.unreadCount}
    >
      <HomeDashboardContent {...dashboard} />
    </HomeTemplate>
  );
}
