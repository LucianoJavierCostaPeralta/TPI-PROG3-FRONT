import { useState } from 'react';
import { initialDeliveryForm, initialDriverForm } from '../../utils/dashboard/homeDashboard';
import { type DeliveryForm, type DriverForm } from '../../types/workspace';

export const useDashboardFormState = () => {
  const [savingDriver, setSavingDriver] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [driverForm, setDriverForm] = useState<DriverForm>(initialDriverForm);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>(initialDeliveryForm);

  return {
    assigningOrderId,
    deliveryForm,
    driverForm,
    savingDelivery,
    savingDriver,
    setAssigningOrderId,
    setDeliveryForm,
    setDriverForm,
    setSavingDelivery,
    setSavingDriver,
    setUpdatingOrderId,
    updatingOrderId,
  };
};
