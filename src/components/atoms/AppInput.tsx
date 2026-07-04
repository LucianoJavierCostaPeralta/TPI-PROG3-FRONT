import { TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';

type AppInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;

  secureTextEntry?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;

  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
};

export function AppInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  icon,
  placeholder,
  error = false,
  disabled = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
}: AppInputProps) {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      error={error}
      disabled={disabled}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      mode="outlined"
      left={
        icon ? (
          <TextInput.Icon
            icon={() => (
              <MaterialCommunityIcons name={icon} size={20} />
            )}
          />
        ) : undefined
      }
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'transparent',
  },
});