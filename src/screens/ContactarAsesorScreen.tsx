import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ContactarAsesor() {
    const [consulta, setConsulta] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // Acá integrás la llamada a tu API de Render
    const handleEnviar = () => {
        if (consulta.trim() === '') return;

        // Simulación del envío exitoso
        setModalVisible(true);
        setConsulta('');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Contactar asesor</Text>
                    <Text style={styles.subtitle}>
                        Escribí tu consulta y nuestros asesores se pondrán en contacto con vos.
                    </Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Escribí tu consulta..."
                    placeholderTextColor="#9E9E9E"
                    multiline
                    textAlignVertical="top"
                    value={consulta}
                    onChangeText={setConsulta}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.primaryButton, consulta.trim() === '' && styles.buttonDisabled]}
                        onPress={handleEnviar}
                        disabled={consulta.trim() === ''}
                    >
                        <Text style={styles.primaryButtonText}>Enviar consulta</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Modal de Éxito Flotante */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Ionicons name="checkmark-circle" size={64} color="#4CAF50" style={styles.modalIcon} />

                        <Text style={styles.modalTitle}>Consulta enviada</Text>
                        <Text style={styles.modalText}>
                            Un asesor se pondrá en contacto con vos.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalActionButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalActionText}>Aceptar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Fondo blanco puro para contraste
    },
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    header: {
        marginTop: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#121212',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        lineHeight: 22,
    },
    input: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333333',
        minHeight: 150,
        marginBottom: 24,
    },
    buttonContainer: {
        paddingBottom: 20,
    },
    primaryButton: {
        backgroundColor: '#0056B3', // Azul vibrante
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#0056B3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#A0C4E8',
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Estilos del Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fondo oscuro semitransparente
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 32,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIcon: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#121212',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    modalActionButton: {
        backgroundColor: '#0056B3',
        borderRadius: 10,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
    },
    modalActionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});