import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense
from sklearn.preprocessing import MinMaxScaler
import joblib
import os
from django.conf import settings
from gymcareapp.models import WorkoutProgress
from datetime import datetime, timedelta
from sklearn.metrics import mean_absolute_error


class ProgressPredictor:
    def __init__(self, look_back=4):
        self.look_back = look_back
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model_path = os.path.join(settings.BASE_DIR, 'progress_tracker/models/progress_model.h5')
        self.scaler_path = os.path.join(settings.BASE_DIR, 'progress_tracker/models/scaler.save')
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)

    def create_dataset(self, dataset):
        dataX, dataY = [], []
        for i in range(len(dataset) - self.look_back - 1):
            a = dataset[i:(i + self.look_back), :]
            dataX.append(a)
            dataY.append(dataset[i + self.look_back, :])
        return np.array(dataX), np.array(dataY)

    def prepare_training_data(self):
        # Lấy dữ liệu từ tất cả thành viên có đủ ít nhất look_back + 1 bản ghi
        progresses = WorkoutProgress.objects.filter(active=True).order_by('member', 'created_date')

        # Tạo DataFrame từ dữ liệu
        data = []
        for p in progresses:
            data.append({
                'member_id': p.member.id,
                'date': p.created_date,
                'weight': float(p.weight_kg),
                'body_fat': float(p.body_fat) if p.body_fat else None,
                'muscle_mass': float(p.muscle_mass) if p.muscle_mass else None
            })

        df = pd.DataFrame(data)

        # Lọc và chuẩn bị dữ liệu huấn luyện
        train_data = []
        for member_id, group in df.groupby('member_id'):
            if len(group) >= self.look_back + 1:
                # Lấy các giá trị không null
                valid_data = group[['weight', 'body_fat', 'muscle_mass']].dropna()
                if len(valid_data) >= self.look_back + 1:
                    train_data.append(valid_data.values)

        if not train_data:
            raise ValueError("Không đủ dữ liệu để huấn luyện")

        return np.vstack(train_data)

    def train(self):
        try:
            dataset = self.prepare_training_data()
            if dataset.shape[0] < self.look_back + 2:
                return {
                    'status': 'error',
                    'message': f"Cần ít nhất {self.look_back + 2} bản ghi hợp lệ để train"
                }
            dataset = self.scaler.fit_transform(dataset)

            # Chuẩn bị dữ liệu train
            X, y = self.create_dataset(dataset)
            print(f"Training data shape - X: {X.shape}, y: {y.shape}")

            # Xây dựng model LSTM
            self.model = Sequential()
            self.model.add(LSTM(50, return_sequences=True, input_shape=(X.shape[1], X.shape[2])))
            self.model.add(LSTM(50, return_sequences=False))
            self.model.add(Dense(3))  # 3 outputs: weight, body_fat, muscle_mass
            self.model.compile(optimizer='adam', loss='mean_squared_error')

            # Huấn luyện model
            history = self.model.fit(X, y, epochs=50, batch_size=1, verbose=1, validation_split=0.2)

            # Tính toán độ chính xác
            y_pred = self.model.predict(X)
            y_true = y
            mae = mean_absolute_error(y_true, y_pred)
            confidence = max(0, min(1, 1 - mae))  # Đảm bảo confidence trong khoảng 0-1

            # Lưu model và scaler
            self.model.save(self.model_path)
            self.model.save(self.model_path.removesuffix('.h5') + '.keras')

            return {
                'status': 'success',
                'loss': history.history['loss'][-1],
                'val_loss': history.history['val_loss'][-1] if 'val_loss' in history.history else None,
                'confidence': confidence
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }

    def load_model(self):
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = load_model(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            return True
        return False

    def predict_for_member(self, member):
        if not self.model:
            if not self.load_model():
                raise Exception("Model chưa được huấn luyện")

        # Lấy dữ liệu lịch sử của thành viên (sửa lại cách lấy last record)
        progresses = WorkoutProgress.objects.filter(
            member=member,
            active=True
        ).order_by('-created_date')[:self.look_back]  # Lấy từ mới đến cũ

        if len(progresses) < self.look_back:
            raise ValueError(f"Thành viên cần ít nhất {self.look_back} bản ghi để dự đoán")

        # Lấy ngày ghi nhận cuối cùng trước khi xử lý dữ liệu
        last_date = progresses[0].created_date  # Vì đã order_by -created_date

        # Chuẩn bị dữ liệu
        data = []
        for p in progresses:
            row = [float(p.weight_kg)]
            row.append(float(p.body_fat) if p.body_fat else 0)
            row.append(float(p.muscle_mass) if p.muscle_mass else 0)
            data.append(row)

        dataset = self.scaler.transform(data)

        # Tạo dataset để predict
        X = np.array([dataset[-self.look_back:]])

        # Dự đoán
        prediction = self.model.predict(X)

        # Đảo ngược chuẩn hóa
        predicted = self.scaler.inverse_transform(prediction)

        # Tính ngày kiểm tra tiếp theo (30 ngày sau lần gần nhất)
        next_check_date = (last_date + timedelta(days=30)).date()

        return {
            'weight': round(float(predicted[0][0]), 2),
            'body_fat': round(float(predicted[0][1]), 2) if predicted[0][1] > 0 else None,
            'muscle_mass': round(float(predicted[0][2]), 2) if predicted[0][2] > 0 else None,
            'next_check_date': next_check_date,
            'last_record_date': last_date
        }


