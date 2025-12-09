import {
    IoHomeOutline,
    IoCalendarOutline,
    IoCalendarSharp,
    IoPersonCircleOutline,
    IoLogOutOutline,
    IoSchoolOutline,
    IoPeopleOutline,
    IoMenuOutline,
    IoCloseOutline,
    IoBookOutline,
    IoBook,
    IoChevronDown,
} from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { RiEdit2Fill, RiDeleteBin6Line, RiPassValidLine } from "react-icons/ri";
import { BsMegaphoneFill, BsCalendar4Event } from "react-icons/bs";
import {
    MdOutlineImageNotSupported,
    MdOutlineContentCopy,
    MdPersonAdd,
    MdPerson,
    MdSwapHoriz,
    MdOpenInNew,
} from "react-icons/md";
import { FaPlus, FaList } from "react-icons/fa6";
import { FaSave, FaLink, FaShareAlt, FaQuestion } from "react-icons/fa";
import { PiChairLight } from "react-icons/pi";
import { GoHistory } from "react-icons/go";
import { IoPersonOutline, IoCheckmarkCircle } from "react-icons/io5";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";
import { GrSchedule } from "react-icons/gr";

const Icons = {
    addTeacher: MdPersonAdd,
    arrowDown: IoChevronDown,
    book: IoBookOutline,
    calendar: IoCalendarOutline,
    dailyCalendar: GrSchedule,
    calendarFill: IoCalendarSharp,
    chair: PiChairLight,
    close: IoCloseOutline,
    delete: RiDeleteBin6Line,
    edit: RiEdit2Fill,
    event: BsCalendar4Event,
    eye: LuEye,
    eyeOff: LuEyeOff,
    faq: FaQuestion,
    history: GoHistory,
    logOut: IoLogOutOutline,
    menu: IoMenuOutline,
    newWindow: MdOpenInNew,
    plus: FaPlus,
    publish: BsMegaphoneFill,
    save: FaSave,
    share: FaShareAlt,
    substituteTeacher: MdSwapHoriz,
    teacher: IoPersonOutline,
    teacherSolid: MdPerson,
    refresh: IoMdRefresh,
    success2: FiCheckCircle,
    users: IoPeopleOutline,
};

export default Icons;
