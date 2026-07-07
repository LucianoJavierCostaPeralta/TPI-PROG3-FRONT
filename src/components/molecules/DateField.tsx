import { useState } from 'react';
import { Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextInput as PaperTextInput, type TextInputProps } from 'react-native-paper';
import { CTAButton, TextInputField } from '../atoms';
import { formatDateForDisplay, formatDateForInput, parseDeliveryFormDate } from '../../types/workspace';

type DateFieldProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'onChange' | 'error'> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  maximumDate?: Date;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function DateField({
  label,
  value,
  onChange,
  disabled,
  error,
  placeholder,
  maximumDate,
  icon = 'calendar-outline',
  ...props
}: DateFieldProps) {
  const [visible, setVisible] = useState(false);
  const selectedDate = value ? parseDeliveryFormDate(value) : new Date();

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setVisible(false);
    }

    if (date) {
      onChange(formatDateForInput(date));
    }
  };

  return (
    <>
      <TextInputField
        label={label}
        placeholder={placeholder ?? 'Seleccionar fecha'}
        value={formatDateForDisplay(value)}
        onPressIn={() => {
          if (!disabled) setVisible(true);
        }}
        editable={false}
        showSoftInputOnFocus={false}
        disabled={disabled}
        error={error}
        icon={icon}
        right={
          <PaperTextInput.Icon
            icon='calendar-month-outline'
            onPress={() => setVisible(true)}
            disabled={disabled}
          />
        }
        {...props}
      />

      {visible ? (
        <DateTimePicker
          value={selectedDate}
          mode='date'
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}

      {Platform.OS === 'ios' && visible ? (
        <CTAButton compact variant='secondary' onPress={() => setVisible(false)}>
          Listo
        </CTAButton>
      ) : null}
    </>
  );
}
