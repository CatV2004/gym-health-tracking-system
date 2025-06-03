import { db } from "../constants/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  or,
  and,
  getDocs,
  writeBatch,
} from "firebase/firestore";

export const ChatService = {
  // Lắng nghe tin nhắn với debounce và phân trang
  listenToMessages: (chatId, onMessagesUpdate, onError) => {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()?.getTime() || Date.now(),
          }));
          onMessagesUpdate(messages);
        },
        (error) => {
          console.error("Error listening to messages:", error);
          onError?.(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up listener:", error);
      onError?.(error);
      return () => {};
    }
  },

  // Gửi tin nhắn với trạng thái và xử lý lỗi chi tiết
  sendMessage: async (chatId, message) => {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const newMessage = {
        ...message,
        timestamp: serverTimestamp(),
        status: "sending",
      };

      const docRef = await addDoc(messagesRef, newMessage);

      // Cập nhật trạng thái sau khi gửi thành công
      await setDoc(docRef, { status: "sent" }, { merge: true });

      return {
        success: true,
        messageId: docRef.id,
      };
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: false,
        error: error.message || "Failed to send message",
      };
    }
  },

  // Tạo hoặc lấy chat room giữa 2 người dùng
  getOrCreateChatRoom: async (user1Id, user2Id) => {
    try {
      // Tạo ID chat room theo thứ tự để tránh trùng lặp
      const chatId = [user1Id, user2Id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);

      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          participants: [user1Id, user2Id],
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTime: null,
        });
      }

      return {
        success: true,
        chatId: chatId,
      };
    } catch (error) {
      console.error("Error creating chat room:", error);
      return {
        success: false,
        error: error.message || "Failed to create chat room",
      };
    }
  },

  // Cập nhật thông tin chat room khi có tin nhắn mới
  updateChatRoom: async (chatId, lastMessage) => {
    try {
      const chatRef = doc(db, "chats", chatId);
      await setDoc(
        chatRef,
        {
          lastMessage: lastMessage.text || "[Media]",
          lastMessageTime: serverTimestamp(),
        },
        { merge: true }
      );

      return { success: true };
    } catch (error) {
      console.error("Error updating chat room:", error);
      return { success: false };
    }
  },

  // Lấy danh sách các cuộc trò chuyện của người dùng
  getUserChats: async (userId, onUpdate) => {
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", userId)
      );

      return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          lastMessageTime: doc.data().lastMessageTime?.toDate()?.getTime() || 0,
        }));

        // Sắp xếp theo tin nhắn cuối cùng
        chats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        onUpdate(chats);
      });
    } catch (error) {
      console.error("Error getting user chats:", error);
      return () => {};
    }
  },

  // Đánh dấu tin nhắn đã xem
  markMessagesAsSeen: async (chatId, userId) => {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(
        messagesRef,
        where("senderId", "!=", userId),
        where("seen", "==", false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        const messageRef = doc.ref;
        batch.update(messageRef, { seen: true, seenAt: serverTimestamp() });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error("Error marking messages as seen:", error);
      return { success: false, error: error.message };
    }
  },

  // Lấy số tin nhắn chưa đọc
  getUnreadMessageCount: async (chatId, userId) => {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(
        messagesRef,
        where("senderId", "!=", userId),
        where("seen", "==", false),
        orderBy('senderId'), 
        orderBy('seen')
      );

      const snapshot = await getDocs(q);
      return { success: true, count: snapshot.size };
    } catch (error) {
      console.error("Error getting unread count:", error);
      return { success: false, error: error.message };
    }
  },

   // Gọi API backend tạo hoặc lấy thread chat giữa user hiện tại và userId
  openChatWithUser: async (userId, token) => {
    try {
      const response = await axios.post(
        `${API_BASE}/chat/open-thread/`,
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Trả về dữ liệu thread từ backend
      return response.data; 
    } catch (error) {
      console.error("Failed to open chat thread:", error);
      throw error;
    }
  },
};
