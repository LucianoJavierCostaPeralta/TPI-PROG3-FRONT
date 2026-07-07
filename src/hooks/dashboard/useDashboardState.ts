import { useState } from 'react';
import { initialDeliveryForm, initialDriverForm } from '../../utils/dashboard/homeDashboard';
import {
  type DeliveryFilter,
  type DeliveryForm,
  type DeliveryOrder,
  type Driver,
  type DriverFilter,
  type DriverForm,
  type HomeTabKey,
} from '../../types/workspace';

export function useDashboardState() {
  const [activeTab, setActiveTab] = useState<HomeTabKey>('home');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [savingDriver, setSavingDriver] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [driverFilter, setDriverFilter] = useState<DriverFilter>('activos');
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>('todos');
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [driverForm, setDriverForm] = useState<DriverForm>(initialDriverForm);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>(initialDeliveryForm);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);

  return {
    activeTab,
    assigningOrderId,
    deliveryFilter,
    deliveryForm,
    drawerVisible,
    driverFilter,
    driverForm,
    isEditingDelivery,
    savingDelivery,
    savingDriver,
    selectedDelivery,
    selectedDriver,
    setActiveTab,
    setAssigningOrderId,
    setDeliveryFilter,
    setDeliveryForm,
    setDrawerVisible,
    setDriverFilter,
    setDriverForm,
    setIsEditingDelivery,
    setSavingDelivery,
    setSavingDriver,
    setSelectedDelivery,
    setSelectedDriver,
    setShowDeliveryForm,
    setShowDriverForm,
    setUpdatingOrderId,
    showDeliveryForm,
    showDriverForm,
    updatingOrderId,
  };
}
