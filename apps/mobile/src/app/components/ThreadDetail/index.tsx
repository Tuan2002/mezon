import { useThreads } from '@mezon/core';
import { size } from '@mezon/mobile-ui';
import React from 'react';
import { ScrollView, View } from 'react-native';
import EmptyThread from './EmptyThread';
import GroupThread from './GroupThread';
import ThreadItem from './ThreadItem';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

export default function CreateThreadModal() {
	const { threadChannel, threadChannelOld, threadChannelOnline } = useThreads();
  const { t } = useTranslation(['createThread']);
	return (
		<View style={styles.createChannelContainer}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: size.s_50, paddingTop: size.s_10 }}>
				{threadChannelOnline?.length ? (
					<GroupThread title={`${threadChannelOnline.length} ${t('joinedThreads')}`}>
						{threadChannelOnline?.map((thread) => (
							<ThreadItem thread={thread} key={thread.id} />
						))}
					</GroupThread>
				) : null}
				{threadChannelOld?.length ? (
					<GroupThread title={t('otherThreads')}>
						{threadChannelOld?.map((thread) => (
							<ThreadItem thread={thread} key={thread.id} />
						))}
					</GroupThread>
				) : null}
			</ScrollView>
			{threadChannel.length === 0 && <EmptyThread />}
		</View>
	);
}
