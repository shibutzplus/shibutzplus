import {
    IoArrowForward,
    IoCalendarClearOutline,
    IoHomeOutline,
    IoCalendarOutline,
    IoPersonCircleOutline,
    IoLogOutOutline,
    IoSchoolOutline,
    IoPeopleOutline,
    IoMenuOutline,
    IoCloseOutline,
    IoBookOutline,
} from "react-icons/io5";
import { RiEdit2Fill, RiDeleteBin6Line } from "react-icons/ri";
import { BsMegaphoneFill, BsCalendar4Event } from "react-icons/bs";
import {
    MdOutlineImageNotSupported,
    MdOutlineContentCopy,
    MdPersonAdd,
    MdPerson,
    MdSwapHoriz,
} from "react-icons/md";
import { FaPlus, FaList } from "react-icons/fa6";
import { FaSave, FaLink, FaShareAlt } from "react-icons/fa";
import { PiChairLight } from "react-icons/pi";
import { GoHistory } from "react-icons/go";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";

const Icons = {
    addTeacher: MdPersonAdd,
    arrowForward: IoArrowForward,
    book: IoBookOutline,
    calendar: IoCalendarOutline,
    chair: PiChairLight,
    close: IoCloseOutline,
    copy: MdOutlineContentCopy,
    dailyCalendar: IoCalendarClearOutline,
    delete: RiDeleteBin6Line,
    edit: RiEdit2Fill,
    empty: MdOutlineImageNotSupported,
    emptyList: FaList,
    event: BsCalendar4Event,
    history: GoHistory,
    home: IoHomeOutline,
    link: FaLink,
    logOut: IoLogOutOutline,
    menu: IoMenuOutline,
    people: IoPeopleOutline,
    personCircle: IoPersonCircleOutline,
    plus: FaPlus,
    publish: BsMegaphoneFill,
    save: FaSave,
    school: IoSchoolOutline,
    share: FaShareAlt,
    substituteTeacher: MdSwapHoriz,
    teacher1: MdPerson,
    teacher2: LiaChalkboardTeacherSolid,
};

export default Icons;
