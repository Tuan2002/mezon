/* eslint-disable prettier/prettier */
import { AttachmentEntity } from '@mezon/store';
import { useEffect, useRef } from 'react';
import ItemAttachment from './itemAttachment';

type ListAttachmentProps = {
  attachments: AttachmentEntity[];
  urlImg: string;
  setUrlImg: React.Dispatch<React.SetStateAction<string>>;
  handleDrag: (e: any) => void;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  setPosition: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
    }>
  >;
  setCurrentIndexAtt: React.Dispatch<React.SetStateAction<number>>;
  currentIndexAtt: number;
};

const ListAttachment = (props: ListAttachmentProps) => {
  const { attachments, urlImg, setUrlImg, setScale, setPosition, handleDrag, setCurrentIndexAtt, currentIndexAtt } = props;

  const selectedImageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedImageRef.current) {
      selectedImageRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
      setPosition({
        x: 0,
        y: 0,
      });
      setScale(1);
    }
  }, [setPosition, setScale, currentIndexAtt,urlImg]);

 

  return (
    <div className="min-[481px]:w-fit min-[481px]:h-full bg-[#0B0B0B] text-white flex md:flex-col px-[10px] overflow-y-hidden gap-y-5 max-[480px]:overflow-x-hidden">
      <div className="w-fit h-full flex flex-col-reverse justify-end py-5 overflow-y-scroll gap-y-5 hide-scrollbar items-center max-[480px]:items-end max-[480px]:flex-row max-[480px]:overflow-x-scroll max-[480px]:overflow-y-auto max-[480px]:py-2 max-[480px]:gap-3">
        {attachments.map((attachment, index) => {
          const currentDate = new Date(attachment.create_time || '').toLocaleDateString();
          const nextDate = new Date(attachments[index + 1]?.create_time || '').toLocaleDateString();
          const showDate = nextDate !== currentDate;
          return (
            <ItemAttachment
              key={attachment.id}
              attachment={attachment}
              previousDate={currentDate}
              selectedImageRef={selectedImageRef}
              showDate={showDate}
              setUrlImg={setUrlImg}
              handleDrag={handleDrag}
              index={index}
              setCurrentIndexAtt={setCurrentIndexAtt}
              currentIndexAtt={currentIndexAtt}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ListAttachment;
