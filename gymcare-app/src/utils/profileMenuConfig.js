const menuConfig = (navigation, handleLogout, user) => {
  const menu = [
    { label: "Chương trình giới thiệu bạn", onPress: () => {} },
    { label: "Ưu đãi", onPress: () => navigation.navigate("Promotions") },
    { label: "Hướng dẫn sử dụng", onPress: () => {} },
    { label: "Liên hệ", onPress: () => navigation.navigate("Contact") },
    { label: "Hợp đồng", onPress: () => {} },
    { label: "Lịch sử chăm sóc khách hàng", onPress: () => {} },
    { label: "Cài đặt đăng nhập", onPress: () => {} },
    { label: "Bổ sung hồ sơ", onPress: () => {} },
    { label: "Đổi ngôn ngữ", onPress: () => {} },
    { label: "Đổi mật khẩu", onPress: () => navigation.navigate("ChangePassword") },
    { label: "Vô hiệu hóa tài khoản", onPress: () => {} },
    { label: "Đăng xuất", onPress: handleLogout },
  ];

  // Chỉ thêm nếu user có role === 2
  if (user?.role === 2) {
    menu.splice(1, 0, { // thêm sau phần tử đầu tiên
      label: "Cập nhật thông tin sức khỏe",
      onPress: () => navigation.navigate("UpdateHealth"),
    });
  }

  return menu;
};

export default menuConfig;
