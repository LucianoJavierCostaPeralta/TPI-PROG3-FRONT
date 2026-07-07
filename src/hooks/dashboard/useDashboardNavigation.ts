import { useDashboardRouteEffects } from './useDashboardRouteEffects';
import { useDashboardHeaderNav } from './useDashboardHeaderNav';
import { type AppWorkspace, type DeliveryOrder, type Driver, type HomeTabKey } from '../../types/workspace';

type UseDashboardNavigationParams = {
  activeTab: HomeTabKey;
  isEditingDelivery: boolean;
  loadWorkspace: () => Promise<void>;
  selectedDelivery: DeliveryOrder | null;
  selectedDriver: Driver | null;
  setActiveTab: React.Dispatch<React.SetStateAction<HomeTabKey>>;
  setDrawerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingDelivery: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDelivery: React.Dispatch<React.SetStateAction<DeliveryOrder | null>>;
  setSelectedDriver: React.Dispatch<React.SetStateAction<Driver | null>>;
  setShowDeliveryForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDriverForm: React.Dispatch<React.SetStateAction<boolean>>;
  showDeliveryForm: boolean;
  showDriverForm: boolean;
  workspace: AppWorkspace;
};

export const useDashboardNavigation = (params: UseDashboardNavigationParams) => {
  useDashboardRouteEffects(params);
  const headerNav = useDashboardHeaderNav(params);
  return { headerNav };
};
