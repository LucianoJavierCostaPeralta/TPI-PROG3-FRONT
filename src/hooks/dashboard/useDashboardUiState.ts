import { useState } from 'react';
import { type DeliveryFilter, type DeliveryOrder, type Driver, type DriverFilter, type HomeTabKey } from '../../types/workspace';

export const useDashboardUiState = () => {
  const [activeTab, setActiveTab] = useState<HomeTabKey>('home');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [driverFilter, setDriverFilter] = useState<DriverFilter>('activos');
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>('todos');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [isEditingDriver, setIsEditingDriver] = useState(false);

  return {
    activeTab,
    deliveryFilter,
    drawerVisible,
    driverFilter,
    isEditingDelivery,
    isEditingDriver,
    selectedDelivery,
    selectedDriver,
    setActiveTab,
    setDeliveryFilter,
    setDrawerVisible,
    setDriverFilter,
    setIsEditingDelivery,
    setIsEditingDriver,
    setSelectedDelivery,
    setSelectedDriver,
    setShowDeliveryForm,
    setShowDriverForm,
    showDeliveryForm,
    showDriverForm,
  };
};
