import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  weight_kg: Yup.number()
    .required('Bắt buộc')
    .min(30, 'Cân nặng quá thấp')
    .max(200, 'Cân nặng quá cao'),
  body_fat: Yup.number()
    .required('Bắt buộc')
    .min(5, 'Tỉ lệ mỡ quá thấp')
    .max(50, 'Tỉ lệ mỡ quá cao'),
  muscle_mass: Yup.number()
    .required('Bắt buộc')
    .min(10, 'Tỉ lệ cơ quá thấp')
    .max(60, 'Tỉ lệ cơ quá cao'),
  notes: Yup.string()
    .max(500, 'Ghi chú quá dài'),
});

const ClientProgressForm = ({ onSubmit, initialValues }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cập nhật tiến độ</Text>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          setIsSubmitting(true);
          try {
            await onSubmit(values);
            resetForm();
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cân nặng (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                onChangeText={handleChange('weight_kg')}
                onBlur={handleBlur('weight_kg')}
                value={values.weight_kg.toString()}
              />
              {touched.weight_kg && errors.weight_kg && (
                <Text style={styles.errorText}>{errors.weight_kg}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tỉ lệ mỡ (%)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                onChangeText={handleChange('body_fat')}
                onBlur={handleBlur('body_fat')}
                value={values.body_fat.toString()}
              />
              {touched.body_fat && errors.body_fat && (
                <Text style={styles.errorText}>{errors.body_fat}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tỉ lệ cơ (%)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                onChangeText={handleChange('muscle_mass')}
                onBlur={handleBlur('muscle_mass')}
                value={values.muscle_mass.toString()}
              />
              {touched.muscle_mass && errors.muscle_mass && (
                <Text style={styles.errorText}>{errors.muscle_mass}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                numberOfLines={3}
                onChangeText={handleChange('notes')}
                onBlur={handleBlur('notes')}
                value={values.notes}
              />
              {touched.notes && errors.notes && (
                <Text style={styles.errorText}>{errors.notes}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu tiến độ'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClientProgressForm;