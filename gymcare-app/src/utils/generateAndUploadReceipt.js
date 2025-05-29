import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { uploadPaymentReceipt } from "../api/payment/paymentServiceApi";
import { formatDateReciept } from "./dateUtils";


export default generateAndUploadReceipt = async (paymentData, subscription, token) => {
  try {
    // Tạo HTML cho biên lai
    const receiptHtml = `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <title>Biên lai thanh toán</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              font-size: 14px;
              color: #333;
            }

            .header {
              text-align: center;
              margin-bottom: 30px;
            }

            .header .title {
              font-size: 22px;
              font-weight: bold;
              text-transform: uppercase;
              color: #2e7d32;
            }

            .header .subtitle {
              font-size: 14px;
              color: #888;
            }

            .section {
              margin-bottom: 20px;
            }

            .section-title {
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 16px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }

            .info-row {
              margin-bottom: 6px;
            }

            .info-row strong {
              display: inline-block;
              width: 180px;
            }

            .amount {
              font-size: 18px;
              font-weight: bold;
              color: #c62828;
            }

            .footer {
              text-align: center;
              margin-top: 40px;
              font-style: italic;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">BIÊN LAI THANH TOÁN</div>
            <div class="subtitle">GYMCARE CENTER - Nâng tầm sức khỏe, thay đổi vóc dáng</div>
          </div>

          <div class="section">
            <div class="section-title">Thông tin giao dịch</div>
            <div class="info-row"><strong>Mã giao dịch:</strong> ${
              paymentData.transaction_id
            }</div>
            <div class="info-row"><strong>Số tiền:</strong> <span class="amount">${paymentData.amount.toLocaleString(
              "vi-VN"
            )} VND</span></div>
            <div class="info-row"><strong>Ngân hàng thanh toán:</strong> ${
              paymentData.bank_code
            }</div>
            <div class="info-row"><strong>Mã ngân hàng:</strong> ${
              paymentData.bank_trans_no
            }</div>
            <div class="info-row"><strong>Thời gian thanh toán:</strong> ${formatDateReciept(
              new Date()
            )}</div>
          </div>

          <div class="section">
            <div class="section-title">Thông tin gói tập</div>
            <div class="info-row"><strong>Tên gói:</strong> ${
              subscription?.training_package?.name || "N/A"
            }</div>
            <div class="info-row"><strong>Mô tả:</strong> ${
              subscription?.training_package?.description || "Không có mô tả"
            }</div>
            <div class="info-row"><strong>Số buổi tập:</strong> ${
              subscription?.training_package?.session_count
            } buổi</div>
            <div class="info-row"><strong>Huấn luyện viên:</strong> ${
              subscription?.training_package?.pt?.user?.fullName || "N/A"
            }</div>
            <div class="info-row"><strong>Ngày bắt đầu:</strong> ${formatDateReciept(
              new Date(subscription?.start_date)
            )}</div>
            <div class="info-row"><strong>Ngày kết thúc:</strong> ${formatDateReciept(
              new Date(subscription?.end_date)
            )}</div>
          </div>

          <div class="footer">
            Cảm ơn quý khách đã tin tưởng lựa chọn GYMCARE. Chúng tôi luôn đồng hành cùng bạn trong hành trình sức khỏe!
          </div>
        </body>
      </html>
`;
    const { uri } = await Print.printToFileAsync({
      html: receiptHtml,
      width: 595,
      height: 421,
      base64: false,
    });

    console.log("PDF generated at:", uri);

    // 3. Tạo bản sao vào thư mục Documents
    const newPath = `${FileSystem.documentDirectory}receipt_${paymentData.transaction_id}.pdf`;

    // Đảm bảo thư mục tồn tại
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory, {
      intermediates: true,
    });

    await FileSystem.copyAsync({
      from: uri,
      to: newPath,
    });

    const formData = new FormData();
    formData.append("receipt", {
      uri: newPath,
      name: `receipt_${paymentData.transaction_id}.pdf`,
      type: "application/pdf",
    });

    const uploadResponse = await uploadPaymentReceipt(
      paymentData.id,
      formData,
      token
    );

    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      await FileSystem.deleteAsync(newPath, { idempotent: true });
    } catch (deleteError) {
      console.warn("Could not delete temp files:", deleteError);
    }

    return uploadResponse;
  } catch (error) {
    console.error("Error in generateAndUploadReceipt:", error);
    throw error;
  }
};
