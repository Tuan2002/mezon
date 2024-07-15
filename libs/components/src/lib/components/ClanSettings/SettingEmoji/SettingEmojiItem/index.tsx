
import { ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
import { selectMemberClanByUserId } from "@mezon/store";

type SettingEmojiItemProp = {
  src: string,
  emojiName: string,
  authorId: string,
}

const SettingEmojiItem = ({ src, authorId, emojiName }: SettingEmojiItemProp) => {
  const [nameEmoji, setNameEmoji] = useState<string>(emojiName);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const handleChangeEmojiName = (e: ChangeEvent<HTMLInputElement>) => {
    setNameEmoji(e.target.value);
  }
  const dataAuthor = useSelector(selectMemberClanByUserId(authorId));

  return (
    <div className={'flex flex-row w-full max-w-[700px] pr-5 relative h-[65px]  hover:bg-[#f9f9f9] dark:hover:bg-transparent'} onMouseEnter={() => setShowEdit(true)} onMouseLeave={() => setShowEdit(false)}>
      <div className="w-full h-full flex flex-row shadow-emoji_item dark:shadow-emoji_item_dark items-center">

        <div className={'w-14 h-8'}>
          <div className={'w-8 h-8 overflow-hidden flex items-center justify-center '}>
            <img className={'w-full h-auto object-cover'} src={src} />
          </div>
        </div>

        <div className={'flex-1 relative'}>
          <div className={'h-[26px] px-1 w-fit relative before:absolute after:absolute before:content-[":"] before:text-gray-400 after:content-[":"] after:text-gray-400 before:left-[-3px] after:right-[-3px]'}>
            <p className={`max-w-[172px] truncate overflow-hidden inline-block`}>
              {nameEmoji}
            </p>
          </div>

          {
            showEdit &&
            <input className={` dark:bg-channelTextarea bg-channelTextareaLight dark:text-white text-black animate-faded_input h-[26px] top-0 ml-[2px] outline-none pl-2 absolute rounded-[3px]`} value={nameEmoji} onChange={(e) => handleChangeEmojiName(e)} />
          }
        </div>

        <div className={'flex-1 flex gap-[6px]'}>
          <div className={'w-6 h-6 flex rounded-[50%] overflow-hidden flex items-center justify-center'}>
            <img className={'w-full h-auto object-cover'} src={dataAuthor?.user?.avatar_url} />
          </div>
          <p className={'text-sm h-auto leading-6'}>
            {dataAuthor?.user?.username}
          </p>
        </div>

        {
          showEdit &&
          <button className="dark:border-black dark:shadow-[#000000] bg-white dark:bg-transparent text-red-600 shadow-emoji_item-delete absolute text-xs font-bold w-6 h-6 top-[-12px] right-[-12px] flex items-center justify-center rounded-[50%]">
            X
          </button>
        }

      </div>
    </div>
  )
}

export default SettingEmojiItem;
