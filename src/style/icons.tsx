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
import { LuEye } from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";
import { GrSchedule } from "react-icons/gr";

const Icons = {
    addTeacher: MdPersonAdd,
    book: IoBookOutline,
    bookFill: IoBook,
    calendar: IoCalendarOutline,
    dailyCalendar: GrSchedule,
    calendarFill: IoCalendarSharp,
    chair: PiChairLight,
    close: IoCloseOutline,
    copy: MdOutlineContentCopy,
    delete: RiDeleteBin6Line,
    edit: RiEdit2Fill,
    empty: MdOutlineImageNotSupported,
    emptyList: FaList,
    event: BsCalendar4Event,
    eye: LuEye,
    faq: FaQuestion,
    history: GoHistory,
    home: IoHomeOutline,
    link: FaLink,
    logOut: IoLogOutOutline,
    menu: IoMenuOutline,
    newWindow: MdOpenInNew,
    people: IoPeopleOutline,
    personCircle: IoPersonCircleOutline,
    plus: FaPlus,
    publish: BsMegaphoneFill,
    save: FaSave,
    school: IoSchoolOutline,
    share: FaShareAlt,
    substituteTeacher: MdSwapHoriz,
    teacher: IoPersonOutline,
    teacherSolid: MdPerson,
    refresh: IoMdRefresh,
    success1: IoCheckmarkCircle,
    success2: FiCheckCircle,
    validate: RiPassValidLine,
};

export default Icons;
