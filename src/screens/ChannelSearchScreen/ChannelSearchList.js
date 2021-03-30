import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {FlatList} from 'react-native';

import {SlackChannelListItem} from '../../components/SlackChannelListItem/SlackChannelListItem';

export const ChannelSearchList = (props) => {
  const {channels} = props;
  const navigation = useNavigation();
  const goToChannelScreen = (channelId) => {
    navigation.navigate('ChannelScreen', {
      channelId,
    });
  };

  const renderChannelRow = ({item: channel}) => (
    <SlackChannelListItem
      channel={channel}
      key={channel.id}
      onSelect={goToChannelScreen}
      showAvatar
    />
  );

  return (
    <FlatList
      data={channels}
      keyboardDismissMode={'on-drag'}
      keyboardShouldPersistTaps='always'
      renderItem={renderChannelRow}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
};