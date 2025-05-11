import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const ChatInput = ({ onSend, style }) => {
  const [message, setMessage] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardDidShowListener = Keyboard.addListener(keyboardShowEvent, () => {
      setKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener(keyboardHideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleAttachmentPress = () => {
    Keyboard.dismiss();
  };

  const handleEmojiPress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={handleAttachmentPress}
          style={styles.attachmentButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="attach-file" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={message}
          autoCorrect={false}       
          autoComplete="off"
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={colors.textSecondary}
          multiline
          onSubmitEditing={handleSend}
          returnKeyType="send"
          enablesReturnKeyAutomatically={true}
          keyboardAppearance="default"
        />

        {message ? (
          <TouchableOpacity
            onPress={handleSend}
            style={styles.sendButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="send" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleEmojiPress}
            style={styles.emojiButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="insert-emoticon" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 25,
    paddingHorizontal: 12,
    minHeight: 55,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.textPrimary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  attachmentButton: {
    marginRight: 8,
    padding: 4,
  },
  emojiButton: {
    marginLeft: 8,
    padding: 4,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(ChatInput);
