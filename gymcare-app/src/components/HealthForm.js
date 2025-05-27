// import React from "react";
// import {
//   TextInput,
//   Text,
//   View,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";

// const HealthForm = ({ form, handleChange }) => {
//   return (
//     <View style={styles.container}>
//       {/* Gender Input */}
//       <Text style={styles.label}>Giới tính</Text>
//       <View style={styles.radioGroup}>
//         <TouchableOpacity
//           onPress={() => handleChange("gender", "M")}
//           style={[
//             styles.radioOption,
//             form.gender === "M" ? styles.selectedOption : {},
//           ]}
//         >
//           <Text style={styles.optionText}>Nam</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() => handleChange("gender", "F")}
//           style={[
//             styles.radioOption,
//             form.gender === "F" ? styles.selectedOption : {},
//           ]}
//         >
//           <Text style={styles.optionText}>Nữ</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Birth Year Input */}
//       <Text style={styles.label}>Năm sinh</Text>
//       <TextInput
//         keyboardType="numeric"
//         placeholder="Năm sinh"
//         value={String(form.birth_year)}
//         onChangeText={(text) => handleChange("birth_year", Number(text))}
//         style={styles.input}
//       />

//       {/* Height Input */}
//       <Text style={styles.label}>Chiều cao (cm)</Text>
//       <TextInput
//         keyboardType="numeric"
//         placeholder="Chiều cao"
//         value={String(form.height)}
//         onChangeText={(text) => handleChange("height", Number(text))}
//         style={styles.input}
//       />

//       {/* Weight Input */}
//       <Text style={styles.label}>Cân nặng (kg)</Text>
//       <TextInput
//         keyboardType="numeric"
//         placeholder="Cân nặng"
//         value={String(form.weight)}
//         onChangeText={(text) => handleChange("weight", Number(text))}
//         style={styles.input}
//       />

//       {/* Goal Input */}
//       <Text style={styles.label}>Mục tiêu</Text>
//       <TextInput
//         placeholder="Mục tiêu"
//         value={form.goal}
//         onChangeText={(text) => handleChange("goal", text)}
//         style={styles.input}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   label: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 12,
//   },
//   input: {
//     height: 45,
//     borderWidth: 1,
//     borderRadius: 8,
//     borderColor: "#ddd",
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//     fontSize: 16,
//   },
//   radioGroup: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   radioOption: {
//     flex: 1,
//     paddingVertical: 12,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     marginHorizontal: 5,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   optionText: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: "#333",
//   },
//   selectedOption: {
//     backgroundColor: "#FF7F00",
//     borderColor: "#FF7F00",
//   },
//   optionTextSelected: {
//     color: "white",
//     fontWeight: "700",
//   },
// });

// export default HealthForm;


import React from "react";
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const HealthForm = ({ form, handleChange, errors = {} }) => {
  return (
    <View style={styles.container}>
      {/* Gender Input - Không cần hiển thị lỗi vì là radio button */}
      <Text style={styles.label}>Giới tính</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          onPress={() => handleChange("gender", "M")}
          style={[
            styles.radioOption,
            form.gender === "M" ? styles.selectedOption : {},
          ]}
        >
          <Text style={[
            styles.optionText,
            form.gender === "M" ? styles.optionTextSelected : {}
          ]}>Nam</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleChange("gender", "F")}
          style={[
            styles.radioOption,
            form.gender === "F" ? styles.selectedOption : {},
          ]}
        >
          <Text style={[
            styles.optionText,
            form.gender === "F" ? styles.optionTextSelected : {}
          ]}>Nữ</Text>
        </TouchableOpacity>
      </View>

      {/* Birth Year Input */}
      <Text style={styles.label}>Năm sinh</Text>
      <TextInput
        keyboardType="numeric"
        placeholder="Năm sinh"
        value={String(form.birth_year)}
        onChangeText={(text) => handleChange("birth_year", Number(text))}
        style={[
          styles.input,
          errors.birth_year && styles.inputError
        ]}
      />
      {errors.birth_year && (
        <Text style={styles.errorText}>{errors.birth_year}</Text>
      )}

      {/* Height Input */}
      <Text style={styles.label}>Chiều cao (cm)</Text>
      <TextInput
        keyboardType="numeric"
        placeholder="Chiều cao"
        value={String(form.height)}
        onChangeText={(text) => handleChange("height", Number(text))}
        style={[
          styles.input,
          errors.height && styles.inputError
        ]}
      />
      {errors.height && (
        <Text style={styles.errorText}>{errors.height}</Text>
      )}

      {/* Weight Input */}
      <Text style={styles.label}>Cân nặng (kg)</Text>
      <TextInput
        keyboardType="numeric"
        placeholder="Cân nặng"
        value={String(form.weight)}
        onChangeText={(text) => handleChange("weight", Number(text))}
        style={[
          styles.input,
          errors.weight && styles.inputError
        ]}
      />
      {errors.weight && (
        <Text style={styles.errorText}>{errors.weight}</Text>
      )}

      {/* Goal Input */}
      <Text style={styles.label}>Mục tiêu</Text>
      <TextInput
        placeholder="Mục tiêu"
        value={form.goal}
        onChangeText={(text) => handleChange("goal", text)}
        style={[
          styles.input,
          errors.goal && styles.inputError
        ]}
      />
      {errors.goal && (
        <Text style={styles.errorText}>{errors.goal}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
    backgroundColor: '#FFF9F9',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  radioOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  selectedOption: {
    backgroundColor: "#FF7F00",
    borderColor: "#FF7F00",
  },
  optionTextSelected: {
    color: "white",
  },
});

export default HealthForm;