import { type AppWorkspace, type DeliveryFilter, type HomeTabKey } from '../../types/workspace';
import { AdminHomePanel } from './home/AdminHomePanel';
import { AdvisorHomePanel } from './home/AdvisorHomePanel';
import { DriverHomePanel } from './home/DriverHomePanel';

type HomePanelProps = {
  workspace: AppWorkspace;
  setActiveTab: (tab: HomeTabKey) => void;
  setShowDeliveryForm: (show: boolean) => void;
  setShowDriverForm: (show: boolean) => void;
  setDeliveryFilter: (filter: DeliveryFilter) => void;
  onUpdateStatus?: (orderId: string, action: string, clienteDni?: string) => Promise<void>;
  updatingOrderId?: string | null;
};

export function HomePanel({
  workspace,
  setActiveTab,
  setShowDeliveryForm,
  setShowDriverForm,
  setDeliveryFilter,
  onUpdateStatus,
  updatingOrderId,
}: HomePanelProps) {
  if (workspace.profile.rol === 'asesor') {
    return <AdvisorHomePanel workspace={workspace} />;
  }

  if (workspace.profile.rol === 'chofer') {
    return (
      <DriverHomePanel
        workspace={workspace}
        setActiveTab={setActiveTab}
        setDeliveryFilter={setDeliveryFilter}
        onUpdateStatus={onUpdateStatus}
        updatingOrderId={updatingOrderId}
      />
    );
  }

  return (
    <AdminHomePanel
      workspace={workspace}
      setActiveTab={setActiveTab}
      setShowDeliveryForm={setShowDeliveryForm}
      setShowDriverForm={setShowDriverForm}
    />
  );
}
