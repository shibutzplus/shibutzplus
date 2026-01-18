import {
    IoCalendarOutline,
    IoCalendarSharp,
    IoLogOutOutline,
    IoPeopleOutline,
    IoMenuOutline,
    IoCloseOutline,
    IoBookOutline,
    IoChevronDown,
    IoSettingsOutline,
    IoPersonOutline,
    IoPersonRemoveOutline,
    IoPeopleSharp,
    IoArrowBack,
    IoArrowForward,
    IoStatsChart,
    IoInformationCircleOutline,
} from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { RiEdit2Fill, RiDeleteBin6Line } from "react-icons/ri";
import { BsMegaphoneFill, BsCalendar4Event, BsThreeDotsVertical, BsFiletypePdf, BsTable } from "react-icons/bs";
import { MdPersonAdd, MdPerson, MdSwapHoriz, MdOpenInNew, MdFileUpload } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { FaSave, FaShareAlt, FaQuestion } from "react-icons/fa";
import { PiChairLight, PiMonitor, PiMonitorFill } from "react-icons/pi";
import { GoHistory } from "react-icons/go";
import { LuEye } from "react-icons/lu";
import { FiCheckCircle } from "react-icons/fi";
import { GrSchedule } from "react-icons/gr";
import { FcGoogle } from "react-icons/fc";

const Icons = {
    addTeacher: MdPersonAdd,
    arrowDown: IoChevronDown,
    arrowRight: IoArrowForward,
    arrowLeft: IoArrowBack,
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
    missingTeacher: IoPersonRemoveOutline,
    teacherSolid: MdPerson,
    refresh: IoMdRefresh,
    success: FiCheckCircle,
    users: IoPeopleOutline,
    settings: IoSettingsOutline,
    upload: MdFileUpload,
    groupSolid: IoPeopleSharp,
    group: IoPeopleOutline,
    menuVertical: BsThreeDotsVertical,
    toPDF: BsFiletypePdf,
    tv: PiMonitor,
    tvSolid: PiMonitorFill,
    table: BsTable,
    stats: IoStatsChart,
    google: FcGoogle,
    info: IoInformationCircleOutline,
};

export default Icons;
