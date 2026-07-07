import { useMemo } from 'react';
import { getTitle } from '../../utils/homeDashboard';
import { type AppWorkspace, type DeliveryOrder, type Driver, type HomeTabKey } from '../../types/workspace';

type UseDashboardHeaderNavParams = {
  activeTab: HomeTabKey;
  isEditingDelivery: boolean;
  selectedDelivery: DeliveryOrder | null;
  selectedDriver: Driver | null;
  setActiveTab: React.Dispatch<React.SetStateAction<HomeTabKey>>;
  setIsEditingDelivery: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDelivery: React.Dispatch<React.SetStateAction<DeliveryOrder | null>>;
  setSelectedDriver: React.Dispatch<React.SetStateAction<Driver | null>>;
  setShowDeliveryForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDriverForm: React.Dispatch<React.SetStateAction<boolean>>;
  showDeliveryForm: boolean;
  showDriverForm: boolean;
  workspace: AppWorkspace;
};

export function useDashboardHeaderNav({
  activeTab,
  isEditingDelivery,
  selectedDelivery,
  selectedDriver,
  setActiveTab,
  setIsEditingDelivery,
  setSelectedDelivery,
  setSelectedDriver,
  setShowDeliveryForm,
  setShowDriverForm,
  showDeliveryForm,
  showDriverForm,
  workspace,
}: UseDashboardHeaderNavParams) {
  const subtitle = useMemo(() => {
    if (workspace.profile.rol === 'asesor') return 'Panel de asesores.';
    if (workspace.profile.rol === 'chofer') return 'Tus pedidos asignados.';
    return workspace.company?.nombre ?? 'Gestioná tu empresa, choferes y pedidos.';
  }, [workspace.company?.nombre, workspace.profile.rol]);

  return useMemo(() => {
    let title = getTitle(activeTab, workspace.profile.rol);
    let headerSubtitle = subtitle;
    let onBack: (() => void) | undefined;

    if (activeTab === 'drivers' && showDriverForm) {
      title = 'Nuevo Chofer';
      headerSubtitle = 'Registrar un conductor en la empresa';
      onBack = () => setShowDriverForm(false);
    } else if (activeTab === 'drivers' && selectedDriver) {
      title = 'Detalle de Chofer';
      headerSubtitle = 'Información de la cuenta';
      onBack = () => setSelectedDriver(null);
    } else if (activeTab === 'deliveries' && showDeliveryForm) {
      title = 'Nueva Entrega';
      headerSubtitle = 'Crear un nuevo pedido';
      onBack = () => setShowDeliveryForm(false);
    } else if (activeTab === 'deliveries' && selectedDelivery && isEditingDelivery) {
      title = 'Editar entrega';
      headerSubtitle = 'Modificar datos del pedido';
      onBack = () => setIsEditingDelivery(false);
    } else if (activeTab === 'deliveries' && selectedDelivery) {
      title = 'Detalle entrega';
      headerSubtitle = `Pedido #${selectedDelivery.id.slice(0, 8).toUpperCase()}`;
      onBack = () => setSelectedDelivery(null);
    } else if (activeTab === 'notifications') {
      title = 'Notificaciones';
      headerSubtitle = 'Alertas del sistema';
      onBack = () => setActiveTab('home');
    }

    return { title, subtitle: headerSubtitle, onBack };
  }, [activeTab, isEditingDelivery, selectedDelivery, selectedDriver, showDeliveryForm, showDriverForm, subtitle, workspace.profile.rol]);
}
