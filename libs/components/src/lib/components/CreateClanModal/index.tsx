import { ModalErrorTypeUpload, ModalOverData } from '@mezon/components';
import { useAppNavigation, useClans } from '@mezon/core';
import { checkDuplicateNameClan, selectAllAccount, selectCurrentChannelId, selectCurrentClanId, useAppDispatch } from '@mezon/store';
import { handleUploadFile, useMezon } from '@mezon/transport';
import { InputField, Modal } from '@mezon/ui';
import { ValidateSpecialCharacters, fileTypeImage } from '@mezon/utils';
import { unwrapResult } from '@reduxjs/toolkit';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import * as Icons from '../../../../../ui/src/lib/Icons';

export type ModalCreateClansProps = {
  open: boolean;
  onClose: () => void;
};

type openModalErrorProps = {
  errorType: boolean;
  errorSize: boolean;
};

const ModalCreateClans = (props: ModalCreateClansProps) => {
  const { open, onClose } = props;
  const [urlImage, setUrlImage] = useState('');
  const [nameClan, setNameClan] = useState('');
  const [checkvalidate, setCheckValidate] = useState(true);
  const { sessionRef, clientRef } = useMezon();
  const { navigate, toClanPage } = useAppNavigation();
  const { createClans } = useClans();
  const userProfile = useSelector(selectAllAccount);
  const dispatch = useAppDispatch();
  const currentClanId = useSelector(selectCurrentClanId) || '';
  const currentChannelId = useSelector(selectCurrentChannelId) || '';
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameClan(value);
    debouncedSetClanName(value)
    const regex = ValidateSpecialCharacters();
    if (regex.test(value) && value !== '') {
      setCheckValidate(false);
    } else {
      setCheckValidate(true);
    }
  };
  const debouncedSetClanName = useDebouncedCallback(async (value) => {
    const isDuplicate = await dispatch(checkDuplicateNameClan(value)).then(unwrapResult).then(result => result);
  }, 700);

  const [openModalError, seOpenModalError] = useState<openModalErrorProps>({
    errorType: false,
    errorSize: false,
  });
  const handleFile = (e: any) => {
    const file = e?.target?.files[0];
    const session = sessionRef.current;
    const client = clientRef.current;
    const sizeImage = file?.size;
    if (!file) return;
    if (!client || !session) {
      throw new Error('Client or file is not initialized');
    }
    const allowedTypes = fileTypeImage;
    if (!allowedTypes.includes(file.type)) {
      seOpenModalError((prev) => ({ ...prev, errorType: true }));
      e.target.value = null;
      return;
    }

    if (sizeImage > 1000000) {
      seOpenModalError((prev) => ({ ...prev, errorSize: true }));
      e.target.value = null;
      return;
    }
    handleUploadFile(client, session, currentClanId, currentChannelId, file?.name, file).then((attachment: any) => {
      setUrlImage(attachment.url ?? '');
    });
  };



  const handleCreateClan = () => {
    // TODO: validate
    if (nameClan) {
      createClans(nameClan, urlImage).then((res) => {
        if (res && res.clan_id) {
          navigate(toClanPage(res.clan_id || ''));
        }
      });
    }
  };
  const handleClose = () => {
    onClose();
    setUrlImage('');
    setNameClan('');
  };

  return (
    <Modal
      showModal={open}
      onClose={handleClose}
      title=""
      titleConfirm="Create"
      confirmButton={handleCreateClan}
      disableButtonConfirm={!nameClan ? true : false || checkvalidate}
      classNameBox="h-full"
    >
      <div className="flex items-center flex-col justify-center ">
        <span className="dark:text-contentPrimary text-black text-[24px] pb-4 font-[700] leading-8">Customize Your Clan</span>
        <p className="dark:text-contentTertiary text-black  text-center text-[20px] leading-6 font-[400]">
          Give your new clan a personality with a name and an icon. You can always change it later.
        </p>
        <label className="block mt-8 mb-4">
          {urlImage ? (
            <img id="preview_img" className="h-[81px] w-[81px] object-cover rounded-full" src={urlImage} alt="Current profile" />
          ) : (
            <div
              id="preview_img"
              className="h-[81px] w-[81px] flex justify-center items-center flex-col dark:bg-bgSecondary bg-bgModifierHoverLight border-white relative border-[1px] border-dashed rounded-full cursor-pointer transform hover:scale-105 transition duration-300 ease-in-out"
            >
              <div className="absolute right-0 top-[-3px] left-[54px]">
                <Icons.AddIcon />
              </div>
              <Icons.UploadImage className="text-black dark:text-white" />
              <span className="text-[14px]">Upload</span>
            </div>
          )}
          <input id="preview_img" type="file" onChange={(e) => handleFile(e)} className="block w-full text-sm text-slate-500 hidden" />
        </label>
        <div className="w-full">
          <span className="font-[700] text-[16px] leading-6">CLAN NAME</span>
          <InputField
            onChange={handleInputChange}
            type="text"
            className="dark:bg-bgSurface bg-bgModifierHoverLight mb-2 mt-4 py-2"
            placeholder={`Enter the clan name`}
            maxLength={Number(process.env.NX_MAX_LENGTH_NAME_ALLOWED)}
          />
          {checkvalidate && (
            <p className="text-[#e44141] text-xs italic font-thin">
              Please enter a valid clan name (max 64 characters, only words, numbers, _ or -).
            </p>
          )}
          <span className="text-[14px] text-contentTertiary">
            By creating a clan, you agree to Mezon’s <span className="text-contentBrandLight">Community Guidelines</span>.
          </span>
        </div>
      </div>
      <ModalErrorTypeUpload
        openModal={openModalError.errorType}
        handleClose={() => seOpenModalError((prev) => ({ ...prev, errorType: false }))}
      />
      <ModalOverData openModal={openModalError.errorSize} handleClose={() => seOpenModalError((prev) => ({ ...prev, errorSize: false }))} />
    </Modal>
  );
};

export default ModalCreateClans;
