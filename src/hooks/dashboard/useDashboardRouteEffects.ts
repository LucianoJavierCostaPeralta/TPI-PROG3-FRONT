import { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { type DeliveryOrder, type Driver, type HomeTabKey } from '../../types/workspace';

type UseDashboardRouteEffectsParams = {
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
};

export function useDashboardRouteEffects({
  activeTab,
  isEditingDelivery,
  loadWorkspace,
  selectedDelivery,
  selectedDriver,
  setActiveTab,
  setDrawerVisible,
  setIsEditingDelivery,
  setSelectedDelivery,
  setSelectedDriver,
  setShowDeliveryForm,
  setShowDriverForm,
  showDeliveryForm,
  showDriverForm,
}: UseDashboardRouteEffectsParams) {
  const params = useLocalSearchParams<{ openDrawer?: string; activeTab?: string }>();
  const router = useRouter();

  useEffect(() => {
    if (params.openDrawer === 'true') {
      setDrawerVisible(true);
      if (params.activeTab) setActiveTab(params.activeTab as HomeTabKey);
      router.setParams({ openDrawer: undefined, activeTab: undefined });
    }
  }, [params.openDrawer, params.activeTab, router, setActiveTab, setDrawerVisible]);

  useFocusEffect(
    useCallback(() => {
      void loadWorkspace();

      const handleBackPress = () => {
        if (selectedDelivery) {
          if (isEditingDelivery) setIsEditingDelivery(false);
          else setSelectedDelivery(null);
          return true;
        }
        if (selectedDriver) {
          setSelectedDriver(null);
          return true;
        }
        if (showDeliveryForm) {
          setShowDeliveryForm(false);
          return true;
        }
        if (showDriverForm) {
          setShowDriverForm(false);
          return true;
        }
        if (activeTab !== 'home') {
          setActiveTab('home');
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [activeTab, isEditingDelivery, loadWorkspace, selectedDelivery, selectedDriver, showDeliveryForm, showDriverForm]),
  );
}
