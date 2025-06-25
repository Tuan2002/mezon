import { quickMenuActions, selectQuickMenuByChannelId, useAppDispatch, useAppSelector } from '@mezon/store';
import { ApiQuickMenuAccessRequest } from 'mezon-js/api.gen';
import React, { useCallback, useEffect, useState } from 'react';

interface QuickMenuAccessManagerProps {
	channelId: string;
	clanId: string;
}

const QuickMenuAccessManager: React.FC<QuickMenuAccessManagerProps> = ({ channelId, clanId }) => {
	const dispatch = useAppDispatch();
	const quickMenuItems = useAppSelector((state) => selectQuickMenuByChannelId(state, channelId));

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<ApiQuickMenuAccessRequest | null>(null);
	const [editingItem, setEditingItem] = useState<ApiQuickMenuAccessRequest | null>(null);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<ApiQuickMenuAccessRequest & { channelId: string; clanId: string }>({
		menu_name: '',
		action_msg: '',
		channelId,
		clanId
	});

	useEffect(() => {
		dispatch(quickMenuActions.listQuickMenuAccess({ channelId }));
	}, [dispatch, channelId]);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!formData.menu_name?.trim()) return;

			setLoading(true);
			try {
				if (editingItem) {
					await dispatch(
						quickMenuActions.updateQuickMenuAccess({
							...formData,
							id: editingItem.id
						})
					).unwrap();
				} else {
					await dispatch(quickMenuActions.addQuickMenuAccess(formData)).unwrap();
				}

				await dispatch(quickMenuActions.listQuickMenuAccess({ channelId }));
				setIsModalOpen(false);
				setEditingItem(null);
				setFormData({ menu_name: '', action_msg: '', channelId, clanId });
			} catch (error) {
				console.error('Error saving quick menu item:', error);
			} finally {
				setLoading(false);
			}
		},
		[formData, editingItem, channelId, clanId, dispatch]
	);

	const handleEdit = useCallback(
		(item: ApiQuickMenuAccessRequest) => {
			setEditingItem(item);
			setFormData({
				menu_name: item.menu_name || '',
				action_msg: item.action_msg || '',
				channelId,
				clanId
			});
			setIsModalOpen(true);
		},
		[channelId, clanId]
	);

	const handleDeleteClick = useCallback((item: ApiQuickMenuAccessRequest) => {
		setItemToDelete(item);
		setIsDeleteModalOpen(true);
	}, []);

	const handleDeleteConfirm = useCallback(async () => {
		if (!itemToDelete) return;

		setLoading(true);
		try {
			await dispatch(quickMenuActions.deleteQuickMenuAccess({ id: itemToDelete.id as string, channelId })).unwrap();
			await dispatch(quickMenuActions.listQuickMenuAccess({ channelId }));
			setIsDeleteModalOpen(false);
			setItemToDelete(null);
		} catch (error) {
			console.error('Error deleting quick menu item:', error);
		} finally {
			setLoading(false);
		}
	}, [dispatch, channelId, itemToDelete]);

	const handleDeleteCancel = useCallback(() => {
		setIsDeleteModalOpen(false);
		setItemToDelete(null);
	}, []);

	const openCreateModal = useCallback(() => {
		setEditingItem(null);
		setFormData({ menu_name: '', action_msg: '', channelId, clanId });
		setIsModalOpen(true);
	}, [channelId, clanId]);

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
		setEditingItem(null);
		setFormData({ menu_name: '', action_msg: '', channelId, clanId });
	}, [channelId, clanId]);

	return (
		<div className="quick-menu-access-manager">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="text-xl font-semibold text-white mb-1">Quick Menu Commands</h3>
					<p className="text-sm text-gray-400">Create custom slash commands for this channel</p>
				</div>
				<button
					onClick={openCreateModal}
					className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
					</svg>
					Add Command
				</button>
			</div>

			{quickMenuItems.length === 0 ? (
				<div className="bg-[#2b2d31] rounded-lg p-8 text-center border border-[#3e4146]">
					<div className="mb-4">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto text-gray-500">
							<path
								d="M5 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9C3 7.89543 3.89543 7 5 7Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
					<h4 className="text-lg font-medium text-white mb-2">No commands yet</h4>
					<p className="text-gray-400 mb-6">Get started by creating your first slash command</p>
					<button
						onClick={openCreateModal}
						className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
					>
						Create Command
					</button>
				</div>
			) : (
				<div className="space-y-3">
					{quickMenuItems.map((item) => (
						<div
							key={item.id}
							className="bg-[#2b2d31] rounded-lg p-4 border border-[#3e4146] hover:border-[#4e5156] transition-colors duration-200"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2">
										<span className="font-mono text-[#00d4aa] bg-[#00d4aa]/10 px-2 py-1 rounded text-sm">/{item.menu_name}</span>
									</div>
									{item.action_msg && <p className="text-gray-400 text-sm leading-relaxed">{item.action_msg}</p>}
								</div>
								<div className="flex items-center gap-2 ml-4">
									<button
										onClick={() => handleEdit(item)}
										disabled={loading}
										className="p-2 text-gray-400 hover:text-white hover:bg-[#3e4146] rounded-md transition-colors duration-200"
										title="Edit command"
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
										</svg>
									</button>
									<button
										onClick={() => handleDeleteClick(item)}
										disabled={loading}
										className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors duration-200"
										title="Delete command"
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{isModalOpen && (
				<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
					<div className="bg-[#313338] rounded-lg w-full max-w-md">
						<div className="p-6 border-b border-[#3e4146]">
							<h2 className="text-xl font-semibold text-white">{editingItem ? 'Edit Command' : 'Create Command'}</h2>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-200 mb-2">
									Command Name <span className="text-red-400">*</span>
								</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-mono">/</span>
									<input
										type="text"
										value={formData.menu_name || ''}
										onChange={(e) => setFormData({ ...formData, menu_name: e.target.value })}
										placeholder="example"
										required
										className="w-full bg-[#1e1f22] border border-[#3e4146] rounded-md px-3 py-2 pl-8 text-white placeholder-gray-500 focus:border-[#5865f2] focus:outline-none transition-colors duration-200"
									/>
								</div>
								<p className="text-xs text-gray-500 mt-1">The name users will type after the slash</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-200 mb-2">Action Message</label>
								<textarea
									value={formData.action_msg || ''}
									onChange={(e) => setFormData({ ...formData, action_msg: e.target.value })}
									placeholder="Message to be sent when command is used"
									rows={3}
									className="w-full bg-[#1e1f22] border border-[#3e4146] rounded-md px-3 py-2 text-white placeholder-gray-500 focus:border-[#5865f2] focus:outline-none transition-colors duration-200 resize-none"
								/>
								<p className="text-xs text-gray-500 mt-1">Message content that will be inserted when this command is selected</p>
							</div>

							<div className="flex justify-end gap-3 pt-4">
								<button
									type="button"
									onClick={closeModal}
									disabled={loading}
									className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={loading || !formData.menu_name?.trim()}
									className="bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
								>
									{loading && (
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
											<circle
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="2"
												strokeDasharray="30"
												strokeDashoffset="30"
											/>
										</svg>
									)}
									{editingItem ? 'Update' : 'Create'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{isDeleteModalOpen && (
				<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
					<div className="bg-[#313338] rounded-lg w-full max-w-md">
						<div className="p-6">
							<h2 className="text-xl font-semibold text-white mb-2">Delete Command</h2>
							<p className="text-gray-400 mb-6">
								Are you sure you want to delete <span className="font-mono text-[#00d4aa]">/{itemToDelete?.menu_name}</span>? This
								action cannot be undone.
							</p>
							<div className="flex justify-end gap-3">
								<button
									onClick={handleDeleteCancel}
									disabled={loading}
									className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium"
								>
									Cancel
								</button>
								<button
									onClick={handleDeleteConfirm}
									disabled={loading}
									className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
								>
									{loading && (
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
											<circle
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="2"
												strokeDasharray="30"
												strokeDashoffset="30"
											/>
										</svg>
									)}
									Delete
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default QuickMenuAccessManager;
