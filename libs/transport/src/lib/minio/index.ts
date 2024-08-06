import { Buffer as BufferMobile } from 'buffer';
import { Client, Session } from 'mezon-js';
import { ApiMessageAttachment } from 'mezon-js/api.gen';

export const isValidUrl = (urlString: string) => {
	let url;
	try {
		url = new URL(urlString);
	} catch (e) {
		return false;
	}
	return url.protocol === 'https:';
};

export function uploadImageToMinIO(url: string, stream: Buffer, size: number) {
	return fetch(url, { method: 'PUT', body: stream });
}

export async function handleUploadFile(
	client: Client,
	session: Session,
	currentClanId: string,
	currentChannelId: string,
	filename: string,
	file: File,
	path?: string,
): Promise<ApiMessageAttachment> {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise<ApiMessageAttachment>(async function (resolve, reject) {
		try {
			let fileType = file.type;
			if (!fileType) {
				const fileNameParts = file.name.split('.');
				const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
				fileType = `text/${fileExtension}`;
			}
			
			const ms = new Date().getTime();			
			filename = ms + filename;
			filename = filename.replace(/-|\(|\)| /g, '_')
			if (!currentClanId) {
				currentClanId = "0";
			}
			let fullfilename = currentClanId + '/' + currentChannelId + '/' + filename;
			if (path) {
				fullfilename = (path + '/') + currentClanId + '/' + currentChannelId + '/' + filename;
			}
			const buf = await file?.arrayBuffer();
			const data = await client.uploadAttachmentFile(session, {
				filename: fullfilename,
				filetype: fileType,
				size: file.size,
			});
			if (!data?.url) {
				reject(new Error('Failed to upload file. URL not available.'));
				return;
			}
			const res = await uploadImageToMinIO(data.url || '', Buffer.from(buf), file.size);
			if (res.status !== 200) {
				throw new Error('Failed to upload file to MinIO.');
			}
			const url = 'https://cdn.mezon.vn/' + fullfilename;
			resolve({
				filename: file.name,
				url: url,
				filetype: fileType,
				size: file.size,
				width: 0,
				height: 0,
			});
		} catch (error) {
			reject(new Error(`${error}`));
		}
	});
}

export async function handleUploadFileMobile(client: Client, session: Session, fullfilename: string, file: any): Promise<ApiMessageAttachment> {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise<ApiMessageAttachment>(async function (resolve, reject) {
		try {
			let fileType = file.type;
			if (!fileType) {
				const fileNameParts = file.name.split('.');
				const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
				fileType = `text/${fileExtension}`;
			}
			if (file?.uri) {
				const arrayBuffer = BufferMobile.from(file.fileData, 'base64');
				if (!arrayBuffer) {
					console.log('Failed to read file data.');
					return;
				}
				const data = await client.uploadAttachmentFile(session, {
					filename: fullfilename,
					filetype: fileType,
					size: file.size,
				});
				if (!data?.url) {
					console.log('Failed to upload file. URL not available.');
					return;
				}
				const buffer = BufferMobile.from(arrayBuffer);

				const res = await fetch(data.url, {
					method: 'PUT',
					headers: {
						'Content-Type': fileType,
						'Content-Length': file?.size?.toString() || '1000',
					},
					body: buffer,
				});
				if (res.status !== 200) {
					throw new Error('Failed to upload file to MinIO.');
				}
				const url = 'https://cdn.mezon.vn/' + fullfilename;
				resolve({
					filename: file.name,
					url: url,
					filetype: fileType,
					size: file.size,
					width: 0,
					height: 0,
				});
			}
		} catch (error) {
			console.log('handleUploadFileMobile Error: ', error);
			reject(new Error(`${error}`));
		}
	});
}

export function handleUrlInput(url: string): Promise<ApiMessageAttachment> {
	return new Promise<ApiMessageAttachment>((resolve, reject) => {
		if (isValidUrl(url) && url.length < 512) {
			fetch(url, { method: 'HEAD' })
				.then((response) => {
					if (response.ok) {
						const now = Date.now();
						const contentSize = response.headers.get('Content-Length');
						const contentType = response.headers.get('Content-Type');
						if (contentType) {
							resolve({
								filename: now + contentType,
								url: url,
								filetype: contentType,
								size: Number(contentSize),
								width: 0,
								height: 0,
							});
						}
					} else {
						reject(new Error('Failed to get URL. URL not available.'));
					}
				})
				.catch((e) => {
					reject(new Error('Failed to get URL. URL not available.'));
				});
		} else {
			reject(new Error('Failed to get URL. URL not available.'));
		}
	});
}
