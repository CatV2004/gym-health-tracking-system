// import React, { useState, useEffect } from "react";
// import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchMemberHealth, updateMemberHealth } from "../../../../store/memberSlice";
// import HealthForm from "../../../../components/HealthForm";  
// import styles from "./HealthUpdateScreen.styles";

// export default function HealthUpdateScreen({ navigation }) {
//   const dispatch = useDispatch();
//   const { error, successMessage, accessToken } = useSelector((state) => state.auth);
//   const { loading, health } = useSelector((state) => state.member);

//   const [form, setForm] = useState({
//     gender: "F",
//     birth_year: "",
//     height: "",
//     weight: "",
//     goal: "",
//   });

//    const [fieldErrors, setFieldErrors] = useState({
//     height: null,
//     weight: null,
//   });

//   // useEffect(() => {
//   //   if (accessToken) {
//   //     dispatch(fetchMemberHealth(accessToken));
//   //   }
//   // }, [accessToken, dispatch]);

//   useEffect(() => {
//     if (health) {
//       setForm({
//         gender: health.gender,
//         birth_year: health.birth_year,
//         height: health.height,
//         weight: health.weight,
//         goal: health.goal,
//       });
//     }
//   }, [health]);

//   const handleChange = (field, value) => {
//     setForm({ ...form, [field]: value });
//   };

//   const handleSubmit = () => {
//     dispatch(updateMemberHealth(form));
//     dispatch(fetchMemberHealth(accessToken));
//     navigation.goBack();
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Cập nhật thông tin sức khỏe</Text>

//       {/* Health Form */}
//       <HealthForm form={form} handleChange={handleChange} />

//       {/* Submit Button */}
//       <View style={styles.buttonContainer}>
//         <TouchableOpacity
//           style={[styles.button, loading && styles.buttonLoading]} 
//           onPress={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Cập nhật sức khỏe</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Loading Indicator */}
//       {loading && (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color="#FF5722" />
//         </View>
//       )}

//       {/* Error/Success Messages */}
//       {error && <Text style={styles.error}>{error}</Text>}
//       {successMessage && <Text style={styles.success}>{successMessage}</Text>}
//     </ScrollView>
//   );
// }

import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchMemberHealth, updateMemberHealth } from "../../../../store/memberSlice";
import HealthForm from "../../../../components/HealthForm";  
import styles from "./HealthUpdateScreen.styles";

export default function HealthUpdateScreen({ navigation }) {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const { loading, health, error } = useSelector((state) => state.member);

  const [form, setForm] = useState({
    gender: "F",
    birth_year: "",
    height: "",
    weight: "",
    goal: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    height: null,
    weight: null,
    // thêm các field khác nếu cần
  });

  useEffect(() => {
    if (health) {
      setForm({
        gender: health.gender,
        birth_year: health.birth_year,
        height: health.height,
        weight: health.weight,
        goal: health.goal,
      });
    }
  }, [health]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    // Clear error khi người dùng bắt đầu nhập
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
  };

  const handleSubmit = async () => {
    try {
      // Reset errors trước khi submit
      setFieldErrors({
        height: null,
        weight: null,
      });

      const resultAction = await dispatch(updateMemberHealth(form));
      
      if (updateMemberHealth.fulfilled.match(resultAction)) {
        // Nếu thành công thì fetch lại data và quay về
        await dispatch(fetchMemberHealth(accessToken));
        navigation.goBack();
      }
    } catch (error) {
      // Xử lý lỗi validation từ backend
      if (error.payload && typeof error.payload === 'object') {
        const newFieldErrors = {};
        Object.keys(error.payload).forEach(key => {
          newFieldErrors[key] = error.payload[key].join(', ');
        });
        setFieldErrors(newFieldErrors);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cập nhật thông tin sức khỏe</Text>

      {/* Health Form - Truyền thêm fieldErrors */}
      <HealthForm 
        form={form} 
        handleChange={handleChange} 
        errors={fieldErrors}
      />

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonLoading]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cập nhật sức khỏe</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF5722" />
        </View>
      )}

      {/* Hiển thị các lỗi không phải validation */}
      {error && typeof error === 'string' && (
        <Text style={styles.error}>{error}</Text>
      )}
    </ScrollView>
  );
}