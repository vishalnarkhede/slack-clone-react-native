import {useNavigation, useRoute, useTheme} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {Channel, MessageInput, MessageList} from 'stream-chat-react-native';

import {CustomKeyboardCompatibleView} from '../../components/CustomKeyboardCompatibleView';
import {Gallery} from '../../components/Gallery';
import {Giphy} from '../../components/Giphy';
import {InlineDateSeparator} from '../../components/InlineDateSeparator';
import {InputBox} from '../../components/InputBox';
import {MessageActionSheet} from '../../components/MessageActionSheet/MessageActionSheet';
import {MessageAvatar} from '../../components/MessageAvatar';
import {MessageFooter} from '../../components/MessageFooter';
import {MessageHeader} from '../../components/MessageHeader';
import {MessageRepliesAvatars} from '../../components/MessageRepliesAvatars';
import {MessageText} from '../../components/MessageText';
import {ReactionPickerActionSheet} from '../../components/ReactionPickerActionSheet/ReactionPickerActionSheet';
import {Reply} from '../../components/Reply';
import {UrlPreview} from '../../components/UrlPreview';
import {useDraftMessage} from '../../hooks/useDraftMessage';
import {ChatClientService} from '../../utils';
import {supportedReactions} from '../../utils/supportedReactions';
import {ChannelHeader} from './ChannelHeader';

const EmptyComponent = () => null;
const styles = StyleSheet.create({
  channelScreenContainer: {flexDirection: 'column', height: '100%'},
  chatContainer: {
    flexGrow: 1,
    flexShrink: 1,
  },
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  drawerNavigator: {
    backgroundColor: '#3F0E40',
    width: 350,
  },
  touchableOpacityStyle: {
    alignItems: 'center',
    backgroundColor: '#3F0E40',
    borderColor: 'black',
    borderRadius: 30,
    borderWidth: 1,
    bottom: 80,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    width: 50,
  },
});

export const ChannelScreen = () => {
  const {colors} = useTheme();
  const {
    params: {channel: paramChannel, channelId = null, messageId = null},
  } = useRoute();
  const navigation = useNavigation();
  const chatClient = ChatClientService.getClient();
  const [channel, setChannel] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [text, setText] = useState('');
  const [actionSheetData, setActionSheetData] = useState(null);
  const [reactionPickerData, setReactionPickerData] = useState(null);
  const actionSheetRef = useRef(null);
  const reactionPickerRef = useRef(null);
  const messageListRef = useRef(null);
  const {getDraftMessageText} = useDraftMessage(text, channel);

  const additionalTextInputProps = useMemo(
    () => ({
      placeholder:
        channel && channel.data.name
          ? 'Message #' + channel.data.name.toLowerCase().replace(' ', '_')
          : 'Message',
      placeholderTextColor: '#979A9A',
    }),
    [channel],
  );

  /**
   * When `openReactionPicker` is called from MessageFooter,
   * it will give you access to corresponding message.
   *
   * @param {*} toggleReactionHandler
   */
  const openReactionPicker = (message) => {
    setReactionPickerData({
      channel,
      message,
    });
    actionSheetRef.current?.dismiss();
    reactionPickerRef.current?.present();
  };

  const onChangeText = (text) => {
    setText(text);
  };

  /**
   * Open slack type actionsheet on long press.
   */
  const onLongPressMessage = ({actionHandlers, message}) => {
    setActionSheetData({
      actionHandlers,
      message,
      openReactionPicker,
    });
    actionSheetRef.current?.present();
  };

  const openThread = (thread) => {
    navigation.navigate('ThreadScreen', {
      channelId: channel.id,
      threadId: thread.id,
    });
  };

  const renderMessageFooter = (props) => (
    <MessageFooter
      {...props}
      openReactionPicker={openReactionPicker}
      scrollToMessage={scrollToMessage}
    />
  );

  const scrollToMessage = (messageId) => {
    const messages = channel.state.messages;
    const indexOfParentInMessageList = messages?.findIndex(
      (message) => message?.id === messageId,
    );
    if (messageListRef.current) {
      /**
       * Since the flatlist is inverted, we need to calculate the index from most recent message
       */
      messageListRef.current.scrollToIndex({
        index: messages.length - indexOfParentInMessageList - 1,
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!channelId && !paramChannel) {
        navigation.goBack();
        return;
      }

      if (paramChannel && paramChannel.initialized) {
        console.log('already initialized');
        setChannel(paramChannel);
      } else {
        const newChannel = chatClient.channel('messaging', channelId);
        setChannel(newChannel);
      }

      const draft = await getDraftMessageText(channelId || paramChannel.id);

      if (!draft) {
        setIsReady(true);
        return;
      }

      setDraftText(draft);
      setText(draft);
      setIsReady(true);
    };

    init();
  }, [channelId]);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: colors.background,
      }}>
      <View style={styles.channelScreenContainer}>
        <ChannelHeader channel={channel} goBack={navigation.goBack} />
        <View
          style={[
            styles.chatContainer,
            {
              backgroundColor: colors.background,
            },
          ]}>
          <Channel
            additionalTextInputProps={additionalTextInputProps}
            animatedLongPress={false}
            channel={channel}
            DateHeader={EmptyComponent}
            forceAlignMessages={'left'}
            Gallery={Gallery}
            Giphy={Giphy}
            initialScrollToFirstUnreadMessage
            initialValue={draftText}
            Input={InputBox}
            InputButtons={EmptyComponent}
            KeyboardCompatibleView={CustomKeyboardCompatibleView}
            MessageAvatar={MessageAvatar}
            MessageDeleted={EmptyComponent}
            MessageFooter={renderMessageFooter}
            MessageHeader={MessageHeader}
            messageId={messageId}
            MessageRepliesAvatars={MessageRepliesAvatars}
            MessageText={MessageText}
            onChangeText={onChangeText}
            onLongPressMessage={onLongPressMessage}
            onPressInMessage={EmptyComponent}
            ReactionList={EmptyComponent}
            Reply={Reply}
            ScrollToBottomButton={EmptyComponent}
            supportedReactions={supportedReactions}
            UrlPreview={UrlPreview}>
            <MessageList
              InlineDateIndicator={InlineDateSeparator}
              onThreadSelect={openThread}
              setFlatListRef={(ref) => {
                messageListRef.current = ref;
              }}
            />
            <MessageInput />
          </Channel>
          <MessageActionSheet {...actionSheetData} ref={actionSheetRef} />
          <ReactionPickerActionSheet
            {...reactionPickerData}
            ref={reactionPickerRef}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};