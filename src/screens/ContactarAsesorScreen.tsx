import React, { useState } from 'react';
import { View, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, type MD3Theme, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components/templates';
import { CTAButton, TextInputField } from '../components/atoms';
import { radii, spacing } from '../styles/theme';

type ContactarAsesorProps = {
  onBack: () => void;
};

export default function ContactarAsesor({ onBack }: ContactarAsesorProps) {
  const theme = useTheme<MD3Theme>();
  const styles = createStyles(theme);
  const [consulta, setConsulta] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleEnviar = () => {
    if (consulta.trim() === '') return;
    setModalVisible(true);
    setConsulta('');
  };

  return (
    <ScreenLayout
      title="Contactar asesor"
      onBack={onBack}
      scrollable={false}
      contentContainerStyle={styles.screenContent}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Escribí tu consulta y nuestros asesores se pondrán en contacto con vos.
          </Text>
        </View>

        <TextInputField
          label="Consulta"
          placeholder="Escribí tu consulta..."
          value={consulta}
          onChangeText={setConsulta}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={styles.input}
          outlineStyle={styles.inputOutline}
        />

        <View style={styles.buttonContainer}>
          <CTAButton
            variant="primary"
            onPress={handleEnviar}
            disabled={consulta.trim() === ''}
            style={styles.primaryButton}
          >
            Enviar consulta
          </CTAButton>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={3}>
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.secondary} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Consulta enviada</Text>
            <Text style={styles.modalText}>
              Un asesor se pondrá en contacto con vos.
            </Text>
            <CTAButton
              variant="primary"
              onPress={() => setModalVisible(false)}
              style={styles.modalActionButton}
            >
              Aceptar
            </CTAButton>
          </Surface>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    screenContent: {
      flex: 1,
    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      gap: spacing.lg,
    },
    header: {
      marginBottom: spacing.md,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 22,
    },
    input: {
      minHeight: 150,
    },
    inputOutline: {
      borderRadius: radii.md,
    },
    buttonContainer: {
      paddingBottom: spacing.lg,
    },
    primaryButton: {
      width: '100%',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.backdrop,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: radii.lg,
      padding: spacing.xl,
      width: '100%',
      alignItems: 'center',
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
      gap: spacing.md,
    },
    modalIcon: {
      marginBottom: spacing.xs,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      textAlign: 'center',
    },
    modalText: {
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 22,
    },
    modalActionButton: {
      width: '100%',
    },
  });
