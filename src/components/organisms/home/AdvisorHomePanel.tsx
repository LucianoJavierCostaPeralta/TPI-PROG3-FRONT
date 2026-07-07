import { View } from 'react-native';
import { Text, Surface, useTheme, type MD3Theme } from 'react-native-paper';
import { type AppWorkspace } from '../../../types/workspace';
import { createStyles } from './HomePanel.styles';

type AdvisorHomePanelProps = {
  workspace: AppWorkspace;
};

export function AdvisorHomePanel({ workspace }: AdvisorHomePanelProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.panel}>
      <Surface style={styles.summaryCard} elevation={1}>
        <Text variant="titleMedium" style={styles.cardTitle}>Asesor</Text>
        <Text variant="headlineSmall" style={styles.primaryText}>{workspace.profile.nombre}</Text>
        <Text variant="bodyMedium" style={styles.mutedText}>Admins usando la app: {workspace.admins.length}</Text>
      </Surface>
    </View>
  );
}
