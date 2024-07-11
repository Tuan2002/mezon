import { Coords } from '../../../ChannelLink';
import ItemPanel from '../../../PanelChannel/ItemPanel';

type PanelEventItemProps = {
    coords: Coords;
    checkUserCreate: boolean;
    onHandle: (e: any) => void;
    setOpenModalDelEvent: React.Dispatch<React.SetStateAction<boolean>>;
    onClose: () => void;
}

function PanelEventItem(props: PanelEventItemProps) {
    const { coords, checkUserCreate, onHandle, setOpenModalDelEvent, onClose } = props;

    const handleDeleteEvent = async () =>{
        setOpenModalDelEvent(true);
        onClose();
    }

    return(
        <div 
            className="fixed dark:bg-bgProfileBody bg-gray-100 rounded-sm shadow z-10 w-[200px] py-[10px] px-[10px]"
            style={{ left: coords.mouseX + 10, top: coords.distanceToBottom > 140 ? coords.mouseY - 30 : '', bottom: coords.distanceToBottom < 140 ? '20px' : ''}}
            onClick={onHandle}
        >
            {checkUserCreate && 
                <>
                    <ItemPanel children="Start Event" />
                    <ItemPanel children="Edit Event" />
                    <ItemPanel children="Cancel Event" danger={true} onClick={handleDeleteEvent}/>
                </>
            }
            <ItemPanel children="Copy Event Link" />
        </div>
    );
}

export default PanelEventItem;