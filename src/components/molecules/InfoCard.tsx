import { StyleSheet, Text, View } from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // <-- Importamos los íconos de Expo
import { spacing, typography } from '../../styles/theme';

type InfoCardProps = {
  // Aseguramos que 'icon' reciba un nombre válido de la librería
  icon: keyof typeof MaterialCommunityIcons.glyphMap; 
  title: string;
  description: string;
};

export function InfoCard({ icon, title, description }: InfoCardProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {/* Renderizamos el componente de Ícono en lugar de Text */}
        <MaterialCommunityIcons 
          name={icon} 
          size={24} 
          color={theme.colors.primary} 
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#EDF2FC',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      paddingTop: 2,
    },
    title: {
      ...typography.bodyMd,
      color: theme.colors.onSurface,
      fontWeight: '700',
      marginBottom: 2,
    },
    description: {
      ...typography.bodyMd,
      color: '#5F6368',
      fontWeight: '400',
    },
  });