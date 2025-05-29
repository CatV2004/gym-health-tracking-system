// import * as Print from "expo-print";
// import * as FileSystem from "expo-file-system";
// import { uploadPaymentReceipt } from "../api/payment/paymentServiceApi";

// // Hàm định dạng ngày tháng
// const formatDate = (date) => {
//   return date.toLocaleString("vi-VN", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
// };

// export const generateAndUploadReceipt = async (paymentData, subscription, token) => {
//   try {
//     // Tạo HTML cho biên lai
//     const receiptHtml = `
// <!DOCTYPE html>
// <html>
//   <head>
//     <meta charset="UTF-8">
//     <style>
//       body { font-family: Arial, sans-serif; padding: 20px; }
//       .header { text-align: center; margin-bottom: 20px; }
//       .title { font-size: 20px; font-weight: bold; }
//       .info { margin-bottom: 10px; }
//       .divider { border-top: 1px dashed #000; margin: 15px 0; }
//       .amount { font-size: 18px; font-weight: bold; color: #2e7d32; }
//     </style>
//   </head>
//   <body>
//     <div class="header">
//       <div class="title">BIÊN LAI THANH TOÁN</div>
//       <div>GYMCARE CENTER</div>
//     </div>
    
//     <div class="info"><strong>Mã giao dịch:</strong> ${
//       paymentData.transaction_id
//     }</div>
//     <div class="info"><strong>Ngân hàng:</strong> ${paymentData.bank_code}</div>
//     <div class="info amount"><strong>Số tiền:</strong> ${paymentData.amount.toLocaleString(
//       "vi-VN"
//     )} VND</div>
//     <div class="info"><strong>Gói dịch vụ:</strong> ${
//       subscription?.name || "N/A"
//     }</div>
//     <div class="info"><strong>Ngày thanh toán:</strong> ${formatDate(
//       new Date()
//     )}</div>
    
//     <div class="divider"></div>
    
//     <div style="text-align: center; font-style: italic; margin-top: 20px;">
//       Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
//     </div>
//   </body>
// </html>
// `;
//     const { uri } = await Print.printToFileAsync({
//       html: receiptHtml,
//       width: 595,
//       height: 842,
//       base64: false,
//     });

//     console.log("PDF generated at:", uri);

//     // Tạo bản sao vào thư mục Documents
//     const newPath = `${FileSystem.documentDirectory}receipt_${paymentData.transaction_id}.pdf`;

//     // Đảm bảo thư mục tồn tại
//     await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory, {
//       intermediates: true,
//     });

//     // Copy file sang vị trí mới
//     await FileSystem.copyAsync({
//       from: uri,
//       to: newPath,
//     });

//     // Tạo FormData để upload
//     const formData = new FormData();
//     formData.append("receipt", {
//       uri: newPath,
//       name: `receipt_${paymentData.transaction_id}.pdf`,
//       type: "application/pdf",
//     });

//     // Upload file
//     const uploadResponse = await uploadPaymentReceipt(
//       paymentData.id,
//       formData,
//       token
//     );

//     console.log("Upload response:", uploadResponse);

//     // (Tùy chọn) Xóa file tạm sau khi upload
//     try {
//       await FileSystem.deleteAsync(uri, { idempotent: true });
//       await FileSystem.deleteAsync(newPath, { idempotent: true });
//     } catch (deleteError) {
//       console.warn("Could not delete temp files:", deleteError);
//     }

//     return { pdfUri: newPath, uploadResponse };
//   } catch (error) {
//     console.error("Error in generateAndUploadReceipt:", error);
//     throw error;
//   }
// };