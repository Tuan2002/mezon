interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	handleDelete: () => void;
}

export const DeleteModal: React.FC<ModalProps> = ({ isOpen, handleDelete, onClose }) => {
	return (
		<>
			{isOpen && (
				<div className="fixed  inset-0 flex items-center justify-center z-50">
					<div className="fixed inset-0 bg-black opacity-80"></div>
					<div className="relative z-10 dark:bg-gray-900  bg-bgDisable p-6 rounded-[5px] text-center">
						<h2 className="text-[30px] font-semibold mb-4">DELETE ROLE</h2>
						<p className="text-white-600 mb-6 text-[16px]">
							Are you sure you want to delete the new role role? This action cannot be undone
						</p>
						<div className="flex justify-center mt-10 text-[14px]">
							<button
								color="gray"
								onClick={onClose}
								className="px-4 py-2 mr-5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring focus:border-blue-300"
							>
								Cancel
							</button>
							<button
								color="blue"
								onClick={() => {
									handleDelete();
									onClose();
								}}
								className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:border-blue-300"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
