import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  ImageBackground,
  ActivityIndicator,
  Easing,
} from "react-native";
import { ChatService } from "../../api/chatService";
import colors from "../../constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import ChatInput from "../../components/chat/ChatInput";
import MessageItem from "../../components/chat/MessageItem";

const ChatScreen = ({ route, navigation }) => {
  const { chatId, otherUser } = route.params;
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const listRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let unsubscribe;
      const setupChat = async () => {
        await ChatService.markMessagesAsSeen(chatId, user.id);
        
        unsubscribe = ChatService.listenToMessages(
          chatId,
          (newMessages) => {
            setMessages(newMessages);
            setIsLoading(false);
            scrollToBottom();
          },
          (err) => {
            setError(err.message);
            setIsLoading(false);
          }
        );
      };
  
      setupChat();
      return () => unsubscribe?.();
    }, [chatId, user.id])
  );

  const scrollToBottom = () => {
    if (listRef.current && messages.length > 0) {
      setTimeout(() => {
        listRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSend = async (messageText) => {
    if (!messageText.trim()) return;

    const newMessage = {
      text: messageText,
      senderId: user.id,
      senderName: `${user.first_name} ${user.last_name}`,
      status: "sending",
    };

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        ...newMessage,
        id: Date.now().toString(),
        timestamp: Date.now(),
      },
    ]);

    scrollToBottom();

    try {
      const result = await ChatService.sendMessage(chatId, newMessage);
      if (!result.success) throw new Error(result.error);

      await ChatService.updateChatRoom(chatId, newMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== Date.now().toString())
      );
    }
  };

  const renderBubble = ({ item }) => {
    const isCurrentUser = item.senderId === user.id;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }],
        }}
      >
        <MessageItem
          message={item}
          isCurrentUser={isCurrentUser}
          otherUserAvatar={otherUser.avatar}
          currentUserAvatar={user.avatar}
          showSeenStatus={isCurrentUser && item.status === 'sent'}
        />
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }


  

  return (
    <ImageBackground
      source={require("../../../assets/chat-bg.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {otherUser.first_name || "ADMIN"} {otherUser.last_name}
          </Text>
          <View style={styles.headerRight} />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.select({
            ios: 0,
            android: 25,
          })}
        >
          <Animated.FlatList
            ref={listRef}
            data={messages}
            renderItem={renderBubble}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            style={{ opacity: fadeAnim }}
          />

          <Animated.View
            style={[
              styles.chatInputContainer,
              { transform: [{ translateY: slideUpAnim }] },
            ]}
          >
            <ChatInput onSend={handleSend} />
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  backButton: {
    padding: 5,
  },
  headerRight: {
    width: 24,
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    padding: 20,
  },
  chatInputContainer: {
  },
});

export default ChatScreen;
